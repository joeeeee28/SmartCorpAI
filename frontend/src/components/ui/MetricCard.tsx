import { ArrowDownRight, ArrowUpRight, BellRing, FileText, Sparkles, Users } from 'lucide-react';
import { clsx } from 'clsx';
import type { Kpi } from '../../types';

const icons = { docs: FileText, queries: Sparkles, users: Users, approvals: BellRing };

export function MetricCard({ kpi }: { kpi: Kpi }) {
  const Icon = icons[kpi.icon];
  const good = kpi.deltaGood;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-2 text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">{kpi.value}</p>
      <p className={clsx('mt-1 flex items-center gap-1 text-xs font-medium', good ? 'text-emerald-600' : 'text-rose-600')}>
        {kpi.deltaDir === 'up' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        {kpi.delta}
      </p>
    </div>
  );
}
