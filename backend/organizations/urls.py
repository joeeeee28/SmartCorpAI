from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DepartmentViewSet, OrganizationView

router = DefaultRouter()
router.register('departments', DepartmentViewSet, basename='departments')

urlpatterns = [
    path('organization/', OrganizationView.as_view(), name='organization'),
    path('', include(router.urls)),
]
