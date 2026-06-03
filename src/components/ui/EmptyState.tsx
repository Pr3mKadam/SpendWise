import React from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';

interface EmptyStateProps {
  // New flexible props:
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: { label: string; icon?: React.ReactNode; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  // Legacy props (keep for backward compat):
  onAction?: () => void;
  message?: string;
  subMessage?: string;
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  action,
  secondaryAction,
  onAction,
  message,
  subMessage, // legacy
}: EmptyStateProps) {
  // Resolve props — new takes priority over legacy:
  const resolvedIcon = icon ?? <ArrowUpRight size={32} />;
  const resolvedTitle = title ?? message ?? "Let's record your first transaction";
  const resolvedAction =
    action ?? (onAction ? { label: 'Add Transaction', onClick: onAction } : undefined);
  const resolvedSub = subtitle ?? subMessage;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[var(--surface-card)] rounded-[var(--radius-card)] border border-[var(--border)] shadow-sm my-4">
      <div className="w-16 h-16 rounded-2xl bg-[var(--teal)]/10 flex items-center justify-center text-[var(--teal)] mb-4">
        {resolvedIcon}
      </div>
      <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{resolvedTitle}</h3>
      {resolvedAction && (
        <button
          onClick={resolvedAction.onClick}
          className="mt-4 px-6 py-2.5 bg-[var(--teal)]/10 text-[var(--teal)] font-bold rounded-full flex items-center gap-2 hover:bg-[var(--teal)]/20 active:scale-95 transition-all"
        >
          {resolvedAction.icon ?? <Plus size={18} />}
          {resolvedAction.label}
        </button>
      )}
      {resolvedSub && (
        <p className="text-sm font-medium text-[var(--text-muted)] mt-3">{resolvedSub}</p>
      )}
      {secondaryAction && (
        <button
          onClick={secondaryAction.onClick}
          className="text-[var(--teal)] text-sm font-medium mt-2"
        >
          {secondaryAction.label}
        </button>
      )}
    </div>
  );
}
