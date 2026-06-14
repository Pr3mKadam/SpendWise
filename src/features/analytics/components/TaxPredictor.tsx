import React, { useState } from 'react';
import { CategorySpend } from '@/types';
import { Calculator, ShieldAlert } from 'lucide-react';

interface TaxPredictorProps {
  income: number;
  categorySpending: CategorySpend[];
  currency: string;
}

export function TaxPredictor({ income, categorySpending, currency }: TaxPredictorProps) {
  const [regime, setRegime] = useState<'old' | 'new'>('new');
  const [sec80c, setSec80c] = useState<number>(0);
  const [sec80d, setSec80d] = useState<number>(0);
  const [hra, setHra] = useState<number>(0);

  // Identify deductible spending from app history to pre-fill inputs if zero
  const auto80C = categorySpending
    .filter(c => ['Investment', 'Life Insurance', 'ELSS'].includes(c.name))
    .reduce((acc, c) => acc + c.value, 0);

  const auto80D = categorySpending
    .filter(c => ['Health Insurance', 'Medical'].includes(c.name))
    .reduce((acc, c) => acc + c.value, 0);

  const calculateTax = (amt: number, type: 'old' | 'new') => {
    let tax = 0;
    
    // Standard deduction of 50k is applicable to both regimes for salaried individuals
    // We assume salaried for simplicity here
    const standardDeduction = 50000;
    let taxable = Math.max(0, amt - standardDeduction);

    if (type === 'old') {
      // Apply deductions (only available in old regime)
      const allowed80c = Math.min(sec80c || auto80C, 150000);
      const allowed80d = Math.min(sec80d || auto80D, 50000); // simplified 25k/50k
      taxable = Math.max(0, taxable - allowed80c - allowed80d - hra);

      // Section 87A rebate for old regime (up to 5L taxable)
      if (taxable <= 500000) {
        return 0;
      }

      if (taxable > 1000000) {
        tax += (taxable - 1000000) * 0.3;
        taxable = 1000000;
      }
      if (taxable > 500000) {
        tax += (taxable - 500000) * 0.2;
        taxable = 500000;
      }
      if (taxable > 250000) {
        tax += (taxable - 250000) * 0.05;
      }
    } else {
      // New Regime FY25-26
      // Section 87A rebate for new regime (up to 7L taxable)
      if (taxable <= 700000) {
        return 0;
      }

      if (taxable > 1500000) {
        tax += (taxable - 1500000) * 0.3;
        taxable = 1500000;
      }
      if (taxable > 1200000) {
        tax += (taxable - 1200000) * 0.2;
        taxable = 1200000;
      }
      if (taxable > 1000000) {
        tax += (taxable - 1000000) * 0.15;
        taxable = 1000000;
      }
      if (taxable > 700000) {
        tax += (taxable - 700000) * 0.1;
        taxable = 700000;
      }
      if (taxable > 300000) {
        tax += (taxable - 300000) * 0.05;
      }
    }
    
    // Add 4% Health and Education Cess
    return tax > 0 ? tax * 1.04 : 0;
  };

  const estimatedTax = calculateTax(income, regime);
  const taxRate = income > 0 ? (estimatedTax / income) * 100 : 0;
  
  // Calculate potential savings by switching regime
  const otherRegimeTax = calculateTax(income, regime === 'old' ? 'new' : 'old');
  const regimeSavings = otherRegimeTax - estimatedTax;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <Calculator size={20} className="text-[var(--teal)]" />
            Income Tax Estimator
          </h3>
          <p className="text-sm text-[var(--text-muted)] flex items-center gap-1 mt-1">
            <ShieldAlert size={14} className="text-amber-500" />
            Estimated — consult a CA for filing.
          </p>
        </div>
        
        <div className="flex bg-[var(--surface-input)] p-1 rounded-xl">
          <button
            onClick={() => setRegime('new')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              regime === 'new'
                ? 'bg-[var(--teal)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            New Regime
          </button>
          <button
            onClick={() => setRegime('old')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              regime === 'old'
                ? 'bg-[var(--teal)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Old Regime
          </button>
        </div>
      </div>

      {regime === 'old' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[var(--surface-input)] p-4 rounded-2xl border border-[var(--border)]">
          <div>
            <label className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              80C (Max 1.5L)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{currency}</span>
              <input
                type="number"
                value={sec80c || ''}
                onChange={(e) => setSec80c(Number(e.target.value))}
                placeholder={auto80C.toString()}
                className="w-full bg-[var(--surface-card)] border border-[var(--border)] rounded-xl py-2 pl-8 pr-3 text-sm text-[var(--text-primary)]"
              />
            </div>
          </div>
          <div>
            <label className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              80D (Health)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{currency}</span>
              <input
                type="number"
                value={sec80d || ''}
                onChange={(e) => setSec80d(Number(e.target.value))}
                placeholder={auto80D.toString()}
                className="w-full bg-[var(--surface-card)] border border-[var(--border)] rounded-xl py-2 pl-8 pr-3 text-sm text-[var(--text-primary)]"
              />
            </div>
          </div>
          <div>
            <label className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              HRA Exemption
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{currency}</span>
              <input
                type="number"
                value={hra || ''}
                onChange={(e) => setHra(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-[var(--surface-card)] border border-[var(--border)] rounded-xl py-2 pl-8 pr-3 text-sm text-[var(--text-primary)]"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]">
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Gross Income
          </p>
          <p className="text-xl font-bold text-[var(--text-primary)]">
            {currency}
            {income.toLocaleString()}
          </p>
          <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mt-1">
            Before tax
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]">
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Est. Tax Liability
          </p>
          <p className="text-xl font-bold text-red-500">
            {currency}
            {Math.round(estimatedTax).toLocaleString()}
          </p>
          <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mt-1">
            Effective rate: {taxRate.toFixed(1)}%
          </p>
        </div>
        <div className={`p-4 rounded-2xl border ${regimeSavings > 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-gray-500/10 border-gray-500/20'}`}>
          <p className={`text-[length:var(--fs-overline)] font-bold uppercase tracking-widest mb-1 ${regimeSavings > 0 ? 'text-green-600' : 'text-gray-500'}`}>
            {regimeSavings > 0 ? 'Regime Savings' : 'Optimal Choice'}
          </p>
          <p className={`text-xl font-bold ${regimeSavings > 0 ? 'text-green-600' : 'text-[var(--text-primary)]'}`}>
            {regimeSavings > 0 ? `+${currency}${Math.round(regimeSavings).toLocaleString()}` : 'Best Choice'}
          </p>
          <p className={`text-[length:var(--fs-overline)] mt-1 ${regimeSavings > 0 ? 'text-green-700/70' : 'text-gray-500'}`}>
            {regimeSavings > 0 ? `By picking ${regime.toUpperCase()}` : `Current regime is optimal`}
          </p>
        </div>
      </div>
    </div>
  );
}
