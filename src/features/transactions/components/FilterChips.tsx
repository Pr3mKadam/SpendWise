import { X } from 'lucide-react';
import type { TypeFilter } from './TransactionFilters';

interface FilterChipsProps {
  search: string;
  onClearSearch: () => void;
  dateFrom: string;
  dateTo: string;
  onClearDateFrom: () => void;
  onClearDateTo: () => void;
  amountMin: string;
  amountMax: string;
  onClearAmountMin: () => void;
  onClearAmountMax: () => void;
  typeFilter: TypeFilter;
  onClearTypeFilter: () => void;
  categoryFilter: string;
  onClearCategoryFilter: () => void;
}

const chipClass =
  'rounded-xl bg-[var(--teal)]/10 text-[var(--teal)] text-xs px-3 py-1 font-semibold flex items-center gap-1';

export function FilterChips({
  search,
  onClearSearch,
  dateFrom,
  dateTo,
  onClearDateFrom,
  onClearDateTo,
  amountMin,
  amountMax,
  onClearAmountMin,
  onClearAmountMax,
  typeFilter,
  onClearTypeFilter,
  categoryFilter,
  onClearCategoryFilter,
}: FilterChipsProps) {
  const chips: { label: string; onClear: () => void }[] = [];

  if (search) {
    chips.push({ label: `"${search}"`, onClear: onClearSearch });
  }

  if (dateFrom) {
    chips.push({ label: `From ${dateFrom}`, onClear: onClearDateFrom });
  }

  if (dateTo) {
    chips.push({ label: `To ${dateTo}`, onClear: onClearDateTo });
  }

  if (amountMin) {
    chips.push({ label: `Min ₹${amountMin}`, onClear: onClearAmountMin });
  }

  if (amountMax) {
    chips.push({ label: `Max ₹${amountMax}`, onClear: onClearAmountMax });
  }

  if (typeFilter !== 'all') {
    chips.push({
      label: typeFilter === 'credit' ? '+ Income' : '− Expense',
      onClear: onClearTypeFilter,
    });
  }

  if (categoryFilter !== 'All') {
    chips.push({ label: categoryFilter, onClear: onClearCategoryFilter });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip, i) => (
        <span key={i} className={chipClass}>
          {chip.label}
          <button
            onClick={chip.onClear}
            className="flex items-center justify-center hover:opacity-70 transition-opacity"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: 'inherit',
            }}
          >
            <X size={12} />
          </button>
        </span>
      ))}
    </div>
  );
}
