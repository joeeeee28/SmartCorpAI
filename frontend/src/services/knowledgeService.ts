import { documents, knowledgeBases } from '../mock/knowledge';
import type { DocumentItem, KnowledgeBase } from '../types';
import { USE_MOCK, fmtDateTime, mock, request, requestForm, unwrap } from './api';

const PALETTE = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const colorFor = (id: string | number) => PALETTE[Number(id) % PALETTE.length];

interface ApiKB {
  id: number; name: string; description: string; department: string | null;
  visibility: string; status: string; documents: number; chunks: number; updated_at: string;
}

interface ApiDoc {
  id: number; name: string; type: string; size: string; knowledge_base: string;
  knowledge_base_id: number; department: string | null; uploader: string | null;
  uploaded_at: string; version: string; status: string; permissions: string[];
  pages: number; chunks: number; embedding_status: string; error_message: string;
  history: { stage: string; status: string; at: string }[];
}

function mapKB(k: ApiKB): KnowledgeBase {
  return {
    id: String(k.id), name: k.name, description: k.description || '—',
    department: k.department ?? '—', documents: k.documents, chunks: k.chunks,
    status: k.status as KnowledgeBase['status'],
    visibility: k.visibility as KnowledgeBase['visibility'],
    updatedAt: fmtDateTime(k.updated_at), color: colorFor(k.id),
  };
}

function mapDoc(d: ApiDoc): DocumentItem {
  return {
    id: String(d.id), name: d.name, type: d.type as DocumentItem['type'], size: d.size,
    knowledgeBase: d.knowledge_base, knowledgeBaseId: String(d.knowledge_base_id),
    department: d.department ?? '—', uploader: d.uploader ?? '—',
    uploadedAt: fmtDateTime(d.uploaded_at), version: d.version,
    status: d.status as DocumentItem['status'], permissions: d.permissions,
    pages: d.pages, chunks: d.chunks,
    embeddingStatus: d.embedding_status as DocumentItem['embeddingStatus'],
    history: (d.history ?? []).map((h) => ({ stage: h.stage, status: h.status as DocumentItem['history'][number]['status'], at: h.at })),
    error_message: d.error_message || undefined,
  };
}

export const knowledgeService = {
  listBases: async (): Promise<KnowledgeBase[]> => {
    if (USE_MOCK) return mock(knowledgeBases);
    return unwrap<ApiKB>(await request('/knowledge-bases/')).map(mapKB);
  },
  listDocuments: async (kbId?: string): Promise<DocumentItem[]> => {
    if (USE_MOCK) return mock(kbId ? documents.filter((d) => d.knowledgeBaseId === kbId) : documents);
    const all = unwrap<ApiDoc>(await request('/documents/')).map(mapDoc);
    return kbId ? all.filter((d) => d.knowledgeBaseId === kbId) : all;
  },
  getDocument: async (id: string): Promise<DocumentItem | undefined> => {
    if (USE_MOCK) return mock(documents.find((d) => d.id === id));
    try {
      return mapDoc(await request<ApiDoc>(`/documents/${id}/`));
    } catch {
      return undefined;
    }
  },
  createBase: async (name: string, department: string, description: string) => {
    if (USE_MOCK) {
      return mock({ id: `kb-${Date.now()}`, name, description, department, documents: 0, chunks: 0, status: 'ACTIVE', visibility: 'Department', updatedAt: 'just now', color: '#4f46e5' } as const, 400);
    }
    let department_id: number | null = null;
    try {
      const depts = unwrap<{ id: number; name: string }>(await request('/departments/'));
      department_id = depts.find((d) => d.name === department)?.id ?? null;
    } catch { /* org without departments — create unscoped */ }
    const created = await request<ApiKB>('/knowledge-bases/', {
      method: 'POST', body: JSON.stringify({ name, description, department_id }),
    });
    return { ...mapKB(created), updatedAt: 'just now' as const };
  },
  /** Real mode takes a File (multipart); mock mode takes a filename string. */
  uploadDocument: async (input: File | string, kbId: string): Promise<DocumentItem> => {
    if (USE_MOCK || typeof input === 'string') {
      const name = typeof input === 'string' ? input : input.name;
      const kb = knowledgeBases.find((k) => k.id === kbId) ?? knowledgeBases[0];
      const ext = name.split('.').pop()?.toUpperCase() ?? 'PDF';
      return mock({
        id: `doc-${Date.now()}`, name, type: (['PDF', 'DOCX', 'TXT', 'CSV'].includes(ext) ? ext : 'PDF') as DocumentItem['type'],
        size: '1.2 MB', knowledgeBase: kb.name, knowledgeBaseId: kb.id, department: kb.department,
        uploader: 'Admin User', uploadedAt: 'Sep 20, 2026 · now', version: 'v1.0', status: 'UPLOADING',
        permissions: ['Admin'], pages: 0, chunks: 0, embeddingStatus: 'QUEUED',
        history: [{ stage: 'Uploaded', status: 'CURRENT', at: 'Sep 20, 2026' }],
      }, 500);
    }
    const form = new FormData();
    form.append('knowledge_base', kbId);
    form.append('file', input);
    return mapDoc(await requestForm<ApiDoc>('/documents/', form));
  },
  reprocess: async (id: string): Promise<DocumentItem | undefined> => {
    if (USE_MOCK) return mock(documents.find((d) => d.id === id));
    try {
      return mapDoc(await request<ApiDoc>(`/documents/${id}/process/`, { method: 'POST' }));
    } catch {
      return undefined;
    }
  },
};
