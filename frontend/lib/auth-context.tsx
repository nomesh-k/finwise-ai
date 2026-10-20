'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api';

export interface User {
  id: number;
  email: string;
  display_name: string;
  currency: string;
  role: string;
  is_active: boolean;
  is_onboarded: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  register: (email: string, pass: string, name: string, currency?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function refreshUser() {
    try {
      const currentToken = getToken();
      if (!currentToken) {
        setUser(null);
        setTokenState(null);
        setIsLoading(false);
        return;
      }
      setTokenState(currentToken);
      const userData = await api.auth.me();
      setUser(userData);
    } catch {
      setUser(null);
      setToken(null);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function login(email: string, pass: string) {
    const res = await api.auth.login({ email, password: pass });
    setToken(res.access_token);
    setTokenState(res.access_token);
    setUser(res.user);
  }

  async function loginAsDemo() {
    await login('demo@finwise.ai', 'Demo1234!');
  }

  async function register(email: string, pass: string, name: string, currency?: string) {
    const res = await api.auth.register({
      email,
      password: pass,
      display_name: name,
      currency: currency || 'INR',
    });
    setToken(res.access_token);
    setTokenState(res.access_token);
    setUser(res.user);
  }

  async function logout() {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    } finally {
      setToken(null);
      setTokenState(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginAsDemo,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
