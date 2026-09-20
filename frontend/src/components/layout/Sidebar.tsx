import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3, BookOpen, Bot, ClipboardCheck, ClipboardList, FileCheck, FileText, Files, FlaskConical,
  Inbox, LayoutDashboard, MessagesSquare, ScanSearch, Settings, ShieldCheck, Building2, Users, X, Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

interface Item { to: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; }
interface Section { title?: string; items: Item[]; }

const sections: Section[] = [
  {
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/chat', label: 'AI Chat', icon: MessagesSquare },
      { to: '/rag-search', label: 'RAG Search', icon: ScanSearch },
      { to: '/decisions', label: 'Decision Center', icon: Zap, badge: '4' },
    ],
  },
  {
    title: 'Knowledge',
    items: [
      { to: '/knowledge', label: 'Knowledge Hub', icon: BookOpen },
      { to: '/knowledge/documents', label: 'Documents', icon: Files },
    ],
  },
  {
    title: 'AI Agents',
    items: [
      { to: '/agents', label: 'All Agents', icon: Bot },
      { to: '/agents/hr', label: 'HR Agent', icon: Users },
      { to: '/agents/finance', label: 'Finance Agent', icon: BarChart3 },
      { to: '/agents/support', label: 'Support Agent', icon: Inbox },
    ],
  },
  {
    title: 'Data Analyst',
    items: [
      { to: '/ask-data', label: 'Ask Data', icon: ScanSearch },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/reports', label: 'Reports', icon: FileText },
      { to: '/evaluation', label: 'Evaluation', icon: FlaskConical },
    ],
  },
  {
    title: 'Workflow',
    items: [
      { to: '/approvals', label: 'Approvals', icon: ClipboardCheck, badge: '5' },
      { to: '/tasks', label: 'Tasks', icon: ClipboardList },
      { to: '/requests', label: 'Requests', icon: FileCheck },
    ],
  },
  {
    title: 'Management',
    items: [
      { to: '/users', label: 'Users & Roles', icon: Users },
      { to: '/departments', label: 'Departments', icon: Building2 },
      { to: '/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

function NavItem({ item, onNavigate }: { item: Item; onNavigate?: () => void }) {
  const loc = useLocation();
  const active = item.to === '/agents'
    ? loc.pathname === '/agents'
    : loc.pathname === item.to || (item.to !== '/dashboard' && loc.pathname.startsWith(item.to + '/') && !item.to.startsWith('/agents/'));
  const isAgentChild = item.to.startsWith('/agents/') && loc.pathname === item.to;
  const isOn = active || isAgentChild;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={clsx(
        'group flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition',
        isOn ? 'bg-white/10 text-white' : 'text-slate-300/80 hover:bg-white/5 hover:text-white',
      )}
    >
      <item.icon className={clsx('h-[17px] w-[17px] shrink-0', isOn ? 'text-indigo-300' : 'text-slate-400 group-hover:text-slate-200')} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && <span className="rounded-full bg-indigo-500/80 px-1.5 py-0.5 text-[10px] font-bold text-white">{item.badge}</span>}
      {isOn && <span className="absolute left-0 h-5 w-[3px] rounded-r bg-indigo-400" />}
    </NavLink>
  );
}

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden" onClick={onClose} />}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col bg-navy-950 transition-transform duration-200 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-2.5 px-5 pb-5 pt-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-indigo-600 shadow-lg shadow-indigo-950">
            <svg viewBox="0 0 32 32" className="h-5 w-5"><path d="M16 6l8.5 5v10L16 26l-8.5-5V11L16 6z" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" /><circle cx="16" cy="16" r="3.2" fill="#fff" /></svg>
          </span>
          <div className="min-w-0">
            <Link to="/dashboard" onClick={onClose} className="block truncate text-[15px] font-extrabold tracking-tight text-white">SMARTCORP AI</Link>
            <p className="text-[11px] font-medium text-slate-400">Enterprise Intelligence</p>
          </div>
          <button onClick={onClose} className="ml-auto rounded-md p-1 text-slate-400 hover:bg-white/10 lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="relative flex-1 space-y-4 overflow-y-auto px-3 pb-4">
          {sections.map((s, i) => (
            <div key={i}>
              {s.title && <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{s.title}</p>}
              <div className="relative space-y-0.5">
                {s.items.map((item) => <NavItem key={item.to} item={item} onNavigate={onClose} />)}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10">
            <p className="text-xs font-semibold text-white">RAG index healthy</p>
            <p className="mt-0.5 text-[11px] text-slate-400">24,927 chunks · synced 12 min ago</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[92%] rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
