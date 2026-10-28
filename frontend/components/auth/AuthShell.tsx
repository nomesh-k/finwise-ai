import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, Lock, MailCheck, LineChart } from 'lucide-react';

const POINTS = [
  { icon: LineChart, title: 'See your whole financial picture', text: 'Budgets, goals, bills and forecasts in one place.' },
  { icon: MailCheck, title: 'Every account is email-verified', text: 'One-time codes confirm it is really you.' },
  { icon: Lock, title: 'Built to resist attacks', text: 'Strong password rules, lockouts and rate limits protect your data.' },
];

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F7F5] grid lg:grid-cols-[1.05fr_1fr] font-sans">
      {/* Brand panel */}
      <aside className="hidden lg:flex flex-col justify-between bg-[#10251D] text-white p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#16A36A]/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-[#16A36A]/10 blur-3xl" aria-hidden />
        <Link href="/" className="relative inline-flex items-center gap-2.5 text-inherit no-underline">
          <div className="h-10 w-10 bg-[#DDF8E8] text-[#10251D] rounded-xl flex items-center justify-center shadow-sm">
            <Activity size={22} />
          </div>
          <span className="font-extrabold text-2xl tracking-tight">
            finwise<span className="text-[#34D399]">AI</span>
          </span>
        </Link>

        <div className="relative space-y-8 max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Financial clarity,
            <br />
            <span className="text-[#34D399]">protected by design.</span>
          </h2>
          <ul className="space-y-5">
            {POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-[#34D399]">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold">{title}</p>
                  <p className="text-xs text-white/60 leading-relaxed">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[11px] text-white/40 flex items-center gap-1.5">
          <ShieldCheck size={13} /> Your data stays private to your account.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col justify-center items-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md space-y-6">
          <Link href="/" className="lg:hidden inline-flex items-center gap-2.5 text-inherit no-underline">
            <div className="h-9 w-9 bg-[#10251D] text-[#DDF8E8] rounded-xl flex items-center justify-center shadow-sm">
              <Activity size={20} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#10251D]">
              finwise<span className="text-[#16A36A]">AI</span>
            </span>
          </Link>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10251D] tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-[#64748B]">{subtitle}</p>}
          </div>

          <div className="bg-white rounded-2xl border border-[#D9E2DC] shadow-sm p-6 sm:p-8 space-y-5">{children}</div>

          {footer && <div className="text-center text-xs text-[#64748B]">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
