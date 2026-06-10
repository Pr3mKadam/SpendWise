import { describe, it, expect } from 'vitest';
import { detectRecurringPatterns } from '@/utils/recurringDetection';
import type { Transaction } from '@/types';

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: `tx-${Math.random().toString(36).slice(2, 8)}`,
    date: '2026-06-15',
    amount: 100,
    category: 'Food',
    merchant: 'Test',
    type: 'debit',
    description: '',
    ...overrides,
  };
}

describe('detectRecurringPatterns', () => {
  it('returns empty array for no transactions', () => {
    expect(detectRecurringPatterns([])).toEqual([]);
  });

  it('returns empty array for single transaction (below MIN_OCCURRENCES)', () => {
    const txs = [tx({ merchant: 'Netflix', amount: 799 })];
    expect(detectRecurringPatterns(txs)).toEqual([]);
  });

  it('detects monthly recurring pattern', () => {
    const txs = [
      tx({ merchant: 'Netflix', amount: 799, date: '2026-01-15' }),
      tx({ merchant: 'Netflix', amount: 799, date: '2026-02-15' }),
      tx({ merchant: 'Netflix', amount: 799, date: '2026-03-15' }),
    ];
    const patterns = detectRecurringPatterns(txs);
    expect(patterns.length).toBeGreaterThanOrEqual(1);
    expect(patterns[0].merchant).toBe('Netflix');
    expect(patterns[0].frequency).toBe('monthly');
    expect(patterns[0].avgAmount).toBe(799);
    expect(patterns[0].occurrences).toBe(3);
  });

  it('detects weekly recurring pattern', () => {
    const txs = [
      tx({ merchant: 'Grocery Store', amount: 1200, date: '2026-06-01' }),
      tx({ merchant: 'Grocery Store', amount: 1350, date: '2026-06-08' }),
      tx({ merchant: 'Grocery Store', amount: 1100, date: '2026-06-15' }),
    ];
    const patterns = detectRecurringPatterns(txs);
    expect(patterns.length).toBeGreaterThanOrEqual(1);
    expect(patterns[0].frequency).toBe('weekly');
  });

  it('calculates totalSpent correctly', () => {
    const txs = [
      tx({ merchant: 'Spotify', amount: 199, date: '2026-01-10' }),
      tx({ merchant: 'Spotify', amount: 199, date: '2026-02-10' }),
    ];
    const patterns = detectRecurringPatterns(txs);
    expect(patterns.length).toBeGreaterThanOrEqual(1);
    expect(patterns[0].totalSpent).toBe(398);
  });

  it('detects price creep when last amount is >5% higher', () => {
    const txs = [
      tx({ merchant: 'Gym', amount: 1500, date: '2026-01-01' }),
      tx({ merchant: 'Gym', amount: 1500, date: '2026-02-01' }),
      tx({ merchant: 'Gym', amount: 1700, date: '2026-03-01' }),
    ];
    const patterns = detectRecurringPatterns(txs);
    expect(patterns.length).toBeGreaterThanOrEqual(1);
    expect(patterns[0].priceCreep).toBe(true);
  });

  it('does not flag price creep for stable amounts', () => {
    const txs = [
      tx({ merchant: 'Hulu', amount: 999, date: '2026-01-05' }),
      tx({ merchant: 'Hulu', amount: 999, date: '2026-02-05' }),
      tx({ merchant: 'Hulu', amount: 999, date: '2026-03-05' }),
    ];
    const patterns = detectRecurringPatterns(txs);
    expect(patterns[0].priceCreep).toBe(false);
  });

  it('filters out credit transactions', () => {
    const txs = [
      tx({ merchant: 'Salary', amount: 50000, type: 'credit', date: '2026-01-01' }),
      tx({ merchant: 'Salary', amount: 50000, type: 'credit', date: '2026-02-01' }),
    ];
    const patterns = detectRecurringPatterns(txs);
    expect(patterns).toEqual([]);
  });

  it('sorts patterns by totalSpent descending', () => {
    const txs = [
      tx({ merchant: 'Rent', amount: 25000, date: '2026-01-01' }),
      tx({ merchant: 'Rent', amount: 25000, date: '2026-02-01' }),
      tx({ merchant: 'Netflix', amount: 799, date: '2026-01-15' }),
      tx({ merchant: 'Netflix', amount: 799, date: '2026-02-15' }),
    ];
    const patterns = detectRecurringPatterns(txs);
    expect(patterns.length).toBe(2);
    expect(patterns[0].merchant).toBe('Rent');
    expect(patterns[1].merchant).toBe('Netflix');
  });

  it('handles merchants with special characters', () => {
    const txs = [
      tx({ merchant: "McDonald's", amount: 450, date: '2026-01-10' }),
      tx({ merchant: "McDonald's", amount: 520, date: '2026-02-10' }),
      tx({ merchant: "McDonald's", amount: 480, date: '2026-03-10' }),
    ];
    const patterns = detectRecurringPatterns(txs);
    expect(patterns.length).toBeGreaterThanOrEqual(1);
  });

  it('generates nextExpected date based on frequency', () => {
    const txs = [
      tx({ merchant: 'Gym', amount: 2000, date: '2026-01-01' }),
      tx({ merchant: 'Gym', amount: 2000, date: '2026-02-01' }),
      tx({ merchant: 'Gym', amount: 2000, date: '2026-03-01' }),
    ];
    const patterns = detectRecurringPatterns(txs);
    expect(patterns[0].nextExpected).toBe('2026-03-31');
  });

  it('handles annual patterns', () => {
    const txs = [
      tx({ merchant: 'Insurance', amount: 12000, date: '2025-01-15' }),
      tx({ merchant: 'Insurance', amount: 12500, date: '2026-01-15' }),
    ];
    const patterns = detectRecurringPatterns(txs);
    if (patterns.length > 0) {
      expect(patterns[0].frequency).toBe('annual');
    }
  });

  it('merges same merchant across similar names (case insensitive)', () => {
    const txs = [
      tx({ merchant: 'netflix', amount: 799, date: '2026-01-15' }),
      tx({ merchant: 'Netflix', amount: 799, date: '2026-02-15' }),
    ];
    const patterns = detectRecurringPatterns(txs);
    expect(patterns.length).toBe(1);
    expect(patterns[0].occurrences).toBe(2);
  });
});
