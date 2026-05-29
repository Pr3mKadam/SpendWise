import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export function Err({ msg, className = '' }: { msg?: string; className?: string }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm mb-3.5 leading-snug ${className}`}>
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

export function Ok({ msg, className = '' }: { msg?: string; className?: string }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm mb-3.5 ${className}`}>
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}
