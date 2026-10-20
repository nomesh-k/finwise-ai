'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError('');
    setLoading(true);
    try {
      await loginAsDemo();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminLogin() {
    setError('');
    setLoading(true);
    try {
      await login('admin@finwise.ai', 'Admin1234!');
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 text-inherit no-underline">
            <div className="h-10 w-10 bg-[#10251D] text-[#DDF8E8] rounded-xl flex items-center justify-center font-bold shadow-sm">
              <Activity size={22} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#10251D]">
              finwise<span className="text-[#16A36A]">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#10251D]">Welcome back</h1>
          <p className="text-xs text-[#64748B]">Sign in to your FinWise AI financial workspace</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#D9E2DC] shadow-sm p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] mb-1.5" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2DC] rounded-xl text-xs outline-none focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/10"
                  placeholder="name@example.com"
                />
                <Mail size={16} className="absolute right-3.5 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#64748B]" htmlFor="password">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[11px] text-[#16A36A] hover:underline font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2DC] rounded-xl text-xs outline-none focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/10"
                  placeholder="••••••••"
                />
                <Lock size={16} className="absolute right-3.5 top-3 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#16A36A] hover:bg-[#128A58] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="pt-2 border-t border-gray-100 space-y-2.5">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-[#F0FDF4] hover:bg-[#DDF8E8] text-[#10251D] border border-[#16A36A]/30 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={15} className="text-[#16A36A]" />
              One-Click Demo Account (John Smith)
            </button>

            <button
              type="button"
              onClick={handleAdminLogin}
              disabled={loading}
              className="w-full bg-gray-50 hover:bg-gray-100 text-[#17251D] border border-gray-200 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={14} className="text-[#2563EB]" />
              Admin Portal Demo
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#64748B]">
          Don't have an account yet?{' '}
          <Link href="/register" className="text-[#16A36A] font-bold hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
