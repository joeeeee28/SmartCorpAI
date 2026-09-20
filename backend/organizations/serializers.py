from rest_framework import serializers

from .models import Department, Organization


class OrganizationSerializer(serializers.ModelSerializer):
    users = serializers.IntegerField(source='users.count', read_only=True)
    departments = serializers.IntegerField(source='departments.count', read_only=True)

    class Meta:
        model = Organization
        fields = ('id', 'name', 'slug', 'created_at', 'users', 'departments')
        read_only_fields = ('slug', 'created_at')


class DepartmentSerializer(serializers.ModelSerializer):
    head = serializers.CharField(source='head.display_name', read_only=True, default=None)
    head_id = serializers.IntegerField(source='head.id', read_only=True, default=None)
    members = serializers.IntegerField(source='members.count', read_only=True)

    class Meta:
        model = Department
        fields = ('id', 'name', 'head', 'head_id', 'members', 'description')
