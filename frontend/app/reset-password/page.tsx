'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(true);
  const [tokenEmail, setTokenEmail] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setVerifying(false);
      setError('No password reset token was provided in the link.');
      return;
    }

    async function verify() {
      try {
        const res = await api.auth.verifyResetToken(token);
        setTokenValid(true);
        if (res.email) setTokenEmail(res.email);
      } catch (err: any) {
        setTokenValid(false);
        setError(err.message || 'This password reset link is invalid or has expired. Please request a new one.');
      } finally {
        setVerifying(false);
      }
    }
    verify();
  }, [token]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword({ token, new_password: password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try requesting a new reset link.');
    } finally {
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <div className="text-center py-12 space-y-3">
        <Loader2 size={28} className="animate-spin text-[#16A36A] mx-auto" />
        <p className="text-xs text-[#64748B]">Verifying your security token...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <h2 className="font-extrabold text-base text-[#10251D]">Invalid or Expired Link</h2>
        <p className="text-xs text-[#64748B] leading-relaxed">{error}</p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center w-full bg-[#16A36A] hover:bg-[#128A58] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          Request a New Recovery Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-12 h-12 rounded-full bg-[#DDF8E8] text-[#16A36A] mx-auto flex items-center justify-center">
          <CheckCircle2 size={24} />
        </div>
        <h2 className="font-extrabold text-base text-[#10251D]">Password Updated!</h2>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Your password has been securely updated. A confirmation notice was dispatched to your email. You can now sign in with your new credentials.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full bg-[#16A36A] hover:bg-[#128A58] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          Sign In to Your Account <ArrowRight size={14} className="ml-1.5" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {tokenEmail && (
        <div className="text-xs text-[#64748B] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          Resetting password for: <strong className="text-[#10251D]">{tokenEmail}</strong>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-[#64748B] mb-1.5" htmlFor="password">
          New Password (min. 8 characters)
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2DC] rounded-xl text-xs outline-none focus:border-[#16A36A]"
            placeholder="••••••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#64748B] mb-1.5" htmlFor="confirmPassword">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2DC] rounded-xl text-xs outline-none focus:border-[#16A36A]"
            placeholder="••••••••••••"
          />
          <Lock size={16} className="absolute right-3.5 top-3 text-gray-400" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#16A36A] hover:bg-[#128A58] disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Updating Password...
          </>
        ) : (
          <>
            Update Password <ArrowRight size={14} />
          </>
        )}
      </button>

      <div className="text-center pt-2">
        <Link href="/login" className="text-xs text-[#64748B] hover:text-[#10251D]">
          Remember your credentials? <strong>Sign in</strong>
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="text-2xl font-extrabold text-[#10251D]">Set a New Password</h1>
          <p className="text-xs text-[#64748B]">Enter your new credentials below</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#D9E2DC] shadow-sm p-8 space-y-6">
          <Suspense fallback={<div className="text-center py-6 text-xs text-gray-400">Loading form...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
