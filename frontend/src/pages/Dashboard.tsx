import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, Bell, CheckCircle2, ChevronRight, Database, FileUp, HardDrive, Inbox,
  MessagesSquare, ScanSearch, Server, Sparkles, ClipboardList, KeyRound, FileText, Upload, UserPlus, Check,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Cell, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dashboardService } from '../services/dashboardService';
import type { Kpi } from '../types';
import { MetricCard } from '../components/ui/MetricCard';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Feedback';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

type Range = 'daily' | 'weekly' | 'monthly';

const quickAccess = [
  { label: 'Ask AI', sub: 'Ask anything', to: '/chat', Icon: MessagesSquare, tint: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300' },
  { label: 'Upload Document', sub: 'Add to knowledge', to: '/knowledge/documents', Icon: FileUp, tint: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300' },
  { label: 'Data Analyst', sub: 'Analyze data', to: '/analytics', Icon: BarChart3, tint: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300' },
  { label: 'Create Task', sub: 'Assign a task', to: '/tasks', Icon: ClipboardList, tint: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300' },
  { label: 'Request Access', sub: 'Request permissions', to: '/requests', Icon: KeyRound, tint: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300' },
  { label: 'View Reports', sub: 'See analytics', to: '/reports', Icon: FileText, tint: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300' },
];

const notifTint: Record<string, string> = {
  approval: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  document: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  ai: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
  system: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
};

const activityIcon = { upload: Upload, check: Check, query: Sparkles, user: UserPlus };
const statusIcon = [Sparkles, Database, Server, HardDrive];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Dashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [range, setRange] = useState<Range>('daily');
  const [trend, setTrend] = useState<{ label: string; queries: number; resolved: number }[]>([]);
  const [usage, setUsage] = useState<{ name: string; value: number; color: string }[]>([]);
  const [notifs, setNotifs] = useState<Awaited<ReturnType<typeof dashboardService.getNotifications>>>([]);
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof dashboardService.getActivity>>>([]);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof dashboardService.getSystemStatus>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [k, u, n, a, s] = await Promise.all([
        dashboardService.getKpis(), dashboardService.getAgentUsage(),
        dashboardService.getNotifications(), dashboardService.getActivity(), dashboardService.getSystemStatus(),
      ]);
      setKpis(k); setUsage(u); setNotifs(n); setActivity(a); setStatus(s);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    dashboardService.getTrend(range).then(setTrend);
  }, [range]);

  const firstName = (user?.name ?? 'Admin').split(' ')[0];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{greeting()}, {firstName} 👋 — Here's what's happening in your organization today.</p>
        </div>
        <select className="input w-auto cursor-pointer py-2 text-[13px]" aria-label="Date range" defaultValue="month">
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[132px]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => <MetricCard key={k.id} kpi={k} />)}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="AI Query Trend" subtitle="Queries submitted vs successfully resolved"
            action={
              <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
                {(['daily', 'weekly', 'monthly'] as Range[]).map((r) => (
                  <button key={r} onClick={() => setRange(r)} className={`rounded-md px-3 py-1 text-xs font-semibold capitalize ${range === r ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{r}</button>
                ))}
              </div>
            }
          />
          <div className="h-[280px] px-2 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="queryFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Area type="monotone" dataKey="queries" name="Queries" stroke="#4f46e5" strokeWidth={2.5} fill="url(#queryFill)" dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Top AI Agent Usage" subtitle="Share of queries by agent" />
          <div className="flex items-center gap-2 px-5 pt-2">
            <div className="relative h-[190px] w-[170px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={usage} dataKey="value" nameKey="name" innerRadius={56} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                    {usage.map((u) => <Cell key={u.name} fill={u.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{usage.reduce((s, u) => s + u.value, 0).toLocaleString()}</p>
                <p className="text-[11px] text-slate-400">Total</p>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-2.5">
              {usage.map((u) => {
                const total = usage.reduce((s, x) => s + x.value, 0) || 1;
                return (
                  <div key={u.name} className="flex items-center gap-2 text-[13px]">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: u.color }} />
                    <span className="flex-1 truncate font-medium text-slate-600 dark:text-slate-300">{u.name}</span>
                    <span className="text-right font-bold leading-tight text-slate-900 dark:text-white">{u.value.toLocaleString()}<span className="block text-[10px] font-medium text-slate-400">{Math.round((u.value / total) * 100)}%</span></span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="px-5 pb-4"><Badge tone="slate">Demo data — live analytics connect in Phase 1</Badge></div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title="Notifications" action={<Link to="/approvals" className="link flex items-center gap-0.5 text-xs font-semibold">View all <ChevronRight className="h-3.5 w-3.5" /></Link>} />
          <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {notifs.map((n) => (
              <div key={n.id} className="flex gap-3 px-5 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"><Bell className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
                  <p className="truncate text-xs text-slate-500">{n.body}</p>
                </div>
                <span className="ml-auto shrink-0 text-[11px] text-slate-400">{n.at}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Activity" action={<Link to="/audit-logs" className="link flex items-center gap-0.5 text-xs font-semibold">Audit logs <ChevronRight className="h-3.5 w-3.5" /></Link>} />
          <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {activity.map((a) => {
              const Icon = activityIcon[a.icon];
              return (
                <div key={a.id} className="flex gap-3 px-5 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">{a.text}</p>
                    <p className="truncate text-xs text-slate-500">{a.detail}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-[11px] text-slate-400">{a.at}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Quick Access" subtitle="Jump into frequent workflows" />
          <div className="grid grid-cols-3 gap-2.5 p-4">
            {quickAccess.map((q) => (
              <Link key={q.label} to={q.to} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 p-3 text-center transition hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-slate-800 dark:hover:bg-slate-800/60">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${q.tint}`}><q.Icon className="h-[18px] w-[18px]" /></span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{q.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="System Status" subtitle="Live service health" action={<Badge tone="emerald"><CheckCircle2 className="h-3 w-3" /> All systems operational</Badge>} />
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {status.map((s, i) => {
            const Icon = statusIcon[i % statusIcon.length];
            return (
              <div key={s.name} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Icon className="h-[18px] w-[18px]" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">{s.name}</p>
                  <p className="text-[11px] text-slate-400">{s.latency} · {s.status}</p>
                </div>
                <span className="relative flex h-2.5 w-2.5"><span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /></span>
              </div>
            );
          })}
          {status.length === 0 && <Inbox className="hidden" />}
        </div>
      </Card>
    </div>
  );
}
