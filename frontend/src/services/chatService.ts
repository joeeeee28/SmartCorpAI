import { agentService, routeQuery } from './agentService';
import { agents } from '../mock/agents';
import { citations, conversations, ragAnswer } from '../mock/chat';
import type { ChatMessage, Conversation } from '../types';
import { USE_MOCK, mock, request } from './api';

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

const mapCitation = (c: any) => ({ id: String(c.id), document: c.document, documentId: String(c.id), section: `Chunk ${c.chunk}`, page: 0, confidence: .5, snippet: c.text });
const mapConversation = (c: any): Conversation => ({ id: String(c.id), title: c.title, agent: 'Permission-aware assistant', updatedAt: c.updated_at, messages: (c.messages ?? []).map((m: any) => ({ id: String(m.id), role: m.role, content: m.content, at: m.created_at, confidence: m.confidence ?? undefined, citations: (m.citations ?? []).map(mapCitation) })) });

const createMock = (title: string, agentId: string) => { const agent = agents.find((a) => a.id === agentId) ?? agents[0]; const conv = { id: `conv-${Date.now()}`, title, agent: agent.name, updatedAt: 'just now', messages: [] as ChatMessage[] }; store.unshift(conv); return mock(conv, 200); };
const sendMock = (convId: string, content: string): Promise<ChatMessage> => { const conv = store.find((c) => c.id === convId); const { agentId } = routeQuery(content); const agent = agents.find((a) => a.id === agentId) ?? agents[0]; const { content: answer, citations: cites, confidence } = craftAnswer(content); const msg: ChatMessage = { id: `m-${Date.now()}`, role: 'assistant', content: answer, at: 'now', agent: conv ? conv.agent : agent.name, confidence, citations: cites, feedback: null }; if (conv) { conv.messages.push({ id: `m-u-${Date.now()}`, role: 'user', content, at: 'now' }, msg); conv.updatedAt = 'just now'; } return mock(msg, 1100); };
export const chatService = {
 list: async (): Promise<any[]> => { if (!USE_MOCK) return (await request<any[]>('/chat/conversations/')).map(mapConversation).map(({ messages, ...c }) => ({ ...c, preview: messages[messages.length - 1]?.content.slice(0, 80) ?? '' })); return mock(store.map(({ messages, ...c }) => ({ ...c, preview: messages[messages.length - 1]?.content.slice(0, 80) ?? '' }))); },
 get: async (id: string): Promise<Conversation | undefined> => USE_MOCK ? mock(store.find((c) => c.id === id)) : mapConversation(await request<any>(`/chat/conversations/${id}/`)),
 create: async (title: string, agentId: string): Promise<Conversation> => USE_MOCK ? createMock(title, agentId) : mapConversation(await request<any>('/chat/conversations/', { method: 'POST', body: JSON.stringify({ title }) })),
 send: async (convId: string, content: string): Promise<ChatMessage> => { if (USE_MOCK) return sendMock(convId, content); const data = await request<any>(`/chat/conversations/${convId}/`, { method: 'POST', body: JSON.stringify({ content }) }); const m = data.message; return { id: String(m.id), role: 'assistant', content: m.content, at: 'now', confidence: m.confidence, citations: (m.citations ?? []).map(mapCitation), feedback: null }; },
 feedback: async (convId: string, msgId: string, fb: 'up' | 'down') => { if (!USE_MOCK) return request<any>(`/chat/conversations/${convId}/messages/${msgId}/feedback/`, { method: 'POST', body: JSON.stringify({ feedback: fb }) }); const m = store.find((c) => c.id === convId)?.messages.find((x) => x.id === msgId); if (m) m.feedback = fb; return mock(m, 150); },
};
export { agentService, routeQuery };
