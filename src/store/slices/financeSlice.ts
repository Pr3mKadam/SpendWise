import { StateCreator } from 'zustand';
import { Transaction, Category, RecurringPattern, RecurringTransaction } from '../../types';
import { SpendWiseStore } from '../index';

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
  razorpayKeys: { keyId: string, keySecret: string } | null;

  addTransaction: (tx: Transaction) => void;
  addTransactions: (txs: Transaction[]) => void;
  deleteTransaction: (id: string) => void;
  updateTransactionCategory: (id: string, newCategory: Category) => void;
  bulkUpdateTransactionsCategory: (ids: string[], newCategory: Category) => void;
  bulkDeleteTransactions: (ids: string[]) => void;
  bulkReassignCategory: (oldCategory: string, newCategory: string) => void;
  setBudget: (category: string, amount: number) => void;
  removeBudget: (category: string) => void;
  updateBudgetSettings: (settings: Partial<BudgetSettings>) => void;
  addSubscription: (sub: RecurringPattern) => void;
  updateSubscription: (merchant: string, data: Partial<RecurringPattern>) => void;
  deleteSubscription: (merchant: string) => void;
  addRecurringTransaction: (rt: RecurringTransaction) => void;
  updateRecurringTransaction: (id: string, data: Partial<RecurringTransaction>) => void;
  removeRecurringTransaction: (id: string) => void;
  setRazorpayKeys: (keys: { keyId: string, keySecret: string } | null) => void;
  reindex: () => void;
}

export const createFinanceSlice: StateCreator<SpendWiseStore, [["zustand/persist", unknown]], [], FinanceSlice> = (set, get) => ({
  transactions: [],
  indexedData: { byCategory: {}, byMonth: {} },
  budgets: {},
  budgetSettings: { period: 'monthly', rolloverEnabled: false },
  subscriptions: [],
  recurringTransactions: [],
  razorpayKeys: null,

  setRazorpayKeys: (keys) => set({ razorpayKeys: keys }),

  reindex: () => {
    const { transactions } = get();
    const byCategory: Record<string, Transaction[]> = {};
    const byMonth: Record<string, Transaction[]> = {};

    transactions.forEach(tx => {
      if (!byCategory[tx.category]) byCategory[tx.category] = [];
      byCategory[tx.category].push(tx);

      const month = tx.date.substring(0, 7);
      if (!byMonth[month]) byMonth[month] = [];
      byMonth[month].push(tx);
    });

    set({ indexedData: { byCategory, byMonth } });
  },

  addTransaction: (tx) => {
    const state = get();
    // Parental control logic is moved to combined store or handled via actions
    if (state.parentalState?.isTeenMode) {
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
    set((state) => ({ transactions: [tx, ...state.transactions] }));
    get().reindex();
  },

  addTransactions: (txs) => {
    set((state) => ({ transactions: [...txs, ...state.transactions] }));
    get().reindex();
  },

  deleteTransaction: (id) => {
    set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) }));
    get().reindex();
  },

  updateTransactionCategory: (id, newCategory) => {
    set((state) => ({
      transactions: state.transactions.map(t => t.id === id ? { ...t, category: newCategory } : t)
    }));
    get().reindex();
  },

  bulkUpdateTransactionsCategory: (ids, newCategory) => {
    const idSet = new Set(ids);
    set((state) => ({
      transactions: state.transactions.map(t => idSet.has(t.id) ? { ...t, category: newCategory } : t)
    }));
    get().reindex();
  },

  bulkDeleteTransactions: (ids) => {
    const idSet = new Set(ids);
    set((state) => ({
      transactions: state.transactions.filter(t => !idSet.has(t.id))
    }));
    get().reindex();
  },

  bulkReassignCategory: (oldCategory, newCategory) => {
    set((state) => ({
      transactions: state.transactions.map(t => t.category === oldCategory ? { ...t, category: newCategory as Category } : t)
    }));
    get().reindex();
  },

  setBudget: (category, amount) => set((state) => ({
    budgets: { ...state.budgets, [category]: amount }
  })),

  removeBudget: (category) => set((state) => {
    const newBudgets = { ...state.budgets };
    delete newBudgets[category];
    return { budgets: newBudgets };
  }),

  updateBudgetSettings: (settings) => set((state) => ({
    budgetSettings: { 
      ...(state.budgetSettings || { period: 'monthly', rolloverEnabled: false }), 
      ...settings 
    }
  })),

  addSubscription: (sub) => set((state) => ({
    subscriptions: [...state.subscriptions, sub]
  })),

  updateSubscription: (merchant, data) => set((state) => ({
    subscriptions: state.subscriptions.map(s => s.merchant === merchant ? { ...s, ...data } : s)
  })),

  deleteSubscription: (merchant) => set((state) => ({
    subscriptions: state.subscriptions.filter(s => s.merchant !== merchant)
  })),

  addRecurringTransaction: (rt) => set((state) => ({
    recurringTransactions: [...state.recurringTransactions, rt]
  })),

  updateRecurringTransaction: (id, data) => set((state) => ({
    recurringTransactions: state.recurringTransactions.map(rt => rt.id === id ? { ...rt, ...data } : rt)
  })),

  removeRecurringTransaction: (id) => set((state) => ({
    recurringTransactions: state.recurringTransactions.filter(rt => rt.id !== id)
  })),
});
