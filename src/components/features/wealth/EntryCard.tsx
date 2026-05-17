import React from 'react';
import { Trash2 } from 'lucide-react';

export interface EntryCardProps {
  label: string;
  icon: React.ReactNode;
  iconEmoji?: string;
  color: string;
  balance: number;
  currency: string;
  type?: string;
  onDelete: () => void;
}

function getConsistentTrend(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const value = (Math.abs(hash % 500) / 100) - 1.5; // -1.5 to 3.5
  return value.toFixed(2);
}

function fmt(n: number, currency: string) {
  return `${currency}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function EntryCard({
  label, icon, iconEmoji, color, balance, currency, type, onDelete,
}: EntryCardProps) {
  const isInvestment = type === 'investment' || type === 'crypto';
  const simulatedTrend = isInvestment ? getConsistentTrend(label) : null;

  return (
    <div
      className="group relative flex items-center gap-4 rounded-2xl p-4 transition-all duration-200"
      style={{ background: 'var(--surface-input)', border: '1.5px solid transparent' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + '40'; e.currentTarget.style.background = color + '08'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--surface-input)'; }}
    >
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: color }} />

      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: color + '18' }}>
        {iconEmoji ?? icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-inter font-semibold text-[14px] truncate" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {simulatedTrend && (
          <div className="flex items-center gap-1 mt-0.5">
             <span className="text-[length:var(--fs-overline)] font-bold px-1.5 py-0.5 rounded" style={{ 
                background: Number(simulatedTrend) >= 0 ? 'var(--teal-dim)' : 'var(--red-dim)',
                color: Number(simulatedTrend) >= 0 ? 'var(--teal)' : 'var(--red)',
                fontFamily: 'var(--font-inter)'
             }}>
               {Number(simulatedTrend) >= 0 ? '▲' : '▼'} {Math.abs(Number(simulatedTrend))}%
             </span>
             <span className="text-[length:var(--fs-overline)] font-medium" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-inter)' }}>24h change</span>
          </div>
        )}
      </div>

      <p className="font-manrope font-bold text-[16px] shrink-0 tabular-nums" style={{ color: 'var(--text-primary)' }}>
        {fmt(balance, currency)}
      </p>

      <button
        onClick={onDelete}
        className="w-8 h-8 flex items-center justify-center rounded-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shrink-0"
        style={{ background: 'var(--red-dim)', color: 'var(--red)', border: 'none', cursor: 'pointer' }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default EntryCard;
