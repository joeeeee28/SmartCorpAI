"""Knowledge Hub: KB CRUD, upload validation, real processing pipeline, chunks, audit."""
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase

from audit.models import AuditLog
from knowledge.models import Document, DocumentChunk, KnowledgeBase
from knowledge.pipeline import chunk_text, clean_text
from .helpers import auth, make_org, make_user


class PipelineUnitTests(APITestCase):
    def test_clean_and_chunk(self):
        dirty = '  Hello   world  \r\n\r\n\r\nSecond   paragraph.  '
        self.assertEqual(clean_text(dirty), 'Hello world\n\nSecond paragraph.')
        long_text = ('Sentence one two three. ' * 200).strip()
        chunks = chunk_text(long_text, size=800, overlap=120)
        self.assertGreater(len(chunks), 3)
        self.assertTrue(all(len(c) <= 800 for c in chunks))
        joined = ' '.join(chunks)
        self.assertIn('Sentence one two three', joined)

    def test_empty_text_chunks_to_nothing(self):
        self.assertEqual(chunk_text('   \n  '), [])


class KnowledgeApiTests(APITestCase):
    def setUp(self):
        self.org = make_org()
        self.admin = make_user('admin@test.com', self.org, 'Admin')
        self.kb = KnowledgeBase.objects.create(organization=self.org, name='HR Handbook')
        auth(self.client, self.admin)

    def test_kb_list_shows_counts(self):
        res = self.client.get('/api/knowledge-bases/')
        self.assertEqual(res.status_code, 200)
        kb = [k for k in res.data['results'] if k['name'] == 'HR Handbook'][0]
        self.assertEqual(kb['documents'], 0)
        self.assertEqual(kb['chunks'], 0)
        self.assertEqual(kb['visibility'], 'Organization')

    def test_upload_txt_processes_to_ready_with_chunks(self):
        body = ('Annual leave policy. Employees receive twenty days per year. ' * 60).encode()
        res = self.client.post('/api/documents/', {
            'knowledge_base': self.kb.id,
            'file': SimpleUploadedFile('leave-policy.txt', body, content_type='text/plain'),
        }, format='multipart')
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(res.data['status'], 'READY')  # eager pipeline ran for real
        self.assertGreater(res.data['chunks'], 1)
        self.assertEqual(res.data['type'], 'TXT')
        self.assertTrue(res.data['history'])

        doc = Document.objects.get(pk=res.data['id'])
        self.assertEqual(doc.status, 'READY')
        self.assertEqual(DocumentChunk.objects.filter(document=doc).count(), doc.chunk_count)
        first = DocumentChunk.objects.filter(document=doc).order_by('chunk_index').first()
        self.assertIn('Annual leave policy', first.text)
        self.assertIsNotNone(first.embedding)
        self.assertEqual(len(first.embedding), 1536)
        self.assertEqual(doc.embedding_status, 'INDEXED')

        # audit trail written
        actions = set(AuditLog.objects.filter(organization=self.org).values_list('action', flat=True))
        self.assertIn('DOCUMENT_UPLOAD', actions)
        self.assertIn('DOCUMENT_PROCESSED', actions)

    def test_upload_csv_and_validation_errors(self):
        csv_body = b'name,salary\nada,100\nbob,200\n'
        res = self.client.post('/api/documents/', {
            'knowledge_base': self.kb.id,
            'file': SimpleUploadedFile('salaries.csv', csv_body, content_type='text/csv'),
        }, format='multipart')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['status'], 'READY')

        bad = self.client.post('/api/documents/', {
            'knowledge_base': self.kb.id,
            'file': SimpleUploadedFile('virus.exe', b'MZ...', content_type='application/octet-stream'),
        }, format='multipart')
        self.assertEqual(bad.status_code, 400)

        empty = self.client.post('/api/documents/', {
            'knowledge_base': self.kb.id,
            'file': SimpleUploadedFile('empty.txt', b'', content_type='text/plain'),
        }, format='multipart')
        self.assertEqual(empty.status_code, 400)

    def test_document_detail_and_reprocess_and_delete(self):
        body = ('Content line. ' * 100).encode()
        res = self.client.post('/api/documents/', {
            'knowledge_base': self.kb.id,
            'file': SimpleUploadedFile('notes.txt', body),
        }, format='multipart')
        doc_id = res.data['id']
        detail = self.client.get(f'/api/documents/{doc_id}/')
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data['knowledge_base'], 'HR Handbook')
        self.assertEqual(detail.data['uploader'], 'admin')

        re = self.client.post(f'/api/documents/{doc_id}/process/')
        self.assertEqual(re.status_code, 200)
        self.assertEqual(re.data['status'], 'READY')

        self.assertEqual(self.client.delete(f'/api/documents/{doc_id}/').status_code, 204)
        self.assertFalse(Document.objects.filter(pk=doc_id).exists())

    def test_failed_processing_marks_failed_honestly(self):
        # A .pdf extension with garbage bytes must FAIL, not fake READY.
        res = self.client.post('/api/documents/', {
            'knowledge_base': self.kb.id,
            'file': SimpleUploadedFile('broken.pdf', b'%PDF-1.4 garbage-not-a-real-pdf\x00\xff' * 5,
                                       content_type='application/pdf'),
        }, format='multipart')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['status'], 'FAILED')
        self.assertTrue(res.data['error_message'])
