import React, { useState } from 'react';
import { Target, TrendingUp, AlertCircle, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/types';
import { SmartBudgetSuggestions } from '@/features/budget/components/SmartBudgetSuggestions';
import { BudgetSummary } from '@/features/budget/components/BudgetSummary';
import { BudgetCategoryCard } from '@/features/budget/components/BudgetCategoryCard';
import { useIsMobile } from '@/hooks/useMediaQuery';
import BudgetViewMobile from '@/features/budget/BudgetViewMobile';

export default function BudgetView({ currency = '₹' }: { currency?: string }) {
  const isMobile = useIsMobile();
  const { budgetStats, setBudget, removeBudget, totalBudgeted, overallBudgetPercent, budgets } =
    useBudgets();
  const { transactions } = useTransactions();
  const { allCategories: categories } = useCategories();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [limitAmount, setLimitAmount] = useState('');

  if (isMobile) {
    return <BudgetViewMobile currency={currency} />;
  }

  const handleAdd = () => {
    if (selectedCategory && limitAmount) {
      setBudget(selectedCategory, parseFloat(limitAmount));
      setIsAdding(false);
      setSelectedCategory('');
      setLimitAmount('');
    }
  };

  return (
    <div className="view-enter space-y-6">
      {/* Smart Budget Suggestions */}
      <SmartBudgetSuggestions
        transactions={transactions}
        existingBudgets={budgets}
        onAccept={(cat, amount) => setBudget(cat, amount)}
        currency={currency}
      />

      {/* Header Summary */}
      <BudgetSummary
        currency={currency}
        totalBudgeted={totalBudgeted}
        overallBudgetPercent={overallBudgetPercent}
      />

      {/* Budget List */}
      <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-bold text-[var(--text-primary)]">Category Budgets</h3>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--teal)]/10 text-[var(--teal)] border-none rounded-xl cursor-pointer font-bold text-[length:var(--fs-caption)] hover:bg-[var(--teal)]/20 transition-all"
          >
            <Plus size={14} /> ADD LIMIT
          </button>
        </div>

        <div className="p-6 space-y-6">
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-[var(--surface-input)] rounded-2xl flex flex-wrap gap-3 items-end border border-[var(--teal)]/30"
              >
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] mb-1.5 uppercase">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value as Category)}
                    className="w-full bg-[var(--surface-card)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--teal)]"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-[120px]">
                  <label className="block text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] mb-1.5 uppercase">
                    Monthly Limit
                  </label>
                  <input
                    type="number"
                    value={limitAmount}
                    onChange={e => setLimitAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[var(--surface-card)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--teal)]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    className="p-2.5 bg-[var(--teal)] text-white rounded-xl border-none cursor-pointer"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border-none cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {budgetStats.length === 0 && !isAdding && (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-[var(--text-muted)] opacity-20 mb-4" />
              <p className="text-[var(--text-muted)] font-medium">
                No budgets set yet. Start by adding a monthly limit for a category.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {budgetStats.map(b => (
              <BudgetCategoryCard
                key={b.category}
                b={b as any}
                currency={currency}
                onEdit={(cat, limit) => {
                  setSelectedCategory(cat);
                  setLimitAmount(limit);
                  setIsAdding(true);
                }}
                onRemove={removeBudget}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
