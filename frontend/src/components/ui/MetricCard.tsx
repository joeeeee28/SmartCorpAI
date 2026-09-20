import { ArrowDownRight, ArrowUpRight, BellRing, FileText, Sparkles, Users } from 'lucide-react';
import { clsx } from 'clsx';
import type { Kpi } from '../../types';

const icons = { docs: FileText, queries: Sparkles, users: Users, approvals: BellRing };

// Per-card tinted icon treatment, per the dashboard reference image.
const tints: Record<Kpi['icon'], string> = {
  docs: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
  queries: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
  users: 'bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300',
  approvals: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
};

export function MetricCard({ kpi }: { kpi: Kpi }) {
  const Icon = icons[kpi.icon];
  const good = kpi.deltaGood;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tints[kpi.icon]}`}>
          <Icon className="h-5 w-5" />
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
