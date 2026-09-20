import { useEffect, useState } from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import { taskService } from '../services/adminService';
import type { TaskItem, TaskStatus } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Feedback';
import { useToast } from '../context/ToastContext';

const cols: { id: TaskStatus; label: string }[] = [
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'IN_REVIEW', label: 'In Review' },
  { id: 'DONE', label: 'Done' },
];

const prio: Record<string, 'slate' | 'sky' | 'amber' | 'rose'> = { LOW: 'slate', MEDIUM: 'sky', HIGH: 'amber', URGENT: 'rose' };

const next: Record<TaskStatus, TaskStatus | null> = { TODO: 'IN_PROGRESS', IN_PROGRESS: 'IN_REVIEW', IN_REVIEW: 'DONE', DONE: null };

export function Tasks() {
  const { toast } = useToast();
  const [items, setItems] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskService.list().then((t) => { setItems(t); setLoading(false); });
  }, []);

  const advance = async (t: TaskItem) => {
    const n = next[t.status];
    if (!n) return;
    await taskService.updateStatus(t.id, n);
    setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: n, progress: n === 'DONE' ? 100 : Math.max(x.progress, 50) } : x)));
    toast({ kind: 'success', title: 'Task updated', body: `${t.id} → ${n.replace(/_/g, ' ')}` });
  };

  return (
    <div>
      <PageHeader
        title="Tasks" subtitle="Operational work items linked to agents, decisions and approvals"
        crumbs={[{ label: 'Workflow' }, { label: 'Tasks' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => toast({ kind: 'info', title: 'Demo mode', body: 'Task creation ships with the backend in Phase 1.' })}>Create Task</Button>}
      />
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-72" />)}</div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cols.map((c) => {
            const list = items.filter((t) => t.status === c.id);
            return (
              <div key={c.id} className="rounded-xl bg-slate-200/50 p-2.5 dark:bg-slate-900">
                <p className="flex items-center justify-between px-1.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {c.label}<span className="rounded-full bg-white px-2 py-0.5 text-[11px] dark:bg-slate-800">{list.length}</span>
                </p>
                <div className="mt-1.5 space-y-2.5">
                  {list.map((t) => (
                    <Card key={t.id} className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <Badge tone={prio[t.priority]}>{t.priority}</Badge>
                        <span className="ml-auto font-mono text-[10px] text-slate-400">{t.id}</span>
                      </div>
                      <p className="mt-2 text-[13px] font-bold text-slate-800 dark:text-slate-100">{t.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{t.description}</p>
                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${t.progress}%` }} />
                      </div>
                      <p className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{t.assignee}</span><span>Due {t.due}</span>
                      </p>
                      {next[t.status] && (
                        <button onClick={() => advance(t)} className="mt-2.5 w-full rounded-lg bg-slate-100 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300">
                          Move to {next[t.status]!.replace(/_/g, ' ')} →
                        </button>
                      )}
                    </Card>
                  ))}
                  {list.length === 0 && (
                    <div className="flex flex-col items-center py-6 text-slate-400"><ClipboardList className="h-6 w-6" /><p className="mt-1 text-xs">Empty</p></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
