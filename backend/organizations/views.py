from rest_framework import status
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from accounts.permissions import IsAdminRole, SameOrganizationObject
from audit.log import write as audit
from .models import Department
from .serializers import DepartmentSerializer, OrganizationSerializer


class OrganizationView(RetrieveUpdateAPIView):
    serializer_class = OrganizationSerializer

    def get_object(self):
        return self.request.user.organization

    def patch(self, request, *args, **kwargs):
        if not IsAdminRole().has_permission(request, self):
            return Response({'detail': 'Admin role required.'}, status=status.HTTP_403_FORBIDDEN)
        return super().patch(request, *args, **kwargs)


class DepartmentViewSet(ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, SameOrganizationObject]
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        return Department.objects.filter(
            organization_id=self.request.user.organization_id).select_related('head').order_by('name')

    def _admin_or_403(self, request):
        if not IsAdminRole().has_permission(request, self):
            return Response({'detail': 'Admin role required.'}, status=status.HTTP_403_FORBIDDEN)
        return None

    def perform_create(self, serializer):
        obj = serializer.save(organization=self.request.user.organization)
        audit(self.request, 'DEPARTMENT_CREATED', obj.name, 'SUCCESS', '')

    def create(self, request, *args, **kwargs):
        denied = self._admin_or_403(request)
        if denied:
            return denied
        return super().create(request, *args, **kwargs)

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
        audit(request, 'DEPARTMENT_DELETED', obj.name, 'SUCCESS', '')
        return super().destroy(request, *args, **kwargs)
