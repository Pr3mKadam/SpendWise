import { describe, it, expect } from 'vitest';
import { detectAnomalies } from '@/insights/anomaly';
import type { Transaction } from '@/types';

// Helper to build a minimal Transaction
function tx(overrides: Partial<Transaction> & { amount: number; category: string }): Transaction {
  return {
    id: `tx-${Math.random()}`,
    date: '2024-03-01',
    type: 'debit',
    merchant: 'Test Merchant',
    description: '',
    tags: [],
    ...overrides,
  } as Transaction;
}

describe('detectAnomalies', () => {
  it('returns empty array when no transactions', () => {
    expect(detectAnomalies([])).toEqual([]);
  });

  it('ignores credit transactions', () => {
    const txs = [
      tx({ amount: 1000, category: 'Income', type: 'credit' }),
      tx({ amount: 5000, category: 'Income', type: 'credit' }),
      tx({ amount: 5000, category: 'Income', type: 'credit' }),
      tx({ amount: 5000, category: 'Income', type: 'credit' }),
    ];
    expect(detectAnomalies(txs)).toHaveLength(0);
  });

  it('returns empty if fewer than 3 transactions per category', () => {
    const txs = [
      tx({ amount: 100, category: 'Food' }),
      tx({ amount: 9000, category: 'Food' }), // only 2 items — ignored
    ];
    expect(detectAnomalies(txs)).toHaveLength(0);
  });

  it('detects a clear outlier in a category', () => {
    // 6 tightly-grouped transactions + 1 extreme outlier.
    // With 6 normals at ~100, mean ≈ 114, outlier at 5000 → zScore >> 2 AND amount >> mean*2
    const txs = [
      tx({ amount: 100, category: 'Food' }),
      tx({ amount: 110, category: 'Food' }),
      tx({ amount: 95,  category: 'Food' }),
      tx({ amount: 105, category: 'Food' }),
      tx({ amount: 98,  category: 'Food' }),
      tx({ amount: 102, category: 'Food' }),
      tx({ amount: 5000, category: 'Food' }), // ← clear outlier
    ];
    const results = detectAnomalies(txs);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].transaction.amount).toBe(5000);
    expect(results[0].zScore).toBeGreaterThan(2);
    expect(results[0].reason).toContain('Food');
  });

  it('does NOT flag normal variation as anomaly', () => {
    const txs = [
      tx({ amount: 100, category: 'Transport' }),
      tx({ amount: 150, category: 'Transport' }),
      tx({ amount: 120, category: 'Transport' }),
      tx({ amount: 130, category: 'Transport' }),
    ];
    expect(detectAnomalies(txs)).toHaveLength(0);
  });

  it('sorts results by z-score descending', () => {
    // Both categories have many normals + one extreme outlier,
    // making zScore > 2 AND amount > mean*2 certain.
    const normals = (cat: string, n: number) =>
      Array.from({ length: n }, () => tx({ amount: 100, category: cat }));
    const txs = [
      ...normals('Entertainment', 6),
      tx({ amount: 3000, category: 'Entertainment' }),
      ...normals('Shopping', 6),
      tx({ amount: 9000, category: 'Shopping' }),
    ];
    const results = detectAnomalies(txs);
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].zScore).toBeGreaterThanOrEqual(results[1].zScore);
  });

  it('handles all-same amounts (zero stdDev) without crashing', () => {
    const txs = [
      tx({ amount: 200, category: 'Subscriptions' }),
      tx({ amount: 200, category: 'Subscriptions' }),
      tx({ amount: 200, category: 'Subscriptions' }),
      tx({ amount: 200, category: 'Subscriptions' }),
    ];
    expect(() => detectAnomalies(txs)).not.toThrow();
    expect(detectAnomalies(txs)).toHaveLength(0);
  });

  it('handles multiple categories independently', () => {
    const txs = [
      // Food: no anomaly
      tx({ amount: 100, category: 'Food' }),
      tx({ amount: 110, category: 'Food' }),
      tx({ amount: 105, category: 'Food' }),
      // Health: has outlier
      tx({ amount: 200, category: 'Health' }),
      tx({ amount: 210, category: 'Health' }),
      tx({ amount: 195, category: 'Health' }),
      tx({ amount: 8000, category: 'Health' }),
    ];
    const results = detectAnomalies(txs);
    expect(results.every(r => r.transaction.category === 'Health')).toBe(true);
  });
});
