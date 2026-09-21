import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileSearch, ScanSearch, ThumbsDown, ThumbsUp } from 'lucide-react';
import { routeQuery } from '../services/agentService';
import { ragService } from '../services/ragService';
import { USE_MOCK } from '../services/api';
import { citations, ragAnswer } from '../mock/chat';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { Alert, EmptyState, Skeleton } from '../components/ui/Feedback';
import { CitationCard, ConfidenceBar, RichText } from '../components/chatBits';

interface Result {
  answer: string; confidence: number; cites: typeof citations;
  route: { intent: string; agent: string; latencyMs: number; chunks: number; filtered: number };
}

function search(query: string): Result {
  const q = query.toLowerCase();
  const { intent, agentId } = routeQuery(query);
  const agentName = agentId === 'hr' ? 'HR Agent' : agentId === 'finance' ? 'Finance Agent' : 'Support Agent';
  const base = { intent, agent: agentName, latencyMs: 900 + Math.floor(Math.random() * 500), chunks: 120 + Math.floor(Math.random() * 300), filtered: Math.floor(Math.random() * 4) };
  if (/leave|vacation|holiday|annual/.test(q)) return { answer: ragAnswer.answer, confidence: 0.96, cites: [citations[0], citations[1]], route: base };
  if (/expense|per-diem|perdiem|reimburse/.test(q))
    return { answer: 'The international travel per-diem cap is **$280/day** (lodging, meals, local transport). Claims must be filed within 30 days with receipts; totals above **$2,000** route to the approval queue.', confidence: 0.95, cites: [citations[2]], route: base };
  if (/auth-214|sso|login/.test(q))
    return { answer: '**AUTH-214** indicates an expired IdP certificate. Re-sync the SAML metadata under Admin → SSO, then ask the customer to retry in a private window.', confidence: 0.93, cites: [citations[3]], route: base };
  if (/refund|threshold/.test(q))
    return { answer: 'Refunds up to **$5,000** with attached evidence can be auto-approved; higher amounts require human approval in the Approval Center.', confidence: 0.88, cites: [citations[3]], route: base };
  return { answer: "I couldn't find sufficient evidence in the available knowledge base.", confidence: 0.32, cites: [], route: base };
}

export function RagSearch() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? 'What is our leave policy?');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [fb, setFb] = useState<'up' | 'down' | null>(null);

  const run = (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setFb(null);
    setResult(null);
    if (USE_MOCK) setTimeout(() => { setResult(search(q)); setLoading(false); }, 950);
    else ragService.search(q).then((data) => setResult({ answer: data.answer ?? 'No generated answer: the LLM provider is not configured.', confidence: data.confidence ?? 0, cites: data.cites as typeof citations, route: { intent: 'retrieval', agent: 'Permission-aware search', latencyMs: 0, chunks: data.chunks, filtered: 0 } })).catch(() => setResult(null)).finally(() => setLoading(false));
  };

  useEffect(() => {
    const q = params.get('q');
    if (q) { setQuery(q); run(q); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const steps = result ? [
    { label: 'Intent', value: result.route.intent.replace(/_/g, ' ') },
    { label: 'Routed to', value: result.route.agent },
    { label: 'Chunks scanned', value: String(result.route.chunks) },
    { label: 'Permission-filtered', value: String(result.route.filtered) },
    { label: 'Latency', value: `${result.route.latencyMs} ms` },
  ] : [];

  return (
    <div>
      <PageHeader title="RAG Search" subtitle="Permission-aware retrieval over your knowledge bases — every claim cited" crumbs={[{ label: 'Search' }]} />
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); run(query); }} className="flex flex-col gap-2.5 p-4 sm:flex-row">
          <div className="relative flex-1">
            <ScanSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="input py-2.5 pl-9" placeholder='Ask anything, e.g. "What is our leave policy?"' />
          </div>
          <Button type="submit" loading={loading}>Search</Button>
        </form>
        <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
          {['What is our leave policy?', 'Per-diem cap for Berlin?', 'Fix SSO error AUTH-214', 'Refund approval threshold'].map((s) => (
            <button key={s} onClick={() => { setQuery(s); run(s); }} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300">{s}</button>
          ))}
        </div>
      </Card>

      {loading && (
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Skeleton className="h-64 xl:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      )}

      {!loading && !result && (
        <Card className="mt-4"><EmptyState icon={FileSearch} title="Search your enterprise knowledge" body="Ask a question to get a cited answer with source documents, sections and confidence." /></Card>
      )}

      {!loading && result && (
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <Card>
              <CardHeader title="Answer" action={<ConfidenceBar value={result.confidence} />} />
              <div className="p-5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                <RichText text={result.answer} />
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-xs text-slate-400">Was this helpful?</span>
                  <button onClick={() => setFb('up')} className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${fb === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800'}`}><ThumbsUp className="h-3.5 w-3.5" /> Helpful</button>
                  <button onClick={() => setFb('down')} className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${fb === 'down' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800'}`}><ThumbsDown className="h-3.5 w-3.5" /> Not helpful</button>
                </div>
              </div>
            </Card>
            <Card>
              <CardHeader title={`Evidence · ${result.cites.length} source${result.cites.length === 1 ? '' : 's'}`} subtitle="Retrieved chunks that grounded this answer" />
              <div className="space-y-3 p-5">
                {result.cites.length === 0 && <Alert kind="warning" title="No supporting evidence" body="No permitted chunks matched. Citations are never fabricated — try rephrasing or request the missing content." />}
                {result.cites.map((c, i) => <CitationCard key={c.id} c={c} index={i} />)}
              </div>
            </Card>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader title="Retrieval pipeline" subtitle="How this answer was produced" />
              <div className="space-y-0 p-5">
                {steps.map((s, i) => (
                  <div key={s.label} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < steps.length - 1 && <span className="absolute left-[11px] top-6 h-[calc(100%-20px)] w-px bg-indigo-200 dark:bg-indigo-500/30" />}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">{i + 1}</span>
                    <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p><p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{s.value}</p></div>
                  </div>
                ))}
              </div>
            </Card>
            <Alert kind="info" title="Permission-aware" body="Restricted chunks are filtered BEFORE content reaches the LLM. Denied sources never appear here." />
            <Card><div className="p-4"><Badge tone="slate">Demo retrieval — production RAG connects in Phase 1</Badge></div></Card>
          </div>
        </div>
      )}
    </div>
  );
}
