import { useEffect, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Feedback';
import { DataTable } from '../components/ui/DataTable';

const FUNNEL_COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#10b981'];

export function Analytics() {
  const [usage, setUsage] = useState<Awaited<ReturnType<typeof analyticsService.usage>>>([]);
  const [perf, setPerf] = useState<Awaited<ReturnType<typeof analyticsService.agentPerformance>>>([]);
  const [cost, setCost] = useState<Awaited<ReturnType<typeof analyticsService.cost>>>([]);
  const [unanswered, setUnanswered] = useState<Awaited<ReturnType<typeof analyticsService.unanswered>>>([]);
  const [funnel, setFunnel] = useState<Awaited<ReturnType<typeof analyticsService.funnel>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [u, p, c, ua, f] = await Promise.all([
        analyticsService.usage(), analyticsService.agentPerformance(), analyticsService.cost(),
        analyticsService.unanswered(), analyticsService.funnel(),
      ]);
      setUsage(u); setPerf(p); setCost(c); setUnanswered(ua); setFunnel(f);
      setLoading(false);
    })();
  }, []);

  const tip = { borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 };

  return (
    <div>
      <PageHeader
        title="Analytics" subtitle="Usage, quality, cost and knowledge gaps across the platform"
        crumbs={[{ label: 'Analytics' }]}
        actions={<Badge tone="slate">Demo data — live analytics in Phase 1</Badge>}
      />
      {loading ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-72" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader title="Queries, users & uploads" subtitle="Daily platform activity" />
              <div className="h-[260px] px-2 py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usage} margin={{ left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tip} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="queries" name="AI queries" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="users" name="Active users" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="docs" name="Uploads" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title="Answer funnel" subtitle="From query to positive feedback" />
              <div className="h-[260px] px-2 py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={funnel} dataKey="value" nameKey="stage" innerRadius={55} outerRadius={95} paddingAngle={3} strokeWidth={0}>
                      {funnel.map((_, i) => <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tip} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title="Agent success rate" subtitle="Runs vs quality" />
              <div className="h-[260px] px-2 py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perf} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" domain={[90, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="agent" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip contentStyle={tip} formatter={(v, name) => [`${v}${name === 'success' ? '%' : ''}`, name === 'success' ? 'Success rate' : 'Runs']} />
                    <Bar dataKey="success" name="success" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title="Token & cost trend" subtitle="Monthly LLM spend (USD)" />
              <div className="h-[260px] px-2 py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cost} margin={{ left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tip} formatter={(v, name) => [name === 'cost' ? `$${v}` : `${v}M`, name === 'cost' ? 'Cost' : 'Tokens']} />
                    <Area type="monotone" dataKey="cost" name="cost" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          <Card className="mt-4">
            <CardHeader title="Top unanswered questions" subtitle="Knowledge gaps worth closing" />
            <DataTable
              columns={[
                { key: 'query', label: 'Question' },
                { key: 'agent', label: 'Routed to', render: (r) => <Badge tone="indigo">{r.agent}</Badge> },
                { key: 'count', label: 'Times asked', render: (r) => <b>{r.count}×</b> },
              ]}
              rows={unanswered} rowKey={(r) => r.query}
            />
          </Card>
        </>
      )}
    </div>
  );
}
