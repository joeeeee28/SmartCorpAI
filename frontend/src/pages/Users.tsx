import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { userService } from '../services/adminService';
import type { User } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { TableSkeleton } from '../components/ui/Feedback';
import { DataTable } from '../components/ui/DataTable';
import { FilterBar, SearchInput, Select } from '../components/ui/Controls';
import { Modal } from '../components/ui/Modal';
import { Avatar } from '../components/ui/Avatar';
import { useToast } from '../context/ToastContext';

const roleTone: Record<string, 'violet' | 'sky' | 'emerald' | 'amber' | 'slate'> = { Admin: 'violet', HR: 'sky', Finance: 'emerald', Support: 'amber', Employee: 'slate' };

export function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const [invite, setInvite] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Employee', department: 'Support' });

  useEffect(() => {
    userService.list().then((u) => { setUsers(u); setLoading(false); });
  }, []);

  const filtered = useMemo(() => users.filter((u) =>
    (role === 'all' || u.role === role) &&
    (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())),
  ), [users, role, q]);

  const changeRole = async (u: User, next: string) => {
    await userService.updateRole(u.id, next);
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: next as User['role'] } : x)));
    toast({ kind: 'success', title: 'Role updated', body: `${u.name} → ${next}` });
  };

  const sendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers((prev) => [{ id: `u-${Date.now()}`, name: form.name, email: form.email, role: form.role as User['role'], department: form.department, status: 'INVITED', avatarColor: '#4f46e5', lastActive: '—', mfaEnabled: false }, ...prev]);
    setInvite(false);
    setForm({ name: '', email: '', role: 'Employee', department: 'Support' });
    toast({ kind: 'success', title: 'Invite sent', body: form.email });
  };

  return (
    <div>
      <PageHeader
        title="Users & Roles" subtitle="Organization members with role-based permissions"
        crumbs={[{ label: 'Management' }, { label: 'Users & Roles' }]}
        actions={
          <>
            <Link to="/roles"><Button variant="secondary" icon={<ShieldCheck className="h-4 w-4" />}>Manage Roles</Button></Link>
            <Button icon={<UserPlus className="h-4 w-4" />} onClick={() => setInvite(true)}>Invite User</Button>
          </>
        }
      />
      <FilterBar>
        <div className="w-full max-w-sm"><SearchInput value={q} onChange={setQ} placeholder="Search users…" /></div>
        <Select value={role} onChange={setRole} ariaLabel="Role" options={[{ value: 'all', label: 'All roles' }, ...['Admin', 'HR', 'Finance', 'Support', 'Employee'].map((r) => ({ value: r, label: r }))]} />
      </FilterBar>
      <Card>
        {loading ? <TableSkeleton /> : (
          <DataTable
            columns={[
              { key: 'name', label: 'User', render: (u) => <span className="flex items-center gap-2.5"><Avatar name={u.name} color={u.avatarColor} size="sm" /><span><b>{u.name}</b><span className="block text-[11px] font-normal text-slate-400">{u.email}</span></span></span> },
              { key: 'role', label: 'Role', render: (u) => (
                <select value={u.role} onChange={(e) => changeRole(u, e.target.value)} className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800" aria-label={`Role for ${u.name}`}>
                  {['Admin', 'HR', 'Finance', 'Support', 'Employee'].map((r) => <option key={r}>{r}</option>)}
                </select>
              ) },
              { key: 'department', label: 'Department' },
              { key: 'status', label: 'Status', render: (u) => <StatusBadge status={u.status} /> },
              { key: 'mfa', label: 'MFA', render: (u) => <Badge tone={u.mfaEnabled ? 'emerald' : 'slate'}>{u.mfaEnabled ? 'On' : 'Off'}</Badge> },
              { key: 'lastActive', label: 'Last active' },
            ]}
            rows={filtered} rowKey={(u) => u.id} emptyTitle="No users found" emptyBody="Try a different search or invite a new member."
          />
        )}
      </Card>

      <Modal open={invite} onClose={() => setInvite(false)} title="Invite user" subtitle="They receive an email to join this organization" footer={
        <>
          <Button variant="ghost" onClick={() => setInvite(false)}>Cancel</Button>
          <Button onClick={(e) => sendInvite(e as unknown as React.FormEvent)}>Send invite</Button>
        </>
      }>
        <form onSubmit={sendInvite} className="space-y-4">
          <div><label className="label">Full name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ada Lovelace" /></div>
          <div><label className="label">Work email</label><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ada@company.com" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Role</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {Object.keys(roleTone).map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div><label className="label">Department</label>
              <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                {['Human Resources', 'Finance', 'Support', 'Engineering', 'Legal', 'Sales'].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
