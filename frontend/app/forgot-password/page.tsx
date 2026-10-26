'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugToken, setDebugToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword({ email: email.trim() });
      if (res.debug_token) {
        setDebugToken(res.debug_token);
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset. Please try again.');
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
          <h1 className="text-2xl font-extrabold text-[#10251D]">Reset your password</h1>
          <p className="text-xs text-[#64748B]">Enter your email to receive recovery instructions</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#D9E2DC] shadow-sm p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-[#DDF8E8] text-[#16A36A] mx-auto flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="font-extrabold text-base text-[#10251D]">Recovery email sent</h2>
              <p className="text-xs text-[#64748B] leading-relaxed">
                A secure password reset link has been dispatched to <strong>{email}</strong>. Check your inbox and spam folder.
              </p>
              {debugToken && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-1">
                  <span className="font-bold text-[#10251D] block">Direct Reset Link:</span>
                  <Link
                    href={`/reset-password?token=${debugToken}`}
                    className="text-[#16A36A] font-semibold break-all underline hover:text-[#128A58]"
                  >
                    Click here to set a new password directly
                  </Link>
                </div>
              )}
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#16A36A] font-bold hover:underline pt-2"
              >
                <ArrowLeft size={14} /> Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1.5" htmlFor="email">
                  Account email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2DC] rounded-xl text-xs outline-none focus:border-[#16A36A]"
                    placeholder="name@example.com"
                  />
                  <Mail size={16} className="absolute right-3.5 top-3 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#16A36A] hover:bg-[#128A58] disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Sending email...
                  </>
                ) : (
                  <>
                    Send Recovery Link <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs text-[#64748B] hover:text-[#10251D]">
                  Remember your password? <strong>Sign in</strong>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
