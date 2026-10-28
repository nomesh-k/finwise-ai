'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, User, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import AuthShell from '@/components/auth/AuthShell';
import { PasswordField, PasswordStrength, passwordIsStrong } from '@/components/auth/PasswordField';
import { ErrorAlert } from '@/components/auth/Alert';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strong = passwordIsStrong(password);
  const matches = password.length > 0 && password === confirm;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!strong) {
      setError('Please choose a stronger password that meets every requirement.');
      return;
    }
    if (!matches) {
      setError('The two passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password, name.trim(), currency);
      // A 6-digit code was emailed. The account is only usable once it is confirmed.
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}&sent=1`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="We'll email you a 6-digit code to confirm it's really you."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-[#16A36A] font-bold hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {error && <ErrorAlert>{error}</ErrorAlert>}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#64748B] mb-1.5" htmlFor="name">
            Full name
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-3.5 text-gray-400" aria-hidden />
            <input
              id="name"
              type="text"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-3.5 py-3 bg-white border border-[#D9E2DC] rounded-xl text-sm outline-none focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/15"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#64748B] mb-1.5" htmlFor="email">
            Email address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" aria-hidden />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3.5 py-3 bg-white border border-[#D9E2DC] rounded-xl text-sm outline-none focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/15"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="space-y-3">
          <PasswordField id="password" label="Create password" value={password} onChange={setPassword} autoComplete="new-password" />
          <PasswordStrength password={password} />
        </div>

        <div>
          <PasswordField id="confirm" label="Confirm password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          {confirm.length > 0 && !matches && <p className="text-[11px] text-red-600 mt-1.5">Passwords don&apos;t match yet.</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#64748B] mb-1.5" htmlFor="currency">
            Primary currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3.5 py-3 bg-white border border-[#D9E2DC] rounded-xl text-sm outline-none focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/15"
          >
            <option value="INR">INR (₹) — Indian Rupee</option>
            <option value="USD">USD ($) — US Dollar</option>
            <option value="EUR">EUR (€) — Euro</option>
            <option value="GBP">GBP (£) — British Pound</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !strong || !matches}
          className="w-full bg-[#16A36A] hover:bg-[#128A58] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Sending code...
            </>
          ) : (
            <>
              Create account &amp; send code <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p className="text-[11px] text-[#64748B] flex items-start gap-1.5 pt-1">
        <ShieldCheck size={14} className="text-[#16A36A] shrink-0 mt-px" />
        No bank login or card needed. Your records stay private to your account.
      </p>
    </AuthShell>
  );
}
