from django.db.models import Count, Q
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from accounts.permissions import IsAdminRole, SameOrganizationObject
from audit.log import write as audit
from .models import Document, KnowledgeBase
from .permissions import can_access_document, can_access_kb, is_admin, role_name
from .serializers import DocumentSerializer, DocumentUploadSerializer, KnowledgeBaseCreateSerializer, KnowledgeBaseSerializer
from .tasks import process_document


class KnowledgeBaseViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated, SameOrganizationObject]
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_serializer_class(self):
        return KnowledgeBaseCreateSerializer if self.action == 'create' else KnowledgeBaseSerializer

    def get_queryset(self):
        user = self.request.user
        qs = KnowledgeBase.objects.filter(organization_id=user.organization_id)
        if not is_admin(user):
            qs = qs.exclude(visibility=KnowledgeBase.Visibility.RESTRICTED)
            qs = qs.filter(Q(visibility=KnowledgeBase.Visibility.ORGANIZATION)
                           | Q(department_id__isnull=True)
                           | Q(department_id=user.department_id))
        return qs.select_related('department').annotate(
            documents_count=Count('docs', distinct=True), chunks_count=Count('chunks', distinct=True)).order_by('name')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save(organization=request.user.organization, created_by=request.user)
        audit(request, 'KNOWLEDGE_BASE_CREATED', obj.name, 'SUCCESS', f'visibility={obj.visibility}')
        full = self.get_queryset().get(pk=obj.pk)
        return Response(KnowledgeBaseSerializer(full).data, status=status.HTTP_201_CREATED)

    def _admin_or_403(self, request):
        if not IsAdminRole().has_permission(request, self):
            return Response({'detail': 'Admin role required.'}, status=status.HTTP_403_FORBIDDEN)
        return None

    def partial_update(self, request, *args, **kwargs):
        denied = self._admin_or_403(request)
        if denied:
            return denied
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        denied = self._admin_or_403(request)
        if denied:
            return denied
        obj = self.get_object()
        audit(request, 'KNOWLEDGE_BASE_DELETED', obj.name, 'SUCCESS', '')
        return super().destroy(request, *args, **kwargs)


class DocumentViewSet(ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated, SameOrganizationObject]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ['get', 'post', 'delete']

    def get_queryset(self):
        user = self.request.user
        qs = Document.objects.filter(organization_id=user.organization_id)
        if not is_admin(user):
            qs = qs.exclude(knowledge_base__visibility=KnowledgeBase.Visibility.RESTRICTED)
            qs = qs.filter(Q(knowledge_base__visibility=KnowledgeBase.Visibility.ORGANIZATION)
                           | Q(knowledge_base__department_id__isnull=True)
                           | Q(knowledge_base__department_id=user.department_id))
            role = role_name(user)
            qs = qs.filter(Q(roles_allowed=[]) | Q(roles_allowed__contains=[role]))
        return qs.select_related('knowledge_base', 'department', 'uploader').order_by('-created_at')

    def get_object(self):
        obj = super().get_object()
        # Backstop (queryset already filters): never leak existence across tenants.
        if obj.organization_id != self.request.user.organization_id or not can_access_document(self.request.user, obj):
            raise Http404
        return obj

    def create(self, request, *args, **kwargs):
        upload = DocumentUploadSerializer(data=request.data)
        upload.is_valid(raise_exception=True)
        kb = get_object_or_404(KnowledgeBase, pk=upload.validated_data['knowledge_base'],
                               organization_id=request.user.organization_id)
        if not can_access_kb(request.user, kb):
            raise Http404
        f = upload.validated_data['file']
        ext = f.name.rsplit('.', 1)[-1].upper()
        doc = Document.objects.create(
            organization=request.user.organization, knowledge_base=kb,
            filename=f.name, file_type=ext, file=f, size_bytes=f.size,
            uploader=request.user, department=request.user.department,
            status=Document.Status.UPLOADING,
        )
        audit(request, 'DOCUMENT_UPLOAD', doc.filename, 'SUCCESS', f'{f.size} bytes → {kb.name}')
        process_document.delay(doc.id)  # eager in dev/tests, real worker in production
        doc.refresh_from_db()
        return Response(DocumentSerializer(doc).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='process')
    def reprocess(self, request, pk=None):
        doc = self.get_object()
        if not (is_admin(request.user) or doc.uploader_id == request.user.id):
            return Response({'detail': 'Only the uploader or an Admin can reprocess.'},
                            status=status.HTTP_403_FORBIDDEN)
        process_document.delay(doc.id)
        doc.refresh_from_db()
        audit(request, 'DOCUMENT_REPROCESS', doc.filename, 'SUCCESS', f'status={doc.status}')
        return Response(DocumentSerializer(doc).data)

    def destroy(self, request, *args, **kwargs):
        if not IsAdminRole().has_permission(request, self):
            return Response({'detail': 'Admin role required.'}, status=status.HTTP_403_FORBIDDEN)
        obj = self.get_object()
        audit(request, 'DOCUMENT_DELETED', obj.filename, 'SUCCESS', '')
        obj.file.delete(save=False)
        return super().destroy(request, *args, **kwargs)
