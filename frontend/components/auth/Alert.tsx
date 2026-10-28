import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function ErrorAlert({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-start gap-2">
      <AlertCircle size={16} className="shrink-0 mt-px" />
      <span>{children}</span>
    </div>
  );
}

export function SuccessAlert({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" className="bg-[#F0FDF4] border border-[#BBE7CF] text-[#166534] text-xs rounded-xl p-3 flex items-start gap-2">
      <CheckCircle2 size={16} className="shrink-0 mt-px" />
      <span>{children}</span>
    </div>
  );
}
