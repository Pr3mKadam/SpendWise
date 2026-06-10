import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, Shield, CreditCard, ExternalLink } from 'lucide-react';
import type { Transaction } from '@/types';

interface ProductRecommendation {
  title: string;
  description: string;
  partner: string;
  cta: string;
  url: string;
  badge?: string;
}

function getRecommendations(
  transactions: Transaction[],
  savingsRate: number
): ProductRecommendation[] {
  const recs: ProductRecommendation[] = [];

  const travelSpend = transactions
    .filter(t => t.category === 'Travel' && t.type === 'debit')
    .reduce((s, t) => s + t.amount, 0);
  const hasMf = transactions.some(t => t.category === 'Investment');

  if (savingsRate > 20 && !hasMf) {
    recs.push({
      title: 'Start a SIP in Nifty 50',
      description: `You save ${savingsRate.toFixed(0)}% of your income. Start a systematic investment plan to grow your wealth.`,
      partner: 'Zerodha',
      cta: 'Explore Funds',
      url: 'https://zerodha.com/mf',
      badge: 'Popular',
    });
  }

  if (travelSpend > 10000) {
    recs.push({
      title: 'Travel Insurance',
      description: `You spent ₹${travelSpend.toFixed(0)} on travel. Protect your trips with travel insurance.`,
      partner: 'ICICI Lombard',
      cta: 'Get Quote',
      url: 'https://icicilombard.com/travel',
    });
  }

  const onlineSpend = transactions.filter(
    t => t.merchant && /amazon|flipkart|myntra/i.test(t.merchant)
  ).length;
  if (onlineSpend >= 3) {
    recs.push({
      title: 'Cashback Credit Card',
      description: `${onlineSpend} online purchases detected. Earn 5% cashback on your shopping.`,
      partner: 'Axis Bank',
      cta: 'Apply Now',
      url: 'https://axisbank.com/cashback-card',
      badge: 'Up to ₹500/mo',
    });
  }

  return recs;
}

interface ProductDiscoveryProps {
  transactions: Transaction[];
  savingsRate: number;
}

export default function ProductDiscovery({ transactions, savingsRate }: ProductDiscoveryProps) {
  const recommendations = useMemo(
    () => getRecommendations(transactions, savingsRate),
    [transactions, savingsRate]
  );

  if (recommendations.length === 0) return null;

  const iconMap: Record<string, React.ReactNode> = {
    'Start a SIP in Nifty 50': <TrendingUp size={20} />,
    'Travel Insurance': <Shield size={20} />,
    'Cashback Credit Card': <CreditCard size={20} />,
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--border)] flex items-center gap-2">
        <Sparkles size={18} className="text-[var(--teal)]" />
        <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">
          Personalised for you
        </h3>
      </div>
      <div className="p-6 space-y-4">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]"
          >
            <div className="w-12 h-12 rounded-2xl bg-[var(--teal-dim)] flex items-center justify-center text-[var(--teal)] shrink-0">
              {iconMap[rec.title] || <Sparkles size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-manrope font-bold text-sm text-[var(--text-primary)]">
                  {rec.title}
                </h4>
                {rec.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-[var(--teal)]/10 text-[length:var(--fs-overline)] font-bold text-[var(--teal)] uppercase tracking-widest">
                    {rec.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
                {rec.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[length:var(--fs-overline)] font-bold text-[var(--text-secondary)]">
                  Partner: {rec.partner}
                </span>
                <a
                  href={rec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--teal)] text-white text-[length:var(--fs-overline)] font-bold hover:opacity-90 transition-opacity"
                >
                  {rec.cta}
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-3 bg-[var(--surface-input)] border-t border-[var(--border)]">
        <p className="text-[length:var(--fs-overline)] text-[var(--text-dim)] text-center">
          SpendWise earns a referral fee if you sign up.
        </p>
      </div>
    </div>
  );
}
