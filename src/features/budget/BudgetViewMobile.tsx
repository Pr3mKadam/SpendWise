import React, { useState } from 'react';
import { Target, Plus, Trash2, Edit2, Check, X, ArrowLeft, MoreVertical, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types';
import { haptic } from '@/core/haptic';
import { BudgetSummaryMobile } from '@/features/budget/components/BudgetSummaryMobile';
import { BudgetCategoryCardMobile } from '@/features/budget/components/BudgetCategoryCardMobile';

interface BudgetViewMobileProps {
  currency: string;
}

export default function BudgetViewMobile({ currency }: BudgetViewMobileProps) {
  const { budgetStats, setBudget, removeBudget, totalBudgeted, overallBudgetPercent } = useBudgets();
  const { allCategories: categories, mergedColors, mergedIcons } = useCategories();
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [limitAmount, setLimitAmount] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const handleAdd = () => {
    if (selectedCategory && limitAmount) {
      haptic.success();
      setBudget(selectedCategory, parseFloat(limitAmount));
      setIsAdding(false);
      setSelectedCategory('');
      setLimitAmount('');
    }
  };

  const handleEdit = (category: string, limit: number) => {
    haptic.light();
    setSelectedCategory(category as Category);
    setLimitAmount(limit.toString());
    setEditingCategory(category);
    setIsAdding(true);
  };

  return (
    <div className="flex flex-col space-y-5 pb-10">
      {/* Summary Header */}
      <BudgetSummaryMobile 
        currency={currency}
        totalBudgeted={totalBudgeted}
        overallBudgetPercent={overallBudgetPercent}
      />

      {/* Action Bar */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-lg text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-manrope)' }}>
          Categories
        </h3>
        <button 
          onClick={() => { haptic.medium(); setIsAdding(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--teal)] text-white rounded-2xl shadow-lg shadow-teal-500/20 font-bold text-xs border-none cursor-pointer active:scale-95 transition-transform"
        >
          <Plus size={14} strokeWidth={3} /> SET LIMIT
        </button>
      </div>

      {/* Add/Edit Budget Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-[var(--surface-card)] p-5 rounded-[var(--radius-hero)] border border-[var(--teal)]/20 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[var(--teal)]/10 flex items-center justify-center">
                  <Target size={14} className="text-[var(--teal)]" />
                </div>
                {editingCategory ? 'Adjust Limit' : 'New Budget Limit'}
              </h4>
              <button 
                onClick={() => { setIsAdding(false); setEditingCategory(null); }}
                className="w-11 h-11 flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 bg-transparent border-none cursor-pointer rounded-xl"
                aria-label="Close budget form"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">Select Category</label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { haptic.light(); setSelectedCategory(cat); }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${selectedCategory === cat ? 'bg-[var(--teal)]/10 border-[var(--teal)]' : 'bg-[var(--surface-input)] border-[var(--border)]'}`}
                    >
                      <span className="text-lg mb-1">{mergedIcons[cat] || '📦'}</span>
                      <span className="text-[length:var(--fs-overline)] font-bold text-center truncate w-full">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">Monthly Limit ({currency})</label>
                <input 
                  type="number" 
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[var(--surface-input)] border border-[var(--border)] rounded-2xl px-4 py-3 text-base font-bold text-[var(--text-primary)] outline-none focus:border-[var(--teal)]"
                  autoFocus
                />
              </div>

              <button 
                onClick={handleAdd}
                disabled={!selectedCategory || !limitAmount}
                className="w-full py-4 bg-[var(--teal)] disabled:opacity-50 text-white rounded-2xl shadow-lg shadow-teal-500/20 font-bold text-sm border-none cursor-pointer active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <Check size={18} strokeWidth={3} /> {editingCategory ? 'SAVE CHANGES' : 'CONFIRM BUDGET'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget List */}
      <div className="space-y-4">
        {budgetStats.length === 0 && !isAdding && (
          <div className="text-center py-16 px-6 bg-[var(--surface-input)]/50 rounded-[var(--radius-hero)] border border-dashed border-[var(--border)]">
            <div className="w-16 h-16 bg-[var(--surface-card)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Target size={32} className="text-[var(--text-muted)] opacity-30" />
            </div>
            <h4 className="text-[var(--text-primary)] font-bold mb-2">No active budgets</h4>
            <p className="text-[var(--text-muted)] text-xs leading-relaxed max-w-[200px] mx-auto">
              Set limits for categories to track your spending habits.
            </p>
          </div>
        )}

        {budgetStats.map((b) => (
          <BudgetCategoryCardMobile 
            key={b.category}
            b={b as any}
            currency={currency}
            mergedColors={mergedColors}
            mergedIcons={mergedIcons}
            onEdit={handleEdit}
            onRemove={removeBudget}
          />
        ))}
      </div>
    </div>
  );
}
