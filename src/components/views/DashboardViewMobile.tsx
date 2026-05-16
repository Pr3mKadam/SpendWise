import React, { useMemo, useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  LayoutGrid, 
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AppView, Transaction } from '../../types';
import { FinanceState } from '../../types/state';
import { SpendWiseConfig } from '../features/onboarding/OnboardingModal';
import { haptic } from '../../lib/haptic';

// Lazy load non-critical widgets
const QuickAddPanel = lazy(() => import('../features/dashboard/QuickAddPanel'));
const LevelProgress = lazy(() => import('../features/gamification/LevelProgress'));

interface DashboardViewMobileProps {
  financeState: FinanceState;
  onAdd: (tx: any) => void;
  currency: string;
  onNavigate: (view: AppView) => void;
  hideBalances?: boolean;
  config: SpendWiseConfig | null;
}

export default function DashboardViewMobile({
  financeState,
  onAdd,
  currency,
  onNavigate,
  hideBalances = false,
  config
}: DashboardViewMobileProps) {
  const { transactions, currentBalance, monthlyStats } = financeState;
  const [isAddOpen, setIsAddOpen] = useState(false);

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  const handleQuickAction = (view: AppView) => {
    haptic.light();
    onNavigate(view);
  };

  return (
    <div className="view-enter space-y-6 pb-24">
      {/* 1. High-Impact Balance Hero */}
      <section className="relative px-1 pt-2">
        <div className="bg-gradient-to-br from-[var(--teal)] to-[#0d9488] rounded-[32px] p-6 text-white shadow-lg overflow-hidden relative">
          {/* Background Decorative Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black uppercase opacity-70 tracking-widest mb-1">Total Balance</p>
              <h2 className="text-4xl font-black tracking-tight">
                {hideBalances ? '••••••' : `${currency}${currentBalance.toLocaleString()}`}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Wallet size={20} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <TrendingUp size={10} className="text-emerald-400" />
                </div>
                <span className="text-[9px] font-bold uppercase opacity-80">Income</span>
              </div>
              <p className="text-sm font-black">
                {hideBalances ? '•••' : `${currency}${monthlyStats.totalIncome.toLocaleString()}`}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 rounded-full bg-red-400/20 flex items-center justify-center">
                  <TrendingDown size={10} className="text-red-400" />
                </div>
                <span className="text-[9px] font-bold uppercase opacity-80">Spent</span>
              </div>
              <p className="text-sm font-black">
                {hideBalances ? '•••' : `${currency}${monthlyStats.totalExpenses.toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Actions Row */}
      <section className="px-1">
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'budget', icon: <LayoutGrid size={18} />, label: 'Budgets', color: 'bg-indigo-500' },
            { id: 'history', icon: <Search size={18} />, label: 'History', color: 'bg-orange-500' },
            { id: 'analytics', icon: <TrendingUp size={18} />, label: 'Stats', color: 'bg-emerald-500' },
            { id: 'goals', icon: <Sparkles size={18} />, label: 'Goals', color: 'bg-violet-500' },
          ].map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id as AppView)}
              className="flex flex-col items-center gap-2 min-w-[72px]"
            >
              <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center text-white shadow-md active:scale-95 transition-transform`}>
                {action.icon}
              </div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Recent Transactions */}
      <section className="px-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-[var(--text-primary)]">Recent</h3>
          <button 
            onClick={() => onNavigate('history')}
            className="text-[var(--teal)] text-xs font-black uppercase tracking-widest flex items-center gap-1 p-2 -mr-2"
          >
            See All <ChevronRight size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((tx: Transaction) => (
            <div 
              key={tx.id}
              className="bg-[var(--surface-card)] rounded-2xl p-4 flex items-center gap-4 border border-[var(--border)] shadow-sm active:bg-[var(--surface-light)] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-input)] flex items-center justify-center text-xl">
                {/* Simplified icon logic for mobile speed */}
                {tx.type === 'credit' ? '💰' : '💸'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">{tx.merchant}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{tx.category}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-black ${tx.type === 'debit' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {tx.type === 'debit' ? '-' : '+'}{currency}{tx.amount.toLocaleString()}
                </p>
                <p className="text-[9px] text-[var(--text-dim)] uppercase font-bold">
                  {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <div className="text-center py-8 opacity-50">
              <p className="text-sm font-medium">No transactions yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Gamification / Progress */}
      <section className="px-1">
        <Suspense fallback={<div className="h-24 bg-[var(--surface-input)] rounded-3xl animate-pulse" />}>
          <LevelProgress onNavigate={onNavigate} />
        </Suspense>
      </section>

      {/* 5. Quick Add Panel Expansion */}
      <section className="px-1">
        <div className="bg-[var(--surface-card)] rounded-[32px] p-6 border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[var(--text-primary)] flex items-center gap-2">
              <Plus size={18} className="text-[var(--teal)]" /> Quick Entry
            </h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
            Scan a receipt or type a transaction to keep your balance updated.
          </p>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="w-full py-4 bg-[var(--teal)] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
          >
            <Plus size={18} /> Add Transaction
          </button>
        </div>
      </section>

      {/* Add Transaction Bottom Sheet (Mock for this component) */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-[1000] flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-[var(--surface-card)] rounded-t-[40px] p-8 max-h-[90vh] overflow-y-auto border-t border-[var(--border)] shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-[var(--border)] rounded-full mx-auto mb-8" />
              <Suspense fallback={<div className="h-64 animate-pulse bg-[var(--surface-input)] rounded-3xl" />}>
                <QuickAddPanel 
                  onAdd={(tx) => { onAdd(tx); setIsAddOpen(false); haptic.success(); }} 
                  transactions={transactions}
                  recentMerchants={[]}
                  dashboardInput=""
                  setDashboardInput={() => {}}
                />
              </Suspense>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="w-full mt-6 py-4 rounded-2xl border border-[var(--border)] font-bold text-[var(--text-muted)]"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
