import { useState } from 'react';
import { Check, Copy, FileText, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { Citation } from '../types';
import { Badge } from './ui/Badge';

/** Minimal safe renderer: **bold**, line breaks. No raw HTML. */
export function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong> : <span key={j}>{part}</span>,
          )}
          {line === '' && <br />}
        </p>
      ))}
    </>
  );
}

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.85 ? 'bg-emerald-500' : value >= 0.6 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-semibold text-slate-500">{pct}% confidence</span>
    </div>
  );
}

export function CitationCard({ c, index }: { c: Citation; index: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-600 text-[10px] font-bold text-white">{index + 1}</span>
        <FileText className="h-3.5 w-3.5 text-slate-400" />
        <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">{c.document}</p>
      </div>
      <p className="mt-1.5 text-xs italic leading-relaxed text-slate-600 dark:text-slate-300">{c.snippet}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge tone="slate">{c.section}</Badge>
        <Badge tone="slate">Page {c.page}</Badge>
        <Badge tone="emerald">{Math.round(c.confidence * 100)}% match</Badge>
      </div>
    </div>
  );
}

export function MsgActions({ content, feedback, onFeedback }: { content: string; feedback: 'up' | 'down' | null | undefined; onFeedback: (f: 'up' | 'down') => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
  };
  return (
    <div className="mt-2.5 flex items-center gap-1">
      <button onClick={copy} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
      </button>
      <button onClick={() => onFeedback('up')} className={`rounded-md p-1.5 ${feedback === 'up' ? 'text-emerald-500' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Helpful"><ThumbsUp className="h-3.5 w-3.5" /></button>
      <button onClick={() => onFeedback('down')} className={`rounded-md p-1.5 ${feedback === 'down' ? 'text-rose-500' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Not helpful"><ThumbsDown className="h-3.5 w-3.5" /></button>
    </div>
  );
}
