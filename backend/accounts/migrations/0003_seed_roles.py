"""Seed the five product roles with their permission scopes."""
from django.db import migrations

ROLES = [
    ('Admin', 'Full organization access incl. security settings and user management.',
     ['*']),
    ('HR', 'HR knowledge bases, leave approvals and onboarding tasks.',
     ['kb.hr.read', 'kb.hr.write', 'approvals.leave', 'tasks.manage']),
    ('Finance', 'Finance knowledge, expenses, invoices and budget reports.',
     ['kb.finance.read', 'kb.finance.write', 'approvals.expense', 'reports.finance']),
    ('Support', 'Product knowledge, tickets and customer-facing answers.',
     ['kb.support.read', 'tickets.manage', 'chat.use']),
    ('Employee', 'Standard access: ask AI, read assigned knowledge, file requests.',
     ['chat.use', 'kb.assigned.read', 'requests.create']),
]


def seed(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    for name, desc, perms in ROLES:
        Role.objects.update_or_create(name=name, defaults={'description': desc, 'permissions': perms})


def unseed(apps, schema_editor):
    apps.get_model('accounts', 'Role').objects.filter(name__in=[r[0] for r in ROLES]).delete()


class Migration(migrations.Migration):
    dependencies = [('accounts', '0002_initial')]

    operations = [migrations.RunPython(seed, unseed)]
