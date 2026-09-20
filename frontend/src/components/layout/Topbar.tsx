import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronDown, LogOut, Menu, Moon, Search, Settings, Sun, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notifications } from '../../mock/dashboard';
import { Avatar } from '../ui/Avatar';

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [read, setRead] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/rag-search?q=${encodeURIComponent(q.trim())}`);
  };

  const unread = read ? 0 : notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85 sm:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"><Menu className="h-5 w-5" /></button>

      <form onSubmit={submit} className="relative hidden w-full max-w-md sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search knowledge, agents, decisions…"
          className="input pl-9 pr-12"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800">⌘K</kbd>
      </form>

      <div className="ml-auto flex items-center gap-1.5">
        <button onClick={toggle} title="Toggle theme" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button onClick={() => { setShowNotif((s) => !s); setShowUser(false); }} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" title="Notifications">
            <Bell className="h-5 w-5" />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{unread}</span>}
          </button>
          {showNotif && (
            <div className="card absolute right-0 top-11 w-80 overflow-hidden p-0 shadow-pop">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
                <button onClick={() => setRead(true)} className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"><CheckCheck className="h-3.5 w-3.5" /> Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="flex gap-3 border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/50">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!n.read && !read ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                    <div>
                      <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{n.body}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{n.at}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button onClick={() => { setShowUser((s) => !s); setShowNotif(false); }} className="flex items-center gap-2.5 rounded-lg p-1.5 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Avatar name={user?.name ?? 'Admin User'} color="#4f46e5" size="sm" />
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-[13px] font-semibold text-slate-800 dark:text-slate-100">{user?.name ?? 'Admin User'}</span>
              <span className="block text-[11px] text-slate-500">{user?.role === 'Admin' ? 'Owner' : user?.role ?? 'Owner'}</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
          </button>
          {showUser && (
            <div className="card absolute right-0 top-11 w-52 overflow-hidden p-1.5 shadow-pop">
              <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              {[
                { to: '/settings', label: 'Profile settings', Icon: UserIcon },
                { to: '/settings', label: 'Preferences', Icon: Settings },
              ].map((x) => (
                <Link key={x.label} to={x.to} onClick={() => setShowUser(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  <x.Icon className="h-4 w-4" /> {x.label}
                </Link>
              ))}
              <button onClick={logout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
