import { useEffect, useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { evaluationService } from '../services/analyticsService';
import type { EvalCase, EvalMetric } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { Alert, Skeleton, TableSkeleton } from '../components/ui/Feedback';
import { DataTable } from '../components/ui/DataTable';

export function Evaluation() {
  const [metrics, setMetrics] = useState<EvalMetric[]>([]);
  const [cases, setCases] = useState<EvalCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [m, c] = await Promise.all([evaluationService.metrics(), evaluationService.cases()]);
      setMetrics(m); setCases(c); setLoading(false);
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title="Evaluation" subtitle="Retrieval quality, faithfulness and failure analysis for every agent"
        crumbs={[{ label: 'Evaluation' }]}
        actions={<Badge tone="amber">Demo metrics — not real AI performance</Badge>}
      />
      <Alert kind="warning" title="Demo evaluation data" body="Scores below are illustrative placeholders so the UI can be reviewed. Real eval harnesses (golden sets, LLM judges, citation checks) connect with the Phase 1 backend." />

      {loading ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-44" />)}</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map((m) => {
            const pct = Math.round(m.score * 100);
            const pass = m.score >= m.target;
            return (
              <Card key={m.id} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-500">{m.name}</p>
                    <p className="mt-1 text-[26px] font-bold text-slate-900 dark:text-white">{pct}<span className="text-sm font-medium text-slate-400"> / 100</span></p>
                  </div>
                  <Badge tone={pass ? 'emerald' : 'amber'}>{pass ? 'On target' : 'Below target'}</Badge>
                </div>
                <div className="mt-2 h-[54px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={m.trend.map((v, i) => ({ i, v: Math.round(v * 100) }))}>
                      <Line type="monotone" dataKey="v" stroke={pass ? '#10b981' : '#f59e0b'} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={`h-full rounded-full ${pass ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Target {Math.round(m.target * 100)} · {m.note}</p>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-4">
        <CardHeader title="Failure & hallucination review" subtitle="Sampled runs with claim-level verdicts" action={<FlaskConical className="h-4 w-4 text-slate-400" />} />
        {loading ? <TableSkeleton /> : (
          <DataTable
            columns={[
              { key: 'id', label: 'Case', render: (c) => <span className="font-mono text-xs">{c.id}</span> },
              { key: 'query', label: 'Query', render: (c) => <span className="max-w-[300px] line-clamp-1">{c.query}</span> },
              { key: 'agent', label: 'Agent', render: (c) => <Badge tone="indigo">{c.agent}</Badge> },
              { key: 'faithfulness', label: 'Faithful.', render: (c) => `${Math.round(c.faithfulness * 100)}%` },
              { key: 'relevance', label: 'Relevance', render: (c) => `${Math.round(c.relevance * 100)}%` },
              { key: 'citationAccuracy', label: 'Cite acc.', render: (c) => `${Math.round(c.citationAccuracy * 100)}%` },
              { key: 'latencyMs', label: 'Latency', render: (c) => `${(c.latencyMs / 1000).toFixed(1)}s` },
              { key: 'verdict', label: 'Verdict', render: (c) => <StatusBadge status={c.verdict} /> },
            ]}
            rows={cases} rowKey={(c) => c.id}
          />
        )}
      </Card>
    </div>
  );
}
