// ─── Service foundation ──────────────────────────────────────────────────────
// UI code talks to services, never to fetch() directly.
//   VITE_USE_MOCK=true (default) → mock data with simulated latency
//   VITE_USE_MOCK=false          → real Django API via request()/requestForm()

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

const LATENCY = 260;

export const delay = (ms = LATENCY) => new Promise((r) => setTimeout(r, ms));

export async function mock<T>(data: T, ms = LATENCY): Promise<T> {
  await delay(ms);
  return structuredClone(data);
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function tryRefresh(): Promise<string | null> {
  const refresh = localStorage.getItem('sc_refresh');
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem('sc_token', data.access);
    if (data.refresh) localStorage.setItem('sc_refresh', data.refresh);
    return data.access as string;
  } catch {
    return null;
  }
}

async function authorizedFetch(path: string, init: RequestInit = {}, retried = false): Promise<Response> {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const isAuthHandshake = path === '/auth/login/' || path === '/auth/refresh/';
  if (res.status === 401 && !retried && !isAuthHandshake) {
    const fresh = await tryRefresh();
    if (fresh) return authorizedFetch(path, init, true);
    window.dispatchEvent(new Event('sc:unauthorized'));
  }
  return res;
}

function errorMessage(status: number, data: unknown): string {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.detail === 'string') return d.detail;
    const first = Object.values(d)[0];
    if (typeof first === 'string') return first;
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
  }
  return `Request failed (${status})`;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authorizedFetch(path, init);
  if (res.status === 204) return null as T;
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, errorMessage(res.status, data), data);
  return data as T;
}

/** POST/PUT with FormData (file uploads). */
export async function requestForm<T>(path: string, form: FormData, method = 'POST'): Promise<T> {
  return request<T>(path, { method, body: form });
}

/** Unwrap DRF pagination ({results} or plain array). */
export function unwrap<T>(page: { results: T[] } | T[]): T[] {
  return Array.isArray(page) ? page : page.results;
}

/** '2026-09-20T06:00:00Z' → 'Sep 20, 2026 · 06:00' */
export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} · ${time}`;
}
