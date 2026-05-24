import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface BudgetSummaryMobileProps {
  currency: string;
  totalBudgeted: number;
  overallBudgetPercent: number;
}

export function BudgetSummaryMobile({ currency, totalBudgeted, overallBudgetPercent }: BudgetSummaryMobileProps) {
  return (
    <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[var(--radius-hero)] p-6 shadow-xl border border-white/5 relative overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--teal)]/10 rounded-full blur-2xl" />
      <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <p className="text-[length:var(--fs-overline)] font-bold uppercase text-teal-400/80 tracking-[0.2em] mb-1">Total Monthly Budget</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-black text-white">{currency}{totalBudgeted.toLocaleString()}</h2>
          <span className={`text-[length:var(--fs-caption)] font-bold px-2 py-0.5 rounded-full ${overallBudgetPercent > 90 ? 'bg-red-500/20 text-red-400' : 'bg-teal-500/20 text-teal-400'}`}>
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
          <div className="flex items-center gap-1.5 text-white/50 text-[length:var(--fs-overline)] font-bold uppercase tracking-wider">
            <TrendingUp size={10} />
            <span>Healthy Strategy</span>
          </div>
          <p className="text-white/70 text-[length:var(--fs-caption)] font-medium italic">
            Keep it under 80% for maximum savings
          </p>
        </div>
      </div>
    </div>
  );
}
