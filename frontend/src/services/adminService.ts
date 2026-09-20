import { approvals } from '../mock/approvals';
import { auditLogs, departments, requests, roles, tasks, users } from '../mock/admin';
import type { AuditLog, Department, RoleName, TaskItem, User } from '../types';
import { USE_MOCK, fmtDateTime, mock, request, unwrap } from './api';

const taskStore: TaskItem[] = structuredClone(tasks);

export interface RealUser {
  id: number; name: string; email: string; role: string;
  department: string | null; department_id: number | null;
  organization: { id: number; name: string; slug: string } | null;
  permissions: string[]; status: string; avatar_color: string;
}

function mapUser(u: RealUser): User {
  return {
    id: String(u.id), name: u.name, email: u.email, role: u.role as RoleName,
    department: u.department ?? '—', status: u.status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED',
    avatarColor: u.avatar_color, lastActive: '—', mfaEnabled: false,
  };
}

export const userService = {
  list: async (): Promise<User[]> => {
    if (USE_MOCK) return mock(users);
    return unwrap<RealUser>(await request('/users/')).map(mapUser);
  },
  roles: () => mock(roles), // no /roles endpoint yet — Phase 1 scope is users/departments/audit
  departments: async (): Promise<Department[]> => {
    if (USE_MOCK) return mock(departments);
    const rows = unwrap<{ id: number; name: string; head: string | null; members: number; description: string }>(
      await request('/departments/'));
    return rows.map((d) => ({ id: String(d.id), name: d.name, head: d.head ?? '—', members: d.members, knowledgeBases: 0, description: d.description }));
  },
  updateRole: async (id: string, role: string) => {
    if (USE_MOCK) return mock({ id, role }, 300);
    const updated = await request<RealUser>(`/users/${id}/`, { method: 'PATCH', body: JSON.stringify({ role }) });
    return { id: String(updated.id), role: updated.role };
  },
};

export const auditService = {
  list: async (): Promise<AuditLog[]> => {
    if (USE_MOCK) return mock(auditLogs);
    const rows = unwrap<{ id: number; at: string; user: string; action: string; resource: string; status: string; details: string; ip: string | null }>(
      await request('/audit-logs/'));
    return rows.map((l) => ({
      id: String(l.id), at: fmtDateTime(l.at), user: l.user || 'system', action: l.action,
      resource: l.resource, status: l.status as AuditLog['status'], details: l.details, ip: l.ip ?? '—',
    }));
  },
};

export const taskService = {
  list: () => mock([...taskStore]),
  updateStatus: (id: string, status: TaskItem['status']) => {
    const t = taskStore.find((x) => x.id === id);
    if (t) {
      t.status = status;
      t.progress = status === 'DONE' ? 100 : t.progress;
    }
    return mock(t, 250);
  },
};

export const requestService = {
  list: () => mock(requests),
  pendingApprovals: () => mock(approvals.filter((a) => a.status === 'PENDING')),
};

export interface SessionUser {
  name: string; email: string; role: string;
  organization: { id: number; name: string; slug: string } | null;
  permissions: string[];
}

export const authService = {
  login: async (email: string, password: string) => {
    if (USE_MOCK) {
      return mock({ token: 'demo-jwt-token', user: { name: 'Admin User', email: email || 'admin@smartcorp.ai', role: 'Admin', organization: null, permissions: ['*'] } as SessionUser }, 600);
    }
    const tokens = await request<{ access: string; refresh: string }>('/auth/login/', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('sc_token', tokens.access);
    localStorage.setItem('sc_refresh', tokens.refresh);
    const me = await request<RealUser>('/auth/me/');
    return { token: tokens.access, user: { name: me.name, email: me.email, role: me.role, organization: me.organization, permissions: me.permissions } as SessionUser };
  },
  register: async (name: string, email: string, password: string, organization?: string) => {
    if (USE_MOCK) {
      return mock({ token: 'demo-jwt-token', user: { name, email, role: 'Employee', organization: null, permissions: [] } as SessionUser }, 700);
    }
    const res = await request<{ access: string; refresh: string; user: RealUser }>('/auth/register/', {
      method: 'POST', body: JSON.stringify({ name, email, password, organization: organization || `${name}'s Organization` }),
    });
    localStorage.setItem('sc_token', res.access);
    localStorage.setItem('sc_refresh', res.refresh);
    const me = res.user;
    return { token: res.access, user: { name: me.name, email: me.email, role: me.role, organization: me.organization, permissions: me.permissions } as SessionUser };
  },
  restore: async (): Promise<SessionUser | null> => {
    if (USE_MOCK || !localStorage.getItem('sc_refresh')) return null;
    try {
      // request() auto-refreshes the access token on 401 via tryRefresh()
      localStorage.removeItem('sc_token');
      const me = await request<RealUser>('/auth/me/');
      return { name: me.name, email: me.email, role: me.role, organization: me.organization, permissions: me.permissions };
    } catch {
      return null;
    }
  },
  logout: async () => {
    if (!USE_MOCK) {
      const refresh = localStorage.getItem('sc_refresh');
      if (refresh) {
        try { await request('/auth/logout/', { method: 'POST', body: JSON.stringify({ refresh }) }); } catch { /* best effort */ }
      }
    }
    localStorage.removeItem('sc_token');
    localStorage.removeItem('sc_refresh');
    localStorage.removeItem('sc_user');
    return mock(null, 150);
  },
};
