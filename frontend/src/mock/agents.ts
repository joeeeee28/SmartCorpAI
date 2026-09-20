import type { Agent, AgentRun } from '../types';

export const agents: Agent[] = [
  {
    id: 'hr', name: 'HR Agent', short: 'HR',
    description: 'Answers HR policy questions about leave, attendance, onboarding, benefits and workplace conduct.',
    status: 'ACTIVE', color: '#4f46e5',
    instructions: 'You are the SmartCorp HR assistant. Answer strictly from the HR Handbook and related approved policies. Cite the source document and section for every factual claim. If evidence is insufficient, say so instead of guessing.',
    knowledgeBases: ['HR Handbook', 'Legal & Compliance'],
    tools: ['rag.search', 'rag.cite', 'calendar.leave_lookup', 'approval.request'],
    temperature: 0.2, maxTokens: 1200, runs: 986, successRate: 96.4, avgLatencyMs: 1180, lastRun: '6 min ago',
  },
  {
    id: 'finance', name: 'Finance Agent', short: 'FIN',
    description: 'Handles expense rules, invoice status, procurement policy and budget report questions.',
    status: 'ACTIVE', color: '#0ea5e9',
    instructions: 'You are the SmartCorp Finance assistant. Use Finance Policies and quarterly reports. Always show amounts with currency and period. Escalate reimbursements above $2,000 to the approval queue with evidence attached.',
    knowledgeBases: ['Finance Policies', 'Legal & Compliance'],
    tools: ['rag.search', 'rag.cite', 'erp.invoice_lookup', 'approval.request'],
    temperature: 0.1, maxTokens: 1200, runs: 742, successRate: 97.8, avgLatencyMs: 1042, lastRun: '18 min ago',
  },
  {
    id: 'support', name: 'Support Agent', short: 'SUP',
    description: 'Resolves customer issues using product knowledge, troubleshooting guides and ticket history.',
    status: 'ACTIVE', color: '#10b981',
    instructions: 'You are the SmartCorp Support assistant. Diagnose from Product Knowledge and Engineering Docs. Provide numbered resolution steps, link the source guide, and create a ticket summary when the issue is unresolved.',
    knowledgeBases: ['Product Knowledge', 'Engineering Docs'],
    tools: ['rag.search', 'rag.cite', 'ticket.create', 'ticket.lookup'],
    temperature: 0.3, maxTokens: 1500, runs: 698, successRate: 94.9, avgLatencyMs: 1310, lastRun: '2 min ago',
  },
];

export const agentRuns: AgentRun[] = [
  { id: 'run-901', agentId: 'support', agent: 'Support Agent', query: 'Customer cannot reset SSO password, error AUTH-214', user: 'Daniel Osei', status: 'SUCCESS', latencyMs: 1210, confidence: 0.93, at: '2 min ago' },
  { id: 'run-900', agentId: 'hr', agent: 'HR Agent', query: 'How many annual leave days do I get in year two?', user: 'Ava Thompson', status: 'SUCCESS', latencyMs: 980, confidence: 0.97, at: '6 min ago' },
  { id: 'run-899', agentId: 'finance', agent: 'Finance Agent', query: 'Q3 travel budget variance vs forecast', user: 'Marcus Chen', status: 'SUCCESS', latencyMs: 1420, confidence: 0.91, at: '18 min ago' },
  { id: 'run-898', agentId: 'hr', agent: 'HR Agent', query: 'Parental leave eligibility for contractors', user: 'Priya Nair', status: 'SUCCESS', latencyMs: 1105, confidence: 0.88, at: '1 h ago' },
  { id: 'run-897', agentId: 'support', agent: 'Support Agent', query: 'Refund request for duplicate enterprise invoice', user: 'Daniel Osei', status: 'FAILED', latencyMs: 890, confidence: 0.41, at: '2 h ago' },
  { id: 'run-896', agentId: 'finance', agent: 'Finance Agent', query: 'Per-diem rates for Berlin offsite', user: 'Sofia Rahman', status: 'SUCCESS', latencyMs: 990, confidence: 0.95, at: '3 h ago' },
  { id: 'run-895', agentId: 'hr', agent: 'HR Agent', query: 'Onboarding checklist for engineering hires', user: 'Kenji Sato', status: 'SUCCESS', latencyMs: 1040, confidence: 0.94, at: '4 h ago' },
  { id: 'run-894', agentId: 'support', agent: 'Support Agent', query: 'API returning 429s after v2.6 upgrade', user: 'Kenji Sato', status: 'RUNNING', latencyMs: 0, confidence: 0, at: 'now' },
];
