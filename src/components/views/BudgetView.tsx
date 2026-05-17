import React, { useState } from 'react';
import { Target, TrendingUp, AlertCircle, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useBudgets } from '../../hooks/useBudgets';
import { useCategories } from '../../hooks/useCategories';
import { useTransactions } from '../../hooks/useTransactions';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '../../types';
import { SmartBudgetSuggestions } from '../features/budgets/SmartBudgetSuggestions';
import { useIsMobile } from '../../hooks/useMediaQuery';
import BudgetViewMobile from './BudgetViewMobile';

export default function BudgetView({ currency = '₹' }: { currency?: string }) {
  const isMobile = useIsMobile();
  const { budgetStats, setBudget, removeBudget, totalBudgeted, overallBudgetPercent, budgets } = useBudgets();
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-[var(--surface-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm">
          <p className="text-[length:var(--fs-overline)] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-1">Total Monthly Budget</p>
          <h2 className="text-3xl font-black text-[var(--text-primary)]">{currency}{totalBudgeted.toLocaleString()}</h2>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-2 bg-[var(--surface-input)] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(overallBudgetPercent, 100)}%` }}
                className={`h-full rounded-full ${overallBudgetPercent > 100 ? 'bg-red-500' : 'bg-[var(--teal)]'}`}
              />
            </div>
            <span className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)]">{Math.round(overallBudgetPercent)}%</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--teal)] to-[#0d9488] rounded-3xl p-6 text-white shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-[length:var(--fs-overline)] font-bold uppercase opacity-80 tracking-widest mb-1">Budgeting Strategy</p>
            <h3 className="text-xl font-bold">70/20/10 Rule</h3>
          </div>
          <p className="text-[length:var(--fs-caption)] opacity-90 mt-2 font-medium">You are currently budgeting {Math.round(overallBudgetPercent)}% of your typical monthly spend.</p>
        </div>
      </div>

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
                  <label className="block text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] mb-1.5 uppercase">Category</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value as Category)}
                    className="w-full bg-[var(--surface-card)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--teal)]"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="w-[120px]">
                  <label className="block text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] mb-1.5 uppercase">Monthly Limit</label>
                  <input 
                    type="number" 
                    value={limitAmount}
                    onChange={(e) => setLimitAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[var(--surface-card)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--teal)]"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAdd} className="p-2.5 bg-[var(--teal)] text-white rounded-xl border-none cursor-pointer">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setIsAdding(false)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border-none cursor-pointer">
                    <X size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {budgetStats.length === 0 && !isAdding && (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-[var(--text-muted)] opacity-20 mb-4" />
              <p className="text-[var(--text-muted)] font-medium">No budgets set yet. Start by adding a monthly limit for a category.</p>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {budgetStats.map((b) => (
              <div key={b.category} className="group p-4 bg-[var(--surface-input)] rounded-2xl border border-[var(--border)] hover:border-[var(--teal)]/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-card)] flex items-center justify-center shadow-sm">
                      <Target size={16} className={b.status === 'danger' ? 'text-red-500' : 'text-[var(--teal)]'} />
                    </div>
                    <h4 className="font-bold text-[var(--text-primary)] text-sm">{b.category}</h4>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setSelectedCategory(b.category); setLimitAmount(b.limit.toString()); setIsAdding(true); }}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--teal)] bg-transparent border-none cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => removeBudget(b.category)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-500 bg-transparent border-none cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-wider">Spent</p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {currency}{b.spent.toLocaleString()} <span className="text-[length:var(--fs-overline)] font-medium text-[var(--text-muted)]">/ {currency}{b.limit.toLocaleString()}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-wider">Remaining</p>
                    <p className={`text-sm font-bold ${b.remaining < 0 ? 'text-red-500' : 'text-[var(--teal)]'}`}>
                      {currency}{b.remaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-[var(--surface-card)] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(b.percent, 100)}%` }}
                    className={`h-full rounded-full ${b.status === 'danger' ? 'bg-red-500' : b.status === 'warning' ? 'bg-amber-500' : 'bg-[var(--teal)]'}`}
                  />
                </div>
                
                {b.percent > 100 && (
                  <div className="mt-2 flex items-center gap-1 text-[length:var(--fs-overline)] font-bold text-red-500">
                    <AlertCircle size={10} />
                    OVER BUDGET BY {currency}{Math.abs(b.remaining).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
