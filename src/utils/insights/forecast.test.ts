import { describe, it, expect, beforeEach } from 'vitest';
import { forecastNextMonth } from './forecast';
import type { Transaction } from '../../types';

// ── helpers ──────────────────────────────────────────────────────────────────
let idCounter = 0;
function makeTx(
  amount: number,
  type: 'debit' | 'credit',
  category: string,
  dateStr: string // 'YYYY-MM-DD'
): Transaction {
  return {
    id: `tx-${++idCounter}`,
    date: dateStr,
    amount,
    type,
    merchant: 'Test',
    description: '',
    category: category as any,
    tags: [],
  } as unknown as Transaction;
}

/** Generate N months of transactions ending N months ago */
function monthsAgo(offset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-15`;
}

// ── tests ─────────────────────────────────────────────────────────────────────
describe('forecastNextMonth', () => {
  beforeEach(() => { idCounter = 0; });

  it('returns low confidence with no transactions', () => {
    const result = forecastNextMonth([]);
    expect(result.confidence).toBe('low');
    expect(result.predictedTotal).toBe(0);
    expect(result.categoryForecasts).toHaveLength(0);
  });

  it('returns low confidence with only current-month transactions', () => {
    const d = new Date();
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-10`;
    const txs = [makeTx(500, 'debit', 'Food', ym)];
    const result = forecastNextMonth(txs);
    expect(result.confidence).toBe('low');
    expect(result.spentSoFar).toBeGreaterThanOrEqual(500);
  });

  it('returns medium confidence with 2-3 historical months', () => {
    const txs = [
      makeTx(1000, 'debit', 'Food', monthsAgo(1)),
      makeTx(900, 'debit', 'Food', monthsAgo(2)),
    ];
    const result = forecastNextMonth(txs);
    expect(result.confidence).toBe('medium');
  });

  it('returns high confidence with 4+ historical months', () => {
    const txs = [];
    for (let i = 1; i <= 4; i++) {
      txs.push(makeTx(1000, 'debit', 'Food', monthsAgo(i)));
    }
    const result = forecastNextMonth(txs);
    expect(result.confidence).toBe('high');
  });

  it('predicts spending proportional to historical average', () => {
    const base = 1000;
    const txs = [];
    for (let i = 1; i <= 4; i++) {
      txs.push(makeTx(base, 'debit', 'Food', monthsAgo(i)));
    }
    const result = forecastNextMonth(txs);
    // Should be close to base (weighted avg of same-value months)
    const foodForecast = result.categoryForecasts.find(c => c.category === 'Food');
    expect(foodForecast).toBeDefined();
    expect(Math.abs(foodForecast!.predicted - base)).toBeLessThan(200);
  });

  it('gives higher weight to recent months', () => {
    // Month 1 ago: 2000, months 2-4 ago: 500 each
    // Weighted: (2000*3 + 500*2 + 500*1 + 500*1) / (3+2+1+1) = (6000+1000+500+500)/7 ≈ 1143
    const txs = [
      makeTx(2000, 'debit', 'Food', monthsAgo(1)),
      makeTx(500, 'debit', 'Food', monthsAgo(2)),
      makeTx(500, 'debit', 'Food', monthsAgo(3)),
      makeTx(500, 'debit', 'Food', monthsAgo(4)),
    ];
    const result = forecastNextMonth(txs);
    const foodForecast = result.categoryForecasts.find(c => c.category === 'Food');
    // Predicted should be higher than simple average (875) due to recency weighting
    const simpleAvg = (2000 + 500 + 500 + 500) / 4; // 875
    expect(foodForecast!.predicted).toBeGreaterThan(simpleAvg);
  });

  it('trend is "up" when predicted > last month', () => {
    const txs = [
      makeTx(500,  'debit', 'Shopping', monthsAgo(3)),
      makeTx(500,  'debit', 'Shopping', monthsAgo(2)),
      makeTx(200,  'debit', 'Shopping', monthsAgo(1)), // ← last month low
    ];
    const result = forecastNextMonth(txs);
    const cat = result.categoryForecasts.find(c => c.category === 'Shopping');
    // Weighted avg > 200, so predicted > last month → trend 'up'
    expect(cat?.trend).toBe('up');
  });

  it('trend is "stable" when difference is within 5%', () => {
    const txs = [];
    for (let i = 1; i <= 4; i++) {
      txs.push(makeTx(1000, 'debit', 'Food', monthsAgo(i)));
    }
    const result = forecastNextMonth(txs);
    const cat = result.categoryForecasts.find(c => c.category === 'Food');
    expect(cat?.trend).toBe('stable');
  });

  it('income forecast uses credit transactions', () => {
    const txs = [];
    for (let i = 1; i <= 3; i++) {
      txs.push(makeTx(5000, 'credit', 'Income', monthsAgo(i)));
      txs.push(makeTx(1000, 'debit',  'Food',   monthsAgo(i)));
    }
    const result = forecastNextMonth(txs);
    expect(result.predictedIncome).toBeGreaterThan(0);
    expect(result.predictedSavings).toBeGreaterThan(0);
  });

  it('predictedSavings can be negative when spending > income', () => {
    const txs = [];
    for (let i = 1; i <= 3; i++) {
      txs.push(makeTx(5000, 'debit', 'Food', monthsAgo(i)));
      txs.push(makeTx(100, 'credit', 'Income', monthsAgo(i)));
    }
    const result = forecastNextMonth(txs);
    expect(result.predictedSavings).toBeLessThan(0);
  });

  it('categoryForecasts are sorted by predicted spend descending', () => {
    const txs = [];
    for (let i = 1; i <= 3; i++) {
      txs.push(makeTx(100, 'debit', 'Food',      monthsAgo(i)));
      txs.push(makeTx(500, 'debit', 'Shopping',  monthsAgo(i)));
      txs.push(makeTx(300, 'debit', 'Transport', monthsAgo(i)));
    }
    const result = forecastNextMonth(txs);
    const predicted = result.categoryForecasts.map(c => c.predicted);
    for (let i = 1; i < predicted.length; i++) {
      expect(predicted[i - 1]).toBeGreaterThanOrEqual(predicted[i]);
    }
  });

  it('daysRemaining is between 0 and 31', () => {
    const result = forecastNextMonth([]);
    expect(result.daysRemaining).toBeGreaterThanOrEqual(0);
    expect(result.daysRemaining).toBeLessThanOrEqual(31);
  });
});
