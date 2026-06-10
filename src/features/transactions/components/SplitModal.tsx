import { useState } from 'react';
import { X, Plus, PieChart } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Category } from '@/types';
import type { TransactionSplit } from '@/types';
import { CATEGORY_COLORS, CATEGORY_ICONS, DEBIT_CATEGORIES } from '@/data/categories';

interface SplitModalProps {
  show: boolean;
  onClose: () => void;
  totalAmount: number;
  splits: TransactionSplit[];
  onSave: (splits: TransactionSplit[]) => void;
  currency: string;
}

const DEFAULT_LABELS = ['Groceries', 'Entertainment', 'Bills', 'Shopping', 'Transport', 'Dining'];

export function SplitModal({ show, onClose, totalAmount, splits: initialSplits, onSave, currency }: SplitModalProps) {
  const [splits, setSplits] = useState<TransactionSplit[]>(
    initialSplits.length > 0
      ? initialSplits
      : [{ label: '', category: 'Shopping' as Category, amount: totalAmount }]
  );

  const allocated = splits.reduce((s, sp) => s + sp.amount, 0);
  const remaining = totalAmount - allocated;
  const isBalanced = Math.abs(remaining) < 0.01;

  function addSplit() {
    setSplits(prev => [...prev, { label: '', category: 'Shopping' as Category, amount: 0 }]);
  }

  function removeSplit(idx: number) {
    setSplits(prev => prev.filter((_, i) => i !== idx));
  }

  function updateSplit(idx: number, field: keyof TransactionSplit, value: string | number) {
    setSplits(prev => prev.map((sp, i) => (i === idx ? { ...sp, [field]: value } : sp)));
  }

  function handleSave() {
    const valid = splits.filter(sp => sp.amount > 0 && sp.category);
    if (valid.length === 0) return;
    const normalized = valid.map(sp => ({
      ...sp,
      amount: Math.round(sp.amount * 100) / 100,
    }));
    onSave(normalized);
    onClose();
  }

  function clearSplits() {
    onSave([]);
    onClose();
  }

  return (
    <Modal show={show} onClose={onClose} title="Split Transaction">
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface-input)]">
          <PieChart size={18} className="text-[var(--teal)]" />
          <span className="text-sm font-bold text-[var(--text-primary)]">
            {currency}{totalAmount.toFixed(2)}
          </span>
          <span className="text-xs text-[var(--text-muted)]">— split across categories</span>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {splits.map((sp, i) => (
            <div key={i} className="flex items-start gap-2 bg-[var(--surface-card)] border border-[var(--border)] rounded-xl p-3">
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex gap-2">
                  <select
                    value={sp.category}
                    onChange={e => updateSplit(i, 'category', e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--teal)] cursor-pointer"
                    style={{ color: CATEGORY_COLORS[sp.category] || 'var(--text-primary)' }} /* tailwind-migration:skip */
                  >
                    {DEBIT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {CATEGORY_ICONS[cat] || '📦'} {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={sp.label}
                    onChange={e => updateSplit(i, 'label', e.target.value)}
                    placeholder={DEFAULT_LABELS[i] || 'Label'}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--teal)]"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] font-bold">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={sp.amount || ''}
                    onChange={e => updateSplit(i, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--teal)] text-right"
                  />
                </div>
              </div>
              {splits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSplit(i)}
                  aria-label={`Remove split ${i + 1}`}
                  className="p-1 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold ${isBalanced ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          <span>{isBalanced ? '✓ Balanced' : `${currency}${remaining.toFixed(2)} remaining`}</span>
          <span>{currency}{allocated.toFixed(2)} / {currency}{totalAmount.toFixed(2)}</span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={addSplit}
            className="flex-1 py-2.5 rounded-xl font-bold text-xs border border-dashed border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--teal)] hover:border-[var(--teal)] transition-colors cursor-pointer bg-transparent"
          >
            <Plus size={14} className="inline mr-1" /> Add Split
          </button>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={clearSplits}
            className="flex-1 py-2.5 rounded-xl font-bold text-xs border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer bg-transparent"
          >
            Clear Splits
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isBalanced || splits.length === 0}
            className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-[var(--teal)] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer border-none"
          >
            Apply {splits.length > 1 ? `${splits.length} Splits` : 'Split'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SplitModal;
