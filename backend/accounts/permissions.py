from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    def has_permission(self, request, view) -> bool:
        u = request.user
        return bool(u and u.is_authenticated and (u.is_superuser or u.role_name == 'Admin'))


class HasScope(BasePermission):
    """View declares ``required_scopes = [...]``; the user needs any one of them."""

    def has_permission(self, request, view) -> bool:
        scopes = getattr(view, 'required_scopes', [])
        if not scopes:
            return True
        u = request.user
        if not (u and u.is_authenticated):
            return False
        return any(u.has_scope(s) for s in scopes)


class SameOrganizationObject(BasePermission):
    """Backstop: object-level org check (views must ALSO scope queryses)."""

    def has_object_permission(self, request, view, obj) -> bool:
        return getattr(obj, 'organization_id', None) == request.user.organization_id
