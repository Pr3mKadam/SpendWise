import { describe, it, expect } from 'vitest';
import { calculateHealthScore } from '@/features/analytics/insights/healthScore';
import type { Transaction, MonthlyStats } from '@/types';

function tx(overrides: Partial<Transaction> & { id: string }): Transaction {
  const now = new Date().toISOString();
  return {
    id: overrides.id,
    date: overrides.date ?? '2024-06-15',
    amount: overrides.amount ?? 50,
    type: overrides.type ?? 'debit',
    category: overrides.category ?? 'Food',
    merchant: overrides.merchant ?? 'Test',
    aiParsed: overrides.aiParsed ?? false,
    isNew: overrides.isNew ?? false,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

function emptyMonthlyStats(overrides?: Partial<MonthlyStats>): MonthlyStats {
  return {
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    savingsRate: 0,
    avgDailySpend: 0,
    topCategory: 'Food',
    categoryDistribution: {},
    transactionCount: 0,
    ...overrides,
  };
}

// ─── Health Score ─────────────────────────────────────────────────────────────

describe('calculateHealthScore', () => {
  const cat = (name: string, value: number, percent: number) => ({ name, value, percent, color: 'var(--teal)' });

  it('returns perfect score for ideal finances', () => {
    const result = calculateHealthScore(
      [tx({ id: '1', type: 'credit', amount: 5000 }), tx({ id: '2', amount: 1000 })],
      emptyMonthlyStats({ savingsRate: 50, avgDailySpend: 50, totalIncome: 5000 }),
      [cat('Food', 1000, 20)],
      10000
    );
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.grade).toBe('A+');
  });

  it('detects poor health with zero savings and low balance', () => {
    const result = calculateHealthScore(
      [tx({ id: '1', amount: 1000 })],
      emptyMonthlyStats({ savingsRate: 0, avgDailySpend: 100, totalIncome: 1000 }),
      [cat('Food', 1000, 100)],
      50
    );
    expect(result.score).toBeLessThan(40);
    expect(['D', 'F']).toContain(result.grade);
  });

  it('returns recommendations for low savings', () => {
    const result = calculateHealthScore(
      [tx({ id: '1', amount: 5000 }), tx({ id: '2', type: 'credit', amount: 5000 })],
      emptyMonthlyStats({ savingsRate: 0, avgDailySpend: 167, totalIncome: 5000 }),
      [cat('Shopping', 5000, 100)],
      1000
    );
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1);
    expect(result.recommendations.some(r => r.toLowerCase().includes('savings'))).toBe(true);
  });

  it('handles zero income without division by zero', () => {
    const result = calculateHealthScore(
      [],
      emptyMonthlyStats({ savingsRate: 0, avgDailySpend: 0, totalIncome: 0 }),
      [],
      0
    );
    expect(result.score).toBeDefined();
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('returns breakdown with all four components', () => {
    const result = calculateHealthScore(
      [tx({ id: '1', type: 'credit', amount: 3000 }), tx({ id: '2', amount: 1500 })],
      emptyMonthlyStats({ savingsRate: 30, avgDailySpend: 50, totalIncome: 3000 }),
      [cat('Food', 1500, 50)],
      5000
    );
    expect(result.breakdown).toHaveProperty('savings');
    expect(result.breakdown).toHaveProperty('stability');
    expect(result.breakdown).toHaveProperty('discipline');
    expect(result.breakdown).toHaveProperty('emergency');
    expect(result.breakdown.savings).toBeGreaterThanOrEqual(0);
    expect(result.breakdown.savings).toBeLessThanOrEqual(100);
  });

  it('grades correctly across the spectrum', () => {
    // Test edge cases - the exact scores depend on all inputs
    // A+ >= 90, A >= 80, B >= 70, C >= 60, D >= 40, F < 40
    const result90 = calculateHealthScore(
      [tx({ id: '1', type: 'credit', amount: 5000 }), tx({ id: '2', amount: 500 })],
      emptyMonthlyStats({ savingsRate: 50, avgDailySpend: 50, totalIncome: 5000 }),
      [cat('Food', 500, 10)],
      50000
    );
    expect(result90.grade).toBe('A+');
    expect(result90.score).toBeGreaterThanOrEqual(90);

    const result70 = calculateHealthScore(
      [tx({ id: '1', amount: 1000 })],
      emptyMonthlyStats({ savingsRate: 0, avgDailySpend: 50, totalIncome: 1000 }),
      [cat('Food', 1000, 100)],
      200
    );
    expect(['F', 'D', 'C']).toContain(result70.grade);
    expect(result70.score).toBeLessThan(60);
  });
});

// ─── Budget Suggestions ───────────────────────────────────────────────────────

describe('generateBudgetSuggestions', () => {
  async function testSuggestions() {
    const { generateBudgetSuggestions } = await import('@/features/budget/insights/budgetSuggestions');
    return generateBudgetSuggestions;
  }

  it('returns empty array for no transactions', async () => {
    const fn = await testSuggestions();
    expect(fn([])).toEqual([]);
  });

  it('returns empty array for only credit transactions', async () => {
    const fn = await testSuggestions();
    const result = fn([
      tx({ id: '1', type: 'credit', amount: 5000, date: '2024-06-01', category: 'Income' }),
    ]);
    expect(result).toEqual([]);
  });

  it('generates suggestions from recent debits', async () => {
    const fn = await testSuggestions();
    const now = new Date();
    const recentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const result = fn([
      tx({ id: '1', type: 'debit', amount: 1000, category: 'Food', date: recentDate, merchant: 'Restaurant A' }),
      tx({ id: '2', type: 'debit', amount: 500, category: 'Food', date: recentDate, merchant: 'Restaurant B' }),
    ]);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some(s => s.category === 'Food')).toBe(true);
  });
});

// ─── Finance Calculations (pure logic extract) ────────────────────────────────

describe('finance calculations', () => {
  function computeCurrentBalance(transactions: Transaction[], initialBalance: number = 0): number {
    return Math.round(
      transactions.reduce((acc, tx) => {
        const amount = Number(tx.amount) || 0;
        return tx.type === 'credit' ? acc + amount : acc - amount;
      }, initialBalance) * 100
    ) / 100;
  }

  function computeCategorySpending(transactions: Transaction[]): { name: string; value: number; percent: number; color?: string }[] {
    const debits = transactions.filter(t => t.type === 'debit');
    const total = debits.reduce((s, t) => s + t.amount, 0);
    const byCategory: Record<string, number> = {};
    debits.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value, percent: total > 0 ? Math.round((value / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }

  function computeMonthlyStats(transactions: Transaction[]): { totalIncome: number; totalExpenses: number; netCashFlow: number } {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthTxs = transactions.filter(t => t.date.startsWith(monthStr));
    const totalIncome = monthTxs.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = monthTxs.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    return { totalIncome, totalExpenses, netCashFlow: totalIncome - totalExpenses };
  }

  it('computes balance from scratch', () => {
    expect(computeCurrentBalance([
      tx({ id: '1', type: 'credit', amount: 1000 }),
      tx({ id: '2', type: 'debit', amount: 300 }),
      tx({ id: '3', type: 'credit', amount: 200 }),
    ])).toBe(900);
  });

  it('computes balance with initial balance', () => {
    expect(computeCurrentBalance([tx({ id: '1', type: 'debit', amount: 100 })], 500)).toBe(400);
  });

  it('returns zero for empty transactions', () => {
    expect(computeCurrentBalance([])).toBe(0);
  });

  it('computes category spending percentages', () => {
    const result = computeCategorySpending([
      tx({ id: '1', type: 'debit', amount: 100, category: 'Food' }),
      tx({ id: '2', type: 'debit', amount: 300, category: 'Shopping' }),
      tx({ id: '3', type: 'debit', amount: 100, category: 'Food' }),
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Shopping');
    expect(result[0].percent).toBe(60);
  });

  it('returns empty for no debits', () => {
    expect(computeCategorySpending([tx({ id: '1', type: 'credit', amount: 100 })])).toEqual([]);
  });

  it('computes monthly income and expenses', () => {
    const result = computeMonthlyStats([
      tx({ id: '1', type: 'credit', amount: 5000, date: new Date().toISOString().slice(0, 10) }),
      tx({ id: '2', type: 'debit', amount: 2000, date: new Date().toISOString().slice(0, 10) }),
    ]);
    expect(result.totalIncome).toBe(5000);
    expect(result.totalExpenses).toBe(2000);
    expect(result.netCashFlow).toBe(3000);
  });

  it('uses full precision for balance', () => {
    expect(computeCurrentBalance([
      tx({ id: '1', type: 'credit', amount: 10.33 }),
      tx({ id: '2', type: 'debit', amount: 5.17 }),
    ])).toBe(5.16);
  });
});
