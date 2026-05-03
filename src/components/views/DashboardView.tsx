import React from 'react';
import DashboardHero from '../features/dashboard/DashboardHero';
import QuickAddPanel from '../features/dashboard/QuickAddPanel';
import SpendingDonut from '../features/analytics/SpendingDonut';
import TransactionList from '../features/history/TransactionList';
import MagicInput from '../features/ai/MagicInput';
import { useFinanceState } from '../../hooks/useFinanceState';
import { useGamification } from '../../hooks/useGamification';
import { WealthTree } from '../features/wealth/WealthTree';
import { Flame, Trophy, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { SavingsChallenges } from '../features/gamification/SavingsChallenges';
import { SubscriptionCard } from '../features/subscriptions/SubscriptionCard';
import FutureWealthSimulator from '../features/wealth/FutureWealthSimulator';
import SpendingPersonality from '../features/ai/SpendingPersonality';
import NetWorthEvolution from '../features/wealth/NetWorthEvolution';

export function DashboardView({
  financeState,
  onCategoryChange,
  onAdd,
  currency,
}: {
  financeState: ReturnType<typeof useFinanceState>;
  onCategoryChange: (id: string, newCategory: string) => void;
  onAdd: Parameters<typeof MagicInput>[0]['onAdd'];
  currency: string;
}) {
  const {
    transactions,
    currentBalance,
    predictedEndOfMonth,
    projectionMeta,
    topCategory,
    categorySpending,
    totalSpent,
    balanceTrend,
    monthlyStats,
    dailySpendRate,
  } = financeState;

  const { streak, healthScore, savingsRate } = useGamification(transactions);

  return (
    <div className="view-enter space-y-6 max-w-7xl mx-auto">
      {/* ── Section 1: Dashboard Hero ── */}
      <DashboardHero
        currentBalance={currentBalance}
        predictedEndOfMonth={predictedEndOfMonth}
        monthlyStats={monthlyStats}
        balanceTrend={balanceTrend}
        healthScore={healthScore}
        currency={currency}
      />

      {/* ── Section 2: Core Insights Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          whileHover={{ y: -4 }}
          className="card p-5 bg-gradient-to-br from-[var(--teal)] to-[#0d9488] text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Flame size={20} className="fill-white" />
            </div>
            <Trophy size={20} className="text-white/30" />
          </div>
          <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Logging Streak</p>
          <p className="text-2xl font-black">{streak} Days</p>
          <p className="text-[10px] mt-1 opacity-70">Keep it up! You're in the top 5%.</p>
        </motion.div>

        <div className="card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Daily Burn</span>
            <TrendingUp size={14} className="text-[var(--teal)]" />
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--text-primary)]">{currency}{dailySpendRate.toLocaleString()}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Average over last 30 days</p>
          </div>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Savings Rate</span>
            <Sparkles size={14} className="text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--text-primary)]">{savingsRate}%</p>
            <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${savingsRate}%` }} />
            </div>
          </div>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Data Quality</span>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--text-primary)]">{projectionMeta.dataQuality.toUpperCase()}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Based on {transactions.length} signals</p>
          </div>
        </div>
      </div>

      {/* ── Section 3: Main Management Area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Feed: Magic Input & List (span 8) */}
        <div className="lg:col-span-8 space-y-6">
          <QuickAddPanel onAdd={onAdd} />
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-headline">Net Worth Evolution</h3>
                <p className="text-xs text-[var(--text-muted)]">Historical progress and future trajectory</p>
              </div>
              <TrendingUp size={18} className="text-[var(--teal)]" />
            </div>
            <NetWorthEvolution transactions={transactions} currency={currency} />
          </div>

          <FutureWealthSimulator 
            currentBalance={currentBalance} 
            monthlySavings={Math.max(0, monthlyStats.totalIncome - monthlyStats.totalExpenses)} 
            currency={currency}
          />

          <TransactionList 
            transactions={transactions} 
            onCategoryChange={onCategoryChange} 
            onDelete={financeState.deleteTransaction}
            currency={currency} 
          />
        </div>

        {/* Side Rail: Insights & Challenges (span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <SpendingDonut data={categorySpending} totalSpent={totalSpent} currency={currency} />
          
          <SpendingPersonality transactions={transactions} />

          <SubscriptionCard />
          
          <SavingsChallenges />
          
          <div className="card p-5 bg-[var(--surface-input)] border-dashed border-2 border-[var(--border)] flex flex-col items-center justify-center text-center py-8">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3">
              <Trophy size={24} className="text-amber-500" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Unlock Elite Wealth</h4>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 px-4">Complete 5 more challenges to unlock the Advanced Tax Strategy module.</p>
          </div>
        </div>
      </div>
    </div>

  );
}
