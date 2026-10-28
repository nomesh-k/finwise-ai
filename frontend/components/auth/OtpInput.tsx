'use client';

import React, { useRef } from 'react';

/** Six single-digit boxes with auto-advance, backspace, arrow keys and paste support. */
export default function OtpInput({
  value,
  onChange,
  disabled,
  autoFocus = true,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  function focus(i: number) {
    refs.current[Math.max(0, Math.min(5, i))]?.focus();
  }

  function setAt(i: number, d: string) {
    const arr = digits.slice();
    arr[i] = d;
    onChange(arr.join('').slice(0, 6));
  }

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6-digit verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          value={d}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '');
            if (!v) return;
            setAt(i, v[v.length - 1]);
            if (i < 5) focus(i + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              e.preventDefault();
              if (digits[i]) setAt(i, '');
              else if (i > 0) {
                setAt(i - 1, '');
                focus(i - 1);
              }
            } else if (e.key === 'ArrowLeft') focus(i - 1);
            else if (e.key === 'ArrowRight') focus(i + 1);
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
            if (!pasted) return;
            e.preventDefault();
            onChange(pasted);
            focus(Math.min(pasted.length, 5));
          }}
          onFocus={(e) => e.target.select()}
          className="h-14 w-full min-w-0 text-center text-xl font-bold text-[#10251D] bg-white border border-[#D9E2DC] rounded-xl outline-none focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/15 disabled:opacity-60"
        />
      ))}
    </div>
  );
}
