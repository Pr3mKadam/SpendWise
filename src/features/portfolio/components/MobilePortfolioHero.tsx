import { Sparkles } from 'lucide-react';

interface MobilePortfolioHeroProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  currency: string;
}

export function MobilePortfolioHero({
  netWorth,
  totalAssets,
  totalLiabilities,
  currency,
}: MobilePortfolioHeroProps) {
  const positive = netWorth >= 0;
  return (
    <div
      className={`rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl ${
        positive ? 'bg-gradient-to-br from-[#0d9488] to-[#2dd4bf]' : 'bg-gradient-to-br from-[#b91c1c] to-[#ef4444]'
      }`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={80} />
      </div>
      <p className="text-[length:var(--fs-overline)] font-bold uppercase tracking-[0.2em] opacity-80 mb-2">
        Net Worth
      </p>
      <h2 className="text-4xl font-black mb-6">
        {positive ? '' : '−'}
        {currency}
        {Math.abs(netWorth).toLocaleString()}
      </h2>
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
        <div>
          <p className="text-[length:var(--fs-overline)] font-bold uppercase opacity-60 mb-1">Assets</p>
          <p className="text-lg font-bold">
            {currency}
            {totalAssets.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[length:var(--fs-overline)] font-bold uppercase opacity-60 mb-1">Liabilities</p>
          <p className="text-lg font-bold">
            {currency}
            {totalLiabilities.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
