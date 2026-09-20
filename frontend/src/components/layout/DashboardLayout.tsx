import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-[248px]">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1400px] p-4 sm:p-6">
          <Outlet />
        </main>
        <footer className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 pb-5 text-[11px] text-slate-400 sm:px-6">
          <span>© 2026 SmartCorp AI. All rights reserved.</span>
          <span>v2.1.0 · demo data until backend analytics connect</span>
        </footer>
      </div>
    </div>
  );
}
