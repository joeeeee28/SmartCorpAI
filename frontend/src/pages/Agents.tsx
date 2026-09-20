import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Play, Wrench } from 'lucide-react';
import { agentService } from '../services/agentService';
import type { Agent, AgentRun } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton, TableSkeleton } from '../components/ui/Feedback';
import { DataTable } from '../components/ui/DataTable';

export function Agents() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [a, r] = await Promise.all([agentService.list(), agentService.runs()]);
      setAgents(a); setRuns(r); setLoading(false);
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title="AI Agents" subtitle="Three specialists on one shared RAG infrastructure — one index, one permission model"
        crumbs={[{ label: 'Agents' }]}
        actions={<Badge tone="indigo">Shared RAG · pgvector (Phase 1)</Badge>}
      />
      {loading ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-64" />)}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {agents.map((a) => (
            <Card key={a.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: a.color }}>
                  <Bot className="h-6 w-6" />
                </span>
                <StatusBadge status={a.status} />
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">{a.name}</h3>
              <p className="mt-1 min-h-10 text-[13px] leading-relaxed text-slate-500">{a.description}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2.5 text-center dark:bg-slate-800/60">
                <div><p className="text-sm font-bold text-slate-900 dark:text-white">{a.runs}</p><p className="text-[10px] text-slate-400">Runs</p></div>
                <div><p className="text-sm font-bold text-emerald-600">{a.successRate}%</p><p className="text-[10px] text-slate-400">Success</p></div>
                <div><p className="text-sm font-bold text-slate-900 dark:text-white">{(a.avgLatencyMs / 1000).toFixed(1)}s</p><p className="text-[10px] text-slate-400">Avg</p></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.knowledgeBases.map((kb) => <Badge key={kb} tone="slate">{kb}</Badge>)}
              </div>
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate(`/agents/${a.id}`)}>Configure</Button>
                <Button size="sm" className="flex-1" icon={<Play className="h-3.5 w-3.5" />} onClick={() => navigate(`/agents/${a.id}/run`)}>Run</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/chat?agent=${a.id}`)}>Chat</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-4">
        <CardHeader title="Recent runs" subtitle="Latest executions across all agents" action={<Link to="/audit-logs" className="link text-xs font-semibold">Full audit trail</Link>} />
        {loading ? <TableSkeleton /> : (
          <DataTable
            columns={[
              { key: 'id', label: 'Run', render: (r) => <span className="font-mono text-xs">{r.id}</span> },
              { key: 'agent', label: 'Agent', render: (r) => <Badge tone="indigo">{r.agent}</Badge> },
              { key: 'query', label: 'Query', render: (r) => <span className="line-clamp-1 max-w-[320px]">{r.query}</span> },
              { key: 'user', label: 'User' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              { key: 'confidence', label: 'Confidence', render: (r) => (r.status === 'RUNNING' ? '—' : `${Math.round(r.confidence * 100)}%`) },
              { key: 'latencyMs', label: 'Latency', render: (r) => (r.status === 'RUNNING' ? '…' : `${(r.latencyMs / 1000).toFixed(1)}s`) },
              { key: 'at', label: 'Time' },
            ]}
            rows={runs} rowKey={(r) => r.id}
          />
        )}
      </Card>

      <Card className="mt-4">
        <div className="flex items-start gap-3 p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"><Wrench className="h-[18px] w-[18px]" /></span>
          <div className="text-[13px] text-slate-600 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-white">One router, one retrieval stack</p>
            <p className="mt-1">User question → <b>intent classification</b> → HR / Finance / Support / General → selected agent → <b>shared permission-filtered RAG</b> → cited response. Agents differ only in instructions, tools and allowed knowledge bases — never in infrastructure.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
