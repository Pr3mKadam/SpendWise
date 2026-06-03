import React from 'react';

export function Sel({
  children,
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-[var(--bg)] border-[1.5px] border-[var(--card-border)] rounded-[10px] py-2.5 px-3 text-[var(--text)] text-sm outline-none cursor-pointer focus:border-[var(--teal)] transition-colors ${className}`}
    >
      {children}
    </select>
  );
}
