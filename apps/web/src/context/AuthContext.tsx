/**
 * AuthContext — single source of truth for authentication state.
 *
 * Responsibilities:
 *  - Stores the current user + accessToken in React state.
 *  - Persists / reads accessToken from localStorage.
 *  - On mount: silently calls GET /auth/me to rehydrate the user.
 *  - Exposes login(), logout(), setAccessToken() helpers.
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '@/api/auth.api';

// ── Types ───────────────────────────────────────────────────────────────

interface AuthUser {
  _id: string;
  email: string;
  name: string;
  role: string;
  provider?: string;
  isEmailVerified?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean; // true while the initial rehydration is in progress
  /** Call after a successful login / verify-email / google-auth */
  login: (user: AuthUser, accessToken: string) => void;
  /** Clear all auth state and call the logout endpoint */
  logout: () => Promise<void>;
  /** Update just the access token (used after silent refresh) */
  setAccessToken: (token: string) => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  login: () => {},
  logout: async () => {},
  setAccessToken: () => {},
});

// ── Provider ────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(
    () => localStorage.getItem('accessToken')
  );
  const [isLoading, setIsLoading] = useState(true);

  // Persist token to localStorage whenever it changes
  const setAccessToken = useCallback((token: string) => {
    localStorage.setItem('accessToken', token);
    setAccessTokenState(token);
  }, []);

  // Login: persist token + set user
  const login = useCallback(
    (userData: AuthUser, token: string) => {
      setUser(userData);
      setAccessToken(token);
    },
    [setAccessToken]
  );

  // Logout: clear everything + call backend
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort — server may be unreachable
    }
    setUser(null);
    setAccessTokenState(null);
    localStorage.removeItem('accessToken');
  }, []);

  // On mount: try to rehydrate the user from the stored token
  useEffect(() => {
    async function rehydrate() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await authApi.getMe();
        if (res.success && res.data) {
          setUser(res.data as AuthUser);
        } else {
          // Token is invalid — clean up
          localStorage.removeItem('accessToken');
          setAccessTokenState(null);
        }
      } catch {
        localStorage.removeItem('accessToken');
        setAccessTokenState(null);
      } finally {
        setIsLoading(false);
      }
    }
    rehydrate();
  }, []);

  const value: AuthContextValue = {
    user,
    accessToken,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    logout,
    setAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

