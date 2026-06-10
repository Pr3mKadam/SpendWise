import { StateCreator } from 'zustand';
import { Transaction, Category, DefaultCategory, RecurringPattern, RecurringTransaction } from '@/types';
import { SpendWiseStore } from '@/store/index';
import { formatLocalYYYYMMDD } from '@/utils/date';
import { learnMerchant } from '@/core/merchantMemory';

const MAX_UNDO_STACK = 10;

export interface BudgetSettings {
  period: 'weekly' | 'biweekly' | 'monthly';
  rolloverEnabled: boolean;
}

export interface FinanceSlice {
  transactions: Transaction[];
  indexedData: {
    byCategory: Record<string, Transaction[]>;
    byMonth: Record<string, Transaction[]>;
  };
  budgets: Record<string, number>;
  budgetSettings: BudgetSettings;
  subscriptions: RecurringPattern[];
  recurringTransactions: RecurringTransaction[];
  razorpayKeys: { keyId: string; keySecret: string } | null;
  undoStack: Transaction[][];

  addTransaction: (tx: Transaction) => void;
  addTransactions: (txs: Transaction[]) => void;
  deleteTransaction: (id: string) => void;
  updateTransactionCategory: (id: string, newCategory: Category) => void;
  bulkUpdateTransactionsCategory: (ids: string[], newCategory: Category) => void;
  bulkDeleteTransactions: (ids: string[]) => void;
  bulkReassignCategory: (oldCategory: string, newCategory: string) => void;
  setBudget: (category: string, amount: number) => void;
  removeBudget: (category: string) => void;
  resetBudgets: () => void;
  resetLimits: () => void;
  updateBudgetSettings: (settings: Partial<BudgetSettings>) => void;
  toggleRollover: () => void;
  addSubscription: (sub: RecurringPattern) => void;
  updateSubscription: (merchant: string, data: Partial<RecurringPattern>) => void;
  deleteSubscription: (merchant: string) => void;
  addRecurringTransaction: (rt: RecurringTransaction) => void;
  updateRecurringTransaction: (id: string, data: Partial<RecurringTransaction>) => void;
  removeRecurringTransaction: (id: string) => void;
  setRazorpayKeys: (keys: { keyId: string; keySecret: string } | null) => void;
  reindex: () => void;
  addToIndex: (tx: Transaction) => void;
  removeFromIndex: (id: string, category: string, date: string) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  undo: () => boolean;
  canUndo: () => boolean;
  processScheduledTransactions: () => void;
  getScheduledTransactions: () => Transaction[];
  getPostedTransactions: () => Transaction[];
}

export const createFinanceSlice: StateCreator<
  SpendWiseStore,
  [['zustand/persist', unknown]],
  [],
  FinanceSlice
> = (set, get) => ({
  transactions: [],
  indexedData: { byCategory: {}, byMonth: {} },
  budgets: {},
  budgetSettings: { period: 'monthly', rolloverEnabled: false },
  subscriptions: [],
  recurringTransactions: [],
  razorpayKeys: null,
  undoStack: [],

  setRazorpayKeys: keys => set({ razorpayKeys: keys }),

  reindex: () => {
    const { transactions } = get();
    const byCategory: Record<string, Transaction[]> = {};
    const byMonth: Record<string, Transaction[]> = {};

    transactions.forEach(tx => {
      if (tx.deletedAt) return;
      if (!byCategory[tx.category]) byCategory[tx.category] = [];
      byCategory[tx.category].push(tx);

      const month = tx.date.substring(0, 7);
      if (!byMonth[month]) byMonth[month] = [];
      byMonth[month].push(tx);
    });

    set({ indexedData: { byCategory, byMonth } });
  },

  addToIndex: tx => {
    const { indexedData } = get();
    const byCategory = { ...indexedData.byCategory };
    const byMonth = { ...indexedData.byMonth };
    const ym = formatLocalYYYYMMDD(new Date(tx.date)).slice(0, 7);
    byCategory[tx.category] = [...(byCategory[tx.category] || []), tx];
    byMonth[ym] = [...(byMonth[ym] || []), tx];
    set({ indexedData: { byCategory, byMonth } });
  },

  removeFromIndex: (id, category, date) => {
    const { indexedData } = get();
    const byCategory = { ...indexedData.byCategory };
    const byMonth = { ...indexedData.byMonth };
    const ym = date.slice(0, 7);
    byCategory[category] = (byCategory[category] || []).filter(t => t.id !== id);
    if (byCategory[category].length === 0) delete byCategory[category];
    byMonth[ym] = (byMonth[ym] || []).filter(t => t.id !== id);
    if (byMonth[ym].length === 0) delete byMonth[ym];
    set({ indexedData: { byCategory, byMonth } });
  },

  addTransaction: tx => {
    const state = get();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((state as any).parentalState?.blockAddTransactions) return;

    const snapshot = [...state.transactions];
    const newStack = [...state.undoStack.slice(-(MAX_UNDO_STACK - 1)), snapshot];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((state as any).parentalState?.enabled || state.parentalState?.isTeenMode) {
      if (state.parentalState.restrictedCategories.includes(tx.category)) {
        state.requestTransactionApproval?.(tx);
        return;
      }
      if (state.parentalState.monthlyLimit !== null && tx.type === 'debit') {
        const currentMonthStr = new Date().toISOString().substring(0, 7);
        const monthlySpent = state.transactions
          .filter(t => t.type === 'debit' && t.date.startsWith(currentMonthStr))
          .reduce((acc, t) => acc + t.amount, 0);

        if (monthlySpent + tx.amount > state.parentalState.monthlyLimit) {
          state.requestTransactionApproval?.(tx);
          return;
        }
      }
    }
    set(state => ({ transactions: [tx, ...state.transactions], undoStack: newStack }));
    get().addToIndex(tx);
  },

  addTransactions: txs => {
    const state = get();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((state as any).parentalState?.blockAddTransactions) return;
    set({ transactions: [...txs, ...state.transactions] });
    get().reindex();
  },

  deleteTransaction: id => {
    const state = get();
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    set(state => ({
      transactions: state.transactions.map(t =>
        t.id === id ? { ...t, deletedAt: new Date().toISOString() } : t
      ),
    }));
    get().removeFromIndex(id, tx.category, tx.date);
    get().reindex();
  },

  updateTransactionCategory: (id, newCategory) => {
    const state = get();
    const tx = state.transactions.find(t => t.id === id);
    const snapshot = [...state.transactions];
    const newStack = [...state.undoStack.slice(-(MAX_UNDO_STACK - 1)), snapshot];

    set(state => ({
      transactions: state.transactions.map(t =>
        t.id === id ? { ...t, category: newCategory } : t
      ),
      undoStack: newStack,
    }));
    get().reindex();

    if (tx) {
      learnMerchant(tx.merchant, newCategory as DefaultCategory);
    }
  },

  updateTransaction: (id, data) => {
    const state = get();
    const snapshot = [...state.transactions];
    const newStack = [...state.undoStack.slice(-(MAX_UNDO_STACK - 1)), snapshot];

    set(state => ({
      transactions: state.transactions.map(t =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
      ),
      undoStack: newStack,
    }));
    get().reindex();
  },

  bulkUpdateTransactionsCategory: (ids, newCategory) => {
    const idSet = new Set(ids);
    set(state => ({
      transactions: state.transactions.map(t =>
        idSet.has(t.id) ? { ...t, category: newCategory } : t
      ),
    }));
    get().reindex();
  },

  bulkDeleteTransactions: ids => {
    const idSet = new Set(ids);
    const now = new Date().toISOString();
    set(state => ({
      transactions: state.transactions.map(t =>
        idSet.has(t.id) ? { ...t, deletedAt: now } : t
      ),
    }));
    get().reindex();
  },

  bulkReassignCategory: (oldCategory, newCategory) => {
    const state = get();
    const merchants = [
      ...new Set(
        state.transactions
          .filter(t => t.category === oldCategory)
          .map(t => t.merchant.toLowerCase())
      ),
    ];

    set(state => ({
      transactions: state.transactions.map(t =>
        t.category === oldCategory ? { ...t, category: newCategory as Category } : t
      ),
    }));
    get().reindex();

    merchants.forEach(merchant => {
      learnMerchant(merchant, newCategory as DefaultCategory);
    });
  },

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return false;
    const snapshot = undoStack[undoStack.length - 1];
    set({
      transactions: snapshot,
      undoStack: undoStack.slice(0, -1),
    });
    get().reindex();
    return true;
  },

  canUndo: () => {
    return get().undoStack.length > 0;
  },

  processScheduledTransactions: () => {
    const { transactions } = get();
    const today = formatLocalYYYYMMDD(new Date());
    let changed = false;
    const updated = transactions.map(t => {
      if (t.status === 'scheduled' && t.date <= today) {
        changed = true;
        return { ...t, status: 'posted' as const };
      }
      return t;
    });
    if (changed) {
      set({ transactions: updated });
      get().reindex();
    }
  },

  getScheduledTransactions: () => {
    return get().transactions.filter(t => t.status === 'scheduled' && !t.deletedAt);
  },

  getPostedTransactions: () => {
    return get().transactions.filter(t => t.status !== 'scheduled' && !t.deletedAt);
  },

  setBudget: (category, amount) =>
    set(state => ({
      budgets: { ...state.budgets, [category]: amount },
    })),

  removeBudget: category =>
    set(state => {
      const newBudgets = { ...state.budgets };
      delete newBudgets[category];
      return { budgets: newBudgets };
    }),

  resetBudgets: () => set({ budgets: {} }),

  resetLimits: () =>
    set(state => {
      const resetB: Record<string, number> = {};
      Object.keys(state.budgets).forEach(cat => {
        resetB[cat] = 0;
      });
      return { budgets: resetB };
    }),

  updateBudgetSettings: settings =>
    set(state => ({
      budgetSettings: {
        ...(state.budgetSettings || { period: 'monthly', rolloverEnabled: false }),
        ...settings,
      },
    })),

  toggleRollover: () =>
    set(state => ({
      budgetSettings: {
        ...(state.budgetSettings || { period: 'monthly', rolloverEnabled: false }),
        rolloverEnabled: !(state.budgetSettings?.rolloverEnabled ?? false),
      },
    })),

  addSubscription: sub =>
    set(state => ({
      subscriptions: [...state.subscriptions, sub],
    })),

  updateSubscription: (merchant, data) =>
    set(state => ({
      subscriptions: state.subscriptions.map(s =>
        s.merchant === merchant ? { ...s, ...data } : s
      ),
    })),

  deleteSubscription: merchant =>
    set(state => ({
      subscriptions: state.subscriptions.filter(s => s.merchant !== merchant),
    })),

  addRecurringTransaction: rt =>
    set(state => ({
      recurringTransactions: [...state.recurringTransactions, rt],
    })),

  updateRecurringTransaction: (id, data) =>
    set(state => ({
      recurringTransactions: state.recurringTransactions.map(rt =>
        rt.id === id ? { ...rt, ...data } : rt
      ),
    })),

  removeRecurringTransaction: id =>
    set(state => ({
      recurringTransactions: state.recurringTransactions.filter(rt => rt.id !== id),
    })),
});
