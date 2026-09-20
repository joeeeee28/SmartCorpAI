from django.db import models


class AuditLog(models.Model):
    class Status(models.TextChoices):
        SUCCESS = 'SUCCESS', 'Success'
        DENIED = 'DENIED', 'Denied'
        FAILED = 'FAILED', 'Failed'

    organization = models.ForeignKey(
        'organizations.Organization', null=True, blank=True,
        on_delete=models.CASCADE, related_name='audit_logs',
    )
    actor = models.ForeignKey('accounts.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='audit_events')
    actor_name = models.CharField(max_length=255, default='')
    action = models.CharField(max_length=64, db_index=True)
    resource = models.CharField(max_length=255, default='')
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.SUCCESS)
    details = models.TextField(blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.created_at:%Y-%m-%d %H:%M} {self.action} {self.resource} [{self.status}]'
