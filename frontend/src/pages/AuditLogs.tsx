import { useEffect, useMemo, useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import { auditService } from '../services/adminService';
import type { AuditLog } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { TableSkeleton } from '../components/ui/Feedback';
import { DataTable } from '../components/ui/DataTable';
import { FilterBar, Pagination, SearchInput, Select } from '../components/ui/Controls';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 9;

export function AuditLogs() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [action, setAction] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    auditService.list().then((l) => { setLogs(l); setLoading(false); });
  }, []);

  const actions = useMemo(() => ['all', ...new Set(logs.map((l) => l.action))], [logs]);
  const filtered = logs.filter((l) =>
    (action === 'all' || l.action === action) &&
    (status === 'all' || l.status === status) &&
    `${l.user} ${l.resource} ${l.details}`.toLowerCase().includes(q.toLowerCase()),
  );
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Audit Logs" subtitle="Immutable trail of logins, retrieval, decisions and permission changes"
        crumbs={[{ label: 'Management' }, { label: 'Audit Logs' }]}
        actions={<Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={() => toast({ kind: 'success', title: 'Export queued', body: 'audit-logs-2026-09-20.csv will download shortly.' })}>Export CSV</Button>}
      />
      <FilterBar>
        <div className="w-full max-w-sm"><SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search user, resource, details…" /></div>
        <Select value={action} onChange={(v) => { setAction(v); setPage(1); }} ariaLabel="Action" options={actions.map((a) => ({ value: a, label: a === 'all' ? 'All actions' : a.replace(/_/g, ' ') }))} />
        <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} ariaLabel="Status" options={[{ value: 'all', label: 'All statuses' }, ...['SUCCESS', 'DENIED', 'FAILED'].map((s) => ({ value: s, label: s }))]} />
      </FilterBar>
      <Card>
        {loading ? <TableSkeleton /> : (
          <>
            <DataTable
              columns={[
                { key: 'at', label: 'Timestamp', render: (l) => <span className="whitespace-nowrap font-mono text-xs">{l.at}</span> },
                { key: 'user', label: 'User', render: (l) => <b>{l.user}</b> },
                { key: 'action', label: 'Action', render: (l) => <Badge tone="indigo">{l.action}</Badge> },
                { key: 'resource', label: 'Resource', render: (l) => <span className="font-mono text-xs">{l.resource}</span> },
                { key: 'details', label: 'Details', render: (l) => <span className="line-clamp-1 max-w-[340px]">{l.details}</span> },
                { key: 'ip', label: 'IP', render: (l) => <span className="font-mono text-xs text-slate-400">{l.ip}</span> },
                { key: 'status', label: 'Status', render: (l) => <StatusBadge status={l.status} /> },
              ]}
              rows={rows} rowKey={(l) => l.id} emptyTitle="No audit events" emptyBody="Try widening your filters."
            />
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </Card>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400"><ShieldCheck className="h-3.5 w-3.5" /> Production logs are append-only with hash-chained integrity verification.</p>
    </div>
  );
}
