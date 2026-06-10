import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand/vanilla';
import { createFinanceSlice, FinanceSlice } from './financeSlice';
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
  describe('basic CRUD', () => {
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
      expect(store.getState().transactions).toHaveLength(1);

      store.getState().deleteTransaction('delete-me');
      expect(store.getState().transactions).toHaveLength(1); // soft delete — still in array
      expect(store.getState().transactions[0].deletedAt).toBeDefined(); // but marked deleted
    });

    it('updates transaction category', () => {
      const t = tx({ id: 'cat-test', category: 'Food' });
      store.getState().addTransaction(t);
      store.getState().updateTransactionCategory('cat-test', 'Transport');
      expect(store.getState().transactions[0].category).toBe('Transport');
    });

    it('bulk deletes transactions (soft delete)', () => {
      const t1 = tx({ id: 'bulk-1' });
      const t2 = tx({ id: 'bulk-2' });
      const t3 = tx({ id: 'keep-me' });
      store.getState().addTransactions([t1, t2, t3]);
      expect(store.getState().transactions).toHaveLength(3);

      store.getState().bulkDeleteTransactions(['bulk-1', 'bulk-2']);
      expect(store.getState().transactions).toHaveLength(3); // soft delete — still in array
      expect(store.getState().transactions.find(t => t.id === 'bulk-1')?.deletedAt).toBeDefined();
      expect(store.getState().transactions.find(t => t.id === 'bulk-2')?.deletedAt).toBeDefined();
      expect(
        store.getState().transactions.find(t => t.id === 'keep-me')?.deletedAt
      ).toBeUndefined();
    });

    it('bulk updates transaction categories', () => {
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

      store.getState().bulkReassignCategory('Food', 'Groceries');
      expect(store.getState().transactions.find(t => t.id === 'r1')?.category).toBe('Groceries');
      expect(store.getState().transactions.find(t => t.id === 'r2')?.category).toBe('Groceries');
      expect(store.getState().transactions.find(t => t.id === 'r3')?.category).toBe('Shopping');
    });

    it('adds multiple transactions at once', () => {
      const t1 = tx();
      const t2 = tx();
      store.getState().addTransactions([t1, t2]);
      expect(store.getState().transactions).toHaveLength(2);
    });
  });

  describe('reindex', () => {
    it('builds byCategory and byMonth indexes', () => {
      const store = createTestStore();
      const jan = tx({ id: 'jan-tx', date: '2026-01-15T10:00:00Z', category: 'Food' });
      const feb = tx({ id: 'feb-tx', date: '2026-02-15T10:00:00Z', category: 'Food' });
      const shop = tx({ id: 'shop-tx', date: '2026-01-20T10:00:00Z', category: 'Shopping' });

      store.getState().addTransactions([jan, feb, shop]);

      const idx = store.getState().indexedData;
      expect(idx.byCategory['Food']).toHaveLength(2);
      expect(idx.byCategory['Shopping']).toHaveLength(1);
      expect(idx.byMonth['2026-01']).toHaveLength(2);
      expect(idx.byMonth['2026-02']).toHaveLength(1);
    });
  });

  describe('parental controls', () => {
    it('blocks addTransaction when blockAddTransactions is true', () => {
      const store = createTestStore({ enabled: true, blockAddTransactions: true });
      store.getState().addTransaction(tx({ id: 'blocked' }));
      expect(store.getState().transactions).toHaveLength(0);
    });

    it('blocks addTransactions when blockAddTransactions is true', () => {
      const store = createTestStore({ enabled: true, blockAddTransactions: true });
      store.getState().addTransactions([tx({ id: 'b1' }), tx({ id: 'b2' })]);
      expect(store.getState().transactions).toHaveLength(0);
    });

    it('diverts restricted-category transactions to approval', () => {
      const store = createTestStore({
        enabled: true,
        restrictedCategories: ['Entertainment'],
      });
      const t = tx({ id: 'restricted', category: 'Entertainment' });
      store.getState().addTransaction(t);

      expect(store.getState().transactions).toHaveLength(0);
      expect(store.getState().getApprovalRequests()).toHaveLength(1);
      expect(store.getState().getApprovalRequests()[0].id).toBe('restricted');
    });
  });

  describe('budgets', () => {
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
      store.getState().setBudget('Shopping', 2000);
      store.getState().resetBudgets();
      expect(store.getState().budgets).toEqual({});
    });

    it('updates budget settings', () => {
      store.getState().updateBudgetSettings({ period: 'weekly' });
      expect(store.getState().budgetSettings.period).toBe('weekly');
    });

    it('toggles rollover', () => {
      expect(store.getState().budgetSettings.rolloverEnabled).toBe(false);
      store.getState().toggleRollover();
      expect(store.getState().budgetSettings.rolloverEnabled).toBe(true);
      store.getState().toggleRollover();
      expect(store.getState().budgetSettings.rolloverEnabled).toBe(false);
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
      expect(store.getState().subscriptions[0].merchant).toBe('Netflix');
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

  describe('razorpay key id', () => {
    it('sets and clears razorpay keys', () => {
      const store = createTestStore();
      store.getState().setRazorpayKeys({ keyId: 'rzp_test', keySecret: 'sk_test' });
      expect(store.getState().razorpayKeys).toEqual({ keyId: 'rzp_test', keySecret: 'sk_test' });

      store.getState().setRazorpayKeys(null);
      expect(store.getState().razorpayKeys).toBeNull();
    });
  });

  describe('undo stack', () => {
    it('pushes snapshot on addTransaction', () => {
      const store = createTestStore();
      store.getState().addTransaction(tx({ id: 't1' }));
      expect(store.getState().undoStack).toHaveLength(1);
    });

    it('undo restores previous state', () => {
      const store = createTestStore();
      store.getState().addTransaction(tx({ id: 't1' }));
      store.getState().addTransaction(tx({ id: 't2' }));
      expect(store.getState().transactions).toHaveLength(2);
      const ok = store.getState().undo();
      expect(ok).toBe(true);
      expect(store.getState().transactions).toHaveLength(1);
      expect(store.getState().transactions[0].id).toBe('t1');
    });

    it('canUndo returns false when stack is empty', () => {
      const store = createTestStore();
      expect(store.getState().canUndo()).toBe(false);
    });

    it('canUndo returns true when stack has entries', () => {
      const store = createTestStore();
      store.getState().addTransaction(tx({ id: 't1' }));
      expect(store.getState().canUndo()).toBe(true);
    });

    it('caps undo stack at 10', () => {
      const store = createTestStore();
      for (let i = 0; i < 15; i++) {
        store.getState().addTransaction(tx({ id: `t${i}` }));
      }
      expect(store.getState().undoStack.length).toBeLessThanOrEqual(10);
    });
  });

  describe('incremental reindex', () => {
    it('addToIndex adds transaction to byCategory', () => {
      const store = createTestStore();
      const t = tx({ id: 't1', category: 'Food', date: '2026-06-01' });
      store.getState().addToIndex(t);
      const cats = store.getState().indexedData.byCategory['Food'];
      expect(cats).toBeDefined();
      expect(cats).toHaveLength(1);
      expect(cats[0].id).toBe('t1');
    });

    it('addToIndex adds transaction to byMonth', () => {
      const store = createTestStore();
      const t = tx({ id: 't1', date: '2026-06-15' });
      store.getState().addToIndex(t);
      expect(store.getState().indexedData.byMonth['2026-06']).toHaveLength(1);
    });

    it('removeFromIndex removes transaction from indices', () => {
      const store = createTestStore();
      const t = tx({ id: 't1', category: 'Food', date: '2026-06-01' });
      store.getState().addToIndex(t);
      store.getState().removeFromIndex('t1', 'Food', '2026-06-01');
      expect(store.getState().indexedData.byCategory['Food']).toBeUndefined();
      expect(store.getState().indexedData.byMonth['2026-06']).toBeUndefined();
    });
  });

  describe('scheduled transactions', () => {
    it('getScheduledTransactions returns future-dated txns', () => {
      const store = createTestStore();
      store
        .getState()
        .addTransaction(tx({ id: 'future', status: 'scheduled', date: '2099-01-01' }));
      store.getState().addTransaction(tx({ id: 'now', status: 'posted', date: '2026-01-01' }));
      const scheduled = store.getState().getScheduledTransactions();
      expect(scheduled).toHaveLength(1);
      expect(scheduled[0].id).toBe('future');
    });

    it('processScheduledTransactions moves due txns to posted', () => {
      const store = createTestStore();
      store.getState().addTransaction(tx({ id: 'due', status: 'scheduled', date: '2020-01-01' }));
      store.getState().processScheduledTransactions();
      const posted = store.getState().getPostedTransactions();
      expect(posted).toHaveLength(1);
      expect(posted[0].id).toBe('due');
    });

    it('getPostedTransactions excludes scheduled txns', () => {
      const store = createTestStore();
      store
        .getState()
        .addTransaction(tx({ id: 'future', status: 'scheduled', date: '2099-01-01' }));
      const posted = store.getState().getPostedTransactions();
      expect(posted).toHaveLength(0);
    });
  });
});
