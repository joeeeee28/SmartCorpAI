from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='actor_name', read_only=True)
    at = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = AuditLog
        fields = ('id', 'at', 'user', 'action', 'resource', 'status', 'details', 'ip')
