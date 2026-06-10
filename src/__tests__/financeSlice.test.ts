/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/config/env', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  GEMINI_PROXY_URL: '/functions/v1/gemini-proxy',
  SETU_ENV: 'sandbox',
  SETU_WEBHOOK_URL: '',
  SENTRY_DSN: '',
  DEMO_MODE: false,
  VAPID_PUBLIC_KEY: '',
  PLAID_CLIENT_ID: '',
  LOG_LEVEL: 'INFO',
  APP_VERSION: '0.0.0',
  RAZORPAY_PROXY_URL: '/functions/v1/razorpay-proxy',
  RESEND_API_KEY: '',
  validateEnv: () => [],
}));

vi.mock('@/store/index', () => ({}));

import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand/vanilla';
import { createFinanceSlice, FinanceSlice } from '@/features/transactions/store/financeSlice';
import type { Transaction } from '@/types';

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: `tx-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    amount: 100,
    category: 'Food',
    merchant: 'Test',
    type: 'debit',
    description: '',
    ...overrides,
  };
}

interface MockParentalState {
  enabled: boolean;
  blockAddTransactions: boolean;
  restrictedCategories: string[];
  restrictLateNightSpending: boolean;
  monthlyLimit: number | null;
  requireApproval: boolean;
}

type ExtendedStore = FinanceSlice & {
  parentalState: MockParentalState;
  requestTransactionApproval: (tx: Transaction) => void;
  getApprovalRequests: () => Transaction[];
};

function defaultParentalState(): MockParentalState {
  return {
    enabled: false,
    blockAddTransactions: false,
    restrictedCategories: [],
    restrictLateNightSpending: false,
    monthlyLimit: null,
    requireApproval: false,
  };
}

function createTestStore(parentalOverrides: Partial<MockParentalState> = {}) {
  const approvalSpy: Transaction[] = [];
  const parental = { ...defaultParentalState(), ...parentalOverrides };
  const store = createStore<Record<string, unknown>>()((set, get, api) => ({
    ...(
      createFinanceSlice as unknown as (s: typeof set, g: typeof get, a: typeof api) => FinanceSlice
    )(set, get, api),
    parentalState: parental,
    requestTransactionApproval: (t: Transaction) => {
      approvalSpy.push(t);
    },
    getApprovalRequests: () => [...approvalSpy],
  }));
  return store as unknown as StoreApi<ExtendedStore>;
}

describe('financeSlice', () => {
  describe('CRUD operations', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    it('starts with empty transactions', () => {
      expect(store.getState().transactions).toHaveLength(0);
    });

    it('adds a single transaction', () => {
      const t = tx({ amount: 50, merchant: 'Coffee' });
      store.getState().addTransaction(t);
      expect(store.getState().transactions).toHaveLength(1);
      expect(store.getState().transactions[0].merchant).toBe('Coffee');
    });

    it('prepends new transactions', () => {
      const t1 = tx({ merchant: 'First' });
      const t2 = tx({ merchant: 'Second' });
      store.getState().addTransaction(t1);
      store.getState().addTransaction(t2);
      expect(store.getState().transactions[0].merchant).toBe('Second');
      expect(store.getState().transactions[1].merchant).toBe('First');
    });

    it('deletes a transaction by id (soft delete)', () => {
      const t = tx({ id: 'delete-me' });
      store.getState().addTransaction(t);
      store.getState().deleteTransaction('delete-me');
      expect(store.getState().transactions).toHaveLength(1);
      expect(store.getState().transactions[0].deletedAt).toBeDefined();
    });

    it('does nothing when deleting non-existent id', () => {
      expect(() => store.getState().deleteTransaction('non-existent')).not.toThrow();
    });

    it('updates transaction category', () => {
      const t = tx({ id: 'cat-test', category: 'Food' });
      store.getState().addTransaction(t);
      store.getState().updateTransactionCategory('cat-test', 'Transport');
      expect(store.getState().transactions[0].category).toBe('Transport');
    });

    it('does nothing when updating category of non-existent transaction', () => {
      expect(() =>
        store.getState().updateTransactionCategory('non-existent', 'Food')
      ).not.toThrow();
    });

    it('adds multiple transactions at once', () => {
      const t1 = tx({ amount: 100 });
      const t2 = tx({ amount: 200 });
      store.getState().addTransactions([t1, t2]);
      expect(store.getState().transactions).toHaveLength(2);
    });

    it('prepends multiple transactions in correct order', () => {
      const existing = tx({ merchant: 'Existing' });
      store.getState().addTransaction(existing);
      const t1 = tx({ merchant: 'New1' });
      const t2 = tx({ merchant: 'New2' });
      store.getState().addTransactions([t1, t2]);
      expect(store.getState().transactions[0].merchant).toBe('New1');
      expect(store.getState().transactions[1].merchant).toBe('New2');
      expect(store.getState().transactions[2].merchant).toBe('Existing');
    });

    it('updates transaction with partial data via updateTransaction', () => {
      const t = tx({ id: 'update-me', merchant: 'Old Name', amount: 100, description: 'test' });
      store.getState().addTransaction(t);
      store.getState().updateTransaction('update-me', { merchant: 'New Name', amount: 200 });
      const updated = store.getState().transactions.find(x => x.id === 'update-me');
      expect(updated?.merchant).toBe('New Name');
      expect(updated?.amount).toBe(200);
      expect(updated?.description).toBe('test');
      expect(updated?.updatedAt).toBeDefined();
    });

    it('does nothing when updating non-existent transaction', () => {
      expect(() =>
        store.getState().updateTransaction('non-existent', { amount: 999 })
      ).not.toThrow();
    });

    it('bulk deletes transactions (soft delete)', () => {
      const t1 = tx({ id: 'bulk-1' });
      const t2 = tx({ id: 'bulk-2' });
      const t3 = tx({ id: 'keep-me' });
      store.getState().addTransactions([t1, t2, t3]);
      store.getState().bulkDeleteTransactions(['bulk-1', 'bulk-2']);
      const keep = store.getState().transactions.find(t => t.id === 'keep-me');
      const del1 = store.getState().transactions.find(t => t.id === 'bulk-1');
      const del2 = store.getState().transactions.find(t => t.id === 'bulk-2');
      expect(keep?.deletedAt).toBeUndefined();
      expect(del1?.deletedAt).toBeDefined();
      expect(del2?.deletedAt).toBeDefined();
    });

    it('bulk updates transaction categories for specified ids only', () => {
      const t1 = tx({ id: 'b1', category: 'Food' });
      const t2 = tx({ id: 'b2', category: 'Shopping' });
      const t3 = tx({ id: 'b3', category: 'Food' });
      store.getState().addTransactions([t1, t2, t3]);
      store.getState().bulkUpdateTransactionsCategory(['b1', 'b3'], 'Transport');
      expect(store.getState().transactions.find(t => t.id === 'b1')?.category).toBe('Transport');
      expect(store.getState().transactions.find(t => t.id === 'b2')?.category).toBe('Shopping');
      expect(store.getState().transactions.find(t => t.id === 'b3')?.category).toBe('Transport');
    });

    it('bulk reassigns category for all transactions with old category', () => {
      const t1 = tx({ id: 'r1', category: 'Food' });
      const t2 = tx({ id: 'r2', category: 'Food' });
      const t3 = tx({ id: 'r3', category: 'Shopping' });
      store.getState().addTransactions([t1, t2, t3]);
      store.getState().bulkReassignCategory('Food', 'Groceries' as any);
      expect(store.getState().transactions.find(t => t.id === 'r1')?.category).toBe('Groceries');
      expect(store.getState().transactions.find(t => t.id === 'r2')?.category).toBe('Groceries');
      expect(store.getState().transactions.find(t => t.id === 'r3')?.category).toBe('Shopping');
    });
  });

  describe('undoStack', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    it('returns false when undo stack is empty', () => {
      expect(store.getState().undo()).toBe(false);
    });

    it('stores snapshot before addTransaction', () => {
      const t1 = tx({ merchant: 'First' });
      store.getState().addTransaction(t1);
      expect(store.getState().undoStack).toHaveLength(1);
    });

    it('undo restores previous state after addTransaction', () => {
      const t1 = tx({ merchant: 'A' });
      store.getState().addTransaction(t1);
      expect(store.getState().transactions).toHaveLength(1);

      const t2 = tx({ merchant: 'B' });
      store.getState().addTransaction(t2);
      expect(store.getState().transactions).toHaveLength(2);

      const undone = store.getState().undo();
      expect(undone).toBe(true);
      expect(store.getState().transactions).toHaveLength(1);
      expect(store.getState().transactions[0].merchant).toBe('A');
    });

    it('undo restores transactions after multiple adds', () => {
      store.getState().addTransaction(tx({ merchant: '1' }));
      store.getState().addTransaction(tx({ merchant: '2' }));
      store.getState().addTransaction(tx({ merchant: '3' }));
      expect(store.getState().transactions).toHaveLength(3);

      store.getState().undo();
      expect(store.getState().transactions).toHaveLength(2);

      store.getState().undo();
      expect(store.getState().transactions).toHaveLength(1);

      store.getState().undo();
      expect(store.getState().transactions).toHaveLength(0);

      expect(store.getState().undo()).toBe(false);
    });

    it('undo after delete reverts only the last addTransaction', () => {
      const t = tx({ id: 'del-test' });
      store.getState().addTransaction(t);
      expect(store.getState().transactions).toHaveLength(1);

      store.getState().deleteTransaction('del-test');
      expect(store.getState().transactions[0].deletedAt).toBeDefined();

      store.getState().undo();
      expect(store.getState().transactions).toHaveLength(0);
    });

    it('limits undo stack to MAX_UNDO_STACK snapshots', () => {
      for (let i = 0; i < 15; i++) {
        store.getState().addTransaction(tx({ merchant: `T${i}` }));
      }
      expect(store.getState().undoStack.length).toBeLessThanOrEqual(10);
    });

    it('undo reindexes after restore', () => {
      const t = tx({ id: 'reindex-check', category: 'Food', date: '2026-06-15T10:00:00Z' });
      store.getState().addTransaction(t);

      const t2 = tx({ id: 'reindex-check-2', category: 'Transport', date: '2026-06-16T10:00:00Z' });
      store.getState().addTransaction(t2);
      expect(store.getState().indexedData.byCategory['Transport']).toHaveLength(1);

      store.getState().undo();
      expect(store.getState().indexedData.byCategory['Transport']).toBeUndefined();
      expect(store.getState().indexedData.byCategory['Food']).toHaveLength(1);
    });
  });

  describe('budget limits calculations', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    it('sets and removes budgets', () => {
      store.getState().setBudget('Food', 5000);
      expect(store.getState().budgets['Food']).toBe(5000);

      store.getState().removeBudget('Food');
      expect(store.getState().budgets['Food']).toBeUndefined();
    });

    it('resets all budgets', () => {
      store.getState().setBudget('Food', 5000);
      store.getState().setBudget('Transport', 2000);
      store.getState().resetBudgets();
      expect(store.getState().budgets).toEqual({});
    });

    it('resetLimits zeroes all budgets', () => {
      store.getState().setBudget('Food', 5000);
      store.getState().resetLimits();
      expect(store.getState().budgets).toEqual({ Food: 0 });
    });

    it('overwrites existing budget when setting same category', () => {
      store.getState().setBudget('Food', 3000);
      store.getState().setBudget('Food', 5000);
      expect(store.getState().budgets['Food']).toBe(5000);
    });

    it('removing non-existent budget does not throw', () => {
      expect(() => store.getState().removeBudget('NonExistent')).not.toThrow();
    });

    it('calculates total spend per category from transactions', () => {
      store
        .getState()
        .addTransactions([
          tx({ category: 'Food', amount: 500 }),
          tx({ category: 'Food', amount: 300 }),
          tx({ category: 'Transport', amount: 200 }),
        ]);

      const foodTxns = store.getState().transactions.filter(t => t.category === 'Food');
      const foodTotal = foodTxns.reduce((sum, t) => sum + t.amount, 0);
      expect(foodTotal).toBe(800);

      const transportTotal = store
        .getState()
        .transactions.filter(t => t.category === 'Transport')
        .reduce((sum, t) => sum + t.amount, 0);
      expect(transportTotal).toBe(200);

      store.getState().setBudget('Food', 1000);
      expect(foodTotal).toBeLessThanOrEqual(store.getState().budgets['Food']);
    });

    it('alerts when spend exceeds budget', () => {
      store.getState().setBudget('Food', 200);
      store
        .getState()
        .addTransactions([
          tx({ category: 'Food', amount: 150 }),
          tx({ category: 'Food', amount: 100 }),
        ]);

      const foodTotal = store
        .getState()
        .transactions.filter(t => t.category === 'Food')
        .reduce((sum, t) => sum + t.amount, 0);
      expect(foodTotal).toBeGreaterThan(store.getState().budgets['Food']);
    });

    it('supports multiple category budgets simultaneously', () => {
      store.getState().setBudget('Food', 5000);
      store.getState().setBudget('Transport', 2000);
      store.getState().setBudget('Entertainment', 1000);

      store
        .getState()
        .addTransactions([
          tx({ category: 'Food', amount: 2000 }),
          tx({ category: 'Transport', amount: 500 }),
          tx({ category: 'Entertainment', amount: 1500 }),
        ]);

      const totals: Record<string, number> = {};
      for (const t of store.getState().transactions) {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      }

      expect(totals['Food']).toBeLessThan(store.getState().budgets['Food']);
      expect(totals['Transport']).toBeLessThan(store.getState().budgets['Transport']);
      expect(totals['Entertainment']).toBeGreaterThan(store.getState().budgets['Entertainment']);
    });

    it('updates budget settings', () => {
      expect(store.getState().budgetSettings).toEqual({
        period: 'monthly',
        rolloverEnabled: false,
      });
      store.getState().updateBudgetSettings({ period: 'weekly' });
      expect(store.getState().budgetSettings.period).toBe('weekly');
    });

    it('toggleRollover flips the flag', () => {
      expect(store.getState().budgetSettings.rolloverEnabled).toBe(false);
      store.getState().toggleRollover();
      expect(store.getState().budgetSettings.rolloverEnabled).toBe(true);
      store.getState().toggleRollover();
      expect(store.getState().budgetSettings.rolloverEnabled).toBe(false);
    });
  });

  describe('transaction filtering and indexedData', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    it('builds byCategory index on addTransaction', () => {
      store.getState().addTransaction(tx({ category: 'Food', date: '2026-06-15T10:00:00Z' }));
      expect(store.getState().indexedData.byCategory['Food']).toHaveLength(1);
    });

    it('builds byMonth index on addTransaction', () => {
      store.getState().addTransaction(tx({ date: '2026-06-15T10:00:00Z' }));
      expect(store.getState().indexedData.byMonth['2026-06']).toHaveLength(1);
    });

    it('groups transactions by category in index', () => {
      store
        .getState()
        .addTransactions([
          tx({ category: 'Food', date: '2026-06-15T10:00:00Z' }),
          tx({ category: 'Food', date: '2026-06-16T10:00:00Z' }),
          tx({ category: 'Transport', date: '2026-06-17T10:00:00Z' }),
        ]);

      expect(store.getState().indexedData.byCategory['Food']).toHaveLength(2);
      expect(store.getState().indexedData.byCategory['Transport']).toHaveLength(1);
    });

    it('groups transactions by month in index', () => {
      store
        .getState()
        .addTransactions([
          tx({ date: '2026-06-15T10:00:00Z' }),
          tx({ date: '2026-06-20T10:00:00Z' }),
          tx({ date: '2026-07-01T10:00:00Z' }),
        ]);

      expect(store.getState().indexedData.byMonth['2026-06']).toHaveLength(2);
      expect(store.getState().indexedData.byMonth['2026-07']).toHaveLength(1);
    });

    it('removes from byCategory index on delete', () => {
      store
        .getState()
        .addTransaction(tx({ id: 'del-cat', category: 'Food', date: '2026-06-15T10:00:00Z' }));
      expect(store.getState().indexedData.byCategory['Food']).toHaveLength(1);

      store.getState().deleteTransaction('del-cat');
      expect(store.getState().indexedData.byCategory['Food']).toBeUndefined();
    });

    it('removes from byMonth index on delete', () => {
      store.getState().addTransaction(tx({ id: 'del-month', date: '2026-06-15T10:00:00Z' }));
      expect(store.getState().indexedData.byMonth['2026-06']).toHaveLength(1);

      store.getState().deleteTransaction('del-month');
      expect(store.getState().indexedData.byMonth['2026-06']).toBeUndefined();
    });

    it('updates byCategory index on category change', () => {
      store
        .getState()
        .addTransaction(tx({ id: 're-cat', category: 'Food', date: '2026-06-15T10:00:00Z' }));
      expect(store.getState().indexedData.byCategory['Food']).toHaveLength(1);

      store.getState().updateTransactionCategory('re-cat', 'Transport');
      expect(store.getState().indexedData.byCategory['Food']).toBeUndefined();
      expect(store.getState().indexedData.byCategory['Transport']).toHaveLength(1);
    });

    it('reindex rebuilds from scratch', () => {
      store
        .getState()
        .addTransactions([
          tx({ id: 'r1', category: 'Food', date: '2026-06-15T10:00:00Z' }),
          tx({ id: 'r2', category: 'Transport', date: '2026-07-01T10:00:00Z' }),
        ]);

      store.getState().reindex();
      expect(store.getState().indexedData.byCategory['Food']).toHaveLength(1);
      expect(store.getState().indexedData.byCategory['Transport']).toHaveLength(1);
      expect(store.getState().indexedData.byMonth['2026-06']).toHaveLength(1);
      expect(store.getState().indexedData.byMonth['2026-07']).toHaveLength(1);
    });

    it('filters soft-deleted transactions from reindex', () => {
      const t1 = tx({ id: 'active', category: 'Food', date: '2026-06-15T10:00:00Z' });
      const t2 = tx({ id: 'deleted', category: 'Transport', date: '2026-06-16T10:00:00Z' });
      store.getState().addTransactions([t1, t2]);
      store.getState().deleteTransaction('deleted');

      store.getState().reindex();
      expect(store.getState().indexedData.byCategory['Food']).toHaveLength(1);
      expect(store.getState().indexedData.byCategory['Transport']).toBeUndefined();
    });

    it('updates index when updateTransaction changes category', () => {
      const t = tx({ id: 'update-cat', category: 'Food', date: '2026-06-15T10:00:00Z' });
      store.getState().addTransaction(t);
      expect(store.getState().indexedData.byCategory['Food']).toHaveLength(1);

      store.getState().updateTransaction('update-cat', { category: 'Shopping' });
      expect(store.getState().indexedData.byCategory['Food']).toBeUndefined();
      expect(store.getState().indexedData.byCategory['Shopping']).toHaveLength(1);
    });

    it('updates index when updateTransaction changes date to different month', () => {
      const t = tx({ id: 'update-date', category: 'Food', date: '2026-06-15T10:00:00Z' });
      store.getState().addTransaction(t);
      expect(store.getState().indexedData.byMonth['2026-06']).toHaveLength(1);

      store.getState().updateTransaction('update-date', { date: '2026-07-01T10:00:00Z' });
      expect(store.getState().indexedData.byMonth['2026-06']).toBeUndefined();
      expect(store.getState().indexedData.byMonth['2026-07']).toHaveLength(1);
    });
  });

  describe('recurring transactions', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    it('adds a recurring transaction', () => {
      store.getState().addRecurringTransaction({
        id: 'rt-1',
        merchant: 'Rent',
        amount: 15000,
        category: 'Utilities',
        frequency: 'monthly',
        lastProcessed: null,
        nextOccurrence: '2026-03-01',
      });
      expect(store.getState().recurringTransactions).toHaveLength(1);
    });

    it('updates a recurring transaction', () => {
      store.getState().addRecurringTransaction({
        id: 'rt-1',
        merchant: 'Rent',
        amount: 15000,
        category: 'Utilities',
        frequency: 'monthly',
        lastProcessed: null,
        nextOccurrence: '2026-03-01',
      });
      store.getState().updateRecurringTransaction('rt-1', { amount: 16000 });
      expect(store.getState().recurringTransactions[0].amount).toBe(16000);
    });

    it('removes a recurring transaction', () => {
      store.getState().addRecurringTransaction({
        id: 'rt-1',
        merchant: 'Rent',
        amount: 15000,
        category: 'Utilities',
        frequency: 'monthly',
        lastProcessed: null,
        nextOccurrence: '2026-03-01',
      });
      store.getState().removeRecurringTransaction('rt-1');
      expect(store.getState().recurringTransactions).toHaveLength(0);
    });
  });

  describe('subscriptions', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    it('adds a subscription', () => {
      store.getState().addSubscription({
        merchant: 'Netflix',
        category: 'Subscriptions',
        avgAmount: 799,
        frequency: 'monthly',
        lastSeen: '2026-01-01',
        nextExpected: '2026-02-01',
        occurrences: 12,
        totalSpent: 9588,
      });
      expect(store.getState().subscriptions).toHaveLength(1);
    });

    it('updates a subscription', () => {
      store.getState().addSubscription({
        merchant: 'Netflix',
        category: 'Subscriptions',
        avgAmount: 799,
        frequency: 'monthly',
        lastSeen: '2026-01-01',
        nextExpected: '2026-02-01',
        occurrences: 12,
        totalSpent: 9588,
      });
      store.getState().updateSubscription('Netflix', { avgAmount: 999 });
      expect(store.getState().subscriptions[0].avgAmount).toBe(999);
    });

    it('deletes a subscription', () => {
      store.getState().addSubscription({
        merchant: 'Netflix',
        category: 'Subscriptions',
        avgAmount: 799,
        frequency: 'monthly',
        lastSeen: '2026-01-01',
        nextExpected: '2026-02-01',
        occurrences: 12,
        totalSpent: 9588,
      });
      store.getState().deleteSubscription('Netflix');
      expect(store.getState().subscriptions).toHaveLength(0);
    });
  });

  describe('razorpay keys', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    it('sets and clears razorpay keys', () => {
      store.getState().setRazorpayKeys({ keyId: 'rzp_test_123', keySecret: 'sk_test_456' });
      expect(store.getState().razorpayKeys).toEqual({
        keyId: 'rzp_test_123',
        keySecret: 'sk_test_456',
      });

      store.getState().setRazorpayKeys(null);
      expect(store.getState().razorpayKeys).toBeNull();
    });
  });

  describe('incremental reindex', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    it('addToIndex updates byCategory and byMonth', () => {
      const t = tx({ id: 'add-idx', category: 'Food', date: '2026-06-15T10:00:00Z' });
      store.getState().addToIndex(t);
      expect(store.getState().indexedData.byCategory['Food']).toHaveLength(1);
      expect(store.getState().indexedData.byMonth['2026-06']).toHaveLength(1);
    });

    it('removeFromIndex removes from byCategory and byMonth', () => {
      const t = tx({ id: 'rm-idx', category: 'Food', date: '2026-06-15T10:00:00Z' });
      store.getState().addToIndex(t);
      expect(store.getState().indexedData.byCategory['Food']).toHaveLength(1);

      store.getState().removeFromIndex('rm-idx', 'Food', '2026-06-15T10:00:00Z');
      expect(store.getState().indexedData.byCategory['Food']).toBeUndefined();
      expect(store.getState().indexedData.byMonth['2026-06']).toBeUndefined();
    });

    it('addToIndex appends to existing category index', () => {
      store.getState().addToIndex(tx({ id: 'a1', category: 'Food', date: '2026-06-15T10:00:00Z' }));
      store.getState().addToIndex(tx({ id: 'a2', category: 'Food', date: '2026-06-16T10:00:00Z' }));
      expect(store.getState().indexedData.byCategory['Food']).toHaveLength(2);
    });
  });

  describe('scheduled transactions', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
    });

    it('getScheduledTransactions returns only scheduled non-deleted', () => {
      const scheduled = tx({
        id: 'sch-1',
        status: 'scheduled' as const,
        date: '2026-07-01T10:00:00Z',
      });
      const posted = tx({ id: 'post-1', status: 'posted' as const });
      store.getState().addTransactions([scheduled, posted]);
      const result = store.getState().getScheduledTransactions();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('sch-1');
    });

    it('getScheduledTransactions excludes deleted scheduled', () => {
      const sch = tx({ id: 'sch-del', status: 'scheduled' as const, date: '2026-07-01T10:00:00Z' });
      store.getState().addTransaction(sch);
      store.getState().deleteTransaction('sch-del');
      expect(store.getState().getScheduledTransactions()).toHaveLength(0);
    });

    it('getPostedTransactions returns non-scheduled non-deleted', () => {
      const posted = tx({ id: 'p1', status: 'posted' as const });
      const scheduled = tx({ id: 's1', status: 'scheduled' as const });
      store.getState().addTransactions([posted, scheduled]);
      const result = store.getState().getPostedTransactions();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');
    });

    it('processScheduledTransactions converts past-due scheduled to posted', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString();

      const sch = tx({ id: 'past-due', status: 'scheduled' as const, date: yStr });
      const future = tx({
        id: 'future',
        status: 'scheduled' as const,
        date: '2099-12-31T10:00:00Z',
      });
      store.getState().addTransactions([sch, future]);

      store.getState().processScheduledTransactions();
      const updated = store.getState().transactions.find(t => t.id === 'past-due');
      expect(updated?.status).toBe('posted');
      const stillFuture = store.getState().transactions.find(t => t.id === 'future');
      expect(stillFuture?.status).toBe('scheduled');
    });

    it('processScheduledTransactions does nothing if no past-due', () => {
      const future = tx({ id: 'f1', status: 'scheduled' as const, date: '2099-12-31T10:00:00Z' });
      store.getState().addTransaction(future);
      store.getState().processScheduledTransactions();
      expect(store.getState().transactions[0].status).toBe('scheduled');
    });
  });
});
