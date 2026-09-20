from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from organizations.models import Organization
from .models import Role

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='display_name', read_only=True)
    role = serializers.CharField(source='role_name', read_only=True)
    department = serializers.CharField(source='department.name', read_only=True, default=None)
    department_id = serializers.IntegerField(source='department.id', read_only=True, default=None)
    organization = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'role', 'department', 'department_id',
                  'organization', 'permissions', 'status', 'avatar_color', 'date_joined')

    def get_organization(self, obj):
        return {'id': obj.organization.id, 'name': obj.organization.name, 'slug': obj.organization.slug} if obj.organization else None

    def get_permissions(self, obj):
        if obj.is_superuser or obj.role_name == 'Admin':
            return ['*']
        return list(obj.role.permissions) if obj.role else []

    def get_status(self, obj):
        return 'ACTIVE' if obj.is_active else 'SUSPENDED'


class UserUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['Admin', 'HR', 'Finance', 'Support', 'Employee'], required=False)
    department_id = serializers.IntegerField(required=False, allow_null=True)
    is_active = serializers.BooleanField(required=False)

    def update(self, instance, validated):
        from organizations.models import Department

        if 'role' in validated:
            instance.role = Role.objects.get(name=validated['role'])
        if 'department_id' in validated:
            dep_id = validated['department_id']
            instance.department = None if dep_id is None else Department.objects.get(
                pk=dep_id, organization_id=instance.organization_id)
        if 'is_active' in validated:
            instance.is_active = validated['is_active']
        instance.save()
        return instance


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    organization = serializers.CharField(max_length=255, help_text='New organization name')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate_organization(self, value):
        if Organization.objects.filter(name__iexact=value.strip()).exists():
            raise serializers.ValidationError('An organization with this name already exists.')
        return value.strip()

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated):
        org = Organization.objects.create(name=validated['organization'])
        admin_role = Role.objects.get(name=Role.ADMIN)
        parts = validated['name'].strip().split(' ', 1)
        user = User(
            email=validated['email'], first_name=parts[0],
            last_name=parts[1] if len(parts) > 1 else '',
            organization=org, role=admin_role,
        )
        user.set_password(validated['password'])
        user.save()
        return user


class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['org_id'] = user.organization_id
        token['role'] = user.role_name
        return token
