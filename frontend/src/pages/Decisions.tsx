import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, XCircle, Zap } from 'lucide-react';
import { decisionService } from '../services/decisionService';
import type { Decision } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { EmptyState, Skeleton } from '../components/ui/Feedback';
import { Drawer } from '../components/ui/Drawer';
import { useToast } from '../context/ToastContext';

const riskTone: Record<string, 'emerald' | 'amber' | 'rose'> = { LOW: 'emerald', MEDIUM: 'amber', HIGH: 'rose', CRITICAL: 'rose' };

export function Decisions() {
  const { toast } = useToast();
  const [items, setItems] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Decision | null>(null);

  useEffect(() => {
    decisionService.list().then((d) => { setItems(d); setLoading(false); });
  }, []);

  const decide = async (approved: boolean) => {
    if (!selected) return;
    const updated = await decisionService.decide(selected.id, approved);
    if (updated) {
      setItems((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setSelected(updated);
      toast({ kind: approved ? 'success' : 'error', title: approved ? 'Decision approved' : 'Decision rejected', body: `${updated.id} · audit record written.` });
    }
  };

  return (
    <div>
      <PageHeader
        title="Decision Center" subtitle="AI-detected issues with evidence, recommendations and human approval"
        crumbs={[{ label: 'Decision Center' }]}
        actions={<Badge tone="indigo">Issue → Evidence → Analysis → Approval → Action → Audit</Badge>}
      />
      {loading ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-56" />)}</div>
      ) : items.length === 0 ? (
        <Card><EmptyState icon={Zap} title="No decisions pending" body="Detected issues will appear here with evidence and recommendations." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {items.map((d) => (
            <Card key={d.id} className="cursor-pointer p-5 transition hover:border-indigo-200 hover:shadow-pop" >
              <div onClick={() => setSelected(d)}>
                <div className="flex items-center gap-2">
                  <Badge tone={riskTone[d.risk]}><AlertTriangle className="h-3 w-3" /> {d.risk} risk</Badge>
                  <StatusBadge status={d.status} />
                  <span className="ml-auto font-mono text-[11px] text-slate-400">{d.id}</span>
                </div>
                <h3 className="mt-2.5 text-[15px] font-bold text-slate-900 dark:text-white">{d.title}</h3>
                <p className="mt-1 line-clamp-2 text-[13px] text-slate-500">{d.issue}</p>
                <div className="mt-3 rounded-lg bg-indigo-50/70 p-3 text-[13px] dark:bg-indigo-500/10">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-500">Recommendation</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{d.recommendation}</p>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <Badge tone="slate">{d.agent}</Badge>
                  <span>{d.department}</span>
                  <span className="ml-auto">Approver: <b className="text-slate-600 dark:text-slate-300">{d.approver}</b></span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.id} · Review` : ''}>
        {selected && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2"><Badge tone={riskTone[selected.risk]}>{selected.risk} risk</Badge><StatusBadge status={selected.status} /></div>
              <h4 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{selected.title}</h4>
              <p className="mt-1 text-[13px] text-slate-500">{selected.issue}</p>
            </div>
            <div>
              <p className="label">Evidence collected</p>
              <ul className="space-y-1.5">
                {selected.evidence.map((e, i) => (
                  <li key={i} className="flex gap-2 rounded-lg bg-slate-50 p-2.5 text-[13px] text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{e}
                  </li>
                ))}
              </ul>
            </div>
            <div><p className="label">Analysis</p><p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{selected.analysis}</p></div>
            <div className="rounded-lg bg-indigo-50/70 p-3 dark:bg-indigo-500/10">
              <p className="label">Recommended action</p>
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{selected.recommendedAction}</p>
            </div>
            <div>
              <p className="label">Supporting documents</p>
              <div className="space-y-1.5">
                {selected.supportingDocs.map((d) => (
                  <div key={d} className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-300"><FileText className="h-4 w-4 text-slate-400" />{d}</div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60"><p className="text-[11px] text-slate-400">Created</p><p className="font-semibold">{selected.createdAt}</p></div>
              <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60"><p className="text-[11px] text-slate-400">Updated</p><p className="font-semibold">{selected.updatedAt}</p></div>
            </div>
            {(selected.status === 'PENDING_APPROVAL' || selected.status === 'ANALYZING' || selected.status === 'DETECTED') && (
              <div className="flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button variant="success" className="flex-1" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => decide(true)}>Approve action</Button>
                <Button variant="danger" className="flex-1" icon={<XCircle className="h-4 w-4" />} onClick={() => decide(false)}>Reject</Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
