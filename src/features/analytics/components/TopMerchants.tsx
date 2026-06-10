import { Store } from 'lucide-react';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions: any[];
  currency: string;
}

export function TopMerchants({ transactions, currency }: Props) {
  const merchantMap: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'debit')
    .forEach(t => {
      merchantMap[t.merchant] = (merchantMap[t.merchant] || 0) + t.amount;
    });
  const topMerchants = Object.entries(merchantMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxVal = topMerchants[0]?.[1] || 1;

  if (topMerchants.length === 0) return null;

  return (
    <div className="card px-4 sm:px-6 py-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
          <Store size={18} className="text-violet-500" />
        </div>
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            Top Merchants
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            Where your money goes most
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {topMerchants.map(([merchant, amount], i) => (
          <div key={merchant} className="flex items-center gap-3">
            <span
              className="text-[length:var(--fs-caption)] font-bold tabular-nums w-4 shrink-0"
              style={{ color: i < 3 ? 'var(--teal)' : 'var(--text-muted)' }}
            >
              #{i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span
                  className="text-sm font-semibold truncate"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}
                >
                  {merchant}
                </span>
                <span
                  className="text-sm font-bold tabular-nums shrink-0 ml-2"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-manrope)' }}
                >
                  {currency}
                  {amount.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f0f2f5' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(amount / maxVal) * 100}%`,
                    background:
                      i === 0 ? '#7c3aed' : i === 1 ? '#8b5cf6' : i === 2 ? '#a78bfa' : '#c4b5fd',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
