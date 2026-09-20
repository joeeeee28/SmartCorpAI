from django.conf import settings
from django.db import models
from pgvector.django import HnswIndex, VectorField


def document_upload_path(instance: 'Document', filename: str) -> str:
    org = instance.organization.slug if instance.organization_id else 'unassigned'
    return f'docs/{org}/{instance.knowledge_base_id}/{filename}'


class KnowledgeBase(models.Model):
    class Visibility(models.TextChoices):
        ORGANIZATION = 'Organization', 'Organization'
        DEPARTMENT = 'Department', 'Department'
        RESTRICTED = 'Restricted', 'Restricted'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        SYNCING = 'SYNCING', 'Syncing'
        PAUSED = 'PAUSED', 'Paused'

    organization = models.ForeignKey('organizations.Organization', on_delete=models.CASCADE, related_name='knowledge_bases')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    department = models.ForeignKey('organizations.Department', null=True, blank=True, on_delete=models.SET_NULL, related_name='knowledge_bases')
    visibility = models.CharField(max_length=32, choices=Visibility.choices, default=Visibility.ORGANIZATION)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='created_bases')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        constraints = [models.UniqueConstraint(fields=['organization', 'name'], name='uniq_kb_per_org')]

    def __str__(self) -> str:
        return f'{self.organization.slug}/{self.name}'


class Document(models.Model):
    class Status(models.TextChoices):
        UPLOADING = 'UPLOADING', 'Uploading'
        PROCESSING = 'PROCESSING', 'Processing'
        READY = 'READY', 'Ready'
        FAILED = 'FAILED', 'Failed'

    class EmbeddingStatus(models.TextChoices):
        QUEUED = 'QUEUED', 'Queued'
        INDEXING = 'INDEXING', 'Indexing'
        INDEXED = 'INDEXED', 'Indexed'
        FAILED = 'FAILED', 'Failed'

    FILE_TYPES = ('PDF', 'DOCX', 'TXT', 'CSV')

    organization = models.ForeignKey('organizations.Organization', on_delete=models.CASCADE, related_name='documents')
    knowledge_base = models.ForeignKey(KnowledgeBase, on_delete=models.CASCADE, related_name='docs')
    filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=8)
    file = models.FileField(upload_to=document_upload_path)
    size_bytes = models.BigIntegerField(default=0)
    uploader = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='uploaded_documents')
    department = models.ForeignKey('organizations.Department', null=True, blank=True, on_delete=models.SET_NULL, related_name='documents')
    version = models.CharField(max_length=16, default='v1.0')
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.UPLOADING, db_index=True)
    roles_allowed = models.JSONField(default=list, help_text='Role names permitted; empty = inherit KB visibility')
    pages = models.IntegerField(default=0)
    chunk_count = models.IntegerField(default=0)
    embedding_status = models.CharField(max_length=16, choices=EmbeddingStatus.choices, default=EmbeddingStatus.QUEUED)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['organization', 'knowledge_base'])]

    def __str__(self) -> str:
        return self.filename


class DocumentChunk(models.Model):
    organization = models.ForeignKey('organizations.Organization', on_delete=models.CASCADE, related_name='chunks')
    knowledge_base = models.ForeignKey(KnowledgeBase, on_delete=models.CASCADE, related_name='chunks')
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    chunk_index = models.IntegerField()
    text = models.TextField()
    page = models.IntegerField(null=True, blank=True)
    section = models.CharField(max_length=255, blank=True)
    # Populated by the embedding step (Phase 2). NULL until then — never faked.
    embedding = VectorField(dimensions=1536, null=True, blank=True)
    meta = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['document_id', 'chunk_index']
        indexes = [
            models.Index(fields=['organization', 'knowledge_base']),
            HnswIndex(name='chunk_emb_hnsw', fields=['embedding'], m=16, ef_construction=64, opclasses=['vector_cosine_ops']),
        ]

    def __str__(self) -> str:
        return f'{self.document.filename}#{self.chunk_index}'
