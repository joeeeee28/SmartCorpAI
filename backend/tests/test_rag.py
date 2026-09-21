from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from knowledge.models import Document, KnowledgeBase, DocumentChunk
from .helpers import auth, make_org, make_user

class RagSecurityTests(APITestCase):
    def setUp(self):
        self.org = make_org('RAG Org')
        self.other = make_org('Other Org')
        self.admin = make_user('rag-admin@test.com', self.org, 'Admin')
        self.other_admin = make_user('other-admin@test.com', self.other, 'Admin')
        self.kb = KnowledgeBase.objects.create(organization=self.org, name='Public')
        self.secret = KnowledgeBase.objects.create(organization=self.other, name='Secret')
        self.doc = Document.objects.create(organization=self.other, knowledge_base=self.secret, filename='secret.txt', file_type='TXT', file=SimpleUploadedFile('secret.txt', b'cross tenant secret'), status='READY')
        DocumentChunk.objects.create(organization=self.other, knowledge_base=self.secret, document=self.doc, chunk_index=0, text='cross tenant secret')

    def test_search_never_returns_other_organization(self):
        auth(self.client, self.admin)
        res = self.client.post('/api/rag/search/', {'query': 'secret'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['citations'], [])

    def test_restricted_document_is_excluded_before_context(self):
        self.doc.organization = self.org
        self.doc.knowledge_base = self.kb
        self.doc.roles_allowed = ['HR']
        self.doc.save()
        self.doc.chunks.update(organization=self.org, knowledge_base=self.kb)
        auth(self.client, make_user('employee@test.com', self.org, 'Employee'))
        res = self.client.post('/api/rag/search/', {'query': 'cross tenant secret'}, format='json')
        self.assertEqual(res.data['citations'], [])

    def test_chat_is_owner_and_org_scoped(self):
        auth(self.client, self.admin)
        created = self.client.post('/api/chat/conversations/', {'title': 'private'}, format='json')
        self.assertEqual(created.status_code, 201)
        auth(self.client, self.other_admin)
        self.assertEqual(self.client.get(f"/api/chat/conversations/{created.data['id']}/").status_code, 404)
