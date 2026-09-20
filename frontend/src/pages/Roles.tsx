import { useEffect, useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { userService } from '../services/adminService';
import type { Role } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Feedback';

export function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.roles().then((r) => { setRoles(r); setLoading(false); });
  }, []);

  return (
    <div>
      <PageHeader title="Roles" subtitle="Permission bundles enforced across UI, API and RAG retrieval" crumbs={[{ label: 'Management' }, { label: 'Roles' }]} />
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-64" />)}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"><ShieldCheck className="h-5 w-5" /></span>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{r.name}</h3>
                  <p className="text-xs text-slate-400">{r.users} users</p>
                </div>
                <Badge tone="slate" className="ml-auto">{r.permissions.length} perms</Badge>
              </div>
              <p className="mt-2.5 text-[13px] text-slate-500">{r.description}</p>
              <div className="mt-3 space-y-1.5">
                {r.permissions.map((p) => (
                  <div key={p} className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /><span className="font-mono">{p}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          <Card className="flex flex-col items-start justify-center p-5">
            <CardHeader title="How RBAC flows" />
            <p className="p-5 pt-2 text-[13px] leading-relaxed text-slate-500">
              Role → department scope → knowledge-base visibility → chunk-level permission filter. The RAG layer drops denied chunks <b>before</b> the LLM ever sees them, and every access is audit-logged.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
