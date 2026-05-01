import React from 'react';

export function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      <span className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
        {label}
      </span>
      {children}
    </div>
  );
}

export function Inp(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-[var(--bg)] border-[1.5px] border-[var(--card-border)] rounded-[10px] py-2.5 px-3 text-[var(--text)] text-sm outline-none focus:border-[var(--accent)] transition-colors ${props.className || ''}`}
    />
  );
}
