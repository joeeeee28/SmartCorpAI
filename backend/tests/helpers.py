"""Shared fixtures for backend tests."""
from django.contrib.auth import get_user_model
from organizations.models import Department, Organization
from accounts.models import Role

User = get_user_model()
PASSWORD = 'Supersecret1'


def make_org(name='Org A'):
    return Organization.objects.create(name=name)


def make_user(email, org, role_name='Employee', department=None, password=PASSWORD, **kw):
    user = User(email=email, organization=org, role=Role.objects.get(name=role_name),
                department=department, first_name=email.split('@')[0], **kw)
    user.set_password(password)
    user.save()
    return user


def auth(client, user, password=PASSWORD):
    res = client.post('/api/auth/login/', {'email': user.email, 'password': password}, format='json')
    assert res.status_code == 200, res.content
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
    return res.data


def make_dept(org, name='Engineering'):
    return Department.objects.create(organization=org, name=name)
