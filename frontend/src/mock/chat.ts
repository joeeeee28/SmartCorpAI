import type { Citation, Conversation } from '../types';

export const citations: Citation[] = [
  { id: 'c1', document: 'Leave & Attendance Policy.docx', documentId: 'doc-002', section: '§3.2 Annual Leave Entitlement', page: 4, confidence: 0.97, snippet: '“Full-time employees are entitled to 20 days of paid annual leave per calendar year, accrued monthly at 1.67 days…”' },
  { id: 'c2', document: 'Policy Handbook.pdf', documentId: 'doc-001', section: '§7.1 Leave Carryover', page: 52, confidence: 0.91, snippet: '“Up to 5 unused annual leave days may be carried over into the following year and must be used by March 31…”' },
  { id: 'c3', document: 'Expense Reimbursement Rules.pdf', documentId: 'doc-004', section: '§5.3 Per-Diem Caps', page: 11, confidence: 0.95, snippet: '“International travel per-diem is capped at $280/day including lodging, meals and local transport…”' },
  { id: 'c4', document: 'Tier-1 Troubleshooting Guide.pdf', documentId: 'doc-006', section: 'Ch. 4 · SSO Errors', page: 63, confidence: 0.93, snippet: '“Error AUTH-214 indicates an expired IdP certificate. Re-sync the SAML metadata and retry authentication…”' },
];

export const conversations: Conversation[] = [
  {
    id: 'conv-1', title: 'Annual leave balance & carryover', agent: 'HR Agent', updatedAt: '10 min ago',
    messages: [
      { id: 'm1', role: 'user', content: 'What is our leave policy? How many days do I get and can I carry them over?', at: '09:58' },
      { id: 'm2', role: 'assistant', agent: 'HR Agent', confidence: 0.96,
        content: 'Full-time employees receive **20 days of paid annual leave** per calendar year, accrued monthly. You can **carry over up to 5 unused days** into the next year, which must be used by March 31.',
        at: '09:58', citations: [citations[0], citations[1]], feedback: 'up' },
    ],
  },
  {
    id: 'conv-2', title: 'Berlin offsite per-diem', agent: 'Finance Agent', updatedAt: 'Yesterday',
    messages: [
      { id: 'm3', role: 'user', content: 'What is the per-diem cap for the Berlin offsite?', at: '16:20' },
      { id: 'm4', role: 'assistant', agent: 'Finance Agent', confidence: 0.95,
        content: 'The international travel per-diem cap is **$280/day**, covering lodging, meals and local transport. Claims above $2,000 in total require an approval request, which I can prepare for you.',
        at: '16:20', citations: [citations[2]], feedback: null },
    ],
  },
  {
    id: 'conv-3', title: 'SSO error AUTH-214', agent: 'Support Agent', updatedAt: 'Yesterday',
    messages: [
      { id: 'm5', role: 'user', content: 'A customer reports SSO login failing with error AUTH-214. How do I fix it?', at: '11:02' },
      { id: 'm6', role: 'assistant', agent: 'Support Agent', confidence: 0.93,
        content: '**AUTH-214** means the identity-provider certificate has expired. Steps:\n1. Open the customer IdP admin console and export fresh SAML metadata.\n2. In Admin → SSO, choose “Re-sync metadata” and upload the file.\n3. Ask the customer to retry login in a private window.\n\nIf the error persists after re-sync, escalate to Tier-2 with the tenant ID.',
        at: '11:02', citations: [citations[3]], feedback: null },
    ],
  },
];

export const suggestedPrompts = [
  'What is our leave policy?',
  'How do I file an expense claim?',
  'Summarize Q3 travel spend vs forecast',
  'How to resolve SSO error AUTH-214?',
  'What is the refund approval threshold?',
  'Draft onboarding checklist for engineers',
];

export const ragAnswer = {
  answer: 'Full-time employees receive **20 days of paid annual leave** per calendar year, accrued at 1.67 days per month. Up to **5 unused days** may be carried over, to be used by March 31 of the following year. Leave requests of 5+ consecutive days require manager approval at least 2 weeks in advance.',
  confidence: 0.96,
  route: { intent: 'policy_lookup', agent: 'HR Agent', latencyMs: 1180, chunksScanned: 412, permissionFiltered: 3 },
  citations: [citations[0], citations[1]],
};
