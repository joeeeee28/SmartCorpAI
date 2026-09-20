import type { DocumentItem, KnowledgeBase } from '../types';

export const knowledgeBases: KnowledgeBase[] = [
  { id: 'kb-hr', name: 'HR Handbook', description: 'Leave, attendance, onboarding, benefits and workplace policies.', department: 'Human Resources', documents: 214, chunks: 4821, status: 'ACTIVE', visibility: 'Organization', updatedAt: '2 h ago', color: '#4f46e5' },
  { id: 'kb-fin', name: 'Finance Policies', description: 'Expense rules, invoicing, procurement and quarterly reports.', department: 'Finance', documents: 186, chunks: 3910, status: 'ACTIVE', visibility: 'Department', updatedAt: '5 h ago', color: '#0ea5e9' },
  { id: 'kb-sup', name: 'Product Knowledge', description: 'Product manuals, troubleshooting guides and ticket macros.', department: 'Support', documents: 342, chunks: 9104, status: 'ACTIVE', visibility: 'Organization', updatedAt: '1 h ago', color: '#10b981' },
  { id: 'kb-legal', name: 'Legal & Compliance', description: 'Contracts, NDAs, data retention and regulatory filings.', department: 'Legal', documents: 128, chunks: 2874, status: 'SYNCING', visibility: 'Restricted', updatedAt: '12 min ago', color: '#f59e0b' },
  { id: 'kb-eng', name: 'Engineering Docs', description: 'Architecture RFCs, runbooks, API references and ADRs.', department: 'Engineering', documents: 264, chunks: 6230, status: 'ACTIVE', visibility: 'Department', updatedAt: 'Yesterday', color: '#8b5cf6' },
  { id: 'kb-sales', name: 'Sales Playbooks', description: 'Pricing, battlecards, proposals and onboarding decks.', department: 'Sales', documents: 114, chunks: 1988, status: 'PAUSED', visibility: 'Department', updatedAt: '3 days ago', color: '#ec4899' },
];

const H = (done: number, failed = false): DocumentItem['history'] => {
  const stages = ['Uploaded', 'Validated', 'Text extracted', 'Chunked', 'Embedded', 'Indexed'];
  return stages.map((stage, i) => ({
    stage,
    status: failed && i === done ? 'FAILED' : i < done ? 'DONE' : i === done ? 'CURRENT' : 'PENDING',
    at: i <= done ? 'Sep 20, 2026' : '—',
  }));
};

export const documents: DocumentItem[] = [
  { id: 'doc-001', name: 'Policy Handbook.pdf', type: 'PDF', size: '4.2 MB', knowledgeBase: 'HR Handbook', knowledgeBaseId: 'kb-hr', department: 'Human Resources', uploader: 'Priya Nair', uploadedAt: 'Sep 20, 2026 · 09:41', version: 'v3.2', status: 'READY', permissions: ['HR', 'Employee', 'Admin'], pages: 86, chunks: 412, embeddingStatus: 'INDEXED', history: H(6) },
  { id: 'doc-002', name: 'Leave & Attendance Policy.docx', type: 'DOCX', size: '812 KB', knowledgeBase: 'HR Handbook', knowledgeBaseId: 'kb-hr', department: 'Human Resources', uploader: 'Admin User', uploadedAt: 'Sep 19, 2026 · 16:02', version: 'v2.0', status: 'READY', permissions: ['HR', 'Employee', 'Admin'], pages: 24, chunks: 118, embeddingStatus: 'INDEXED', history: H(6) },
  { id: 'doc-003', name: 'Q3 Financial Summary.pdf', type: 'PDF', size: '2.8 MB', knowledgeBase: 'Finance Policies', knowledgeBaseId: 'kb-fin', department: 'Finance', uploader: 'Marcus Chen', uploadedAt: 'Sep 20, 2026 · 08:15', version: 'v1.0', status: 'PROCESSING', permissions: ['Finance', 'Admin'], pages: 41, chunks: 187, embeddingStatus: 'INDEXING', history: H(4) },
  { id: 'doc-004', name: 'Expense Reimbursement Rules.pdf', type: 'PDF', size: '1.1 MB', knowledgeBase: 'Finance Policies', knowledgeBaseId: 'kb-fin', department: 'Finance', uploader: 'Sofia Rahman', uploadedAt: 'Sep 18, 2026 · 11:27', version: 'v4.1', status: 'READY', permissions: ['Finance', 'Employee', 'Admin'], pages: 18, chunks: 92, embeddingStatus: 'INDEXED', history: H(6) },
  { id: 'doc-005', name: 'Invoice Processing SOP.docx', type: 'DOCX', size: '640 KB', knowledgeBase: 'Finance Policies', knowledgeBaseId: 'kb-fin', department: 'Finance', uploader: 'Marcus Chen', uploadedAt: 'Sep 17, 2026 · 14:50', version: 'v1.4', status: 'READY', permissions: ['Finance', 'Admin'], pages: 12, chunks: 54, embeddingStatus: 'INDEXED', history: H(6) },
  { id: 'doc-006', name: 'Tier-1 Troubleshooting Guide.pdf', type: 'PDF', size: '6.4 MB', knowledgeBase: 'Product Knowledge', knowledgeBaseId: 'kb-sup', department: 'Support', uploader: 'Daniel Osei', uploadedAt: 'Sep 19, 2026 · 10:12', version: 'v5.0', status: 'READY', permissions: ['Support', 'Employee', 'Admin'], pages: 132, chunks: 588, embeddingStatus: 'INDEXED', history: H(6) },
  { id: 'doc-007', name: 'Returns & Refunds Policy.txt', type: 'TXT', size: '48 KB', knowledgeBase: 'Product Knowledge', knowledgeBaseId: 'kb-sup', department: 'Support', uploader: 'Ava Thompson', uploadedAt: 'Sep 16, 2026 · 09:03', version: 'v1.9', status: 'READY', permissions: ['Support', 'Employee', 'Admin'], pages: 6, chunks: 21, embeddingStatus: 'INDEXED', history: H(6) },
  { id: 'doc-008', name: 'Vendor Contracts Register.csv', type: 'CSV', size: '220 KB', knowledgeBase: 'Legal & Compliance', knowledgeBaseId: 'kb-legal', department: 'Legal', uploader: 'Admin User', uploadedAt: 'Sep 20, 2026 · 07:58', version: 'v1.0', status: 'UPLOADING', permissions: ['Admin'], pages: 0, chunks: 0, embeddingStatus: 'QUEUED', history: H(0) },
  { id: 'doc-009', name: 'Data Retention Schedule.pdf', type: 'PDF', size: '980 KB', knowledgeBase: 'Legal & Compliance', knowledgeBaseId: 'kb-legal', department: 'Legal', uploader: 'Elena Petrova', uploadedAt: 'Sep 15, 2026 · 13:36', version: 'v2.3', status: 'READY', permissions: ['Legal', 'Admin'], pages: 22, chunks: 104, embeddingStatus: 'INDEXED', history: H(6) },
  { id: 'doc-010', name: 'API Reference v2.pdf', type: 'PDF', size: '9.1 MB', knowledgeBase: 'Engineering Docs', knowledgeBaseId: 'kb-eng', department: 'Engineering', uploader: 'Kenji Sato', uploadedAt: 'Sep 14, 2026 · 17:20', version: 'v2.6', status: 'READY', permissions: ['Engineering', 'Support', 'Admin'], pages: 210, chunks: 940, embeddingStatus: 'INDEXED', history: H(6) },
  { id: 'doc-011', name: 'Incident Runbook — Search Outage.docx', type: 'DOCX', size: '388 KB', knowledgeBase: 'Engineering Docs', knowledgeBaseId: 'kb-eng', department: 'Engineering', uploader: 'Kenji Sato', uploadedAt: 'Sep 13, 2026 · 12:44', version: 'v1.1', status: 'FAILED', permissions: ['Engineering', 'Admin'], pages: 9, chunks: 0, embeddingStatus: 'FAILED', history: H(2, true) },
  { id: 'doc-012', name: 'Enterprise Pricing 2026.pdf', type: 'PDF', size: '1.6 MB', knowledgeBase: 'Sales Playbooks', knowledgeBaseId: 'kb-sales', department: 'Sales', uploader: 'Liam Carter', uploadedAt: 'Sep 12, 2026 · 15:29', version: 'v3.0', status: 'READY', permissions: ['Sales', 'Admin'], pages: 28, chunks: 126, embeddingStatus: 'INDEXED', history: H(6) },
];
