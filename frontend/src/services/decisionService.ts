import { decisions } from '../mock/approvals';
import type { Decision } from '../types';
import { mock } from './api';

const store: Decision[] = structuredClone(decisions);

export const decisionService = {
  list: () => mock([...store]),
  get: (id: string) => mock(store.find((d) => d.id === id)),
  decide: (id: string, approved: boolean) => {
    const d = store.find((x) => x.id === id);
    if (d) {
      d.status = approved ? 'APPROVED' : 'REJECTED';
      d.updatedAt = 'Sep 20, 2026 · now';
    }
    return mock(d, 350);
  },
};
