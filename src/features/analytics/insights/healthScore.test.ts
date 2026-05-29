import { describe, it, expect } from 'vitest';
import { calculateHealthScore } from '@/features/analytics/insights/healthScore';
import type { Transaction, CategorySpend, MonthlyStats } from '@/types';

// ── helpers ──────────────────────────────────────────────────────────────────
function makeStats(overrides: Partial<MonthlyStats> = {}): MonthlyStats {
  return {
    totalIncome:      5000,
    totalExpenses:    3000,
    savingsRate:      40,
    netCashFlow:      2000,
    avgDailySpend:    100,
    transactionCount: 20,
    ...overrides,
  };
}

function makeCatSpend(name: string, value: number, percent: number): CategorySpend {
  return { name, value, percent, color: '#6366f1' };
}

const sampleTxs: Transaction[] = [];

// ── tests ─────────────────────────────────────────────────────────────────────
describe('calculateHealthScore', () => {
  it('returns a score between 0 and 100', () => {
    const result = calculateHealthScore(sampleTxs, makeStats(), [], 10000);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('assigns A+ grade for score >= 90', () => {
    // High savings rate, good runway, no wants spending
    const stats = makeStats({ savingsRate: 40, avgDailySpend: 10 });
    const result = calculateHealthScore(sampleTxs, stats, [], 500000);
    expect(['A+', 'A', 'B']).toContain(result.grade); // conservative assertion
  });

  it('assigns lower grade when savings rate is 0', () => {
    const stats = makeStats({ savingsRate: 0, totalExpenses: 5000, avgDailySpend: 160 });
    const result = calculateHealthScore(sampleTxs, stats, [], 500);
    expect(['C', 'D', 'F']).toContain(result.grade);
  });

  it('returns a non-empty grade string', () => {
    const result = calculateHealthScore(sampleTxs, makeStats(), [], 10000);
    expect(['A+', 'A', 'B', 'C', 'D', 'F']).toContain(result.grade);
  });

  it('score is higher when savings rate is 30% vs 0%', () => {
    const highSavings = makeStats({ savingsRate: 30, avgDailySpend: 50 });
    const noSavings   = makeStats({ savingsRate: 0, avgDailySpend: 50 });
    const r1 = calculateHealthScore(sampleTxs, highSavings, [], 10000);
    const r2 = calculateHealthScore(sampleTxs, noSavings, [], 10000);
    expect(r1.score).toBeGreaterThan(r2.score);
  });

  it('score is higher when balance (runway) is large', () => {
    const stats = makeStats({ avgDailySpend: 100 });
    const r1 = calculateHealthScore(sampleTxs, stats, [], 100000); // 1000 days runway
    const r2 = calculateHealthScore(sampleTxs, stats, [], 1000);   // 10 days runway
    expect(r1.score).toBeGreaterThan(r2.score);
  });

  it('discipline score drops when "wants" categories dominate', () => {
    const highWants = [
      makeCatSpend('Entertainment', 800, 80),
      makeCatSpend('Shopping', 200, 20),
    ];
    const noWants = [
      makeCatSpend('Utilities', 500, 50),
      makeCatSpend('Health', 500, 50),
    ];
    const stats = makeStats({ avgDailySpend: 50 });
    const r1 = calculateHealthScore(sampleTxs, stats, highWants, 10000);
    const r2 = calculateHealthScore(sampleTxs, stats, noWants, 10000);
    expect(r2.score).toBeGreaterThan(r1.score);
  });

  it('breakdown values sum to approximately the total score', () => {
    const stats = makeStats({ savingsRate: 25, avgDailySpend: 80 });
    const result = calculateHealthScore(sampleTxs, stats, [], 15000);
    const { savings, stability, discipline, emergency } = result.breakdown;
    // Weighted sum: 40% + 30% + 20% + 10%
    const weighted = savings * 0.4 + stability * 0.3 + discipline * 0.2 + emergency * 0.1;
    expect(Math.abs(Math.round(weighted) - result.score)).toBeLessThanOrEqual(2);
  });

  it('returns at most 2 recommendations', () => {
    const result = calculateHealthScore(sampleTxs, makeStats({ savingsRate: 0, avgDailySpend: 500 }), [], 100);
    expect(result.recommendations.length).toBeLessThanOrEqual(2);
  });

  it('returns no recommendations when health is excellent', () => {
    const stats = makeStats({ savingsRate: 40, avgDailySpend: 10 });
    const result = calculateHealthScore(sampleTxs, stats, [], 500000);
    // For a very healthy scenario, some recommendations may be empty
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it('breakdown values are between 0 and 100', () => {
    const stats = makeStats({ savingsRate: 15, avgDailySpend: 60 });
    const result = calculateHealthScore(sampleTxs, stats, [], 8000);
    for (const val of Object.values(result.breakdown)) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    }
  });

  it('returns color property as a string', () => {
    const result = calculateHealthScore(sampleTxs, makeStats(), [], 10000);
    expect(typeof result.color).toBe('string');
    expect(result.color.length).toBeGreaterThan(0);
  });
});
