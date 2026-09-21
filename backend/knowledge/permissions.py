"""Knowledge visibility rules — the same checks the RAG layer will reuse (Phase 2)."""


def role_name(user) -> str:
    return user.role.name if getattr(user, 'role', None) else 'Employee'


def is_admin(user) -> bool:
    return bool(user and user.is_authenticated and (user.is_superuser or role_name(user) == 'Admin'))


def can_access_kb(user, kb) -> bool:
    if not user or not user.is_authenticated:
        return False
    if user.organization_id != kb.organization_id:
        return False
    if is_admin(user):
        return True
    if kb.visibility == 'Restricted':
        return False
    if kb.visibility == 'Department':
        if kb.department_id is None:
            return True
        return user.department_id == kb.department_id
    return True


def can_access_document(user, doc) -> bool:
    if not can_access_kb(user, doc.knowledge_base):
        return False
    if is_admin(user):
        return True
    if doc.department_id is not None and doc.department_id != user.department_id:
        return False
    allowed = doc.roles_allowed or []
    if allowed and role_name(user) not in allowed:
        return False
    return True
