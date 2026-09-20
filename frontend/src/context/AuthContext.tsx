import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authService, type SessionUser } from '../services/adminService';
import { USE_MOCK } from '../services/api';

interface AuthUser {
  name: string;
  email: string;
  role: string;
  organization?: { id: number; name: string; slug: string } | null;
  permissions?: string[];
}

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, organization?: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (USE_MOCK) {
          const raw = localStorage.getItem('sc_user');
          if (raw && localStorage.getItem('sc_token')) setUser(JSON.parse(raw));
        } else {
          const restored: SessionUser | null = await authService.restore();
          if (restored) {
            setUser(restored);
            localStorage.setItem('sc_user', JSON.stringify(restored));
          } else {
            localStorage.removeItem('sc_token');
            localStorage.removeItem('sc_refresh');
            localStorage.removeItem('sc_user');
          }
        }
      } catch { /* stay logged out */ }
      setLoading(false);
    })();
  }, []);

  // Global 401 (refresh failed/expired) → force logout to login screen.
  useEffect(() => {
    if (USE_MOCK) return;
    const onUnauthorized = () => {
      localStorage.removeItem('sc_token');
      localStorage.removeItem('sc_refresh');
      localStorage.removeItem('sc_user');
      setUser(null);
    };
    window.addEventListener('sc:unauthorized', onUnauthorized);
    return () => window.removeEventListener('sc:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password);
    if (USE_MOCK) localStorage.setItem('sc_token', res.token);
    localStorage.setItem('sc_user', JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, organization?: string) => {
    const res = await authService.register(name, email, password, organization);
    if (USE_MOCK) localStorage.setItem('sc_token', res.token);
    localStorage.setItem('sc_user', JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    authService.logout().finally(() => setUser(null));
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
