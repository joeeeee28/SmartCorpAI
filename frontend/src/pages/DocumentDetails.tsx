import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, FileText, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { knowledgeService } from '../services/knowledgeService';
import type { DocumentItem } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Feedback';
import { useToast } from '../context/ToastContext';

export function DocumentDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) knowledgeService.getDocument(id).then((d) => { setDoc(d ?? null); setLoading(false); });
  }, [id]);

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-64" /></div>;
  }

  if (!doc) {
    return (
      <div>
        <PageHeader title="Document not found" crumbs={[{ label: 'Documents', to: '/knowledge/documents' }, { label: 'Not found' }]} />
        <Card><div className="p-8 text-sm text-slate-500">This document does not exist. <Link to="/knowledge/documents" className="link">Back to documents</Link></div></Card>
      </div>
    );
  }

  const meta: [string, React.ReactNode][] = [
    ['Filename', doc.name],
    ['Department', doc.department],
    ['Knowledge Base', <Link key="kb" to={`/knowledge/documents?kb=${doc.knowledgeBaseId}`} className="link">{doc.knowledgeBase}</Link>],
    ['Uploader', doc.uploader],
    ['Upload date', doc.uploadedAt],
    ['Version', <Badge key="v" tone="slate">{doc.version}</Badge>],
    ['Processing status', <StatusBadge key="s" status={doc.status} />],
    ['Pages', doc.pages || '—'],
    ['Chunks', doc.chunks ? doc.chunks.toLocaleString() : '—'],
    ['Embedding status', <StatusBadge key="e" status={doc.embeddingStatus} />],
    ['Size', doc.size],
    ['Permissions', <span key="p" className="flex flex-wrap gap-1.5">{doc.permissions.map((p) => <Badge key={p} tone="indigo">{p}</Badge>)}</span>],
  ];

  return (
    <div>
      <PageHeader
        title={doc.name}
        subtitle={`${doc.type} · ${doc.size} · ${doc.knowledgeBase}`}
        crumbs={[{ label: 'Knowledge', to: '/knowledge' }, { label: 'Documents', to: '/knowledge/documents' }, { label: doc.name }]}
        actions={
          <>
            {doc.status === 'FAILED' && <Button icon={<Loader2 className="h-4 w-4" />} onClick={() => toast({ kind: 'info', title: 'Reprocessing queued', body: doc.name })}>Reprocess</Button>}
            <Button variant="secondary" icon={<ShieldCheck className="h-4 w-4" />} onClick={() => toast({ kind: 'info', title: 'Permissions', body: `Visible to: ${doc.permissions.join(', ')}` })}>Permissions</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Document details" />
          <dl className="grid grid-cols-1 gap-x-8 p-5 sm:grid-cols-2">
            {meta.map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 border-b border-slate-50 py-2.5 last:border-0 dark:border-slate-800/60">
                <dt className="text-[13px] text-slate-500 dark:text-slate-400">{k}</dt>
                <dd className="text-right text-[13px] font-semibold text-slate-800 dark:text-slate-100">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader title="Processing history" subtitle="Async pipeline stages" />
            <div className="space-y-0 p-5">
              {doc.history.map((h, i) => (
                <div key={h.stage} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < doc.history.length - 1 && <span className="absolute left-[9px] top-5 h-[calc(100%-18px)] w-px bg-slate-200 dark:bg-slate-700" />}
                  {h.status === 'DONE' ? <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-emerald-500" />
                    : h.status === 'CURRENT' ? <Loader2 className="h-[18px] w-[18px] shrink-0 animate-spin text-indigo-500" />
                    : h.status === 'FAILED' ? <XCircle className="h-[18px] w-[18px] shrink-0 text-rose-500" />
                    : <Clock className="h-[18px] w-[18px] shrink-0 text-slate-300" />}
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{h.stage}</p>
                    <p className="text-[11px] text-slate-400">{h.at}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Preview" />
            <div className="flex items-center gap-3 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-500/10"><FileText className="h-6 w-6" /></span>
              <p className="text-[13px] text-slate-500">Secure preview renders here after permission check. Content is never exposed to unauthorized roles.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
