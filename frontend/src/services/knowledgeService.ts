import { documents, knowledgeBases } from '../mock/knowledge';
import type { DocumentItem } from '../types';
import { mock } from './api';

export const knowledgeService = {
  listBases: () => mock(knowledgeBases),
  listDocuments: (kbId?: string) =>
    mock(kbId ? documents.filter((d) => d.knowledgeBaseId === kbId) : documents),
  getDocument: (id: string) => mock(documents.find((d) => d.id === id)),
  createBase: (name: string, department: string, description: string) =>
    mock({ id: `kb-${Date.now()}`, name, description, department, documents: 0, chunks: 0, status: 'ACTIVE', visibility: 'Department', updatedAt: 'just now', color: '#4f46e5' } as const, 400),
  uploadDocument: (name: string, kbId: string): Promise<DocumentItem> => {
    const kb = knowledgeBases.find((k) => k.id === kbId) ?? knowledgeBases[0];
    const ext = name.split('.').pop()?.toUpperCase() ?? 'PDF';
    return mock({
      id: `doc-${Date.now()}`, name, type: (['PDF', 'DOCX', 'TXT', 'CSV'].includes(ext) ? ext : 'PDF') as DocumentItem['type'],
      size: '1.2 MB', knowledgeBase: kb.name, knowledgeBaseId: kb.id, department: kb.department,
      uploader: 'Admin User', uploadedAt: 'Sep 20, 2026 · now', version: 'v1.0', status: 'UPLOADING',
      permissions: ['Admin'], pages: 0, chunks: 0, embeddingStatus: 'QUEUED',
      history: [{ stage: 'Uploaded', status: 'CURRENT', at: 'Sep 20, 2026' }],
    }, 500);
  },
};
