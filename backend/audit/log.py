"""Single helper for writing audit records. Call from views/tasks, never from models."""
from __future__ import annotations

from typing import Any


def client_ip(request) -> str | None:
    if request is None:
        return None
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def write(request, action: str, resource: str = '', status: str = 'SUCCESS', details: str = '') -> None:
    from .models import AuditLog

    user = getattr(request, 'user', None) if request is not None else None
    authed = user is not None and getattr(user, 'is_authenticated', False)
    AuditLog.objects.create(
        organization=getattr(user, 'organization', None) if authed else None,
        actor=user if authed else None,
        actor_name=getattr(user, 'display_name', '') if authed else '',
        action=action,
        resource=resource,
        status=status,
        details=details,
        ip=client_ip(request),
    )


def write_system(organization, action: str, resource: str = '', status: str = 'SUCCESS', details: str = '') -> None:
    """For Celery tasks / jobs with no HTTP request."""
    from .models import AuditLog

    AuditLog.objects.create(
        organization=organization, actor=None, actor_name='system',
        action=action, resource=resource, status=status, details=details, ip=None,
    )
