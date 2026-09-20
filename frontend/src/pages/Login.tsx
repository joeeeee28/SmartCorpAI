import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Feedback';

export function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@smartcorp.ai');
  const [password, setPassword] = useState('demo-password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast({ kind: 'success', title: 'Welcome back', body: 'Signed in to SmartCorp AI.' });
      navigate('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="hidden w-[46%] flex-col justify-between bg-navy-950 p-10 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <Bot className="h-6 w-6 text-white" />
          </span>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-white">SMARTCORP AI</p>
            <p className="text-xs text-slate-400">Enterprise Intelligence</p>
          </div>
        </div>
        <div>
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white">One intelligence layer for the whole enterprise.</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">Permission-aware RAG, specialized agents, decision workflows and audit-grade governance — built for regulated teams.</p>
          <div className="mt-6 grid max-w-md grid-cols-3 gap-3">
            {[{ k: '24.9k', l: 'Chunks indexed' }, { k: '96.4%', l: 'Answer success' }, { k: '1.1s', l: 'Median latency' }].map((s) => (
              <div key={s.l} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <p className="text-lg font-bold text-white">{s.k}</p>
                <p className="text-[11px] text-slate-400">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500">© 2026 SmartCorp AI · SOC2-ready demo environment</p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-indigo-600"><Bot className="h-5 w-5 text-white" /></span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white">SMARTCORP AI</p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Access your organization's intelligence workspace.</p>
          <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
            {error && <Alert kind="error" title={error} />}
            <div>
              <label className="label">Work email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className="input pl-9" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className="input pl-9" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
            <Button type="submit" loading={loading} size="lg" className="w-full">Sign in</Button>
            <p className="text-center text-[13px] text-slate-500">New to SmartCorp? <Link to="/register" className="link font-semibold">Create an account</Link></p>
          </form>
          <p className="mt-4 rounded-lg bg-indigo-50 p-3 text-center text-xs text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">Demo mode — any credentials work. Pre-filled with the Admin account.</p>
        </div>
      </div>
    </div>
  );
}
