import { Sparkles } from 'lucide-react';
import { SpendWiseConfig } from '@/types/config';

function fmt(n: number, currency: string) {
  return `${currency}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

interface PortfolioSummaryBannerProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  currency: string;
  config: SpendWiseConfig | null;
}

export function PortfolioSummaryBanner({
  netWorth,
  totalAssets,
  totalLiabilities,
  currency,
  config,
}: PortfolioSummaryBannerProps) {
  const positive = netWorth >= 0;

  return (
    <div
      className="rounded-2xl px-8 py-7 flex flex-wrap items-center gap-8 relative overflow-hidden"
      style={{
        background: positive
          ? 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)'
          : 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
        boxShadow: positive ? '0 8px 32px rgba(20,184,166,0.3)' : '0 8px 32px rgba(239,68,68,0.3)',
      }}
    >
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Sparkles size={120} color="white" />
      </div>

      <div>
        <p className="font-inter text-[length:var(--fs-caption)] font-semibold uppercase tracking-widest text-white/70 mb-1">
          Total Net Worth
        </p>
        <p className="font-manrope font-bold text-4xl text-white">
          {positive ? '' : '−'}
          {fmt(netWorth, currency)}
        </p>
        <p className="font-inter text-[12px] text-white/70 mt-1">
          {config?.userRole === 'student'
            ? positive
              ? '🟢 Study fund is growing'
              : '🔴 Focus on scholarship/aid'
            : config?.userRole === 'business'
              ? positive
                ? '🟢 Business capital is strong'
                : '🔴 Cash flow optimization needed'
              : positive
                ? '🟢 Financial health is optimal'
                : '🔴 Focus on debt reduction'}
        </p>
      </div>
      <div className="flex gap-8 flex-wrap">
        <div>
          <p className="font-inter text-[length:var(--fs-caption)] text-white/60 uppercase tracking-wider mb-1">
            Total Assets
          </p>
          <p className="font-manrope font-bold text-2xl text-white">{fmt(totalAssets, currency)}</p>
        </div>
        <div>
          <p className="font-inter text-[length:var(--fs-caption)] text-white/60 uppercase tracking-wider mb-1">
            Total Liabilities
          </p>
          <p className="font-manrope font-bold text-2xl text-white">
            {fmt(totalLiabilities, currency)}
          </p>
        </div>
      </div>
    </div>
  );
}
