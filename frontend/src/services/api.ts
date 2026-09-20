// ─── Service foundation ──────────────────────────────────────────────────────
// All UI code talks to services, never to fetch() directly. Today services
// return mock data with simulated latency; when the Django backend is ready,
// flip VITE_USE_MOCK=false and each service will use `request()` instead.

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

const LATENCY = 260;

export const delay = (ms = LATENCY) => new Promise((r) => setTimeout(r, ms));

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return (await res.json()) as T;
}

export const mock = async <T>(data: T, ms = LATENCY): Promise<T> => {
  await delay(ms);
  return structuredClone(data);
};
