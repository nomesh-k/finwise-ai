'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
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
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-[#DDF8E8] text-[#16A36A] mx-auto flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="font-extrabold text-base text-[#10251D]">Recovery email sent</h2>
              <p className="text-xs text-[#64748B] leading-relaxed">
                If an account exists for <strong>{email}</strong>, a secure password reset link has been dispatched.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#16A36A] font-bold hover:underline"
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
                className="w-full bg-[#16A36A] hover:bg-[#128A58] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Send Recovery Link <ArrowRight size={14} />
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
