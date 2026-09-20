"""Organization isolation: A must never see B's data. Uses 404s (no existence leaks)."""
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase

from knowledge.models import Document, KnowledgeBase
from .helpers import auth, make_dept, make_org, make_user


class IsolationTests(APITestCase):
    def setUp(self):
        self.org_a = make_org('Org A')
        self.org_b = make_org('Org B')
        self.admin_a = make_user('admin-a@test.com', self.org_a, 'Admin')
        self.admin_b = make_user('admin-b@test.com', self.org_b, 'Admin')
        self.kb_b = KnowledgeBase.objects.create(organization=self.org_b, name='Secret KB')
        self.doc_b = Document.objects.create(
            organization=self.org_b, knowledge_base=self.kb_b, filename='secret.txt',
            file_type='TXT', file=SimpleUploadedFile('secret.txt', b'classified content here'),
            size_bytes=22, uploader=self.admin_b, status='READY')
        make_dept(self.org_b, 'Finance')

    def test_cross_org_kb_invisible(self):
        auth(self.client, self.admin_a)
        res = self.client.get('/api/knowledge-bases/')
        names = [kb['name'] for kb in res.data['results']]
        self.assertNotIn('Secret KB', names)
        res = self.client.get(f'/api/knowledge-bases/{self.kb_b.id}/')
        self.assertEqual(res.status_code, 404)

    def test_cross_org_document_invisible(self):
        auth(self.client, self.admin_a)
        res = self.client.get('/api/documents/')
        self.assertEqual(res.data['results'], [])
        res = self.client.get(f'/api/documents/{self.doc_b.id}/')
        self.assertEqual(res.status_code, 404)
        res = self.client.post(f'/api/documents/{self.doc_b.id}/process/')
        self.assertEqual(res.status_code, 404)

    def test_cross_org_users_departments_audit_invisible(self):
        auth(self.client, self.admin_a)
        users = self.client.get('/api/users/')
        self.assertNotIn('admin-b@test.com', [u['email'] for u in users.data['results']])
        self.assertEqual(self.client.get(f'/api/users/{self.admin_b.id}/').status_code, 404)
        depts = self.client.get('/api/departments/')
        self.assertEqual(depts.data['results'], [])
        logs = self.client.get('/api/audit-logs/')
        for entry in logs.data['results']:
            self.assertNotIn('admin-b', (entry.get('user') or '') + (entry.get('details') or ''))

    def test_cross_org_kb_create_rejected(self):
        """Uploading into another org's KB must fail even with a valid-looking id."""
        auth(self.client, self.admin_a)
        res = self.client.post('/api/documents/', {
            'knowledge_base': self.kb_b.id,
            'file': SimpleUploadedFile('evil.txt', b'x' * 100),
        }, format='multipart')
        self.assertEqual(res.status_code, 404)
        self.assertEqual(Document.objects.filter(organization=self.org_a).count(), 0)
