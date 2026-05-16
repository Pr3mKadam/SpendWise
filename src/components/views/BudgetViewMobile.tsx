import React, { useState } from 'react';
import { Target, Plus, Trash2, Edit2, Check, X, ArrowLeft, MoreVertical, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudgets } from '../../hooks/useBudgets';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../types';
import { haptic } from '../../lib/haptic';

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
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[2rem] p-6 shadow-xl border border-white/5 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--teal)]/10 rounded-full blur-2xl" />
        <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase text-teal-400/80 tracking-[0.2em] mb-1">Total Monthly Budget</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">{currency}{totalBudgeted.toLocaleString()}</h2>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${overallBudgetPercent > 90 ? 'bg-red-500/20 text-red-400' : 'bg-teal-500/20 text-teal-400'}`}>
              {Math.round(overallBudgetPercent)}% Used
            </span>
          </div>
          
          <div className="mt-5">
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(overallBudgetPercent, 100)}%` }}
                className={`h-full rounded-full ${overallBudgetPercent > 100 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-[var(--teal)] to-emerald-400 shadow-[0_0_12px_rgba(20,184,166,0.5)]'}`}
              />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-bold uppercase tracking-wider">
              <TrendingUp size={10} />
              <span>Healthy Strategy</span>
            </div>
            <p className="text-white/70 text-[11px] font-medium italic">
              Keep it under 80% for maximum savings
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-black text-lg text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-manrope)' }}>
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
            className="bg-[var(--surface-card)] p-5 rounded-[2rem] border border-[var(--teal)]/20 shadow-xl"
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
                className="p-1 text-[var(--text-muted)] hover:text-red-500 bg-transparent border-none cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest">Select Category</label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { haptic.light(); setSelectedCategory(cat); }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${selectedCategory === cat ? 'bg-[var(--teal)]/10 border-[var(--teal)]' : 'bg-[var(--surface-input)] border-[var(--border)]'}`}
                    >
                      <span className="text-lg mb-1">{mergedIcons[cat] || '📦'}</span>
                      <span className="text-[9px] font-bold text-center truncate w-full">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest">Monthly Limit ({currency})</label>
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
                className="w-full py-4 bg-[var(--teal)] disabled:opacity-50 text-white rounded-2xl shadow-lg shadow-teal-500/20 font-black text-sm border-none cursor-pointer active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
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
          <div className="text-center py-16 px-6 bg-[var(--surface-input)]/50 rounded-[2rem] border border-dashed border-[var(--border)]">
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
          <motion.div 
            layout
            key={b.category} 
            className="group p-5 bg-[var(--surface-card)] rounded-[2rem] border border-[var(--border)] shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden"
          >
            {/* Background progress indicator (subtle) */}
            <div 
              className="absolute left-0 top-0 bottom-0 opacity-[0.03] pointer-events-none transition-all duration-700"
              style={{ 
                width: `${Math.min(b.percent, 100)}%`, 
                background: b.status === 'danger' ? 'var(--red)' : b.status === 'warning' ? 'var(--amber)' : 'var(--teal)' 
              }}
            />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner"
                  style={{ background: `${mergedColors[b.category] || '#14b8a6'}15` }}
                >
                  {mergedIcons[b.category] || '📦'}
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">{b.category}</h4>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {Math.round(b.percent)}% Used
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleEdit(b.category, b.limit)}
                  className="p-2 text-[var(--text-muted)] active:text-[var(--teal)] bg-white/5 rounded-lg border-none cursor-pointer"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => { haptic.medium(); removeBudget(b.category); }}
                  className="p-2 text-[var(--text-muted)] active:text-red-500 bg-white/5 rounded-lg border-none cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-end justify-between mb-3 relative z-10">
              <div>
                <p className="text-xl font-black text-[var(--text-primary)]">
                  {currency}{b.spent.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold text-[var(--text-muted)]">
                   / {currency}{b.limit.toLocaleString()} limit
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-black ${b.remaining < 0 ? 'text-red-500' : 'text-[var(--teal)]'}`}>
                  {b.remaining < 0 ? '-' : ''}{currency}{Math.abs(b.remaining).toLocaleString()}
                </p>
                <p className="text-[10px] font-bold text-[var(--text-muted)]">
                  {b.remaining < 0 ? 'Exceeded' : 'Left'}
                </p>
              </div>
            </div>

            <div className="h-2 w-full bg-[var(--surface-input)] rounded-full overflow-hidden relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(b.percent, 100)}%` }}
                className={`h-full rounded-full ${b.status === 'danger' ? 'bg-red-500' : b.status === 'warning' ? 'bg-amber-500' : 'bg-gradient-to-r from-[var(--teal)] to-emerald-400'}`}
              />
            </div>
            
            {b.percent > 100 && (
              <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-red-500 bg-red-500/10 py-1.5 px-3 rounded-full w-fit">
                <AlertCircle size={12} strokeWidth={3} />
                <span>OVER BUDGET BY {currency}{Math.abs(b.remaining).toLocaleString()}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
