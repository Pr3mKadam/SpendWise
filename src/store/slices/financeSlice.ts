import { StateCreator } from 'zustand';
import { Transaction, Category, RecurringPattern } from '../../types';
import { SpendWiseStore } from '../index';

export interface FinanceSlice {
  transactions: Transaction[];
  indexedData: {
    byCategory: Record<string, Transaction[]>;
    byMonth: Record<string, Transaction[]>;
  };
  budgets: Record<string, number>;
  subscriptions: RecurringPattern[];
  
  addTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateTransactionCategory: (id: string, newCategory: Category) => void;
  bulkReassignCategory: (oldCategory: string, newCategory: string) => void;
  setBudget: (category: string, amount: number) => void;
  removeBudget: (category: string) => void;
  addSubscription: (sub: RecurringPattern) => void;
  updateSubscription: (merchant: string, data: Partial<RecurringPattern>) => void;
  deleteSubscription: (merchant: string) => void;
  reindex: () => void;
}

export const createFinanceSlice: StateCreator<SpendWiseStore, [["zustand/persist", unknown]], [], FinanceSlice> = (set, get) => ({
  transactions: [],
  indexedData: { byCategory: {}, byMonth: {} },
  budgets: {},
  subscriptions: [],

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
    if (state.parentalState.isTeenMode) {
      if (state.parentalState.restrictedCategories.includes(tx.category)) {
        state.requestTransactionApproval(tx);
        return;
      }
      if (state.parentalState.monthlyLimit !== null && tx.type === 'debit') {
        const currentMonthStr = new Date().toISOString().substring(0, 7);
        const monthlySpent = state.transactions
          .filter(t => t.type === 'debit' && t.date.startsWith(currentMonthStr))
          .reduce((acc, t) => acc + t.amount, 0);
        
        if (monthlySpent + tx.amount > state.parentalState.monthlyLimit) {
          state.requestTransactionApproval(tx);
          return;
        }
      }
    }
    set((state) => ({ transactions: [tx, ...state.transactions] }));
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

  addSubscription: (sub) => set((state) => ({
    subscriptions: [...state.subscriptions, sub]
  })),

  updateSubscription: (merchant, data) => set((state) => ({
    subscriptions: state.subscriptions.map(s => s.merchant === merchant ? { ...s, ...data } : s)
  })),

  deleteSubscription: (merchant) => set((state) => ({
    subscriptions: state.subscriptions.filter(s => s.merchant !== merchant)
  })),
});
