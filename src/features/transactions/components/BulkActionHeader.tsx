import React from 'react';
import { Trash2, X } from 'lucide-react';
import { Category } from '@/types';
import { CategoryDropdown } from '@/components/ui/CategoryDropdown';

export interface BulkActionHeaderProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkCategoryChange: (newCategory: Category) => void;
  onBulkDelete: () => void;
}

export function BulkActionHeader({
  selectedCount,
  onClearSelection,
  onBulkCategoryChange,
  onBulkDelete,
}: BulkActionHeaderProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="card flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-5 py-3"
      style={{
        background: 'var(--teal-dim)',
        border: '1.5px solid var(--teal-glow)',
        borderRadius: '16px',
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onClearSelection}
          className="p-1.5 rounded-full hover:bg-white/50 transition-colors"
          aria-label="Clear selection"
          style={{ color: 'var(--teal)', border: 'none', background: 'none', cursor: 'pointer' }}
        >
          <X size={14} />
        </button>
        <span
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--teal)',
          }}
        >
          {selectedCount} transaction{selectedCount > 1 ? 's' : ''} selected
        </span>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="w-40">
          <CategoryDropdown
            value="Move to..."
            onChange={cat => onBulkCategoryChange(cat as Category)}
          />
        </div>

        <button
          onClick={onBulkDelete}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
          style={{
            background: 'var(--red-dim)',
            color: 'var(--red)',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-inter)',
          }}
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
}

export default BulkActionHeader;
