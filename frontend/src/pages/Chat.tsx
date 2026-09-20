import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, Plus, RotateCcw, Send, Sparkles, Trash2 } from 'lucide-react';
import { chatService } from '../services/chatService';
import { agentService } from '../services/agentService';
import { suggestedPrompts } from '../mock/chat';
import type { Agent, ChatMessage, Conversation } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Feedback';
import { CitationCard, ConfidenceBar, MsgActions, RichText } from '../components/chatBits';
import { Avatar } from '../components/ui/Avatar';
import { useToast } from '../context/ToastContext';

export function Chat() {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [convs, setConvs] = useState<{ id: string; title: string; agent: string; updatedAt: string; preview?: string }[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [agentId, setAgentId] = useState(params.get('agent') ?? 'auto');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const [a, c] = await Promise.all([agentService.list(), chatService.list()]);
      setAgents(a);
      setConvs(c);
      const target = params.get('c') ?? c[0]?.id;
      if (target) {
        const full = await chatService.get(target);
        if (full) setActive(full);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [active?.messages.length, sending]);

  const select = async (id: string) => {
    const full = await chatService.get(id);
    if (full) { setActive(full); setParams((p) => { p.set('c', id); return p; }); }
  };

  const create = async () => {
    const conv = await chatService.create('New conversation', agentId === 'auto' ? 'hr' : agentId);
    setConvs((prev) => [conv, ...prev]);
    setActive(conv);
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || sending) return;
    let conv = active;
    if (!conv) {
      conv = await chatService.create(content.slice(0, 42), agentId === 'auto' ? 'hr' : agentId);
      setConvs((prev) => [conv as Conversation, ...prev]);
    }
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content, at: 'now' };
    setActive({ ...conv, messages: [...conv.messages, userMsg] });
    setInput('');
    setSending(true);
    const reply = await chatService.send(conv.id, content);
    const full = await chatService.get(conv.id);
    if (full) setActive(full);
    else setActive((prev) => (prev ? { ...prev, messages: [...prev.messages, reply] } : prev));
    setSending(false);
  };

  const feedback = async (msgId: string, fb: 'up' | 'down') => {
    if (!active) return;
    await chatService.feedback(active.id, msgId, fb);
    setActive({ ...active, messages: active.messages.map((m) => (m.id === msgId ? { ...m, feedback: fb } : m)) });
  };

  const clear = () => {
    if (!active) return;
    setActive({ ...active, messages: [] });
    toast({ kind: 'info', title: 'Conversation cleared', body: 'Message history hidden for this view.' });
  };

  const activeAgent = agents.find((a) => a.id === agentId);

  return (
    <div>
      <PageHeader
        title="AI Chat" subtitle="Enterprise assistant with cited answers and agent routing"
        crumbs={[{ label: 'AI Chat' }]}
        actions={
          <>
            <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="input w-auto cursor-pointer py-2 text-[13px]" aria-label="Select agent">
              <option value="auto">Auto-route (recommended)</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <Button icon={<Plus className="h-4 w-4" />} onClick={create}>New Chat</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="hidden max-h-[calc(100vh-220px)] flex-col overflow-hidden lg:flex">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? <div className="space-y-2 p-2"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
              : convs.map((c) => (
                <button key={c.id} onClick={() => select(c.id)} className={`w-full rounded-lg p-2.5 text-left transition ${active?.id === c.id ? 'bg-indigo-50 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:ring-indigo-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}>
                  <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">{c.title}</p>
                  <p className="mt-0.5 flex items-center justify-between text-[11px] text-slate-400"><span className="truncate">{c.agent}</span><span className="shrink-0">{c.updatedAt}</span></p>
                </button>
              ))}
          </div>
        </Card>

        <Card className="flex min-h-[560px] max-h-[calc(100vh-220px)] flex-col overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white"><Bot className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{active?.title ?? 'New conversation'}</p>
              <p className="text-[11px] text-slate-400">{agentId === 'auto' ? 'Auto-routing across HR · Finance · Support' : `${activeAgent?.name ?? ''} · ${activeAgent?.status ?? ''}`}</p>
            </div>
            <Badge tone="emerald"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online</Badge>
            <button onClick={clear} title="Clear conversation" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><Trash2 className="h-4 w-4" /></button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-4 dark:bg-slate-900/40">
            {!active || active.messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><Sparkles className="h-6 w-6" /></span>
                <p className="mt-3 text-[15px] font-bold text-slate-900 dark:text-white">How can I help today?</p>
                <p className="mt-1 max-w-sm text-[13px] text-slate-500">I route your question to the right specialist and answer with cited evidence.</p>
                <div className="mt-4 grid max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
                  {suggestedPrompts.slice(0, 4).map((p) => (
                    <button key={p} onClick={() => send(p)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{p}</button>
                  ))}
                </div>
              </div>
            ) : active.messages.map((m) => (
              <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : ''}`}>
                {m.role === 'assistant' && <Avatar name={m.agent ?? 'AI'} color="#4f46e5" size="sm" />}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'rounded-br-md bg-indigo-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                  {m.role === 'assistant' && m.agent && (
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-indigo-500">{m.agent}</span>
                      {m.confidence !== undefined && <ConfidenceBar value={m.confidence} />}
                    </div>
                  )}
                  <RichText text={m.content} />
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Sources</p>
                      {m.citations.map((c, i) => <CitationCard key={c.id} c={c} index={i} />)}
                    </div>
                  )}
                  {m.role === 'assistant' && <MsgActions content={m.content} feedback={m.feedback} onFeedback={(f) => feedback(m.id, f)} />}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-2.5">
                <Avatar name="AI" color="#4f46e5" size="sm" />
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                  <RotateCcw className="h-4 w-4 animate-spin text-indigo-500" />
                  <span className="text-[13px] text-slate-500">Routing → retrieving → drafting answer…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-slate-100 p-3 dark:border-slate-800">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about policies, expenses, tickets…" className="input flex-1 py-2.5" />
              <Button type="submit" loading={sending} icon={<Send className="h-4 w-4" />}>Send</Button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">Answers are grounded in permitted knowledge only · Feedback improves retrieval quality</p>
          </form>
        </Card>
      </div>
    </div>
  );
}
