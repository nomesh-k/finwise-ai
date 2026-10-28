'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import AuthShell from '@/components/auth/AuthShell';
import OtpInput from '@/components/auth/OtpInput';
import { useCooldown } from '@/components/auth/useCooldown';
import { ErrorAlert, SuccessAlert } from '@/components/auth/Alert';

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { verifyEmail } = useAuth();
  const email = (params.get('email') || '').trim();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(params.get('sent') ? 'We emailed you a 6-digit code.' : '');
  const [loading, setLoading] = useState(false);
  const cooldown = useCooldown(params.get('sent') ? 60 : 0);

  async function submit(value: string) {
    if (loading || value.length !== 6) return;
    setError('');
    setNotice('');
    setLoading(true);
    try {
      await verifyEmail(email, value);
      router.push('/onboarding');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  }

  // Submit automatically once all six digits are in.
  useEffect(() => {
    if (code.length === 6) submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function resend() {
    setError('');
    try {
      await api.auth.resendCode({ email, purpose: 'signup' });
      setNotice('If that email is waiting for verification, a new code is on its way.');
      cooldown.start(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not resend the code.');
    }
  }

  if (!email) {
    return (
      <div className="text-center space-y-3 py-2">
        <p className="text-sm text-[#64748B]">We need your email address to verify it.</p>
        <Link href="/register" className="inline-block text-sm text-[#16A36A] font-bold hover:underline">
          Go to sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-[#DDF8E8] text-[#16A36A] flex items-center justify-center shrink-0">
          <MailCheck size={22} />
        </div>
        <p className="text-sm text-[#475569] leading-snug">
          Enter the 6-digit code sent to <strong className="text-[#10251D] break-all">{email}</strong>.
        </p>
      </div>

      {notice && <SuccessAlert>{notice}</SuccessAlert>}
      {error && <ErrorAlert>{error}</ErrorAlert>}

      <OtpInput value={code} onChange={setCode} disabled={loading} />

      <button
        type="button"
        onClick={() => submit(code)}
        disabled={loading || code.length !== 6}
        className="w-full bg-[#16A36A] hover:bg-[#128A58] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Verifying...
          </>
        ) : (
          'Verify email'
        )}
      </button>

      <div className="text-center text-xs text-[#64748B] space-y-2">
        <p>
          Didn&apos;t get it? Check spam, or{' '}
          <button
            type="button"
            onClick={resend}
            disabled={cooldown.left > 0}
            className="text-[#16A36A] font-bold hover:underline disabled:text-[#94A3B8] disabled:no-underline"
          >
            {cooldown.left > 0 ? `resend in ${cooldown.left}s` : 'resend the code'}
          </button>
        </p>
        <p>The code expires in 10 minutes.</p>
        <Link href="/register" className="inline-flex items-center gap-1 hover:text-[#10251D]">
          <ArrowLeft size={12} /> Use a different email
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Check your email" subtitle="One last step to protect your account.">
      <Suspense fallback={<div className="text-center py-6 text-xs text-gray-400">Loading...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </AuthShell>
  );
}
