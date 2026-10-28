'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export const PASSWORD_RULES = [
  { id: 'len', label: 'At least 10 characters', test: (p: string) => p.length >= 10 },
  { id: 'lower', label: 'A lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'upper', label: 'An uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'num', label: 'A number', test: (p: string) => /\d/.test(p) },
  { id: 'sym', label: 'A special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function passwordIsStrong(p: string) {
  return PASSWORD_RULES.every((r) => r.test(p));
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder = '••••••••••',
  rightLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: 'current-password' | 'new-password';
  placeholder?: string;
  rightLabel?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold text-[#64748B]" htmlFor={id}>
          {label}
        </label>
        {rightLabel}
      </div>
      <div className="relative">
        <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" aria-hidden />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          required
          maxLength={72}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-11 py-3 bg-white border border-[#D9E2DC] rounded-xl text-sm outline-none focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/15"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export function PasswordStrength({ password }: { password: string }) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const pct = (passed / PASSWORD_RULES.length) * 100;
  const color = passed <= 2 ? 'bg-red-500' : passed < 5 ? 'bg-amber-500' : 'bg-[#16A36A]';
  const word = passed <= 2 ? 'Weak' : passed < 5 ? 'Almost there' : 'Strong';
  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
          <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[11px] font-semibold text-[#64748B] w-20 text-right">{password ? word : ''}</span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {PASSWORD_RULES.map((r) => {
          const ok = r.test(password);
          return (
            <li key={r.id} className={`text-[11px] flex items-center gap-1.5 ${ok ? 'text-[#16A36A]' : 'text-[#94A3B8]'}`}>
              <span aria-hidden>{ok ? '✓' : '○'}</span>
              {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
