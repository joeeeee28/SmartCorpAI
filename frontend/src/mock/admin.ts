import type { AuditLog, Department, EvalCase, EvalMetric, ReportItem, RequestItem, Role, TaskItem, User } from '../types';

export const users: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@smartcorp.ai', role: 'Admin', department: 'Engineering', status: 'ACTIVE', avatarColor: '#4f46e5', lastActive: 'now', mfaEnabled: true },
  { id: 'u2', name: 'Priya Nair', email: 'priya@smartcorp.ai', role: 'HR', department: 'Human Resources', status: 'ACTIVE', avatarColor: '#0ea5e9', lastActive: '12 min ago', mfaEnabled: true },
  { id: 'u3', name: 'Marcus Chen', email: 'marcus@smartcorp.ai', role: 'Finance', department: 'Finance', status: 'ACTIVE', avatarColor: '#10b981', lastActive: '26 min ago', mfaEnabled: true },
  { id: 'u4', name: 'Daniel Osei', email: 'daniel@smartcorp.ai', role: 'Support', department: 'Support', status: 'ACTIVE', avatarColor: '#f59e0b', lastActive: '4 min ago', mfaEnabled: false },
  { id: 'u5', name: 'Ava Thompson', email: 'ava@smartcorp.ai', role: 'Employee', department: 'Support', status: 'ACTIVE', avatarColor: '#ec4899', lastActive: '1 h ago', mfaEnabled: true },
  { id: 'u6', name: 'Kenji Sato', email: 'kenji@smartcorp.ai', role: 'Employee', department: 'Engineering', status: 'ACTIVE', avatarColor: '#8b5cf6', lastActive: '2 h ago', mfaEnabled: true },
  { id: 'u7', name: 'Sofia Rahman', email: 'sofia@smartcorp.ai', role: 'Finance', department: 'Finance', status: 'ACTIVE', avatarColor: '#14b8a6', lastActive: '3 h ago', mfaEnabled: true },
  { id: 'u8', name: 'Liam Carter', email: 'liam@smartcorp.ai', role: 'Employee', department: 'Sales', status: 'INVITED', avatarColor: '#f97316', lastActive: '—', mfaEnabled: false },
  { id: 'u9', name: 'Elena Petrova', email: 'elena@smartcorp.ai', role: 'Employee', department: 'Legal', status: 'ACTIVE', avatarColor: '#6366f1', lastActive: 'Yesterday', mfaEnabled: true },
  { id: 'u10', name: 'Tom Becker', email: 'tom@smartcorp.ai', role: 'Employee', department: 'Sales', status: 'SUSPENDED', avatarColor: '#64748b', lastActive: '6 days ago', mfaEnabled: false },
];

export const roles: Role[] = [
  { id: 'r1', name: 'Admin', description: 'Full organization access incl. security settings and user management.', users: 3, permissions: ['users.manage', 'roles.manage', 'kb.manage', 'docs.manage', 'agents.manage', 'approvals.decide', 'audit.read', 'settings.manage'] },
  { id: 'r2', name: 'HR', description: 'HR knowledge bases, leave approvals and onboarding tasks.', users: 12, permissions: ['kb.hr.read', 'kb.hr.write', 'approvals.leave', 'tasks.manage'] },
  { id: 'r3', name: 'Finance', description: 'Finance knowledge, expenses, invoices and budget reports.', users: 18, permissions: ['kb.finance.read', 'kb.finance.write', 'approvals.expense', 'reports.finance'] },
  { id: 'r4', name: 'Support', description: 'Product knowledge, tickets and customer-facing answers.', users: 46, permissions: ['kb.support.read', 'tickets.manage', 'chat.use'] },
  { id: 'r5', name: 'Employee', description: 'Standard access: ask AI, read assigned knowledge, file requests.', users: 263, permissions: ['chat.use', 'kb.assigned.read', 'requests.create'] },
];

export const departments: Department[] = [
  { id: 'd1', name: 'Human Resources', head: 'Priya Nair', members: 14, knowledgeBases: 1, description: 'People operations, policy and onboarding.' },
  { id: 'd2', name: 'Finance', head: 'Marcus Chen', members: 22, knowledgeBases: 1, description: 'Accounting, expenses, procurement and reporting.' },
  { id: 'd3', name: 'Support', head: 'Daniel Osei', members: 48, knowledgeBases: 1, description: 'Customer success and ticket resolution.' },
  { id: 'd4', name: 'Engineering', head: 'Kenji Sato', members: 96, knowledgeBases: 1, description: 'Product development and infrastructure.' },
  { id: 'd5', name: 'Legal', head: 'Elena Petrova', members: 8, knowledgeBases: 1, description: 'Contracts, compliance and risk.' },
  { id: 'd6', name: 'Sales', head: 'Liam Carter', members: 31, knowledgeBases: 1, description: 'Revenue, proposals and partnerships.' },
];

export const auditLogs: AuditLog[] = [
  { id: 'log-120', at: 'Sep 20, 10:14:02', user: 'Support Agent', action: 'DECISION_CREATED', resource: 'DEC-210', status: 'SUCCESS', details: 'SSO anomaly decision drafted, routed to Admin User', ip: '10.0.4.18' },
  { id: 'log-119', at: 'Sep 20, 10:02:47', user: 'Daniel Osei', action: 'AI_QUERY', resource: 'Support Agent', status: 'SUCCESS', details: '“Customer cannot reset SSO password” · conf 0.93', ip: '10.0.1.44' },
  { id: 'log-118', at: 'Sep 20, 09:58:13', user: 'Ava Thompson', action: 'AI_QUERY', resource: 'HR Agent', status: 'SUCCESS', details: '“What is our leave policy?” · conf 0.96', ip: '10.0.1.51' },
  { id: 'log-117', at: 'Sep 20, 09:41:55', user: 'Priya Nair', action: 'DOCUMENT_UPLOAD', resource: 'Policy Handbook.pdf', status: 'SUCCESS', details: '4.2 MB → HR Handbook · processing started', ip: '10.0.2.10' },
  { id: 'log-116', at: 'Sep 20, 09:12:30', user: 'Admin User', action: 'APPROVAL_DECIDED', resource: 'APR-1042', status: 'SUCCESS', details: 'Leave request approved', ip: '10.0.0.2' },
  { id: 'log-115', at: 'Sep 20, 08:47:09', user: 'Finance Agent', action: 'RAG_RETRIEVAL', resource: 'Finance Policies', status: 'SUCCESS', details: '6 chunks retrieved · 2 permission-filtered', ip: '10.0.4.18' },
  { id: 'log-114', at: 'Sep 20, 08:15:41', user: 'Marcus Chen', action: 'DOCUMENT_UPLOAD', resource: 'Q3 Financial Summary.pdf', status: 'SUCCESS', details: '2.8 MB → Finance Policies', ip: '10.0.3.22' },
  { id: 'log-113', at: 'Sep 20, 07:58:03', user: 'Liam Carter', action: 'DOCUMENT_ACCESS', resource: 'Vendor Contracts Register.csv', status: 'DENIED', details: 'Restricted KB · missing legal.head approval', ip: '10.0.5.17' },
  { id: 'log-112', at: 'Sep 19, 17:22:19', user: 'Support Agent', action: 'AGENT_RUN', resource: 'run-897', status: 'FAILED', details: 'Insufficient evidence for refund query', ip: '10.0.4.18' },
  { id: 'log-111', at: 'Sep 19, 16:02:44', user: 'Elena Petrova', action: 'PERMISSION_CHANGE', resource: 'Legal & Compliance', status: 'SUCCESS', details: 'Visibility set to Restricted', ip: '10.0.2.30' },
  { id: 'log-110', at: 'Sep 19, 15:40:11', user: 'Admin User', action: 'APPROVAL_DECIDED', resource: 'APR-1039', status: 'SUCCESS', details: 'Vendor onboarding approved · PO-3321', ip: '10.0.0.2' },
  { id: 'log-109', at: 'Sep 19, 10:02:37', user: 'Tom Becker', action: 'LOGIN', resource: 'web', status: 'FAILED', details: 'Suspended account login attempt', ip: '84.121.40.9' },
];

export const tasks: TaskItem[] = [
  { id: 'TSK-301', title: 'Review 16 auto-drafted billing responses', description: 'Verify Support Agent drafts before sending to customers.', assignee: 'Daniel Osei', department: 'Support', status: 'IN_PROGRESS', priority: 'HIGH', due: 'Sep 21', progress: 62 },
  { id: 'TSK-302', title: 'Re-index HR Handbook after policy update', description: 'Policy Handbook v3.2 uploaded — confirm embeddings refreshed.', assignee: 'Kenji Sato', department: 'Engineering', status: 'TODO', priority: 'MEDIUM', due: 'Sep 22', progress: 0 },
  { id: 'TSK-303', title: 'Verify Berlin offsite receipts', description: 'Check 6 receipts against per-diem caps for APR-1041.', assignee: 'Sofia Rahman', department: 'Finance', status: 'IN_REVIEW', priority: 'MEDIUM', due: 'Sep 21', progress: 90 },
  { id: 'TSK-304', title: 'Draft Q4 budget forecast', description: 'Incorporate travel-freeze savings scenario.', assignee: 'Marcus Chen', department: 'Finance', status: 'TODO', priority: 'HIGH', due: 'Sep 25', progress: 10 },
  { id: 'TSK-305', title: 'Onboard 3 engineering hires', description: 'Accounts, hardware, buddy assignment for Oct 1 cohort.', assignee: 'Priya Nair', department: 'Human Resources', status: 'IN_PROGRESS', priority: 'MEDIUM', due: 'Sep 30', progress: 40 },
  { id: 'TSK-306', title: 'Retry failed runbook embedding', description: 'Incident Runbook doc-011 failed at extraction — reprocess.', assignee: 'Kenji Sato', department: 'Engineering', status: 'TODO', priority: 'URGENT', due: 'Sep 20', progress: 0 },
  { id: 'TSK-307', title: 'Publish travel freeze notice', description: 'Pending DEC-209 approval from Marcus Chen.', assignee: 'Admin User', department: 'Finance', status: 'TODO', priority: 'MEDIUM', due: 'Sep 23', progress: 0 },
  { id: 'TSK-308', title: 'Sales playbook refresh sign-off', description: 'Review paused Sales Playbooks KB before reactivation.', assignee: 'Liam Carter', department: 'Sales', status: 'DONE', priority: 'LOW', due: 'Sep 18', progress: 100 },
];

export const requests: RequestItem[] = [
  { id: 'REQ-501', title: 'Access to Finance Policies KB', category: 'Access', requester: 'Ava Thompson', department: 'Support', status: 'OPEN', createdAt: 'Sep 20, 2026', details: 'Needs invoice lookup rights for billing tickets.' },
  { id: 'REQ-502', title: 'New knowledge base: IT Security', category: 'Knowledge Base', requester: 'Kenji Sato', department: 'Engineering', status: 'IN_PROGRESS', createdAt: 'Sep 19, 2026', details: 'Consolidate SOC2 evidence and security runbooks.' },
  { id: 'REQ-503', title: 'Increase Finance Agent token limit', category: 'Configuration', requester: 'Marcus Chen', department: 'Finance', status: 'OPEN', createdAt: 'Sep 19, 2026', details: 'Quarterly summaries truncated at 1,200 tokens.' },
  { id: 'REQ-504', title: 'Export audit logs for SOC2 review', category: 'Compliance', requester: 'Elena Petrova', department: 'Legal', status: 'FULFILLED', createdAt: 'Sep 17, 2026', details: 'August access logs delivered to auditors.' },
  { id: 'REQ-505', title: 'SSO enforcement for Support team', category: 'Security', requester: 'Daniel Osei', department: 'Support', status: 'IN_PROGRESS', createdAt: 'Sep 16, 2026', details: '2 agents still on password-only login.' },
  { id: 'REQ-506', title: 'Delete deprecated v1 API docs', category: 'Content', requester: 'Kenji Sato', department: 'Engineering', status: 'DENIED', createdAt: 'Sep 15, 2026', details: 'Denied: still referenced by 9 active tickets.' },
];

export const evalMetrics: EvalMetric[] = [
  { id: 'e1', name: 'Retrieval Quality', score: 0.91, target: 0.9, trend: [0.86, 0.87, 0.89, 0.9, 0.9, 0.91], note: 'Recall@5 on weekly golden set (240 queries).' },
  { id: 'e2', name: 'Answer Relevance', score: 0.93, target: 0.9, trend: [0.89, 0.9, 0.91, 0.92, 0.92, 0.93], note: 'LLM-judged relevance, sampled 200 answers/week.' },
  { id: 'e3', name: 'Faithfulness', score: 0.95, target: 0.95, trend: [0.92, 0.93, 0.93, 0.94, 0.95, 0.95], note: 'Claim-level grounding vs cited chunks.' },
  { id: 'e4', name: 'Citation Accuracy', score: 0.89, target: 0.92, trend: [0.85, 0.86, 0.87, 0.88, 0.88, 0.89], note: 'Citations resolving to correct page/section.' },
  { id: 'e5', name: 'P95 Latency', score: 0.82, target: 0.85, trend: [0.78, 0.79, 0.8, 0.81, 0.81, 0.82], note: 'Score = 1 − normalized p95 (2.1s current).' },
  { id: 'e6', name: 'Hallucination Rate', score: 0.97, target: 0.97, trend: [0.95, 0.96, 0.96, 0.97, 0.97, 0.97], note: 'Score = 1 − flagged rate (0.6% flagged).' },
];

export const evalCases: EvalCase[] = [
  { id: 'EV-771', query: 'How many sick days per year?', agent: 'HR Agent', verdict: 'PASS', faithfulness: 0.99, relevance: 0.98, citationAccuracy: 1, latencyMs: 940, at: 'Sep 20' },
  { id: 'EV-770', query: 'Refund threshold for enterprise invoices', agent: 'Support Agent', verdict: 'NEEDS_REVIEW', faithfulness: 0.81, relevance: 0.9, citationAccuracy: 0.75, latencyMs: 1210, at: 'Sep 20' },
  { id: 'EV-769', query: 'Q3 travel budget variance', agent: 'Finance Agent', verdict: 'PASS', faithfulness: 0.97, relevance: 0.95, citationAccuracy: 0.96, latencyMs: 1420, at: 'Sep 19' },
  { id: 'EV-768', query: 'Visa sponsorship for contractors', agent: 'HR Agent', verdict: 'FAIL', faithfulness: 0.52, relevance: 0.61, citationAccuracy: 0.4, latencyMs: 890, at: 'Sep 19' },
  { id: 'EV-767', query: 'SSO error AUTH-214 resolution', agent: 'Support Agent', verdict: 'PASS', faithfulness: 0.98, relevance: 0.97, citationAccuracy: 1, latencyMs: 1105, at: 'Sep 18' },
];

export const reports: ReportItem[] = [
  { id: 'rep-1', name: 'Weekly AI Usage Summary', type: 'Usage', schedule: 'Weekly · Mon 08:00', lastRun: 'Sep 15, 2026', format: 'PDF', owner: 'Admin User' },
  { id: 'rep-2', name: 'Agent Quality Scorecard', type: 'Evaluation', schedule: 'Weekly · Fri 17:00', lastRun: 'Sep 19, 2026', format: 'PDF', owner: 'Kenji Sato' },
  { id: 'rep-3', name: 'Approval SLA Compliance', type: 'Workflow', schedule: 'Daily · 07:00', lastRun: 'Sep 20, 2026', format: 'CSV', owner: 'Priya Nair' },
  { id: 'rep-4', name: 'Unanswered Questions Digest', type: 'Knowledge Gaps', schedule: 'Weekly · Wed 09:00', lastRun: 'Sep 17, 2026', format: 'CSV', owner: 'Daniel Osei' },
  { id: 'rep-5', name: 'Finance Token & Cost Report', type: 'Cost', schedule: 'Monthly · 1st', lastRun: 'Sep 01, 2026', format: 'XLSX', owner: 'Marcus Chen' },
  { id: 'rep-6', name: 'SOC2 Audit Evidence Pack', type: 'Compliance', schedule: 'On demand', lastRun: 'Sep 17, 2026', format: 'PDF', owner: 'Elena Petrova' },
];
