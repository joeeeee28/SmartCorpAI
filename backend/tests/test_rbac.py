"""RBAC: role + visibility enforcement at the API level."""
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase

from knowledge.models import Document, KnowledgeBase
from organizations.models import Department
from .helpers import auth, make_dept, make_org, make_user


class RBACTests(APITestCase):
    def setUp(self):
        self.org = make_org()
        self.hr_dept = make_dept(self.org, 'Human Resources')
        self.eng_dept = make_dept(self.org, 'Engineering')
        self.admin = make_user('admin@test.com', self.org, 'Admin')
        self.hr = make_user('hr@test.com', self.org, 'HR', department=self.hr_dept)
        self.emp = make_user('emp@test.com', self.org, 'Employee', department=self.eng_dept)
        self.open_kb = KnowledgeBase.objects.create(organization=self.org, name='Open KB')
        self.dept_kb = KnowledgeBase.objects.create(
            organization=self.org, name='HR KB', visibility='Department', department=self.hr_dept)
        self.restricted_kb = KnowledgeBase.objects.create(
            organization=self.org, name='Legal Vault', visibility='Restricted')
        self.role_doc = Document.objects.create(
            organization=self.org, knowledge_base=self.open_kb, filename='salaries.txt',
            file_type='TXT', file=SimpleUploadedFile('salaries.txt', b'pay data'),
            size_bytes=8, uploader=self.admin, status='READY', roles_allowed=['HR', 'Admin'])

    def kb_names(self):
        return [kb['name'] for kb in self.client.get('/api/knowledge-bases/').data['results']]

    def test_admin_sees_everything(self):
        auth(self.client, self.admin)
        self.assertEqual(set(self.kb_names()), {'Open KB', 'HR KB', 'Legal Vault'})

    def test_employee_visibility_rules(self):
        auth(self.client, self.emp)
        names = self.kb_names()
        self.assertIn('Open KB', names)
        self.assertNotIn('HR KB', names)          # other department
        self.assertNotIn('Legal Vault', names)    # restricted
        self.assertEqual(self.client.get(f'/api/knowledge-bases/{self.restricted_kb.id}/').status_code, 404)

    def test_hr_member_sees_own_department_kb(self):
        auth(self.client, self.hr)
        names = self.kb_names()
        self.assertIn('HR KB', names)
        self.assertNotIn('Legal Vault', names)

    def test_role_restricted_document(self):
        auth(self.client, self.emp)
        self.assertEqual(self.client.get(f'/api/documents/{self.role_doc.id}/').status_code, 404)
        auth(self.client, self.hr)
        res = self.client.get(f'/api/documents/{self.role_doc.id}/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['name'], 'salaries.txt')

    def test_admin_only_writes(self):
        auth(self.client, self.emp)
        res = self.client.delete(f'/api/knowledge-bases/{self.open_kb.id}/')
        self.assertEqual(res.status_code, 403)
        res = self.client.patch(f'/api/users/{self.emp.id}/', {'role': 'Admin'}, format='json')
        self.assertEqual(res.status_code, 403)
        res = self.client.get('/api/audit-logs/')
        self.assertEqual(res.status_code, 403)
        # Admin can do all of the above
        auth(self.client, self.admin)
        self.assertEqual(self.client.get('/api/audit-logs/').status_code, 200)
        res = self.client.patch(f'/api/users/{self.emp.id}/', {'role': 'HR'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['role'], 'HR')

    def test_member_can_create_kb_but_not_delete(self):
        auth(self.client, self.emp)
        res = self.client.post('/api/knowledge-bases/', {'name': 'Team Notes'}, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(self.client.delete(f"/api/knowledge-bases/{res.data['id']}/").status_code, 403)
