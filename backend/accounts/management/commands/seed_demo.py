"""Create demo org, users, departments and knowledge bases. DEV ONLY."""
from django.core.management.base import BaseCommand

from accounts.models import Role, User
from knowledge.models import KnowledgeBase
from organizations.models import Department, Organization


class Command(BaseCommand):
    help = 'Seed demo data (dev only — predictable passwords)'

    def handle(self, *args, **options):
        org, _ = Organization.objects.get_or_create(name='SmartCorp Inc.')
        depts = {}
        for name, desc in [
            ('Human Resources', 'People operations, policy and onboarding.'),
            ('Finance', 'Accounting, expenses, procurement and reporting.'),
            ('Support', 'Customer success and ticket resolution.'),
            ('Engineering', 'Product development and infrastructure.'),
            ('Legal', 'Contracts, compliance and risk.'),
            ('Sales', 'Revenue, proposals and partnerships.'),
        ]:
            depts[name], _ = Department.objects.get_or_create(
                organization=org, name=name, defaults={'description': desc})

        users = [
            ('Admin User', 'admin@smartcorp.ai', 'Admin', 'Engineering', '#4f46e5', 'Admin123!'),
            ('Priya Nair', 'priya@smartcorp.ai', 'HR', 'Human Resources', '#0ea5e9', 'Priya123!'),
            ('Marcus Chen', 'marcus@smartcorp.ai', 'Finance', 'Finance', '#10b981', 'Marcus123!'),
            ('Daniel Osei', 'daniel@smartcorp.ai', 'Support', 'Support', '#f59e0b', 'Daniel123!'),
        ]
        for full, email, role, dept, color, pwd in users:
            if User.objects.filter(email=email).exists():
                continue
            first, _, last = full.partition(' ')
            u = User(email=email, first_name=first, last_name=last, organization=org,
                     role=Role.objects.get(name=role), department=depts[dept], avatar_color=color)
            u.set_password(pwd)
            u.save()
            self.stdout.write(f'user: {email} / {pwd}')

        kbs = [
            ('HR Handbook', 'Leave, attendance, onboarding, benefits and workplace policies.',
             'Human Resources', 'Organization'),
            ('Finance Policies', 'Expense rules, invoicing, procurement and quarterly reports.',
             'Finance', 'Department'),
            ('Product Knowledge', 'Product manuals, troubleshooting guides and ticket macros.',
             'Support', 'Organization'),
            ('Legal & Compliance', 'Contracts, NDAs, data retention and regulatory filings.',
             'Legal', 'Restricted'),
            ('Engineering Docs', 'Architecture RFCs, runbooks, API references and ADRs.',
             'Engineering', 'Department'),
            ('Sales Playbooks', 'Pricing, battlecards, proposals and onboarding decks.',
             'Sales', 'Department'),
        ]
        admin = User.objects.get(email='admin@smartcorp.ai')
        for name, desc, dept, vis in kbs:
            KnowledgeBase.objects.get_or_create(
                organization=org, name=name,
                defaults={'description': desc, 'department': depts[dept],
                          'visibility': vis, 'created_by': admin})
        self.stdout.write(self.style.SUCCESS('Demo seed complete.'))
