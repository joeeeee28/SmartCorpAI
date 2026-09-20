import { approvals } from '../mock/approvals';
import { auditLogs, departments, requests, roles, tasks, users } from '../mock/admin';
import type { TaskItem } from '../types';
import { mock } from './api';

const taskStore: TaskItem[] = structuredClone(tasks);

export const userService = {
  list: () => mock(users),
  roles: () => mock(roles),
  departments: () => mock(departments),
  updateRole: (id: string, role: string) => mock({ id, role }, 300),
};

export const auditService = {
  list: () => mock(auditLogs),
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

export const authService = {
  login: (email: string, _password: string) =>
    mock({ token: 'demo-jwt-token', user: { name: 'Admin User', email: email || 'admin@smartcorp.ai', role: 'Admin' as const } }, 600),
  register: (name: string, email: string, _password: string) =>
    mock({ token: 'demo-jwt-token', user: { name, email, role: 'Employee' as const } }, 700),
  logout: () => mock(null, 150),
};
