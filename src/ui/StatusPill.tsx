import React from 'react';

export function StatusPill({ s }: { s: string }) {
  const styles: Record<string, string> = { 
    active: 'bg-emerald-500/10 text-emerald-500', 
    invited: 'bg-amber-500/10 text-amber-500', 
    left: 'bg-slate-500/10 text-slate-500' 
  };
  
  const colors = styles[s] ?? 'bg-slate-500/10 text-slate-500';
  
  return (
    <span className={`text-[0.66rem] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${colors}`}>
      {s}
    </span>
  );
}
