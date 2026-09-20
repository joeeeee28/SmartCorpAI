import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, FileUp, RotateCcw } from 'lucide-react';
import { knowledgeService } from '../services/knowledgeService';
import type { DocumentItem } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { TableSkeleton } from '../components/ui/Feedback';
import { DataTable } from '../components/ui/DataTable';
import { FilterBar, Pagination, SearchInput, Select } from '../components/ui/Controls';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 8;

const typeTone: Record<string, 'rose' | 'sky' | 'slate' | 'emerald'> = { PDF: 'rose', DOCX: 'sky', TXT: 'slate', CSV: 'emerald' };

export function Documents() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const kbFilter = params.get('kb') ?? undefined;

  useEffect(() => {
    setLoading(true);
    knowledgeService.listDocuments(kbFilter).then((d) => { setDocs(d); setLoading(false); setPage(1); });
  }, [kbFilter]);

  const filtered = useMemo(() => docs.filter((d) =>
    (status === 'all' || d.status === status) &&
    (type === 'all' || d.type === type) &&
    d.name.toLowerCase().includes(q.toLowerCase()),
  ), [docs, status, type, q]);

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;
    setUploading(true);
    setProgress(8);
    const timer = setInterval(() => setProgress((p) => Math.min(92, p + Math.random() * 18)), 220);
    const doc = await knowledgeService.uploadDocument(fileName.trim(), kbFilter ?? 'kb-hr');
    clearInterval(timer);
    setProgress(100);
    setTimeout(() => {
      setDocs((prev) => [{ ...doc, status: 'PROCESSING', embeddingStatus: 'INDEXING', chunks: 64, pages: 12 }, ...prev]);
      setUploading(false);
      setUploadOpen(false);
      setFileName('');
      toast({ kind: 'success', title: 'Upload started', body: `${doc.name} is being processed.` });
    }, 350);
  };

  return (
    <div>
      <PageHeader
        title="Documents" subtitle={kbFilter ? 'Filtered by knowledge base' : 'All indexed documents across knowledge bases'}
        crumbs={[{ label: 'Knowledge', to: '/knowledge' }, { label: 'Documents' }]}
        actions={<Button icon={<FileUp className="h-4 w-4" />} onClick={() => setUploadOpen(true)}>Upload Document</Button>}
      />
      <FilterBar>
        <div className="w-full max-w-sm"><SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search documents…" /></div>
        <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} ariaLabel="Status" options={[{ value: 'all', label: 'All statuses' }, ...['READY', 'PROCESSING', 'UPLOADING', 'FAILED'].map((s) => ({ value: s, label: s }))]} />
        <Select value={type} onChange={(v) => { setType(v); setPage(1); }} ariaLabel="Type" options={[{ value: 'all', label: 'All types' }, ...['PDF', 'DOCX', 'TXT', 'CSV'].map((s) => ({ value: s, label: s }))]} />
        {kbFilter && <Button variant="ghost" size="sm" onClick={() => navigate('/knowledge/documents')}>Clear KB filter</Button>}
      </FilterBar>

      <Card>
        {loading ? <TableSkeleton /> : (
          <>
            <DataTable
              columns={[
                { key: 'name', label: 'Document', render: (d) => (
                  <span className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                    <span><Link to={`/knowledge/documents/${d.id}`} className="link font-semibold">{d.name}</Link>
                      <span className="block text-[11px] font-normal text-slate-400">{d.knowledgeBase} · {d.version}</span></span>
                  </span>
                ) },
                { key: 'type', label: 'Type', render: (d) => <Badge tone={typeTone[d.type]}>{d.type}</Badge> },
                { key: 'department', label: 'Department' },
                { key: 'uploader', label: 'Uploader' },
                { key: 'uploadedAt', label: 'Uploaded' },
                { key: 'status', label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
                { key: 'actions', label: '', render: (d) => d.status === 'FAILED' ? (
                  <button className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline" onClick={(e) => { e.stopPropagation(); toast({ kind: 'info', title: 'Reprocessing queued', body: d.name }); }}>
                    <RotateCcw className="h-3.5 w-3.5" /> Retry
                  </button>
                ) : null },
              ]}
              rows={pageRows} rowKey={(d) => d.id}
              onRowClick={(d) => navigate(`/knowledge/documents/${d.id}`)}
              emptyTitle="No documents found" emptyBody="Upload a PDF, DOCX, TXT or CSV to get started."
            />
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </Card>

      <Modal open={uploadOpen} onClose={() => !uploading && setUploadOpen(false)} title="Upload document" subtitle="PDF, DOCX, TXT, CSV up to 50 MB" footer={
        <>
          <Button variant="ghost" disabled={uploading} onClick={() => setUploadOpen(false)}>Cancel</Button>
          <Button loading={uploading} onClick={(e) => upload(e as unknown as React.FormEvent)}>Upload & Process</Button>
        </>
      }>
        <form onSubmit={upload} className="space-y-4">
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
            <FileUp className="mx-auto h-8 w-8 text-indigo-400" />
            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Drop a file here or type a filename</p>
            <p className="text-xs text-slate-400">Demo upload — simulated pipeline</p>
            <input className="input mt-3" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="e.g. Travel Policy 2026.pdf" />
          </div>
          {uploading && (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">Uploading… {Math.round(progress)}% — extraction & embedding run async via Celery in production.</p>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
