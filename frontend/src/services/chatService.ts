import { agentService, routeQuery } from './agentService';
import { agents } from '../mock/agents';
import { citations, conversations, ragAnswer } from '../mock/chat';
import type { ChatMessage } from '../types';
import { mock } from './api';

const store = structuredClone(conversations);

function craftAnswer(query: string): { content: string; citations: typeof citations; confidence: number } {
  const q = query.toLowerCase();
  if (/leave|vacation|holiday|annual/.test(q))
    return { content: ragAnswer.answer, citations: [citations[0], citations[1]], confidence: 0.96 };
  if (/expense|per-diem|perdiem|reimburse/.test(q))
    return { content: 'The international travel per-diem cap is **$280/day** (lodging, meals, local transport). Attach all receipts and file within 30 days of travel. Claims above **$2,000** are routed to the approval queue automatically.', citations: [citations[2]], confidence: 0.95 };
  if (/auth-214|sso|login/.test(q))
    return { content: '**AUTH-214** indicates an expired IdP certificate:\n1. Export fresh SAML metadata from the customer IdP.\n2. Re-sync it under Admin → SSO.\n3. Ask the customer to retry in a private window.\n\nEscalate to Tier-2 with the tenant ID if it persists.', citations: [citations[3]], confidence: 0.93 };
  if (/refund|threshold/.test(q))
    return { content: 'Refunds up to **$5,000** can be auto-approved when evidence is attached. Anything above that threshold — like the pending $8,900 duplicate-invoice case — requires human approval in the Approval Center.', citations: [citations[3]], confidence: 0.88 };
  return { content: 'I couldn\'t find sufficient evidence in the available knowledge base to answer that confidently. Try rephrasing, or ask about leave policy, expenses, SSO errors, or refunds — or file a request so we can close this knowledge gap.', citations: [], confidence: 0.32 };
}

export const chatService = {
  list: () => mock(store.map(({ messages, ...c }) => ({ ...c, preview: messages[messages.length - 1]?.content.slice(0, 80) ?? '' }))),
  get: (id: string) => mock(store.find((c) => c.id === id)),
  create: (title: string, agentId: string) => {
    const agent = agents.find((a) => a.id === agentId) ?? agents[0];
    const conv = { id: `conv-${Date.now()}`, title, agent: agent.name, updatedAt: 'just now', messages: [] as ChatMessage[] };
    store.unshift(conv);
    return mock(conv, 200);
  },
  send: (convId: string, content: string): Promise<ChatMessage> => {
    const conv = store.find((c) => c.id === convId);
    const { agentId } = routeQuery(content);
    const agent = agents.find((a) => a.id === agentId) ?? agents[0];
    const { content: answer, citations: cites, confidence } = craftAnswer(content);
    const msg: ChatMessage = {
      id: `m-${Date.now()}`, role: 'assistant', content: answer, at: 'now',
      agent: conv ? conv.agent : agent.name, confidence, citations: cites, feedback: null,
    };
    if (conv) {
      conv.messages.push({ id: `m-u-${Date.now()}`, role: 'user', content, at: 'now' }, msg);
      conv.updatedAt = 'just now';
    }
    return mock(msg, 1100);
  },
  feedback: (convId: string, msgId: string, fb: 'up' | 'down') => {
    const m = store.find((c) => c.id === convId)?.messages.find((x) => x.id === msgId);
    if (m) m.feedback = fb;
    return mock(m, 150);
  },
};

export { agentService, routeQuery };
