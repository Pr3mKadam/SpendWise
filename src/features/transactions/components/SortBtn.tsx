import { ChevronUp, ChevronDown } from 'lucide-react';
import { haptic } from '@/core/haptic';
import type { SortKey, SortDir } from '@/features/transactions/components/historyTypes';

interface SortBtnProps {
  label: string;
  field: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}

export function SortBtn({ label, field, sortKey, sortDir, onSort }: SortBtnProps) {
  const active = sortKey === field;
  return (
    <button
      onClick={() => {
        haptic.light();
        onSort(field);
      }}
      className="flex items-center gap-1"
      style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: active ? 'var(--teal)' : 'var(--text-muted)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {label}
      {active ? (
        sortDir === 'desc' ? (
          <ChevronDown size={12} />
        ) : (
          <ChevronUp size={12} />
        )
      ) : (
        <ChevronDown size={12} /* tailwind-migration:replaced */ />
      )}
    </button>
  );
}
