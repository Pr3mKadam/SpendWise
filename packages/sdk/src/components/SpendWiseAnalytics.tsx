import React, { useMemo } from 'react';
import type { AnalyticsConfig } from '../types';

interface SpendWiseAnalyticsProps extends AnalyticsConfig {
  theme?: string;
}

export function SpendWiseAnalytics({
  transactions,
  currency,
  theme,
  onBudgetAlert,
}: SpendWiseAnalyticsProps) {
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach(tx => {
      if (tx.type === 'debit') {
        map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
      }
    });
    return Array.from(map.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  const totalSpend = useMemo(
    () => categoryBreakdown.reduce((s, c) => s + c.total, 0),
    [categoryBreakdown]
  );

  return (
    <div data-analytics-sdk data-theme={theme} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Spending Breakdown</h2>
        <p style={{ fontSize: 13, color: '#666', margin: '4px 0 0' }}>
          {currency}
          {totalSpend.toFixed(2)} total spent
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {categoryBreakdown.map(({ category, total }) => (
          <div key={category}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              <span>{category}</span>
              <span style={{ fontWeight: 600 }}>
                {currency}
                {total.toFixed(2)}
              </span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: '#eee',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(total / totalSpend) * 100}%`,
                  height: '100%',
                  borderRadius: 4,
                  background: '#14b8a6',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {onBudgetAlert && (
        <button
          onClick={() =>
            onBudgetAlert({
              category: 'sample',
              spent: 0,
              limit: 0,
            })
          }
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
}
