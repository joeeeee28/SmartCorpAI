import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10"><Compass className="h-7 w-7" /></span>
      <h1 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">404</h1>
      <p className="mt-1 text-sm text-slate-500">This page doesn't exist in your workspace.</p>
      <Link to="/dashboard" className="mt-5"><Button>Back to Dashboard</Button></Link>
    </div>
  );
}
