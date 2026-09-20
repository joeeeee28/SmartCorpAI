import { approvals } from '../mock/approvals';
import type { Approval, ApprovalStatus } from '../types';
import { mock } from './api';

const store: Approval[] = structuredClone(approvals);

export const approvalService = {
  list: (status?: ApprovalStatus) => mock(status ? store.filter((a) => a.status === status) : [...store]),
  get: (id: string) => mock(store.find((a) => a.id === id)),
  decide: (id: string, status: Extract<ApprovalStatus, 'APPROVED' | 'REJECTED'>, comment: string) => {
    const a = store.find((x) => x.id === id);
    if (a) {
      a.status = status;
      a.decidedAt = 'Sep 20, 2026 · now';
      if (comment) a.comments.push({ by: 'Admin User', text: comment, at: 'Sep 20, now' });
      a.resultingAction = status === 'APPROVED' ? 'Action queued for execution' : 'Request closed';
    }
    return mock(a, 350);
  },
  comment: (id: string, text: string) => {
    const a = store.find((x) => x.id === id);
    if (a) a.comments.push({ by: 'Admin User', text, at: 'Sep 20, now' });
    return mock(a, 250);
  },
};
