from celery import shared_task
from django.conf import settings
from audit.log import write_system

@shared_task(name='knowledge.embed_document')
def embed_document(document_id: int) -> dict:
    from .models import Document
    from rag.providers import embed
    doc = Document.objects.select_related('organization').get(pk=document_id)
    doc.embedding_status = Document.EmbeddingStatus.INDEXING
    doc.save(update_fields=['embedding_status', 'updated_at'])
    try:
        if not settings.EMBEDDING_API_KEY:
            doc.embedding_status = Document.EmbeddingStatus.QUEUED
            doc.save(update_fields=['embedding_status', 'updated_at'])
            return {'id': doc.id, 'status': 'QUEUED', 'reason': 'embedding provider not configured'}
        for chunk in doc.chunks.all():
            chunk.embedding = embed(chunk.text)
            chunk.save(update_fields=['embedding'])
        doc.embedding_status = Document.EmbeddingStatus.INDEXED
        doc.save(update_fields=['embedding_status', 'updated_at'])
        write_system(doc.organization, 'DOCUMENT_EMBEDDED', doc.filename, 'SUCCESS', f'{doc.chunk_count} chunks indexed')
        return {'id': doc.id, 'status': 'INDEXED'}
    except Exception as exc:
        doc.embedding_status = Document.EmbeddingStatus.FAILED
        doc.error_message = str(exc)[:500]
        doc.save(update_fields=['embedding_status', 'error_message', 'updated_at'])
        write_system(doc.organization, 'DOCUMENT_EMBEDDED', doc.filename, 'FAILED', str(exc)[:500])
        return {'id': doc.id, 'status': 'FAILED', 'error': str(exc)[:500]}

@shared_task(name='knowledge.process_document')
def process_document(document_id: int) -> dict:
    from .models import Document, DocumentChunk
    from .pipeline import chunk_text, extract_text
    doc = Document.objects.select_related('organization', 'knowledge_base').get(pk=document_id)
    doc.status = Document.Status.PROCESSING; doc.error_message = ''
    doc.save(update_fields=['status', 'error_message', 'updated_at'])
    try:
        text, pages = extract_text(doc.file.path, doc.file_type)
        chunks = chunk_text(text)
        if not chunks: raise ValueError('No extractable text found in file.')
        doc.chunks.all().delete()
        DocumentChunk.objects.bulk_create([DocumentChunk(organization_id=doc.organization_id, knowledge_base_id=doc.knowledge_base_id, document=doc, chunk_index=i, text=body) for i, body in enumerate(chunks)])
        doc.status = Document.Status.READY; doc.pages = pages; doc.chunk_count = len(chunks)
        doc.save(update_fields=['status', 'pages', 'chunk_count', 'updated_at'])
        if settings.EMBEDDING_API_KEY: embed_document.delay(doc.id)
        write_system(doc.organization, 'DOCUMENT_PROCESSED', doc.filename, 'SUCCESS', f'{len(chunks)} chunks from {pages} page(s); embeddings queued')
        return {'id': doc.id, 'status': 'READY', 'chunks': len(chunks)}
    except Exception as exc:
        doc.status = Document.Status.FAILED; doc.error_message = str(exc)[:500]
        doc.save(update_fields=['status', 'error_message', 'updated_at'])
        write_system(doc.organization, 'DOCUMENT_PROCESSED', doc.filename, 'FAILED', str(exc)[:500])
        return {'id': doc.id, 'status': 'FAILED', 'error': str(exc)[:500]}
