import { USE_MOCK, request } from './api';
import { citations, ragAnswer } from '../mock/chat';
import type { Citation } from '../types';

export interface RagResult { answer: string | null; confidence: number | null; cites: Citation[]; semanticAvailable: boolean; chunks: number; }
const map = (c: any): Citation => ({ id: String(c.id), document: c.document, documentId: String(c.id), section: `Chunk ${c.chunk}`, page: 0, confidence: 0.5, snippet: c.text });
export const ragService = {
  search: async (query: string): Promise<RagResult> => {
    if (USE_MOCK) return { answer: ragAnswer.answer, confidence: .96, cites: citations as unknown as Citation[], semanticAvailable: false, chunks: 120 };
    const data = await request<any>('/rag/search/', { method: 'POST', body: JSON.stringify({ query }) });
    return { answer: data.answer, confidence: data.confidence, cites: (data.citations ?? []).map(map), semanticAvailable: data.semantic_available, chunks: (data.results ?? []).length };
  },
};
