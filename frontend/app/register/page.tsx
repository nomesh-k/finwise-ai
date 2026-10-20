'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Lock, Mail, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name, currency);
      // New user goes straight to onboarding wizard
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 text-inherit no-underline">
            <div className="h-10 w-10 bg-[#10251D] text-[#DDF8E8] rounded-xl flex items-center justify-center font-bold shadow-sm">
              <Activity size={22} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#10251D]">
              finwise<span className="text-[#16A36A]">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#10251D]">Create your workspace</h1>
          <p className="text-xs text-[#64748B]">Start making smarter decisions with your money</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#D9E2DC] shadow-sm p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] mb-1.5" htmlFor="name">
                Full or display name
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2DC] rounded-xl text-xs outline-none focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/10"
                  placeholder="e.g. John Smith"
                />
                <User size={16} className="absolute right-3.5 top-3 text-gray-400" />
              </div>
            </div>

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
              <label className="block text-xs font-bold text-[#64748B] mb-1.5" htmlFor="password">
                Create password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2DC] rounded-xl text-xs outline-none focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/10"
                  placeholder="Min. 8 characters"
                />
                <Lock size={16} className="absolute right-3.5 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#64748B] mb-1.5" htmlFor="currency">
                Primary currency
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2DC] rounded-xl text-xs outline-none focus:border-[#16A36A]"
              >
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#16A36A] hover:bg-[#128A58] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Account...' : 'Continue to Onboarding'}
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="pt-2 border-t border-gray-100 text-[11px] text-[#64748B] space-y-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[#16A36A]" />
              <span>No credit card or bank login required.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[#16A36A]" />
              <span>Personal records isolated securely to your account.</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#64748B]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#16A36A] font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
