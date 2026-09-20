import { useEffect, useState } from 'react';
import { Building2, Users } from 'lucide-react';
import { userService } from '../services/adminService';
import type { Department } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Feedback';
import { Avatar } from '../components/ui/Avatar';
import { useToast } from '../context/ToastContext';

export function Departments() {
  const { toast } = useToast();
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.departments().then((d) => { setItems(d); setLoading(false); });
  }, []);

  return (
    <div>
      <PageHeader
        title="Departments" subtitle="Teams, heads and their knowledge footprint"
        crumbs={[{ label: 'Management' }, { label: 'Departments' }]}
        actions={<Button variant="secondary" icon={<Building2 className="h-4 w-4" />} onClick={() => toast({ kind: 'info', title: 'Demo mode', body: 'Department management ships with the backend in Phase 1.' })}>New Department</Button>}
      />
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-44" />)}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((d) => (
            <Card key={d.id} className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"><Building2 className="h-5 w-5" /></span>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{d.name}</h3>
                  <p className="text-xs text-slate-400">{d.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2.5">
                <Avatar name={d.head} size="sm" />
                <div className="text-xs"><p className="font-semibold text-slate-700 dark:text-slate-200">{d.head}</p><p className="text-slate-400">Department head</p></div>
                <div className="ml-auto flex gap-1.5">
                  <Badge tone="slate"><Users className="h-3 w-3" /> {d.members}</Badge>
                  <Badge tone="indigo">{d.knowledgeBases} KB</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
