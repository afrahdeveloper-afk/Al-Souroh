import * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getCurrentUser, login as loginRequest, logout as logoutRequest } from '../services/auth';
import type { CurrentUser } from '../types';

/**
 * Session state for the whole `/dashboard` tree, backed by the real
 * `/api/auth/*` endpoints (session-cookie auth — see `services/client.ts`
 * for why every call is routed through the same-site `/api` proxy). Mounted
 * once in `DashboardLayout` so it survives navigation between CMS screens;
 * `RequireAuth` reads it to gate every route except `/dashboard/login`.
 */
type AuthContextValue = {
  user: CurrentUser | null;
  /** True only while the initial session check (on mount) is in flight. */
  isLoading: boolean;
  login: (username: string, password: string) => Promise<CurrentUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((current) => {
      if (!cancelled) {
        setUser(current);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const nextUser = await loginRequest(username, password);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
