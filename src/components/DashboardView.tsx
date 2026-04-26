import React from 'react';
import MetricCards from './MetricCards';
import BalanceChart from './BalanceChart';
import SpendingDonut from './SpendingDonut';
import TransactionList from './TransactionList';
import MagicInput from './MagicInput';
import { useFinanceState } from '../hooks/useFinanceState';
import { useGamification } from '../hooks/useGamification';
import { WealthTree } from './WealthTree';
import { Flame, Trophy, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="view-enter">
      {/* Top Metrics Row */}
      <MetricCards
        currentBalance={currentBalance}
        predictedEndOfMonth={predictedEndOfMonth}
        projectionMeta={projectionMeta}
        monthlyStats={monthlyStats}
        currency={currency}
        healthScore={healthScore}
      />

      {/* Gamification Bar */}
      <div className="mt-8 flex flex-wrap gap-4">
        <motion.div 
          whileHover={{ y: -2 }}
          className="flex-1 min-w-[200px] bg-gradient-to-br from-[var(--teal)] to-[#0d9488] rounded-2xl p-4 text-white flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Flame size={20} className="fill-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Daily Logging Streak</p>
              <p className="text-xl font-black">{streak} Days</p>
            </div>
          </div>
          <div className="text-[10px] bg-black/20 px-2 py-1 rounded-full font-bold">
            KEEP IT UP!
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="flex-1 min-w-[200px] bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--green-dim)] flex items-center justify-center">
              <Activity size={20} className="text-[var(--green)]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Financial Vitality</p>
              <p className="text-xl font-black text-[var(--text-primary)]">{healthScore}/100</p>
            </div>
          </div>
          <Trophy size={20} className="text-amber-500" />
        </motion.div>
      </div>

      {/* Main Bento Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column (Deep Dive: Charts & History) - 8 columns */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="relative">
            <BalanceChart data={balanceTrend} currency={currency} />
          </div>
          
          <TransactionList 
            transactions={transactions} 
            onCategoryChange={onCategoryChange} 
            onDelete={financeState.deleteTransaction}
            currency={currency} 
          />
        </div>

        {/* Right Column (Quick Actions & Summaries) - 4 columns */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <MagicInput onAddTransaction={onAdd} currency={currency} />

          <div className="relative">
            <SpendingDonut data={categorySpending} totalSpent={totalSpent} currency={currency} />
          </div>

          <WealthTree score={healthScore} savingsRate={savingsRate} />
        </div>
      </div>
    </div>
  );
}
