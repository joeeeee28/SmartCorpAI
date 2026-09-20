import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Layers, Plus } from 'lucide-react';
import { knowledgeService } from '../services/knowledgeService';
import type { KnowledgeBase } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState, Skeleton } from '../components/ui/Feedback';
import { FilterBar, SearchInput, Select } from '../components/ui/Controls';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

export function KnowledgeHub() {
  const { toast } = useToast();
  const [bases, setBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('all');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', department: 'Human Resources', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    knowledgeService.listBases().then((b) => { setBases(b); setLoading(false); });
  }, []);

  const depts = useMemo(() => ['all', ...new Set(bases.map((b) => b.department))], [bases]);
  const filtered = bases.filter((b) =>
    (dept === 'all' || b.department === dept) &&
    (b.name.toLowerCase().includes(q.toLowerCase()) || b.description.toLowerCase().includes(q.toLowerCase())),
  );

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const nb = await knowledgeService.createBase(form.name, form.department, form.description);
    setBases((prev) => [{ ...nb, status: 'ACTIVE', visibility: 'Department', color: '#4f46e5' }, ...prev]);
    setCreating(false);
    setModal(false);
    setForm({ name: '', department: 'Human Resources', description: '' });
    toast({ kind: 'success', title: 'Knowledge base created', body: `${form.name} is ready for uploads.` });
  };

  return (
    <div>
      <PageHeader
        title="Knowledge Hub" subtitle="Department knowledge bases powering permission-aware RAG"
        crumbs={[{ label: 'Knowledge', to: '/knowledge' }, { label: 'Hub' }]}
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setModal(true)}>New Knowledge Base</Button>}
      />
      <FilterBar>
        <div className="w-full max-w-sm"><SearchInput value={q} onChange={setQ} placeholder="Search knowledge bases…" /></div>
        <Select value={dept} onChange={setDept} ariaLabel="Department" options={depts.map((d) => ({ value: d, label: d === 'all' ? 'All departments' : d }))} />
      </FilterBar>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-52" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon={BookOpen} title="No knowledge bases found" body="Try a different search, or create a new knowledge base." action={<Button onClick={() => setModal(true)}>New Knowledge Base</Button>} /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((kb) => (
            <Link key={kb.id} to={`/knowledge/documents?kb=${kb.id}`} className="card group p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-pop">
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundColor: kb.color }}>
                  <BookOpen className="h-5 w-5" />
                </span>
                <StatusBadge status={kb.status} />
              </div>
              <h3 className="mt-3 text-[15px] font-bold text-slate-900 group-hover:text-indigo-700 dark:text-white">{kb.name}</h3>
              <p className="mt-1 line-clamp-2 min-h-10 text-[13px] text-slate-500">{kb.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <Badge tone="slate">{kb.department}</Badge>
                <Badge tone="indigo">{kb.visibility}</Badge>
              </div>
              <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /><b className="text-slate-800 dark:text-slate-100">{kb.documents}</b> docs</span>
                <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /><b className="text-slate-800 dark:text-slate-100">{kb.chunks.toLocaleString()}</b> chunks</span>
                <span className="ml-auto">{kb.updatedAt}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New knowledge base" subtitle="Isolated per organization with department-level permissions" footer={
        <>
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button loading={creating} onClick={(e) => create(e as unknown as React.FormEvent)}>Create</Button>
        </>
      }>
        <form onSubmit={create} className="space-y-4">
          <div><label className="label">Name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. IT Security" /></div>
          <div><label className="label">Department</label>
            <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              {['Human Resources', 'Finance', 'Support', 'Engineering', 'Legal', 'Sales'].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will this knowledge base contain?" /></div>
        </form>
      </Modal>
    </div>
  );
}
