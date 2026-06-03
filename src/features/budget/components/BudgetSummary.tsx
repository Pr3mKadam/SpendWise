import { motion } from 'framer-motion';

interface BudgetSummaryProps {
  currency: string;
  totalBudgeted: number;
  overallBudgetPercent: number;
}

export function BudgetSummary({
  currency,
  totalBudgeted,
  overallBudgetPercent,
}: BudgetSummaryProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="bg-[var(--surface-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm">
        <p className="text-[length:var(--fs-overline)] font-bold uppercase text-[var(--text-muted)] tracking-widest mb-1">
          Total Monthly Budget
        </p>
        <h2 className="text-3xl font-black text-[var(--text-primary)]">
          {currency}
          {totalBudgeted.toLocaleString()}
        </h2>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-2 bg-[var(--surface-input)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(overallBudgetPercent, 100)}%` }}
              className={`h-full rounded-full ${overallBudgetPercent > 100 ? 'bg-red-500' : 'bg-[var(--teal)]'}`}
            />
          </div>
          <span className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)]">
            {Math.round(overallBudgetPercent)}%
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[var(--teal)] to-[#0d9488] rounded-3xl p-6 text-white shadow-lg flex flex-col justify-between">
        <div>
          <p className="text-[length:var(--fs-overline)] font-bold uppercase opacity-80 tracking-widest mb-1">
            Budgeting Strategy
          </p>
          <h3 className="text-xl font-bold">70/20/10 Rule</h3>
        </div>
        <p className="text-[length:var(--fs-caption)] opacity-90 mt-2 font-medium">
          You are currently budgeting {Math.round(overallBudgetPercent)}% of your typical monthly
          spend.
        </p>
      </div>
    </div>
  );
}
