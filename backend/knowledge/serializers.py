from django.db.models import Count
from rest_framework import serializers

from .models import Document, KnowledgeBase

MAX_UPLOAD_BYTES = 50 * 1024 * 1024
ALLOWED_EXTENSIONS = {'PDF': 'pdf', 'DOCX': 'docx', 'TXT': 'txt', 'CSV': 'csv'}


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    department = serializers.CharField(source='department.name', read_only=True, default=None)
    department_id = serializers.IntegerField(write_only=False, required=False)
    documents = serializers.SerializerMethodField()
    chunks = serializers.SerializerMethodField()
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = KnowledgeBase
        fields = ('id', 'name', 'description', 'department', 'department_id',
                  'visibility', 'status', 'documents', 'chunks', 'created_at', 'updated_at')
        read_only_fields = ('status', 'created_at', 'updated_at')

    def get_documents(self, obj):
        annotated = getattr(obj, 'documents_count', None)
        return annotated if annotated is not None else obj.docs.count()

    def get_chunks(self, obj):
        annotated = getattr(obj, 'chunks_count', None)
        return annotated if annotated is not None else obj.chunks.count()

    def update(self, instance, validated):
        from organizations.models import Department

        dep_id = validated.pop('department_id', None)
        if dep_id is not None:
            try:
                instance.department = Department.objects.get(
                    pk=dep_id, organization_id=instance.organization_id)
            except Department.DoesNotExist:
                raise serializers.ValidationError({'department_id': 'Department not found in your organization.'})
        return super().update(instance, validated)


class KnowledgeBaseCreateSerializer(serializers.ModelSerializer):
    department_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = KnowledgeBase
        fields = ('name', 'description', 'department_id', 'visibility')

    def validate_department_id(self, value):
        if value is None:
            return value
        from organizations.models import Department

        org = self.context['request'].user.organization
        try:
            return Department.objects.get(pk=value, organization=org).id
        except Department.DoesNotExist:
            raise serializers.ValidationError('Department not found in your organization.')


class DocumentSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='filename', read_only=True)
    type = serializers.CharField(source='file_type', read_only=True)
    size = serializers.SerializerMethodField()
    knowledge_base = serializers.CharField(source='knowledge_base.name', read_only=True)
    knowledge_base_id = serializers.IntegerField(source='knowledge_base.id', read_only=True)
    department = serializers.CharField(source='department.name', read_only=True, default=None)
    uploader = serializers.CharField(source='uploader.display_name', read_only=True, default=None)
    uploaded_at = serializers.DateTimeField(source='created_at', read_only=True)
    permissions = serializers.ListField(source='roles_allowed', child=serializers.CharField(), read_only=True)
    chunks = serializers.IntegerField(source='chunk_count', read_only=True)
    embedding_status = serializers.CharField(read_only=True)
    history = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ('id', 'name', 'type', 'size', 'size_bytes', 'knowledge_base', 'knowledge_base_id',
                  'department', 'uploader', 'uploaded_at', 'version', 'status', 'permissions',
                  'pages', 'chunks', 'embedding_status', 'error_message', 'history')

    def get_size(self, obj):
        mb = obj.size_bytes / (1024 * 1024)
        return f'{mb:.1f} MB' if mb >= 1 else f'{max(1, obj.size_bytes // 1024)} KB'

    def get_history(self, obj):
        stages = ['Uploaded', 'Validated', 'Text extracted', 'Chunked', 'Embedded', 'Indexed']
        reached = {'UPLOADING': 1, 'PROCESSING': 3, 'READY': 4, 'FAILED': 2}[obj.status]
        out = []
        for i, stage in enumerate(stages):
            if obj.status == 'FAILED' and i == reached:
                state = 'FAILED'
            elif i < reached:
                state = 'DONE'
            elif i == reached:
                state = 'CURRENT' if obj.status != 'READY' else 'DONE'
            else:
                state = 'CURRENT' if obj.status == 'READY' and i == 4 else 'PENDING'
            out.append({'stage': stage, 'status': state,
                        'at': obj.updated_at.strftime('%b %d, %Y') if state in ('DONE', 'CURRENT', 'FAILED') else '—'})
        return out


class DocumentUploadSerializer(serializers.Serializer):
    knowledge_base = serializers.IntegerField()
    file = serializers.FileField()

    def validate_file(self, value):
        ext = (value.name.rsplit('.', 1)[-1] if '.' in value.name else '').lower()
        if ext not in ALLOWED_EXTENSIONS.values():
            raise serializers.ValidationError('Only PDF, DOCX, TXT and CSV files are supported.')
        if value.size > MAX_UPLOAD_BYTES:
            raise serializers.ValidationError('File exceeds the 50 MB limit.')
        if value.size == 0:
            raise serializers.ValidationError('Empty files cannot be processed.')
        return value
