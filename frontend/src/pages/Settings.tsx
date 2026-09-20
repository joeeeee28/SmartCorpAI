import { useState } from 'react';
import { Building2, KeyRound, Moon, Save } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Alert } from '../components/ui/Feedback';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export function Settings() {
  const { toast } = useToast();
  const { dark, toggle } = useTheme();
  const [tab, setTab] = useState('general');
  const [org, setOrg] = useState('SmartCorp Inc.');
  const [notifs, setNotifs] = useState({ approvals: true, uploads: true, training: false, system: true });

  const save = () => toast({ kind: 'success', title: 'Settings saved', body: 'Changes apply immediately.' });

  return (
    <div>
      <PageHeader title="Settings" subtitle="Organization preferences, notifications and security" crumbs={[{ label: 'Management' }, { label: 'Settings' }]} />
      <Card>
        <div className="px-2 pt-1">
          <Tabs tabs={[
            { id: 'general', label: 'General' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'security', label: 'Security' },
            { id: 'api', label: 'API & Keys' },
          ]} active={tab} onChange={setTab} />
        </div>

        {tab === 'general' && (
          <div className="max-w-xl space-y-4 p-5">
            <div><label className="label">Organization name</label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className="input pl-9" value={org} onChange={(e) => setOrg(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Timezone</label>
                <select className="input"><option>UTC</option><option>America/New_York</option><option>Europe/Berlin</option><option>Asia/Singapore</option></select>
              </div>
              <div><label className="label">Date format</label>
                <select className="input"><option>MMM d, yyyy</option><option>yyyy-MM-dd</option><option>d MMM yyyy</option></select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <span className="flex items-center gap-2 text-sm font-medium"><Moon className="h-4 w-4 text-slate-400" /> Dark mode</span>
              <button onClick={toggle} className={`relative h-6 w-11 rounded-full transition ${dark ? 'bg-indigo-600' : 'bg-slate-300'}`} aria-label="Toggle dark mode">
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${dark ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            <Button icon={<Save className="h-4 w-4" />} onClick={save}>Save changes</Button>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="max-w-xl space-y-2 p-5">
            {([
              ['approvals', 'Approval requests', 'Notify approvers immediately'],
              ['uploads', 'Document uploads', 'Notify KB owners on new uploads'],
              ['training', 'AI training completed', 'Notify when embeddings refresh'],
              ['system', 'System updates', 'Maintenance and release notices'],
            ] as const).map(([k, label, desc]) => (
              <div key={k} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-slate-400">{desc}</p></div>
                <button onClick={() => setNotifs({ ...notifs, [k]: !notifs[k] })} className={`relative h-6 w-11 rounded-full transition ${notifs[k] ? 'bg-indigo-600' : 'bg-slate-300'}`} aria-label={label}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${notifs[k] ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
            <Button icon={<Save className="h-4 w-4" />} onClick={save}>Save preferences</Button>
          </div>
        )}

        {tab === 'security' && (
          <div className="max-w-xl space-y-4 p-5">
            <Alert kind="info" title="SSO enforced for Admins" body="All Admin-role members must authenticate via SSO with MFA." />
            {['Require MFA for all users', 'Enforce SSO for Support team', 'IP allowlist for API access'].map((label, i) => (
              <label key={label} className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                <input type="checkbox" defaultChecked={i < 2} className="h-4 w-4 rounded accent-indigo-600" /> {label}
              </label>
            ))}
            <div><label className="label">Session timeout (minutes)</label><input type="number" defaultValue={60} className="input max-w-[160px]" /></div>
            <Button icon={<Save className="h-4 w-4" />} onClick={save}>Save security settings</Button>
          </div>
        )}

        {tab === 'api' && (
          <div className="max-w-xl space-y-4 p-5">
            <Alert kind="warning" title="Keep keys secret" body="API keys inherit the creator's role permissions. Never expose them in frontend code — the React app uses short-lived JWTs only." />
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 font-mono text-[13px] dark:border-slate-700">
              <span className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-slate-400" /> sc_live_••••••••4f2a</span>
              <span className="text-xs text-slate-400">Created Sep 1 · Admin scope</span>
            </div>
            <Button variant="secondary" onClick={() => toast({ kind: 'success', title: 'Key rotated', body: 'Old key revoked immediately.' })}>Rotate key</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
