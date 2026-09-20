import type { ReactNode } from 'react';
import { EmptyState } from './Feedback';

export interface Column<T> { key: string; label: string; render?: (row: T) => ReactNode; width?: string; }

export function DataTable<T extends object>({ columns, rows, rowKey, onRowClick, emptyTitle = 'No results', emptyBody }: {
  columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string; onRowClick?: (row: T) => void; emptyTitle?: string; emptyBody?: string;
}) {
  if (rows.length === 0) return <EmptyState title={emptyTitle} body={emptyBody} />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40">
            {columns.map((c) => <th key={c.key} className="th" style={c.width ? { width: c.width } : undefined}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-slate-100 last:border-0 dark:border-slate-800 ${onRowClick ? 'cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-slate-800/60' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'}`}
            >
              {columns.map((c) => (
                <td key={c.key} className="td">{c.render ? c.render(row) : ((row as Record<string, unknown>)[c.key] as ReactNode)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
