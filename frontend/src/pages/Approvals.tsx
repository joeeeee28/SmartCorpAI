import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardCheck, MessageSquare, XCircle } from 'lucide-react';
import { approvalService } from '../services/approvalService';
import type { Approval, ApprovalStatus } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { EmptyState, TableSkeleton } from '../components/ui/Feedback';
import { Tabs } from '../components/ui/Tabs';
import { DataTable } from '../components/ui/DataTable';
import { Drawer } from '../components/ui/Drawer';
import { useToast } from '../context/ToastContext';

const riskTone: Record<string, 'emerald' | 'amber' | 'rose'> = { LOW: 'emerald', MEDIUM: 'amber', HIGH: 'rose', CRITICAL: 'rose' };

export function Approvals() {
  const { toast } = useToast();
  const [items, setItems] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('PENDING');
  const [selected, setSelected] = useState<Approval | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    approvalService.list().then((a) => { setItems(a); setLoading(false); });
  }, []);

  const counts = (s: string) => s === 'ALL' ? items.length : items.filter((a) => a.status === s).length;
  const rows = tab === 'ALL' ? items : items.filter((a) => a.status === tab);

  const decide = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selected) return;
    const updated = await approvalService.decide(selected.id, status, comment);
    if (updated) {
      setItems((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setSelected(updated);
      setComment('');
      toast({ kind: status === 'APPROVED' ? 'success' : 'error', title: `Request ${status.toLowerCase()}`, body: `${updated.id} · ${updated.title}` });
    }
  };

  const addComment = async () => {
    if (!selected || !comment.trim()) return;
    const updated = await approvalService.comment(selected.id, comment.trim());
    if (updated) {
      setItems((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setSelected(updated);
      setComment('');
      toast({ kind: 'success', title: 'Comment added' });
    }
  };

  return (
    <div>
      <PageHeader title="Approval Center" subtitle="Human-in-the-loop queue for AI-recommended actions" crumbs={[{ label: 'Workflow' }, { label: 'Approvals' }]} />
      <Card>
        <div className="px-2 pt-1">
          <Tabs tabs={[
            { id: 'PENDING', label: 'Pending', count: counts('PENDING') },
            { id: 'APPROVED', label: 'Approved', count: counts('APPROVED') },
            { id: 'REJECTED', label: 'Rejected', count: counts('REJECTED') },
            { id: 'ALL', label: 'All', count: counts('ALL') },
          ]} active={tab} onChange={setTab} />
        </div>
        {loading ? <TableSkeleton /> : rows.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title={`No ${tab.toLowerCase()} approvals`} body="Items requiring your decision will appear here." />
        ) : (
          <DataTable
            columns={[
              { key: 'id', label: 'ID', render: (a) => <span className="font-mono text-xs">{a.id}</span> },
              { key: 'title', label: 'Request', render: (a) => <span><span className="font-semibold">{a.title}</span><span className="block text-[11px] font-normal text-slate-400">{a.type} · {a.requester}</span></span> },
              { key: 'agent', label: 'Agent', render: (a) => <Badge tone="indigo">{a.agent}</Badge> },
              { key: 'risk', label: 'Risk', render: (a) => <Badge tone={riskTone[a.risk]}>{a.risk}</Badge> },
              { key: 'approver', label: 'Approver' },
              { key: 'createdAt', label: 'Created' },
              { key: 'status', label: 'Status', render: (a) => <StatusBadge status={a.status} /> },
            ]}
            rows={rows} rowKey={(a) => a.id} onRowClick={setSelected}
          />
        )}
      </Card>

      <Drawer open={!!selected} onClose={() => { setSelected(null); setComment(''); }} title={selected ? `${selected.id} · Evidence review` : ''}>
        {selected && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone={riskTone[selected.risk]}>{selected.risk} risk</Badge>
                <StatusBadge status={selected.status} />
                <Badge tone="slate">{selected.type}</Badge>
              </div>
              <h4 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{selected.title}</h4>
              <p className="mt-1 text-[13px] text-slate-500">Requested by <b>{selected.requester}</b> ({selected.department}) · {selected.createdAt}</p>
            </div>
            <Card>
              <CardHeader title="AI recommendation" subtitle={selected.agent} />
              <p className="p-4 text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">{selected.recommendation}</p>
            </Card>
            <div>
              <p className="label">Evidence</p>
              <ul className="space-y-1.5">
                {selected.evidence.map((e, i) => (
                  <li key={i} className="flex gap-2 rounded-lg bg-slate-50 p-2.5 text-[13px] text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />{e}
                  </li>
                ))}
              </ul>
            </div>
            {selected.decidedAt && (
              <div className="rounded-lg bg-slate-50 p-3 text-[13px] dark:bg-slate-800/60">
                <p><b>Decided:</b> {selected.decidedAt}</p>
                {selected.resultingAction && <p className="mt-1"><b>Action:</b> {selected.resultingAction}</p>}
              </div>
            )}
            <div>
              <p className="label flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Comments ({selected.comments.length})</p>
              <div className="space-y-2">
                {selected.comments.map((c, i) => (
                  <div key={i} className="rounded-lg border border-slate-100 p-2.5 text-[13px] dark:border-slate-800">
                    <p className="flex justify-between text-[11px] text-slate-400"><b className="text-slate-700 dark:text-slate-200">{c.by}</b>{c.at}</p>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">{c.text}</p>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" className="input flex-1" />
                  <Button variant="secondary" size="sm" onClick={addComment}>Post</Button>
                </div>
              </div>
            </div>
            {selected.status === 'PENDING' && (
              <div className="flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button variant="success" className="flex-1" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => decide('APPROVED')}>Approve</Button>
                <Button variant="danger" className="flex-1" icon={<XCircle className="h-4 w-4" />} onClick={() => decide('REJECTED')}>Reject</Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
