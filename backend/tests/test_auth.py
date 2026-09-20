"""Authentication: register, login, refresh, me, logout."""
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


class AuthTests(APITestCase):
    def test_register_creates_org_and_admin(self):
        res = self.client.post('/api/auth/register/', {
            'name': 'Ada Lovelace', 'email': 'ada@acme.test',
            'password': 'Supersecret1', 'organization': 'Acme Test',
        }, format='json')
        self.assertEqual(res.status_code, 201, res.content)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertEqual(res.data['user']['role'], 'Admin')
        self.assertEqual(res.data['user']['organization']['name'], 'Acme Test')
        user = User.objects.get(email='ada@acme.test')
        self.assertTrue(user.check_password('Supersecret1'))
        self.assertEqual(user.organization.name, 'Acme Test')

    def test_register_rejects_duplicate_email_and_org(self):
        payload = {'name': 'A', 'email': 'dupe@test.com', 'password': 'Supersecret1', 'organization': 'Org X'}
        self.assertEqual(self.client.post('/api/auth/register/', payload, format='json').status_code, 201)
        payload2 = dict(payload, organization='Org Y')
        self.assertEqual(self.client.post('/api/auth/register/', payload2, format='json').status_code, 400)
        payload3 = dict(payload, email='other@test.com')
        self.assertEqual(self.client.post('/api/auth/register/', payload3, format='json').status_code, 400)

    def test_login_me_refresh_logout(self):
        self.client.post('/api/auth/register/', {
            'name': 'Bob', 'email': 'bob@test.com',
            'password': 'Supersecret1', 'organization': 'Org B',
        }, format='json')
        login = self.client.post('/api/auth/login/', {'email': 'bob@test.com', 'password': 'Supersecret1'}, format='json')
        self.assertEqual(login.status_code, 200)
        access, refresh = login.data['access'], login.data['refresh']

        bad = self.client.post('/api/auth/login/', {'email': 'bob@test.com', 'password': 'wrong'}, format='json')
        self.assertEqual(bad.status_code, 401)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        me = self.client.get('/api/auth/me/')
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.data['email'], 'bob@test.com')
        self.assertEqual(me.data['role'], 'Admin')

        rotated = self.client.post('/api/auth/refresh/', {'refresh': refresh}, format='json')
        self.assertEqual(rotated.status_code, 200)
        self.assertIn('access', rotated.data)

        # old refresh was rotated+blacklisted
        reuse = self.client.post('/api/auth/refresh/', {'refresh': refresh}, format='json')
        self.assertEqual(reuse.status_code, 401)

        logout = self.client.post('/api/auth/logout/', {'refresh': rotated.data['refresh']}, format='json')
        self.assertEqual(logout.status_code, 204)

    def test_protected_endpoints_require_auth(self):
        for url in ['/api/auth/me/', '/api/knowledge-bases/', '/api/documents/', '/api/users/', '/api/audit-logs/']:
            res = self.client.get(url)
            self.assertEqual(res.status_code, 401, url)
