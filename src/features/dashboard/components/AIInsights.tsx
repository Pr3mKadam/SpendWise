import { BrainCircuit, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';

interface AIInsightsProps {
  insights: {
    topCat: [string, number] | undefined;
    topCatChange: number | null;
    savingsRate: number;
    totalExpensesChange: number | null;
  };
  transactionsCount: number;
  currency: string;
}

export function AIInsights({ insights, transactionsCount, currency }: AIInsightsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
        <div className="p-2 bg-blue-500/20 rounded-xl text-blue-500 mt-0.5">
          <BrainCircuit size={18} />
        </div>
        <div>
          <h4 className="text-[0.85rem] font-bold text-[var(--text-primary)] m-0 mb-1">AI Smart Insight</h4>
          <p className="text-[0.75rem] text-[var(--text-muted)] m-0 leading-snug">
            {transactionsCount === 0
              ? 'Add transactions to unlock personalized AI insights.'
              : insights.savingsRate > 0
                ? `You're saving ${insights.savingsRate}% of income this month. ${
                    insights.savingsRate >= 20
                      ? 'Great discipline — consider moving savings to a Goal!'
                      : 'Try to hit the 20% savings target for financial health.'
                  }`
                : `Your expenses exceed income this month. Review your ${insights.topCat?.[0] ?? 'top'} spending to find savings.`
            }
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
        <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500 mt-0.5">
          {!insights.topCat ? <Sparkles size={18} /> : 
           insights.topCatChange !== null && insights.topCatChange < 0
            ? <TrendingDown size={18} />
            : <TrendingUp size={18} />
          }
        </div>
        <div>
          <h4 className="text-[0.85rem] font-bold text-[var(--text-primary)] m-0 mb-1">Spending Pulse</h4>
          <p className="text-[0.75rem] text-[var(--text-muted)] m-0 leading-snug">
            {insights.topCat
              ? insights.topCatChange !== null
                ? `${insights.topCat[0]} is your top expense (${currency}${Math.round(insights.topCat[1]).toLocaleString()}). ${
                    insights.topCatChange < 0
                      ? `Down ${Math.abs(Math.round(insights.topCatChange))}% vs last month — great progress!`
                      : `Up ${Math.round(insights.topCatChange)}% from last month.`
                  } ${insights.totalExpensesChange !== null ? `Overall spending is ${insights.totalExpensesChange > 0 ? 'up' : 'down'} ${Math.abs(Math.round(insights.totalExpensesChange))}%.` : ''}`
                : `${insights.topCat[0]} is your biggest spend this month at ${currency}${Math.round(insights.topCat[1]).toLocaleString()}. ${insights.totalExpensesChange !== null ? `Overall spending is ${insights.totalExpensesChange > 0 ? 'up' : 'down'} ${Math.abs(Math.round(insights.totalExpensesChange))}%.` : ''}`
              : 'Add transactions to unlock spending insights.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
