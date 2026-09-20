import { useEffect, useState } from 'react';
import { CalendarClock, Download, FileText, Play } from 'lucide-react';
import { reportService } from '../services/analyticsService';
import type { ReportItem } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { TableSkeleton } from '../components/ui/Feedback';
import { DataTable } from '../components/ui/DataTable';
import { useToast } from '../context/ToastContext';

export function Reports() {
  const { toast } = useToast();
  const [items, setItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.list().then((r) => { setItems(r); setLoading(false); });
  }, []);

  return (
    <div>
      <PageHeader
        title="Reports" subtitle="Scheduled exports for usage, quality, workflow and compliance"
        crumbs={[{ label: 'Data Analyst' }, { label: 'Reports' }]}
        actions={<Button icon={<Play className="h-4 w-4" />} onClick={() => toast({ kind: 'info', title: 'Demo mode', body: 'Report builder ships with the backend in Phase 1.' })}>New Report</Button>}
      />
      <Card>
        {loading ? <TableSkeleton /> : (
          <DataTable
            columns={[
              { key: 'name', label: 'Report', render: (r) => <span className="flex items-center gap-2.5"><FileText className="h-4 w-4 text-slate-400" /><b>{r.name}</b></span> },
              { key: 'type', label: 'Type', render: (r) => <Badge tone="slate">{r.type}</Badge> },
              { key: 'schedule', label: 'Schedule', render: (r) => <span className="flex items-center gap-1.5 text-[13px]"><CalendarClock className="h-3.5 w-3.5 text-slate-400" />{r.schedule}</span> },
              { key: 'lastRun', label: 'Last run' },
              { key: 'format', label: 'Format', render: (r) => <Badge tone="indigo">{r.format}</Badge> },
              { key: 'owner', label: 'Owner' },
              { key: 'actions', label: '', render: (r) => (
                <button className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline" onClick={() => toast({ kind: 'success', title: 'Download started', body: `${r.name}.${r.format.toLowerCase()}` })}>
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
              ) },
            ]}
            rows={items} rowKey={(r) => r.id}
          />
        )}
      </Card>
    </div>
  );
}
