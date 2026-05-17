import React from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAction?: () => void;
  message?: string;
  subMessage?: string;
}

export default function EmptyState({ 
  onAction,
  message = "Let's record your first transaction",
  subMessage = "or scan a receipt"
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[var(--surface-card)] rounded-[var(--radius-card)] border border-[var(--border)] shadow-sm my-4">
      <div className="w-16 h-16 rounded-full bg-[var(--teal)]/10 flex items-center justify-center text-[var(--teal)] mb-4">
        <ArrowUpRight size={32} />
      </div>
      <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{message}</h3>
      {onAction && (
        <button 
          onClick={onAction}
          className="mt-4 px-6 py-2.5 bg-[var(--teal)]/10 text-[var(--teal)] font-bold rounded-full flex items-center gap-2 hover:bg-[var(--teal)]/20 active:scale-95 transition-all"
        >
          <Plus size={18} /> Add Transaction
        </button>
      )}
      <p className="text-sm font-medium text-[var(--text-muted)] mt-3">{subMessage}</p>
    </div>
  );
}
