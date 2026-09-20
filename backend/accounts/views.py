from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from audit.log import write as audit
from .models import Role
from .permissions import IsAdminRole, SameOrganizationObject
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer, UserUpdateSerializer

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['org_id'] = user.organization_id
        refresh['role'] = user.role_name
        audit(request, 'REGISTER', user.email, 'SUCCESS', f'Organization "{user.organization.name}" created; first user is Admin')
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            audit(request, 'LOGIN', request.data.get('email', ''), 'FAILED', 'Invalid credentials')
            raise
        audit(request, 'LOGIN', serializer.user.email, 'SUCCESS', f'Role {serializer.user.role_name}')
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    def post(self, request):
        refresh = request.data.get('refresh')
        if not refresh:
            return Response({'detail': 'refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            RefreshToken(refresh).blacklist()
        except TokenError:
            return Response({'detail': 'invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        audit(request, 'LOGOUT', request.user.email, 'SUCCESS', '')
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(RetrieveAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserViewSet(GenericViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, SameOrganizationObject]

    def get_queryset(self):
        return User.objects.filter(organization_id=self.request.user.organization_id).select_related(
            'role', 'department', 'organization').order_by('email')

    def list(self, request):
        page = self.paginate_queryset(self.get_queryset())
        return self.get_paginated_response(UserSerializer(page, many=True).data)

    def retrieve(self, request, pk=None):
        obj = self.get_object()
        return Response(UserSerializer(obj).data)

    def partial_update(self, request, pk=None):
        if not IsAdminRole().has_permission(request, self):
            return Response({'detail': 'Admin role required.'}, status=status.HTTP_403_FORBIDDEN)
        obj = self.get_object()
        serializer = UserUpdateSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        audit(request, 'USER_UPDATED', obj.email, 'SUCCESS', f'role={obj.role_name} active={obj.is_active}')
        return Response(UserSerializer(obj).data)
