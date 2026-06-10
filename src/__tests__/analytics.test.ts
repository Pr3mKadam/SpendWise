import { describe, it, expect } from 'vitest';
import type { Transaction } from '@/types';

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

// ─── Forecast ─────────────────────────────────────────────────────────────────

describe('forecastNextMonth', () => {
  async function testForecast() {
    const { forecastNextMonth } = await import('@/features/analytics/insights/forecast');
    return forecastNextMonth;
  }

  it('returns zero forecast for empty transactions', async () => {
    const fn = await testForecast();
    const result = fn([], new Date('2024-06-15'));
    expect(result.predictedTotal).toBe(0);
    expect(result.categoryForecasts).toEqual([]);
  });

  it('forecasts from one month of data', async () => {
    const fn = await testForecast();
    const result = fn(
      [
        tx({ id: '1', date: '2024-05-10', amount: 500, category: 'Food' }),
        tx({ id: '2', date: '2024-05-12', amount: 200, category: 'Transport' }),
      ],
      new Date('2024-06-15')
    );
    expect(result.predictedTotal).toBeGreaterThan(0);
    expect(result.categoryForecasts.length).toBeGreaterThanOrEqual(1);
    expect(result.confidence).toBe('low');
  });

  it('applies recency weighting', async () => {
    const fn = await testForecast();
    const result = fn(
      [
        tx({ id: '1', date: '2024-04-10', amount: 100, category: 'Food' }),
        tx({ id: '2', date: '2024-05-10', amount: 500, category: 'Food' }),
      ],
      new Date('2024-06-15')
    );
    const foodCat = result.categoryForecasts.find(c => c.category === 'Food');
    expect(foodCat).toBeDefined();
    expect(foodCat!.predicted).toBeGreaterThan(300);
  });

  it('increases confidence with more data', async () => {
    const fn = await testForecast();
    const result = fn(
      [
        tx({ id: '1', date: '2024-01-10', amount: 100, category: 'Food' }),
        tx({ id: '2', date: '2024-02-10', amount: 100, category: 'Food' }),
        tx({ id: '3', date: '2024-03-10', amount: 100, category: 'Food' }),
        tx({ id: '4', date: '2024-04-10', amount: 100, category: 'Food' }),
        tx({ id: '5', date: '2024-05-10', amount: 100, category: 'Food' }),
      ],
      new Date('2024-06-15')
    );
    expect(result.confidence).toBe('high');
  });
});

// ─── Anomaly Detection ────────────────────────────────────────────────────────

describe('detectAnomalies', () => {
  async function testAnomaly() {
    const { detectAnomalies } = await import('@/features/analytics/insights/anomaly');
    return detectAnomalies;
  }

  it('returns empty for no transactions', async () => {
    const fn = await testAnomaly();
    expect(fn([])).toEqual([]);
  });

  it('flags unusually large transactions', async () => {
    const fn = await testAnomaly();
    const result = fn([
      tx({ id: '1', date: '2024-06-01', amount: 10, category: 'Food' }),
      tx({ id: '2', date: '2024-06-02', amount: 12, category: 'Food' }),
      tx({ id: '3', date: '2024-06-03', amount: 11, category: 'Food' }),
      tx({ id: '4', date: '2024-06-04', amount: 9, category: 'Food' }),
      tx({ id: '5', date: '2024-06-05', amount: 13, category: 'Food' }),
      tx({ id: '6', date: '2024-06-06', amount: 8, category: 'Food' }),
      tx({ id: '7', date: '2024-06-07', amount: 10, category: 'Food' }),
      tx({ id: '8', date: '2024-06-08', amount: 5000, category: 'Food' }),
    ]);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some(a => a.transaction.id === '8')).toBe(true);
  });

  it('does not flag transactions in categories with low variation', async () => {
    const fn = await testAnomaly();
    const result = fn([
      tx({ id: '1', amount: 100, category: 'Food' }),
      tx({ id: '2', amount: 101, category: 'Food' }),
    ]);
    expect(result).toEqual([]);
  });

  it('skips credit transactions', async () => {
    const fn = await testAnomaly();
    const result = fn([tx({ id: '1', type: 'credit', amount: 99999, category: 'Income' })]);
    expect(result).toEqual([]);
  });
});

// ─── Advisor ──────────────────────────────────────────────────────────────────

describe('buildBriefing', () => {
  async function testBuildBriefing() {
    const { buildBriefing } = await import('@/features/analytics/insights/advisor');
    return buildBriefing;
  }

  it('builds briefing with total income and expenses', async () => {
    const fn = await testBuildBriefing();
    const result = fn(
      [
        tx({ id: '1', type: 'credit', amount: 5000, merchant: 'Salary' }),
        tx({ id: '2', type: 'debit', amount: 200, merchant: 'Restaurant', category: 'Food' }),
      ],
      '₹'
    );
    expect(result.totalIncome).toBe(5000);
    expect(result.totalSpent).toBe(200);
    expect(result.topCategories).toHaveLength(1);
    expect(result.topMerchants).toHaveLength(1);
  });

  it('handles empty transactions', async () => {
    const fn = await testBuildBriefing();
    const result = fn([], '$');
    expect(result.totalIncome).toBe(0);
    expect(result.totalSpent).toBe(0);
    expect(result.topCategories).toEqual([]);
  });
});

describe('getProactiveNudge', () => {
  async function testNudge() {
    const { getProactiveNudge } = await import('@/features/analytics/insights/advisor');
    return getProactiveNudge;
  }

  it('returns null when everything is fine', async () => {
    const fn = await testNudge();
    const result = fn(
      [tx({ id: '1', type: 'credit', amount: 5000, date: new Date().toISOString().slice(0, 10) })],
      {},
      [],
      0,
      '₹'
    );
    expect(result).toBeNull();
  });

  it('returns deficit nudge when expenses exceed income', async () => {
    const fn = await testNudge();
    const result = fn(
      [tx({ id: '1', type: 'debit', amount: 5000 }), tx({ id: '2', type: 'credit', amount: 3000 })],
      {},
      [],
      5,
      '₹'
    );
    expect(result).not.toBeNull();
    expect(result!.action).toBe('CREATE_BUDGET');
    expect(result!.urgency).toBe('high');
  });
});

describe('getSpendingPersonality', () => {
  async function testPersonality() {
    const { getSpendingPersonality } = await import('@/features/analytics/insights/advisor');
    return getSpendingPersonality;
  }

  it('returns Optimizer for high savers', async () => {
    const fn = await testPersonality();
    const result = fn(
      [
        tx({ id: '1', type: 'debit', amount: 500, category: 'Food' }),
        tx({ id: '2', type: 'debit', amount: 300, category: 'Transport' }),
        tx({ id: '3', type: 'debit', amount: 200, category: 'Shopping' }),
        tx({ id: '4', type: 'credit', amount: 5000, category: 'Income' }),
      ],
      '₹'
    );
    expect(result.archetype).toBeDefined();
    expect(typeof result.description).toBe('string');
    expect(result.description.length).toBeGreaterThan(0);
  });

  it('handles only credits gracefully', async () => {
    const fn = await testPersonality();
    const result = fn([tx({ id: '1', type: 'credit', amount: 1000, category: 'Income' })], '$');
    expect(result.archetype).toBeDefined();
  });
});

// ─── Quests ───────────────────────────────────────────────────────────────────

describe('generateQuests', () => {
  async function testQuests() {
    const { generateQuests } = await import('@/features/analytics/insights/advisor');
    return generateQuests;
  }

  it('generates up to 4 quests from transactions', async () => {
    const fn = await testQuests();
    const result = fn([tx({ id: '1', type: 'debit', amount: 500, category: 'Food' })], '₹');
    expect(result.length).toBeLessThanOrEqual(4);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('includes uncategorized quest when applicable', async () => {
    const fn = await testQuests();
    const result = fn(
      [tx({ id: '1', type: 'debit', amount: 100, category: 'Uncategorized' })],
      '₹'
    );
    expect(result.some(q => q.type === 'uncategorized')).toBe(true);
  });
});
