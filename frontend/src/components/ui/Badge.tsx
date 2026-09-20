import { clsx } from 'clsx';

const tones: Record<string, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30',
};

export function Badge({ children, tone = 'slate', className }: { children: React.ReactNode; tone?: keyof typeof tones; className?: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', tones[tone], className)}>
      {children}
    </span>
  );
}

const statusTone: Record<string, keyof typeof tones> = {
  READY: 'emerald', ACTIVE: 'emerald', SUCCESS: 'emerald', APPROVED: 'emerald', OPERATIONAL: 'emerald',
  INDEXED: 'emerald', DONE: 'emerald', FULFILLED: 'emerald', PASS: 'emerald',
  PROCESSING: 'amber', PENDING: 'amber', UPLOADING: 'amber', SYNCING: 'amber', IN_PROGRESS: 'amber',
  IN_REVIEW: 'amber', PENDING_APPROVAL: 'amber', ANALYZING: 'amber', OPEN: 'amber', RUNNING: 'sky',
  INDEXING: 'amber', TODO: 'slate', QUEUED: 'slate', INVITED: 'sky', DRAFT: 'slate', PAUSED: 'slate',
  FAILED: 'rose', REJECTED: 'rose', DENIED: 'rose', CANCELLED: 'slate', SUSPENDED: 'rose', FAIL: 'rose',
  EXECUTED: 'indigo', DETECTED: 'violet', NEEDS_REVIEW: 'amber',
  LOW: 'emerald', MEDIUM: 'amber', HIGH: 'rose', CRITICAL: 'rose', URGENT: 'rose',
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone[status] ?? 'slate'}>{status.replace(/_/g, ' ')}</Badge>;
}
