import { agentRuns, agents } from '../mock/agents';
import type { AgentRun } from '../types';
import { mock } from './api';

// Mock intent router: User question → Intent → Agent. Mirrors the future backend router.
export function routeQuery(query: string): { intent: string; agentId: string } {
  const q = query.toLowerCase();
  if (/(leave|vacation|holiday|payroll|onboard|benefit|attendance|sick|parental|hr\b)/.test(q)) return { intent: 'hr_policy', agentId: 'hr' };
  if (/(expense|invoice|budget|reimburse|cost|spend|per-diem|finance|procurement|refund.*invoice)/.test(q)) return { intent: 'finance_policy', agentId: 'finance' };
  if (/(error|bug|sso|login|api|refund|customer|ticket|support|troubleshoot)/.test(q)) return { intent: 'support_issue', agentId: 'support' };
  return { intent: 'general', agentId: 'hr' };
}

export const agentService = {
  list: () => mock(agents),
  get: (id: string) => mock(agents.find((a) => a.id === id)),
  runs: (agentId?: string) => mock(agentId ? agentRuns.filter((r) => r.agentId === agentId) : agentRuns),
  run: (agentId: string, query: string): Promise<AgentRun> => {
    const agent = agents.find((a) => a.id === agentId) ?? agents[0];
    return mock({
      id: `run-${Date.now()}`, agentId, agent: agent.name, query, user: 'Admin User',
      status: 'SUCCESS', latencyMs: 900 + Math.floor(Math.random() * 700),
      confidence: 0.88 + Math.random() * 0.09, at: 'just now',
    }, 1400);
  },
};
