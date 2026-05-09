import React, { useState, useMemo } from 'react';
import { ShieldAlert, Zap, TrendingDown, Calendar, ArrowRight, BrainCircuit, Info } from 'lucide-react';
import { LiabilityEntry } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface DebtPlannerProps {
  liabilities: LiabilityEntry[];
  currency: string;
  monthlyExtra?: number; // How much extra the user can pay each month
}

type PayoffStrategy = 'avalanche' | 'snowball';

export default function DebtPlanner({ liabilities, currency, monthlyExtra = 0 }: DebtPlannerProps) {
  const [strategy, setStrategy] = useState<PayoffStrategy>('avalanche');
  const [extraPayment, setExtraPayment] = useState(monthlyExtra);

  const debts = useMemo(() => {
    return liabilities.filter(l => l.balance > 0).map(l => ({
      ...l,
      interestRate: l.interestRate || 0,
      minPayment: l.minPayment || Math.max(l.balance * 0.02, 500), // Default 2% or 500
    }));
  }, [liabilities]);

  const sortedDebts = useMemo(() => {
    if (strategy === 'avalanche') {
      return [...debts].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
    }
    return [...debts].sort((a, b) => a.balance - b.balance);
  }, [debts, strategy]);

  const totalMinPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);
  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);

  // Simple payoff simulation
  const simulation = useMemo(() => {
    if (debts.length === 0) return null;

    let months = 0;
    let totalInterest = 0;
    let currentDebts = debts.map(d => ({ ...d }));
    let history = [];

    const MAX_MONTHS = 360; // 30 years limit

    while (currentDebts.some(d => d.balance > 0) && months < MAX_MONTHS) {
      months++;
      let availableExtra = extraPayment;
      let monthlyInterest = 0;

      // 1. Apply interest and pay minimums
      currentDebts.forEach(d => {
        if (d.balance > 0) {
          const interest = (d.balance * (d.interestRate / 100)) / 12;
          monthlyInterest += interest;
          d.balance += interest;
          
          const payment = Math.min(d.balance, d.minPayment);
          d.balance -= payment;
        }
      });

      // 2. Apply extra payment to targeted debt
      const target = strategy === 'avalanche' 
        ? [...currentDebts].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0)).find(d => d.balance > 0)
        : [...currentDebts].sort((a, b) => a.balance - b.balance).find(d => d.balance > 0);

      if (target && availableExtra > 0) {
        const extra = Math.min(target.balance, availableExtra);
        target.balance -= extra;
      }

      totalInterest += monthlyInterest;
      if (months % 6 === 0 || currentDebts.every(d => d.balance === 0)) {
        history.push({ month: months, balance: currentDebts.reduce((s, d) => s + d.balance, 0) });
      }
    }

    return { months, totalInterest, history };
  }, [debts, strategy, extraPayment]);

  if (debts.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Strategy Selector */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">Payoff Strategy</h3>
            <div className="flex bg-[var(--surface-input)] p-1 rounded-xl border border-[var(--border)]">
              <button
                onClick={() => setStrategy('avalanche')}
                className={`px-4 py-1.5 rounded-lg font-inter font-bold text-xs transition-all ${
                  strategy === 'avalanche' ? 'bg-[var(--teal)] text-white shadow-lg' : 'text-[var(--text-muted)]'
                }`}
              >
                Avalanche
              </button>
              <button
                onClick={() => setStrategy('snowball')}
                className={`px-4 py-1.5 rounded-lg font-inter font-bold text-xs transition-all ${
                  strategy === 'snowball' ? 'bg-[var(--teal)] text-white shadow-lg' : 'text-[var(--text-muted)]'
                }`}
              >
                Snowball
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${strategy === 'avalanche' ? 'border-[var(--teal)] bg-[var(--teal-dim)]/5' : 'border-[var(--border)] bg-[var(--card)] opacity-60'}`}
              onClick={() => setStrategy('avalanche')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-amber-500" />
                <span className="font-inter font-bold text-sm text-[var(--text-primary)]">Avalanche</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Prioritize debts with the <strong>highest interest rates</strong>. Mathematically saves the most money.
              </p>
            </div>
            <div 
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${strategy === 'snowball' ? 'border-[var(--teal)] bg-[var(--teal-dim)]/5' : 'border-[var(--border)] bg-[var(--card)] opacity-60'}`}
              onClick={() => setStrategy('snowball')}
            >
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert size={16} className="text-blue-500" />
                <span className="font-inter font-bold text-sm text-[var(--text-primary)]">Snowball</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Prioritize debts with the <strong>smallest balances</strong>. Built for psychological wins and momentum.
              </p>
            </div>
          </div>

          <div className="card p-5 bg-[var(--surface-input)]">
            <div className="flex items-center justify-between mb-4">
              <label className="font-inter font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">Extra Monthly Payment</label>
              <span className="font-manrope font-bold text-[var(--teal)]">{currency}{extraPayment.toLocaleString()}</span>
            </div>
            <input 
              type="range"
              min="0"
              max="50000"
              step="500"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--teal)]"
            />
            <div className="flex justify-between mt-2">
              <span className="text-[10px] font-bold text-[var(--text-dim)]">{currency}0</span>
              <span className="text-[10px] font-bold text-[var(--text-dim)]">{currency}50k</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="md:w-[320px] space-y-4">
          <div className="card p-5 bg-gradient-to-br from-[var(--teal)] to-[#0d9488] text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Time to Freedom</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-3xl font-manrope font-bold">
                {simulation ? Math.floor(simulation.months / 12) : 0}
              </h4>
              <span className="text-sm font-inter font-medium opacity-80">years</span>
              <h4 className="text-3xl font-manrope font-bold ml-2">
                {simulation ? simulation.months % 12 : 0}
              </h4>
              <span className="text-sm font-inter font-medium opacity-80">months</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between items-center text-[12px]">
                <span className="opacity-70">Total Interest</span>
                <span className="font-bold">{currency}{simulation?.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingDown size={16} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Monthly Commit</p>
                <p className="text-sm font-manrope font-bold">{currency}{(totalMinPayment + extraPayment).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Total Principal</p>
                <p className="text-sm font-manrope font-bold">{currency}{totalBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payoff List */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-input)]/30">
          <h3 className="font-inter font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">Repayment Order</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {sortedDebts.map((debt, idx) => (
            <div key={debt.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[var(--surface-input)]/20 transition-colors">
              <div className="w-8 h-8 rounded-full bg-[var(--surface-input)] flex items-center justify-center font-manrope font-bold text-xs text-[var(--text-muted)]">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="font-inter font-bold text-sm text-[var(--text-primary)]">{debt.name}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{debt.interestRate}% Interest · {currency}{debt.minPayment}/mo min</p>
              </div>
              <div className="text-right">
                <p className="font-manrope font-bold text-sm text-[var(--text-primary)]">{currency}{debt.balance.toLocaleString()}</p>
                {idx === 0 && (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--teal-dim)] text-[var(--teal)] text-[9px] font-bold uppercase tracking-wider">Targeting</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <BrainCircuit size={20} className="text-indigo-400" />
          </div>
          <div>
            <h4 className="font-manrope font-bold text-sm text-[var(--text-primary)] mb-1">Advisor's Strategy Recommendation</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {strategy === 'snowball' 
                ? "Snowball is excellent for behavioral momentum. You'll clear your first debt in just a few months, giving you the 'win' needed to stay focused."
                : "Mathematically, Avalanche is superior. By targeting high interest first, you are effectively 'earning' a guaranteed return equal to that interest rate."
              } 
              {extraPayment < 2000 && " Increasing your extra payment by just 1,000 could save you months of repayment time."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
