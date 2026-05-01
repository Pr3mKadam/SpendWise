import React from 'react';
import MetricCards from '../features/dashboard/MetricCards';
import NetWorthEvolution from '../features/wealth/NetWorthEvolution';
import SpendingDonut from '../features/analytics/SpendingDonut';
import TransactionList from '../features/history/TransactionList';
import MagicInput from '../features/ai/MagicInput';
import { useFinanceState } from '../../hooks/useFinanceState';
import { useGamification } from '../../hooks/useGamification';
import { WealthTree } from '../features/wealth/WealthTree';
import { Flame, Trophy, Activity, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { SavingsChallenges } from '../features/gamification/SavingsChallenges';
import { SubscriptionCard } from '../features/subscriptions/SubscriptionCard';
import FutureWealthSimulator from '../features/wealth/FutureWealthSimulator';
import SpendingPersonality from '../features/ai/SpendingPersonality';

export function DashboardView({
  financeState,
  onCategoryChange,
  onAdd,
  currency,
}: {
  financeState: ReturnType<typeof useFinanceState>;
  onCategoryChange: (id: string, newCategory: string) => void;
  onAdd: Parameters<typeof MagicInput>[0]['onAddTransaction'];
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
    <div className="view-enter space-y-6">
      {/* ── Section 1: Strategic Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Metric Cloud (span 8) */}
        <div className="lg:col-span-8">
          <MetricCards
            currentBalance={currentBalance}
            predictedEndOfMonth={predictedEndOfMonth}
            projectionMeta={projectionMeta}
            monthlyStats={monthlyStats}
            currency={currency}
            healthScore={healthScore}
          />
        </div>

        {/* Right: Wealth Tree & Personality (span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="card p-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-label">Wealth Growth</h3>
              <Activity size={14} className="text-[var(--teal)]" />
            </div>
            <WealthTree score={healthScore} savingsRate={savingsRate} />
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-tighter">Current Vitality</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-[var(--text-primary)]">{healthScore}/100</span>
                <span className="text-[10px] font-bold text-[var(--teal)] px-2 py-0.5 bg-[var(--teal-dim)] rounded-full">ELITE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Active Management ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Feed: Magic Input & Evolution (span 8) */}
        <div className="lg:col-span-8 space-y-6">
          <MagicInput onAdd={onAdd} />
          
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

          <TransactionList 
            transactions={transactions} 
            onCategoryChange={onCategoryChange} 
            onDelete={financeState.deleteTransaction}
            currency={currency} 
          />
        </div>

        {/* Side Rail: Insights & Challenges (span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-[var(--teal)] to-[#0d9488] rounded-2xl p-5 text-white shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Flame size={24} className="fill-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Logging Streak</p>
                <p className="text-2xl font-black">{streak} Days</p>
              </div>
            </div>
            <Trophy size={28} className="text-white/20" />
          </motion.div>

          <SpendingDonut data={categorySpending} totalSpent={totalSpent} currency={currency} />
          
          <SpendingPersonality transactions={transactions} />

          <div className="card p-5 bg-[var(--surface-input)] border-dashed border-2 border-[var(--border)]">
             <div className="flex items-center gap-2 mb-3">
               <Sparkles size={16} className="text-[var(--teal)]" />
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)]">Future Forecast</h3>
             </div>
             <FutureWealthSimulator 
                currentBalance={currentBalance} 
                monthlySavings={Math.max(0, monthlyStats.totalIncome - monthlyStats.totalExpenses)} 
                currency={currency}
              />
          </div>

          <SubscriptionCard currency={currency} />
          
          <SavingsChallenges />
        </div>
      </div>
    </div>
  );
}
