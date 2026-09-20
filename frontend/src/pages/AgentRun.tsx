import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Play } from 'lucide-react';
import { agentService } from '../services/agentService';
import type { Agent, AgentRun as Run } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Feedback';

const samples: Record<string, string[]> = {
  hr: ['How many annual leave days do I get in year two?', 'Onboarding checklist for engineering hires', 'Parental leave eligibility for contractors'],
  finance: ['Q3 travel budget variance vs forecast', 'Per-diem rates for Berlin offsite', 'How do I file an expense claim?'],
  support: ['Customer cannot reset SSO password, error AUTH-214', 'API returning 429s after v2.6 upgrade', 'Refund request for duplicate enterprise invoice'],
};

export function AgentRun() {
  const { id } = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [query, setQuery] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Run | null>(null);

  useEffect(() => {
    if (id) agentService.get(id).then((a) => setAgent(a ?? null));
  }, [id]);

  const run = async (q: string) => {
    if (!q.trim() || !id || running) return;
    setRunning(true);
    setResult(null);
    const r = await agentService.run(id, q);
    setResult(r);
    setRunning(false);
  };

  if (!agent) return <div className="space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-64" /></div>;

  return (
    <div>
      <PageHeader
        title={`Run ${agent.name}`} subtitle="Execute the agent with full traceability — every run is audit-logged"
        crumbs={[{ label: 'Agents', to: '/agents' }, { label: agent.name, to: `/agents/${agent.id}` }, { label: 'Run' }]}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Input" subtitle={`${agent.name} · ${agent.knowledgeBases.join(' · ')}`} />
          <form onSubmit={(e) => { e.preventDefault(); run(query); }} className="space-y-3 p-5">
            <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={4} className="input" placeholder={`Ask the ${agent.name} anything…`} />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" loading={running} icon={<Play className="h-4 w-4" />}>Run agent</Button>
              <Link to={`/chat?agent=${agent.id}`} className="link text-[13px] font-semibold">or continue in chat →</Link>
            </div>
            <div>
              <p className="label">Try a sample query</p>
              <div className="flex flex-wrap gap-1.5">
                {(samples[agent.id] ?? []).map((s) => (
                  <button key={s} type="button" onClick={() => { setQuery(s); run(s); }} className="rounded-full bg-slate-100 px-3 py-1.5 text-left text-xs font-medium text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300">{s}</button>
                ))}
              </div>
            </div>
          </form>
        </Card>
        <Card>
          <CardHeader title="Execution" />
          <div className="p-5">
            {!result && !running && <p className="text-[13px] text-slate-500">Results, confidence and latency appear here after a run.</p>}
            {running && (
              <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                <span>Classifying intent → retrieving evidence → generating…</span>
              </div>
            )}
            {result && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" /> Run completed
                </div>
                <dl className="space-y-2 text-[13px]">
                  {[['Run ID', <span key="i" className="font-mono text-xs">{result.id}</span>], ['Status', <StatusBadge key="s" status={result.status} />],
                    ['Confidence', `${Math.round(result.confidence * 100)}%`], ['Latency', `${(result.latencyMs / 1000).toFixed(1)}s`],
                    ['Query', result.query]].map(([k, v]) => (
                    <div key={k as string} className="flex items-start justify-between gap-3 border-b border-slate-50 pb-2 last:border-0 dark:border-slate-800/60">
                      <dt className="shrink-0 text-slate-400">{k}</dt><dd className="text-right font-semibold text-slate-800 dark:text-slate-100">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-[11px] text-slate-400">Full answer text streams to chat; the run record above is what gets audited.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
