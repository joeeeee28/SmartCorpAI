from celery import shared_task

from audit.log import write_system


@shared_task(name='knowledge.process_document')
def process_document(document_id: int) -> dict:
    """Extract → clean → chunk → store. Embeddings arrive in Phase 2 (status stays QUEUED)."""
    from .models import Document, DocumentChunk
    from .pipeline import chunk_text, extract_text

    doc = Document.objects.select_related('organization', 'knowledge_base').get(pk=document_id)
    doc.status = Document.Status.PROCESSING
    doc.error_message = ''
    doc.save(update_fields=['status', 'error_message', 'updated_at'])
    try:
        text, pages = extract_text(doc.file.path, doc.file_type)
        chunks = chunk_text(text)
        if not chunks:
            raise ValueError('No extractable text found in file.')
        doc.chunks.all().delete()
        DocumentChunk.objects.bulk_create([
            DocumentChunk(
                organization_id=doc.organization_id,
                knowledge_base_id=doc.knowledge_base_id,
                document=doc, chunk_index=i, text=body, page=None, section='',
            )
            for i, body in enumerate(chunks)
        ])
        doc.status = Document.Status.READY
        doc.pages = pages
        doc.chunk_count = len(chunks)
        doc.save(update_fields=['status', 'pages', 'chunk_count', 'updated_at'])
        write_system(doc.organization, 'DOCUMENT_PROCESSED', doc.filename, 'SUCCESS',
                     f'{len(chunks)} chunks from {pages} page(s); embeddings queued (Phase 2)')
        return {'id': doc.id, 'status': 'READY', 'chunks': len(chunks)}
    except Exception as exc:  # noqa: BLE001 - processing must never crash the worker/loop
        doc.status = Document.Status.FAILED
        doc.error_message = str(exc)[:500]
        doc.save(update_fields=['status', 'error_message', 'updated_at'])
        write_system(doc.organization, 'DOCUMENT_PROCESSED', doc.filename, 'FAILED', str(exc)[:500])
        return {'id': doc.id, 'status': 'FAILED', 'error': str(exc)[:500]}
