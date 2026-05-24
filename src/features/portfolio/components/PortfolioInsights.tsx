import { BrainCircuit, TrendingUp, Sparkles } from 'lucide-react';
import AllocationDonut from '@/features/portfolio/components/AllocationDonut';
import NetWorthEvolution from '@/features/portfolio/components/NetWorthEvolution';
import { WealthTree } from '@/features/portfolio/components/WealthTree';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';

interface PortfolioInsightsProps {
  financeState: any;
  currency: string;
  healthScore: number;
  savingsRate: number;
  config: SpendWiseConfig | null;
  allocationByType: any[];
  totalAssets: number;
  netWorth: number;
}

export function PortfolioInsights({
  financeState,
  currency,
  healthScore,
  savingsRate,
  config,
  allocationByType,
  totalAssets,
  netWorth,
}: PortfolioInsightsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-8 space-y-6">
        <NetWorthEvolution transactions={financeState?.transactions ?? []} currency={currency} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <WealthTree score={healthScore} savingsRate={savingsRate} role={config?.userRole} />
          <div className="card p-5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-[length:var(--fs-overline)] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                AI Insight
              </span>
            </div>
            <p className="text-sm font-manrope font-bold text-[var(--text-primary)] mb-2">
              {config?.userRole === 'student'
                ? 'Future value is promising.'
                : config?.userRole === 'business'
                ? 'Business velocity is high.'
                : 'Growth potential is high.'}
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {config?.userRole === 'student'
                ? `Your discipline could grow your education fund to ${currency}${(netWorth * 1.8).toLocaleString()} by graduation.`
                : config?.userRole === 'business'
                ? `At this rate, your business reinvestment capacity will increase by 40% in the next quarter.`
                : `Your current savings rate of ${savingsRate.toFixed(1)}% could lead to a ${currency}{(netWorth * 1.5).toLocaleString()} portfolio in 2 years.`}
            </p>
          </div>
        </div>
      </div>
      <div className="xl:col-span-4 card px-6 py-5">
        <h3
          className="font-inter font-bold text-[12px] uppercase tracking-wider mb-5"
          style={{ color: 'var(--text-muted)' }}
        >
          Portfolio Allocation
        </h3>
        <AllocationDonut allocationByType={allocationByType} total={totalAssets} currency={currency} />
        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit size={16} className="text-[var(--teal)]" />
            <span className="text-[length:var(--fs-caption)] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Wealth Tip
            </span>
          </div>
          <p className="text-[12px] leading-relaxed text-[var(--text-secondary)] font-inter">
            {config?.userRole === 'student'
              ? "Since you're a student, focus on high-yield accounts for your scholarship funds while avoiding high-interest credit card debt."
              : config?.userRole === 'business'
              ? 'Keep a 3-month operational runway in a liquid business account before making major equipment investments.'
              : `Based on your current ${
                  allocationByType.find((a) => a.type === 'bank') ? 'high cash' : 'diversified'
                } position, consider ${
                  netWorth > 100000 ? 'exploring tax-efficient index funds' : 'building a 6-month emergency buffer'
                }.`}
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-green-500" />
            <span
              className="font-inter font-bold text-[12px] uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Performance vs S&P 500
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="font-manrope font-bold text-lg text-green-500">+12.4%</p>
              <p className="font-inter text-[length:var(--fs-overline)] text-gray-400 uppercase">
                Your Portfolio
              </p>
            </div>
            <div className="text-right">
              <p className="font-manrope font-bold text-lg text-gray-500 dark:text-gray-400">+10.2%</p>
              <p className="font-inter text-[length:var(--fs-overline)] text-gray-400 uppercase">
                S&P 500 (YTD)
              </p>
            </div>
          </div>
          <div className="mt-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-2 flex justify-center items-center">
            <span className="text-xs font-bold text-green-700 dark:text-green-400">
              +2.2% Alpha Generated 🚀
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
