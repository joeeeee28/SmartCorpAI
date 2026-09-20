import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Database, Play } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { Alert, EmptyState, Skeleton } from '../components/ui/Feedback';

const presets = [
  { q: 'Travel spend by department this quarter', sql: 'SELECT department, SUM(amount) FROM expenses WHERE quarter = \'Q3\' GROUP BY department;', data: [
    { name: 'Engineering', value: 48200 }, { name: 'Sales', value: 39800 }, { name: 'Support', value: 21400 }, { name: 'Finance', value: 18900 }, { name: 'HR', value: 12400 },
  ]},
  { q: 'Open tickets by priority', sql: 'SELECT priority, COUNT(*) FROM tickets WHERE status = \'open\' GROUP BY priority;', data: [
    { name: 'Urgent', value: 7 }, { name: 'High', value: 23 }, { name: 'Medium', value: 41 }, { name: 'Low', value: 18 },
  ]},
  { q: 'Leave days taken per month', sql: 'SELECT month, SUM(days) FROM leave_requests WHERE year = 2026 GROUP BY month;', data: [
    { name: 'Apr', value: 96 }, { name: 'May', value: 121 }, { name: 'Jun', value: 148 }, { name: 'Jul', value: 172 }, { name: 'Aug', value: 165 }, { name: 'Sep', value: 88 },
  ]},
];

export function AskData() {
  const [question, setQuestion] = useState('');
  const [active, setActive] = useState<(typeof presets)[number] | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setActive(null);
    const match = presets.find((p) => q.toLowerCase().split(/\s+/).some((w) => w.length > 4 && p.q.toLowerCase().includes(w))) ?? presets[0];
    setTimeout(() => { setActive(match); setLoading(false); }, 900);
  };

  return (
    <div>
      <PageHeader title="Ask Data" subtitle="Natural-language questions over governed enterprise datasets" crumbs={[{ label: 'Data Analyst' }, { label: 'Ask Data' }]} />
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); ask(question); }} className="flex flex-col gap-2.5 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Database className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={question} onChange={(e) => setQuestion(e.target.value)} className="input py-2.5 pl-9" placeholder="e.g. Travel spend by department this quarter" />
          </div>
          <Button type="submit" loading={loading} icon={<Play className="h-4 w-4" />}>Analyze</Button>
        </form>
        <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
          {presets.map((p) => (
            <button key={p.q} onClick={() => { setQuestion(p.q); ask(p.q); }} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300">{p.q}</button>
          ))}
        </div>
      </Card>

      {loading && <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3"><Skeleton className="h-72 xl:col-span-2" /><Skeleton className="h-72" /></div>}
      {!loading && !active && (
        <Card className="mt-4"><EmptyState icon={Database} title="Ask a data question" body="The analyst plans a query against permitted tables, runs it, and charts the result." /></Card>
      )}
      {!loading && active && (
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader title="Result" subtitle={active.q} action={<Badge tone="emerald">3 tables · row-level permissions applied</Badge>} />
            <div className="h-[300px] px-2 py-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={active.data} margin={{ left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v) => [Number(v).toLocaleString(), 'Value']} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <div className="space-y-4">
            <Card>
              <CardHeader title="Generated query" />
              <pre className="overflow-x-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-300">{active.sql}</pre>
            </Card>
            <Alert kind="info" title="Governed access" body="Queries run against role-scoped views. Restricted rows are excluded before aggregation." />
          </div>
        </div>
      )}
    </div>
  );
}
