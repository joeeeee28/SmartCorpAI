import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Bot, Play, Settings2, Wrench } from 'lucide-react';
import { agentService } from '../services/agentService';
import type { Agent, AgentRun } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton, TableSkeleton } from '../components/ui/Feedback';
import { Tabs } from '../components/ui/Tabs';
import { DataTable } from '../components/ui/DataTable';
import { useToast } from '../context/ToastContext';

export function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [a, r] = await Promise.all([agentService.get(id), agentService.runs(id)]);
      setAgent(a ?? null);
      setInstructions(a?.instructions ?? '');
      setRuns(r);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-72" /></div>;
  if (!agent) {
    return (
      <div>
        <PageHeader title="Agent not found" crumbs={[{ label: 'Agents', to: '/agents' }, { label: 'Not found' }]} />
        <Card><div className="p-8 text-sm text-slate-500">Unknown agent. <Link to="/agents" className="link">Back to agents</Link></div></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={agent.name} subtitle={agent.description}
        crumbs={[{ label: 'Agents', to: '/agents' }, { label: agent.name }]}
        actions={
          <>
            <Button variant="secondary" icon={<Settings2 className="h-4 w-4" />} onClick={() => setTab('settings')}>Configure</Button>
            <Button icon={<Play className="h-4 w-4" />} onClick={() => navigate(`/agents/${agent.id}/run`)}>Run Agent</Button>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { l: 'Total runs', v: String(agent.runs) },
          { l: 'Success rate', v: `${agent.successRate}%` },
          { l: 'Avg latency', v: `${(agent.avgLatencyMs / 1000).toFixed(1)}s` },
          { l: 'Last run', v: agent.lastRun },
        ].map((s) => (
          <Card key={s.l} className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{s.l}</p>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{s.v}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <div className="px-2 pt-1"><Tabs tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'runs', label: 'Recent Runs', count: runs.length },
          { id: 'settings', label: 'Settings' },
        ]} active={tab} onChange={setTab} /></div>

        {tab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
            <div>
              <p className="label">System instructions</p>
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 text-[13px] leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">{agent.instructions}</div>
              <p className="label mt-4">Allowed knowledge bases</p>
              <div className="flex flex-wrap gap-1.5">{agent.knowledgeBases.map((kb) => <Badge key={kb} tone="indigo">{kb}</Badge>)}</div>
            </div>
            <div>
              <p className="label">Tools</p>
              <div className="space-y-2">
                {agent.tools.map((t) => (
                  <div key={t} className="flex items-center gap-2.5 rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
                    <Wrench className="h-4 w-4 text-slate-400" />
                    <span className="font-mono text-[13px] text-slate-700 dark:text-slate-200">{t}</span>
                    <Badge tone="emerald" className="ml-auto">enabled</Badge>
                  </div>
                ))}
              </div>
              <p className="label mt-4">Execution settings</p>
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60"><p className="text-[11px] text-slate-400">Temperature</p><p className="font-bold">{agent.temperature}</p></div>
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60"><p className="text-[11px] text-slate-400">Max tokens</p><p className="font-bold">{agent.maxTokens.toLocaleString()}</p></div>
              </div>
            </div>
          </div>
        )}

        {tab === 'runs' && (
          <DataTable
            columns={[
              { key: 'id', label: 'Run', render: (r) => <span className="font-mono text-xs">{r.id}</span> },
              { key: 'query', label: 'Query', render: (r) => <span className="line-clamp-1 max-w-[420px]">{r.query}</span> },
              { key: 'user', label: 'User' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              { key: 'confidence', label: 'Confidence', render: (r) => (r.status === 'RUNNING' ? '—' : `${Math.round(r.confidence * 100)}%`) },
              { key: 'at', label: 'Time' },
            ]}
            rows={runs} rowKey={(r) => r.id} emptyTitle="No runs yet" emptyBody="Run this agent to see execution history."
          />
        )}

        {tab === 'settings' && (
          <div className="max-w-2xl space-y-4 p-5">
            <div>
              <label className="label">Status</label>
              <div className="flex items-center gap-2"><StatusBadge status={agent.status} />
                <button className="link text-xs font-semibold" onClick={() => toast({ kind: 'info', title: 'Status change queued', body: 'Takes effect after running executions finish.' })}>Pause agent</button>
              </div>
            </div>
            <div><label className="label">System instructions</label><textarea className="input" rows={5} value={instructions} onChange={(e) => setInstructions(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Temperature</label><input className="input" type="number" step="0.1" min="0" max="1" defaultValue={agent.temperature} /></div>
              <div><label className="label">Max tokens</label><input className="input" type="number" step="100" defaultValue={agent.maxTokens} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => toast({ kind: 'success', title: 'Agent updated', body: `${agent.name} configuration saved.` })}>Save changes</Button>
              <Button variant="secondary" icon={<Bot className="h-4 w-4" />} onClick={() => navigate(`/chat?agent=${agent.id}`)}>Open in Chat</Button>
            </div>
          </div>
        )}
      </Card>
      {runs.length === 0 && tab !== 'settings' && <div className="hidden"><TableSkeleton rows={1} /></div>}
    </div>
  );
}
