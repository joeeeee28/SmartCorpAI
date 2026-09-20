import { AlertTriangle, CheckCircle2, Info, LucideIcon, SearchX, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export function EmptyState({ icon: Icon = SearchX, title, body, action }: { icon?: LucideIcon; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-700/60', className)} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-9 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Alert({ kind = 'info', title, body }: { kind?: 'info' | 'success' | 'warning' | 'error'; title: string; body?: string }) {
  const conf = {
    info: { Icon: Info, cls: 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200' },
    success: { Icon: CheckCircle2, cls: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200' },
    warning: { Icon: AlertTriangle, cls: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200' },
    error: { Icon: XCircle, cls: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200' },
  }[kind];
  return (
    <div className={clsx('flex items-start gap-2.5 rounded-lg border p-3.5 text-sm', conf.cls)}>
      <conf.Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div><p className="font-semibold">{title}</p>{body && <p className="mt-0.5 text-[13px] opacity-90">{body}</p>}</div>
    </div>
  );
}
