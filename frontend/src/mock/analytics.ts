export const usageByDay = [
  { day: 'Mon', queries: 402, users: 188, docs: 34 },
  { day: 'Tue', queries: 468, users: 204, docs: 41 },
  { day: 'Wed', queries: 441, users: 197, docs: 38 },
  { day: 'Thu', queries: 512, users: 226, docs: 52 },
  { day: 'Fri', queries: 478, users: 211, docs: 44 },
  { day: 'Sat', queries: 156, users: 72, docs: 9 },
  { day: 'Sun', queries: 121, users: 58, docs: 6 },
];

export const agentPerformance = [
  { agent: 'HR Agent', runs: 986, success: 96.4, avgMs: 1180 },
  { agent: 'Finance Agent', runs: 742, success: 97.8, avgMs: 1042 },
  { agent: 'Support Agent', runs: 698, success: 94.9, avgMs: 1310 },
];

export const costUsage = [
  { month: 'Apr', tokens: 8.2, cost: 164 },
  { month: 'May', tokens: 9.8, cost: 196 },
  { month: 'Jun', tokens: 11.4, cost: 228 },
  { month: 'Jul', tokens: 13.1, cost: 262 },
  { month: 'Aug', tokens: 14.6, cost: 292 },
  { month: 'Sep', tokens: 8.1, cost: 162 },
];

export const unanswered = [
  { query: 'Visa sponsorship policy for APAC contractors', count: 14, agent: 'HR Agent' },
  { query: 'Cryptocurrency invoice settlement process', count: 11, agent: 'Finance Agent' },
  { query: 'Legacy v1 API deprecation timeline', count: 9, agent: 'Support Agent' },
  { query: 'Sabbatical eligibility after 5 years', count: 8, agent: 'HR Agent' },
  { query: 'Intercompany loan documentation template', count: 6, agent: 'Finance Agent' },
];

export const funnel = [
  { stage: 'Queries', value: 2856 },
  { stage: 'Retrieved evidence', value: 2684 },
  { stage: 'Answered', value: 2541 },
  { stage: 'Positive feedback', value: 1987 },
];
