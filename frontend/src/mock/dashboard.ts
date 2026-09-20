import type { ActivityItem, Kpi, NotificationItem } from '../types';

export const kpis: Kpi[] = [
  { id: 'k1', label: 'Total Documents', value: '1,248', delta: '+18.2% vs last month', deltaDir: 'up', deltaGood: true, icon: 'docs' },
  { id: 'k2', label: 'AI Queries', value: '2,856', delta: '+24.6% vs last month', deltaDir: 'up', deltaGood: true, icon: 'queries' },
  { id: 'k3', label: 'Active Users', value: '342', delta: '+12.4% vs last month', deltaDir: 'up', deltaGood: true, icon: 'users' },
  { id: 'k4', label: 'Pending Approvals', value: '17', delta: '-8.1% vs last month', deltaDir: 'down', deltaGood: true, icon: 'approvals' },
];

export const queryTrendDaily = [
  { label: 'Mon', queries: 182, resolved: 164 },
  { label: 'Tue', queries: 214, resolved: 198 },
  { label: 'Wed', queries: 196, resolved: 181 },
  { label: 'Thu', queries: 248, resolved: 231 },
  { label: 'Fri', queries: 226, resolved: 209 },
  { label: 'Sat', queries: 98, resolved: 91 },
  { label: 'Sun', queries: 74, resolved: 69 },
];

export const queryTrendWeekly = [
  { label: 'W1', queries: 1180, resolved: 1092 },
  { label: 'W2', queries: 1344, resolved: 1251 },
  { label: 'W3', queries: 1298, resolved: 1204 },
  { label: 'W4', queries: 1522, resolved: 1418 },
];

export const queryTrendMonthly = [
  { label: 'Apr', queries: 3210, resolved: 2968 },
  { label: 'May', queries: 3844, resolved: 3581 },
  { label: 'Jun', queries: 4126, resolved: 3870 },
  { label: 'Jul', queries: 4698, resolved: 4412 },
  { label: 'Aug', queries: 5231, resolved: 4926 },
  { label: 'Sep', queries: 2856, resolved: 2691 },
];

export const agentUsage = [
  { name: 'HR Agent', value: 986, color: '#4f46e5' },
  { name: 'Finance Agent', value: 742, color: '#0ea5e9' },
  { name: 'Support Agent', value: 698, color: '#10b981' },
  { name: 'Other', value: 430, color: '#cbd5e1' },
];

export const notifications: NotificationItem[] = [
  { id: 'n1', title: '5 approvals pending', body: 'Expense and leave requests are waiting for your review.', kind: 'approval', at: '12 min ago', read: false },
  { id: 'n2', title: 'New document uploaded', body: 'Q3 Financial Summary.pdf was added to Finance Policies.', kind: 'document', at: '48 min ago', read: false },
  { id: 'n3', title: 'AI training completed', body: 'Embeddings refreshed for HR Handbook knowledge base.', kind: 'ai', at: '3 h ago', read: false },
  { id: 'n4', title: 'System update', body: 'SmartCorp AI indexer v2.4 deployed successfully.', kind: 'system', at: 'Yesterday', read: true },
];

export const recentActivity: ActivityItem[] = [
  { id: 'a1', text: 'Policy Handbook.pdf uploaded', detail: 'by Priya Nair · HR Handbook', at: '24 min ago', icon: 'upload' },
  { id: 'a2', text: 'Leave Request approved', detail: 'by Admin User · #APR-1042', at: '1 h ago', icon: 'check' },
  { id: 'a3', text: 'AI query submitted', detail: 'Finance Agent · “Q3 travel budget variance”', at: '2 h ago', icon: 'query' },
  { id: 'a4', text: 'New user added', detail: 'Daniel Osei invited to Support team', at: '5 h ago', icon: 'user' },
];

export const systemStatus = [
  { name: 'AI Services', status: 'Operational', latency: '212 ms' },
  { name: 'RAG Service', status: 'Operational', latency: '148 ms' },
  { name: 'Database', status: 'Operational', latency: '22 ms' },
  { name: 'Storage', status: 'Operational', latency: '31 ms' },
];
