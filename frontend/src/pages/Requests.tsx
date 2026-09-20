import { useEffect, useState } from 'react';
import { FileCheck, Plus } from 'lucide-react';
import { requestService } from '../services/adminService';
import type { RequestItem, RequestStatus } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState, TableSkeleton } from '../components/ui/Feedback';
import { Tabs } from '../components/ui/Tabs';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

export function Requests() {
  const { toast } = useToast();
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Access', details: '' });

  useEffect(() => {
    requestService.list().then((r) => { setItems(r); setLoading(false); });
  }, []);

  const rows = tab === 'ALL' ? items : items.filter((r) => r.status === tab);

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const req: RequestItem = {
      id: `REQ-${500 + items.length + 1}`, title: form.title, category: form.category,
      requester: 'Admin User', department: 'Engineering', status: 'OPEN' as RequestStatus,
      createdAt: 'Sep 20, 2026', details: form.details,
    };
    setItems((prev) => [req, ...prev]);
    setModal(false);
    setForm({ title: '', category: 'Access', details: '' });
    setTab('ALL');
    toast({ kind: 'success', title: 'Request submitted', body: req.id });
  };

  return (
    <div>
      <PageHeader
        title="Requests" subtitle="Access, content and configuration requests from across the organization"
        crumbs={[{ label: 'Workflow' }, { label: 'Requests' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setModal(true)}>New Request</Button>}
      />
      <Card>
        <div className="px-2 pt-1">
          <Tabs tabs={[
            { id: 'ALL', label: 'All', count: items.length },
            { id: 'OPEN', label: 'Open', count: items.filter((r) => r.status === 'OPEN').length },
            { id: 'IN_PROGRESS', label: 'In Progress', count: items.filter((r) => r.status === 'IN_PROGRESS').length },
            { id: 'FULFILLED', label: 'Fulfilled', count: items.filter((r) => r.status === 'FULFILLED').length },
          ]} active={tab} onChange={setTab} />
        </div>
        {loading ? <TableSkeleton /> : rows.length === 0 ? (
          <EmptyState icon={FileCheck} title="No requests" body="New requests will appear here for triage." />
        ) : (
          <DataTable
            columns={[
              { key: 'id', label: 'ID', render: (r) => <span className="font-mono text-xs">{r.id}</span> },
              { key: 'title', label: 'Request', render: (r) => <span><span className="font-semibold">{r.title}</span><span className="block max-w-[380px] truncate text-[11px] font-normal text-slate-400">{r.details}</span></span> },
              { key: 'category', label: 'Category', render: (r) => <Badge tone="slate">{r.category}</Badge> },
              { key: 'requester', label: 'Requester' },
              { key: 'department', label: 'Department' },
              { key: 'createdAt', label: 'Created' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={rows} rowKey={(r) => r.id}
          />
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="New request" subtitle="Routed to the right owner automatically" footer={
        <>
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={(e) => create(e as unknown as React.FormEvent)}>Submit request</Button>
        </>
      }>
        <form onSubmit={create} className="space-y-4">
          <div><label className="label">Title</label><input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Access to Finance Policies KB" /></div>
          <div><label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {['Access', 'Knowledge Base', 'Configuration', 'Compliance', 'Security', 'Content'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="label">Details</label><textarea required className="input" rows={3} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Describe what you need and why" /></div>
        </form>
      </Modal>
    </div>
  );
}
