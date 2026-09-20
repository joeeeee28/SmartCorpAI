import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.Model):
    """Global role definitions. Users get exactly one role (Phase 1)."""

    ADMIN = 'Admin'
    HR = 'HR'
    FINANCE = 'Finance'
    SUPPORT = 'Support'
    EMPLOYEE = 'Employee'

    name = models.CharField(max_length=32, unique=True)
    description = models.TextField(blank=True)
    permissions = models.JSONField(default=list, help_text='Scope strings, e.g. kb.manage')

    class Meta:
        ordering = ['name']

    def __str__(self) -> str:
        return self.name


class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    organization = models.ForeignKey(
        'organizations.Organization', null=True, blank=True,
        on_delete=models.CASCADE, related_name='users',
    )
    role = models.ForeignKey(Role, null=True, blank=True, on_delete=models.PROTECT, related_name='users')
    department = models.ForeignKey(
        'organizations.Department', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='members',
    )
    avatar_color = models.CharField(max_length=16, default='#4f46e5')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS: list[str] = []

    def save(self, *args, **kwargs):
        if not self.username:
            base = (self.email or 'user').split('@')[0][:140]
            candidate = base
            while User.objects.filter(username=candidate).exclude(pk=self.pk).exists():
                candidate = f'{base}-{uuid.uuid4().hex[:6]}'
            self.username = candidate
        super().save(*args, **kwargs)

    @property
    def display_name(self) -> str:
        full = self.get_full_name().strip()
        return full or (self.email or '').split('@')[0] or 'User'

    @property
    def role_name(self) -> str:
        return self.role.name if self.role else Role.EMPLOYEE

    def has_scope(self, scope: str) -> bool:
        if self.is_superuser or self.role_name == Role.ADMIN:
            return True
        return scope in (self.role.permissions if self.role else [])
