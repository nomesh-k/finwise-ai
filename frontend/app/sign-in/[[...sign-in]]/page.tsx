'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { Suspense } from 'react';

export default function SignInPage() {
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
        </div>

        <div className="flex justify-center">
          <Suspense fallback={<div className="text-xs text-gray-400">Loading sign-in...</div>}>
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-[#16A36A] hover:bg-[#128A58] text-sm font-bold',
                  card: 'rounded-2xl shadow-sm border border-[#D9E2DC]',
                },
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
