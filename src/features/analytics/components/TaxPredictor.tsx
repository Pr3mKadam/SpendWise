import React from 'react';
import { motion } from 'framer-motion';
import { CategorySpend } from '@/types';

interface TaxPredictorProps {
  income: number;
  categorySpending: CategorySpend[];
  currency: string;
}

export function TaxPredictor({ income, categorySpending, currency }: TaxPredictorProps) {
  // Simple progressive tax simulation (e.g., 10% up to 50k, 20% up to 100k, 30% above)
  const calculateTax = (amt: number) => {
    let tax = 0;
    if (amt > 100000) {
      tax += (amt - 100000) * 0.3;
      amt = 100000;
    }
    if (amt > 50000) {
      tax += (amt - 50000) * 0.2;
      amt = 50000;
    }
    tax += amt * 0.1;
    return tax;
  };

  // Identify deductible spending (e.g., Health, Charities - simulated)
  const deductibles = categorySpending
    .filter(c => ['Health', 'Education', 'Charity'].includes(c.name))
    .reduce((acc, c) => acc + c.value, 0);

  const taxableIncome = Math.max(0, income - deductibles);
  const estimatedTax = calculateTax(taxableIncome);
  const taxRate = income > 0 ? (estimatedTax / income) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]">
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Taxable Income
          </p>
          <p className="text-xl font-bold text-[var(--text-primary)]">
            {currency}
            {taxableIncome.toLocaleString()}
          </p>
          <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mt-1">
            After {currency}
            {deductibles.toLocaleString()} in deductions
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]">
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Est. Tax Liability
          </p>
          <p className="text-xl font-bold text-red-500">
            {currency}
            {estimatedTax.toLocaleString()}
          </p>
          <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mt-1">
            Effective rate: {taxRate.toFixed(1)}%
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
          <p className="text-[length:var(--fs-overline)] font-bold text-green-600 uppercase tracking-widest mb-1">
            Potential Savings
          </p>
          <p className="text-xl font-bold text-green-600">
            {currency}
            {(deductibles * 0.2).toLocaleString()}
          </p>
          <p className="text-[length:var(--fs-overline)] text-green-700/70 mt-1">
            Via tax-efficient spending
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
          Tax Buckets
        </h4>
        <div className="h-4 w-full bg-[var(--surface-input)] rounded-full overflow-hidden flex">
          <div
            className="h-full bg-[var(--teal)] opacity-30"
            style={{ width: '40%' }}
            title="Standard Deduction"
          />
          <div
            className="h-full bg-[var(--teal)] opacity-60"
            style={{ width: '30%' }}
            title="10% Bracket"
          />
          <div className="h-full bg-[var(--teal)]" style={{ width: '30%' }} title="20% Bracket" />
        </div>
        <div className="flex justify-between text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
          <span>0 - 50k</span>
          <span>50k - 100k</span>
          <span>100k+</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
          "Tip: You've spent {currency}
          {deductibles.toLocaleString()} in deductible categories. Increasing your 'Education' spend
          by {currency}5,000 could lower your tax by {currency}1,000 next year."
        </p>
      </div>
    </div>
  );
}
