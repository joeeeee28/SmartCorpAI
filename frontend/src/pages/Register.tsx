import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Building2, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';

export function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', org: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name || 'New User', form.email, form.password);
      toast({ kind: 'success', title: 'Workspace created', body: `${form.org || 'Your organization'} is ready.` });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-indigo-600"><Bot className="h-5 w-5 text-white" /></span>
          <p className="text-base font-extrabold text-slate-900 dark:text-white">SMARTCORP AI</p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create your workspace</h1>
        <p className="mt-1 text-sm text-slate-500">Start with a secure, isolated organization.</p>
        <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
          {[
            { k: 'name' as const, label: 'Full name', Icon: User, type: 'text', ph: 'Ada Lovelace' },
            { k: 'email' as const, label: 'Work email', Icon: Mail, type: 'email', ph: 'you@company.com' },
            { k: 'org' as const, label: 'Organization', Icon: Building2, type: 'text', ph: 'Acme Corp' },
            { k: 'password' as const, label: 'Password', Icon: Lock, type: 'password', ph: 'Min. 8 characters' },
          ].map((f) => (
            <div key={f.k}>
              <label className="label">{f.label}</label>
              <div className="relative">
                <f.Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className="input pl-9" required type={f.type} value={form[f.k]} onChange={set(f.k)} placeholder={f.ph} />
              </div>
            </div>
          ))}
          <Button type="submit" loading={loading} size="lg" className="w-full">Create workspace</Button>
          <p className="text-center text-[13px] text-slate-500">Already have an account? <Link to="/login" className="link font-semibold">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}
