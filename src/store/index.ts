import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Transaction, Category } from '../types';
import { db } from '../db/db';
import { createFinanceSlice, FinanceSlice } from './slices/financeSlice';
import { createPortfolioSlice, PortfolioSlice } from './slices/portfolioSlice';
import { createGamificationSlice, GamificationSlice } from './slices/gamificationSlice';
import { createParentalSlice, ParentalSlice } from './slices/parentalSlice';

// Custom storage for IndexedDB using Dexie
const dexieStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const record = await db.keyval.get(name);
    return record ? record.value : null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await db.keyval.put({ key: name, value });
  },
  removeItem: async (name: string): Promise<void> => {
    await db.keyval.delete(name);
  },
};

export interface ParentalControlState {
  enabled: boolean;
  isTeenMode: boolean;
  ageGroup: 'child' | 'teen' | 'adult';
  parentPin: string | null;
  monthlyLimit: number | null;
  restrictedCategories: Category[];
  pendingTransactions: Transaction[];
  hideBalances: boolean;
  hideAnalytics: boolean;
  blockAddTransactions: boolean;
  sessionUnlocked: boolean;
  requireApproval: boolean;
}

export type SpendWiseStore = FinanceSlice & PortfolioSlice & GamificationSlice & ParentalSlice & {
  resetData: () => void;
  restoreBackup: (data: any) => void;
};

export const useStore = create<SpendWiseStore>()(
  persist(
    (set, get, api) => ({
      ...createFinanceSlice(set, get, api),
      ...createPortfolioSlice(set, get, api),
      ...createGamificationSlice(set, get, api),
      ...createParentalSlice(set, get, api),

      resetData: () => {
        set({ 
          transactions: [], 
          indexedData: { byCategory: {}, byMonth: {} },
          assets: [], 
          liabilities: [], 
          parentalState: { 
            enabled: false,
            isTeenMode: false, 
            ageGroup: 'teen',
            parentPin: null, 
            monthlyLimit: null, 
            restrictedCategories: [], 
            pendingTransactions: [],
            hideBalances: false,
            hideAnalytics: false,
            blockAddTransactions: false,
            sessionUnlocked: false,
            requireApproval: false,
          } 
        });
      },

      restoreBackup: (data) => {
        set({
          transactions: data.transactions || [],
          budgets: data.budgets || {},
          quests: data.quests || [],
          parentalState: data.parentalState || {},
          assets: data.assets || [],
          liabilities: data.liabilities || [],
          subscriptions: data.subscriptions || [],
        });
        get().reindex();
      }
    }),
    {
      name: 'spendwise-global-store',
      storage: createJSONStorage(() => dexieStorage),
    }
  )
);
