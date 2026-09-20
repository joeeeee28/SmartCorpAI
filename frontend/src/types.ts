// ─── SmartCorp AI shared domain types ─────────────────────────────────────────

export type RoleName = 'Admin' | 'HR' | 'Finance' | 'Support' | 'Employee';
export type DocStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DecisionStatus = 'DETECTED' | 'ANALYZING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
export type RunStatus = 'SUCCESS' | 'FAILED' | 'RUNNING';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'FULFILLED' | 'DENIED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  department: string;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  avatarColor: string;
  lastActive: string;
  mfaEnabled: boolean;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  members: number;
  knowledgeBases: number;
  description: string;
}

export interface Role {
  id: string;
  name: RoleName;
  description: string;
  users: number;
  permissions: string[];
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  department: string;
  documents: number;
  chunks: number;
  status: 'ACTIVE' | 'SYNCING' | 'PAUSED';
  visibility: 'Organization' | 'Department' | 'Restricted';
  updatedAt: string;
  color: string;
}

export interface ProcessingEvent {
  stage: string;
  status: 'DONE' | 'CURRENT' | 'PENDING' | 'FAILED';
  at: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'TXT' | 'CSV';
  size: string;
  knowledgeBase: string;
  knowledgeBaseId: string;
  department: string;
  uploader: string;
  uploadedAt: string;
  version: string;
  status: DocStatus;
  permissions: string[];
  pages: number;
  chunks: number;
  embeddingStatus: 'INDEXED' | 'INDEXING' | 'QUEUED' | 'FAILED';
  history: ProcessingEvent[];
}

export interface Citation {
  id: string;
  document: string;
  documentId: string;
  section: string;
  page: number;
  confidence: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  at: string;
  agent?: string;
  confidence?: number;
  citations?: Citation[];
  feedback?: 'up' | 'down' | null;
}

export interface Conversation {
  id: string;
  title: string;
  agent: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface Agent {
  id: string;
  name: string;
  short: string;
  description: string;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  color: string;
  instructions: string;
  knowledgeBases: string[];
  tools: string[];
  temperature: number;
  maxTokens: number;
  runs: number;
  successRate: number;
  avgLatencyMs: number;
  lastRun: string;
}

export interface AgentRun {
  id: string;
  agentId: string;
  agent: string;
  query: string;
  user: string;
  status: RunStatus;
  latencyMs: number;
  confidence: number;
  at: string;
}

export interface Decision {
  id: string;
  title: string;
  issue: string;
  department: string;
  agent: string;
  evidence: string[];
  analysis: string;
  recommendation: string;
  recommendedAction: string;
  risk: RiskLevel;
  status: DecisionStatus;
  approver: string;
  supportingDocs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: string;
  title: string;
  type: string;
  requester: string;
  department: string;
  agent: string;
  recommendation: string;
  evidence: string[];
  risk: RiskLevel;
  approver: string;
  status: ApprovalStatus;
  createdAt: string;
  decidedAt: string | null;
  comments: { by: string; text: string; at: string }[];
  resultingAction: string | null;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignee: string;
  department: string;
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
  progress: number;
}

export interface RequestItem {
  id: string;
  title: string;
  category: string;
  requester: string;
  department: string;
  status: RequestStatus;
  createdAt: string;
  details: string;
}

export interface AuditLog {
  id: string;
  at: string;
  user: string;
  action: string;
  resource: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  details: string;
  ip: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  kind: 'approval' | 'document' | 'ai' | 'system';
  at: string;
  read: boolean;
}

export interface ActivityItem {
  id: string;
  text: string;
  detail: string;
  at: string;
  icon: 'upload' | 'check' | 'query' | 'user';
}

export interface Kpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaDir: 'up' | 'down';
  deltaGood: boolean;
  icon: 'docs' | 'queries' | 'users' | 'approvals';
}

export interface EvalMetric {
  id: string;
  name: string;
  score: number;
  target: number;
  trend: number[];
  note: string;
}

export interface EvalCase {
  id: string;
  query: string;
  agent: string;
  verdict: 'PASS' | 'FAIL' | 'NEEDS_REVIEW';
  faithfulness: number;
  relevance: number;
  citationAccuracy: number;
  latencyMs: number;
  at: string;
}

export interface ReportItem {
  id: string;
  name: string;
  type: string;
  schedule: string;
  lastRun: string;
  format: string;
  owner: string;
}
