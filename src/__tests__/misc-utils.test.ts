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

function item(id: string, extra: Record<string, unknown> = {}) {
  return { id, ...extra };
}

// ─── Recurring Detection ──────────────────────────────────────────────────────

describe('detectRecurringPatterns', () => {
  async function testDetectRecurring() {
    const mod = await import('@/utils/recurringDetection');
    return mod.detectRecurringPatterns;
  }

  it('returns empty for no transactions', async () => {
    const fn = await testDetectRecurring();
    expect(fn([])).toEqual([]);
  });

  it('detects weekly pattern', async () => {
    const fn = await testDetectRecurring();
    const result = fn([
      tx({
        id: '1',
        date: '2024-06-03',
        amount: 500,
        merchant: 'Netflix',
        category: 'Entertainment',
      }),
      tx({
        id: '2',
        date: '2024-06-10',
        amount: 500,
        merchant: 'Netflix',
        category: 'Entertainment',
      }),
      tx({
        id: '3',
        date: '2024-06-17',
        amount: 500,
        merchant: 'Netflix',
        category: 'Entertainment',
      }),
    ]);
    expect(result.length).toBeGreaterThanOrEqual(1);
    const netflix = result.find(r => r.merchant.toLowerCase().includes('netflix'));
    expect(netflix).toBeDefined();
    expect(netflix!.frequency).toBe('weekly');
    expect(netflix!.avgAmount).toBe(500);
    expect(netflix!.occurrences).toBe(3);
  });

  it('detects monthly pattern', async () => {
    const fn = await testDetectRecurring();
    const result = fn([
      tx({
        id: '1',
        date: '2024-04-15',
        amount: 1500,
        merchant: 'Rent Payment',
        category: 'Housing',
      }),
      tx({
        id: '2',
        date: '2024-05-15',
        amount: 1500,
        merchant: 'Rent Payment',
        category: 'Housing',
      }),
    ]);
    expect(result.length).toBeGreaterThanOrEqual(1);
    const rent = result.find(r => r.merchant.includes('Rent'));
    expect(rent).toBeDefined();
    expect(rent!.frequency).toBe('monthly');
  });

  it('ignores credit transactions', async () => {
    const fn = await testDetectRecurring();
    const result = fn([
      tx({
        id: '1',
        date: '2024-06-01',
        amount: 5000,
        type: 'credit',
        merchant: 'Salary',
        category: 'Income',
      }),
    ]);
    expect(result).toEqual([]);
  });

  it('requires minimum 2 occurrences', async () => {
    const fn = await testDetectRecurring();
    const result = fn([
      tx({
        id: '1',
        date: '2024-06-10',
        amount: 250,
        merchant: 'Electric Bill',
        category: 'Bills & Utilities',
      }),
    ]);
    expect(result).toEqual([]);
  });

  it('merges similar merchant names (case-insensitive)', async () => {
    const fn = await testDetectRecurring();
    const result = fn([
      tx({
        id: '1',
        date: '2024-06-03',
        amount: 100,
        merchant: 'Spotify Premium',
        category: 'Entertainment',
      }),
      tx({
        id: '2',
        date: '2024-06-10',
        amount: 100,
        merchant: 'spotify_premium',
        category: 'Entertainment',
      }),
    ]);
    const spotify = result.find(r => r.avgAmount === 100);
    expect(spotify).toBeDefined();
    expect(spotify!.occurrences).toBe(2);
  });
});

// ─── CRDT Merge ───────────────────────────────────────────────────────────────

describe('mergeSharedStorage', () => {
  interface MergeItem {
    id: string;
    name?: string;
    balance?: number;
    amount?: number;
    purpose?: string;
    created_by?: string;
  }
  interface Storage {
    groups: MergeItem[];
    members: MergeItem[];
    walletEntries: MergeItem[];
    expenses: MergeItem[];
    goals: MergeItem[];
    deleted_ids: string[];
  }

  const emptyStore = (): Storage => ({
    groups: [],
    members: [],
    walletEntries: [],
    expenses: [],
    goals: [],
    deleted_ids: [],
  });

  async function testMerge() {
    const mod = await import('@/core/crdt');
    return mod.mergeSharedStorage;
  }

  function toShared(v: Storage): import('@/core/crdt').SharedStorage {
    const g = v.groups.map(g => ({
      id: g.id,
      name: g.name ?? '',
      purpose: g.purpose ?? '',
      created_by: g.created_by ?? '',
    }));
    const m = v.members.map(m => ({
      id: m.id,
      display_name: m.name ?? '',
      emoji: '',
      role: 'member',
      status: 'active',
      invited_at: '',
      group_id: '',
    }));
    const w = v.walletEntries.map(w => ({
      id: w.id,
      kind: 'contribution' as const,
      amount: w.balance ?? 0,
      label: '',
      date: '',
      group_id: '',
      member_id: '',
    }));
    const e = v.expenses.map(e => ({
      id: e.id,
      label: '',
      category: '',
      amount: e.amount ?? 0,
      date: '',
      paid_by_member_id: '',
      group_id: '',
    }));
    const gl = v.goals.map(gl => ({
      id: gl.id,
      name: gl.name ?? '',
      emoji: '',
      target_amount: 0,
      target_date: '',
      color: '',
      group_id: '',
    }));
    return {
      groups: g,
      members: m,
      walletEntries: w,
      expenses: e,
      goals: gl,
      deleted_ids: v.deleted_ids,
    };
  }

  it('merges unique items from both sides', async () => {
    const fn = await testMerge();
    const local = emptyStore();
    local.groups = [item('g1', { name: 'Groceries' })];
    const remote = emptyStore();
    remote.groups = [item('g2', { name: 'Transport' })];
    const result = fn(toShared(local), toShared(remote));
    expect(result.groups).toHaveLength(2);
  });

  it('remote overwrites local on conflict (LWW)', async () => {
    const fn = await testMerge();
    const local = emptyStore();
    local.groups = [item('g1', { name: 'Old Name' })];
    const remote = emptyStore();
    remote.groups = [item('g1', { name: 'New Name' })];
    const result = fn(toShared(local), toShared(remote));
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].name).toBe('New Name');
  });

  it('removes deleted items via tombstones', async () => {
    const fn = await testMerge();
    const local = emptyStore();
    local.groups = [item('g1', { name: 'Groceries' })];
    local.deleted_ids = ['g1'];
    const remote = emptyStore();
    const result = fn(toShared(local), toShared(remote));
    expect(result.groups).toHaveLength(0);
  });

  it('merges deleted_ids from both sides', async () => {
    const fn = await testMerge();
    const local = emptyStore();
    local.deleted_ids = ['a', 'b'];
    const remote = emptyStore();
    remote.deleted_ids = ['b', 'c'];
    const result = fn(toShared(local), toShared(remote));
    expect(result.deleted_ids.sort()).toEqual(['a', 'b', 'c']);
  });

  it('handles empty stores', async () => {
    const fn = await testMerge();
    const empty = emptyStore();
    expect(fn(toShared(empty), toShared(empty))).toEqual({
      groups: [],
      members: [],
      walletEntries: [],
      expenses: [],
      goals: [],
      deleted_ids: [],
    });
  });

  it('merges all collection types', async () => {
    const fn = await testMerge();
    const local = emptyStore();
    local.groups = [item('g1', { name: 'G1' })];
    local.members = [item('m1', { name: 'M1' })];
    local.walletEntries = [item('w1', { balance: 100 })];
    local.expenses = [item('e1', { amount: 50 })];
    local.goals = [item('goal1', { name: 'Goal1' })];
    const remote = emptyStore();
    remote.goals = [item('goal2', { name: 'Goal2' })];
    const result = fn(toShared(local), toShared(remote));
    expect(result.groups).toHaveLength(1);
    expect(result.members).toHaveLength(1);
    expect(result.walletEntries).toHaveLength(1);
    expect(result.expenses).toHaveLength(1);
    expect(result.goals).toHaveLength(2);
  });
});

// ─── Goal Utils ───────────────────────────────────────────────────────────────

describe('goal utility functions', () => {
  async function testGoalUtils() {
    const mod = await import('@/features/goals/components/utils');
    return mod;
  }

  it('daysUntil computes positive difference', async () => {
    const { daysUntil } = await testGoalUtils();
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const result = daysUntil(future.toISOString().slice(0, 10));
    expect(result).toBe(30);
  });

  it('daysUntil computes negative for past dates', async () => {
    const { daysUntil } = await testGoalUtils();
    const result = daysUntil('2020-01-01');
    expect(result).toBeLessThan(0);
  });

  it('formatDate formats date string', async () => {
    const { formatDate } = await testGoalUtils();
    const result = formatDate('2024-06-15');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });
});

// ─── Date Utilities ───────────────────────────────────────────────────────────

describe('date utilities', () => {
  async function testDateUtils() {
    const mod = await import('@/utils/date');
    return mod;
  }

  it('formatLocalYYYYMMDD formats correctly', async () => {
    const { formatLocalYYYYMMDD } = await testDateUtils();
    expect(formatLocalYYYYMMDD(new Date(2024, 5, 15))).toBe('2024-06-15');
    expect(formatLocalYYYYMMDD(new Date(2024, 0, 1))).toBe('2024-01-01');
    expect(formatLocalYYYYMMDD(new Date(2024, 11, 31))).toBe('2024-12-31');
  });
});

// ─── Error Utilities ──────────────────────────────────────────────────────────

describe('error utilities', () => {
  async function testErrors() {
    const mod = await import('@/core/api/errors');
    return mod;
  }

  it('normalizeError wraps non-Error strings as UNKNOWN', async () => {
    const { normalizeError } = await testErrors();
    const result = normalizeError('something went wrong');
    expect(result.code).toBe('UNKNOWN');
  });

  it('normalizeError handles Error objects', async () => {
    const { normalizeError } = await testErrors();
    const result = normalizeError(new Error('original error'));
    expect(result.message).toBe('original error');
  });

  it('normalizeError handles unknown types gracefully', async () => {
    const { normalizeError } = await testErrors();
    const result = normalizeError(null);
    expect(result.message).toBeDefined();
  });

  it('ApiError contains code and message', async () => {
    const { ApiError } = await testErrors();
    const err = new ApiError({
      code: 'NETWORK_ERROR',
      message: 'Network offline',
      retryable: true,
      status: 0,
    });
    expect(err.code).toBe('NETWORK_ERROR');
    expect(err.message).toBe('Network offline');
    expect(err.status).toBe(0);
    expect(err.retryable).toBe(true);
  });
});
