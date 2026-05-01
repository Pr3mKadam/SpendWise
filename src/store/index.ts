import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { Transaction, Category, AssetEntry, LiabilityEntry, RecurringPattern, SavingsGoal } from '../types';

// Custom storage for IndexedDB
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: string;
  category?: Category;
  targetAmount?: number;
  progress: number; // 0-100
  completed: boolean;
  type: 'saving' | 'spending' | 'habit';
  icon: string;
}

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

export interface SpendWiseStore {
  // Finance State
  transactions: Transaction[];
  indexedData: {
    byCategory: Record<string, Transaction[]>;
    byMonth: Record<string, Transaction[]>;
  };
  addTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateTransactionCategory: (id: string, newCategory: Category) => void;
  bulkReassignCategory: (oldCategory: string, newCategory: string) => void;
  resetData: () => void;
  reindex: () => void;

  // Portfolio State
  assets: AssetEntry[];
  liabilities: LiabilityEntry[];
  addAsset: (asset: Omit<AssetEntry, 'id' | 'lastUpdated'>) => void;
  updateAsset: (id: string, data: Partial<AssetEntry>) => void;
  deleteAsset: (id: string) => void;
  addLiability: (liability: Omit<LiabilityEntry, 'id' | 'lastUpdated'>) => void;
  updateLiability: (id: string, data: Partial<LiabilityEntry>) => void;
  deleteLiability: (id: string) => void;

  // Phase 2: Budgets & Subscriptions
  budgets: Record<string, number>;
  setBudget: (category: string, amount: number) => void;
  removeBudget: (category: string) => void;

  subscriptions: RecurringPattern[];
  addSubscription: (sub: RecurringPattern) => void;
  updateSubscription: (merchant: string, data: Partial<RecurringPattern>) => void;
  deleteSubscription: (merchant: string) => void;

  // Phase 2: Gamification (Quests)
  quests: Quest[];
  updateQuestProgress: (id: string, progress: number) => void;
  completeQuest: (id: string) => void;
  resetQuests: () => void;

  // Parental Control State
  parentalState: ParentalControlState;
  setTeenMode: (enabled: boolean, pin?: string) => void;
  setMonthlyLimit: (limit: number | null) => void;
  toggleRestrictedCategory: (category: Category) => void;
  updateParentalSettings: (updates: Partial<ParentalControlState>) => void;
  setupPin: (pin: string) => void;
  removePin: () => void;
  unlockSession: () => void;
  lockSession: () => void;
  requestTransactionApproval: (tx: Transaction) => void;
  approveTransaction: (id: string) => void;
  denyTransaction: (id: string) => void;
  verifyPin: (pin: string) => boolean;
  restoreBackup: (data: any) => void;
}

export const useStore = create<SpendWiseStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      indexedData: { byCategory: {}, byMonth: {} },
      reindex: () => {
        const state = get();
        const byCategory: Record<string, Transaction[]> = {};
        const byMonth: Record<string, Transaction[]> = {};
        
        state.transactions.forEach(tx => {
          // Category index
          if (!byCategory[tx.category]) byCategory[tx.category] = [];
          byCategory[tx.category].push(tx);
          
          // Month index (YYYY-MM)
          const month = tx.date.substring(0, 7);
          if (!byMonth[month]) byMonth[month] = [];
          byMonth[month].push(tx);
        });
        
        set({ indexedData: { byCategory, byMonth } });
      },
      addTransaction: (tx) => {
        const state = get();
        // Check Parental Controls
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
        set({ transactions: [tx, ...state.transactions] });
        state.reindex();
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

      assets: [],
      liabilities: [],
      addAsset: (asset) => set((state) => ({ assets: [...state.assets, { ...asset, id: `a-${Date.now()}`, lastUpdated: new Date().toISOString().split('T')[0] }] })),
      updateAsset: (id, data) => set((state) => ({ assets: state.assets.map(a => a.id === id ? { ...a, ...data, lastUpdated: new Date().toISOString().split('T')[0] } : a) })),
      deleteAsset: (id) => set((state) => ({ assets: state.assets.filter(a => a.id !== id) })),
      addLiability: (liability) => set((state) => ({ liabilities: [...state.liabilities, { ...liability, id: `l-${Date.now()}`, lastUpdated: new Date().toISOString().split('T')[0] }] })),
      updateLiability: (id, data) => set((state) => ({ liabilities: state.liabilities.map(l => l.id === id ? { ...l, ...data, lastUpdated: new Date().toISOString().split('T')[0] } : l) })),
      deleteLiability: (id) => set((state) => ({ liabilities: state.liabilities.filter(l => l.id !== id) })),

      // Phase 2 implementations
      budgets: {},
      setBudget: (category, amount) => set((state) => ({
        budgets: { ...state.budgets, [category]: amount }
      })),
      removeBudget: (category) => set((state) => {
        const newBudgets = { ...state.budgets };
        delete newBudgets[category];
        return { budgets: newBudgets };
      }),

      subscriptions: [],
      addSubscription: (sub) => set((state) => ({
        subscriptions: [...state.subscriptions, sub]
      })),
      updateSubscription: (merchant, data) => set((state) => ({
        subscriptions: state.subscriptions.map(s => s.merchant === merchant ? { ...s, ...data } : s)
      })),
      deleteSubscription: (merchant) => set((state) => ({
        subscriptions: state.subscriptions.filter(s => s.merchant !== merchant)
      })),

      quests: [
        {
          id: 'q1',
          title: 'Coffee Break',
          description: 'Spend less than ₹200 on coffee this week.',
          reward: '+20 XP',
          category: 'Food',
          targetAmount: 200,
          progress: 0,
          completed: false,
          type: 'spending',
          icon: '☕'
        },
        {
          id: 'q2',
          title: 'Savings Sprint',
          description: 'Save 20% of your income this month.',
          reward: 'Golden Leaf',
          progress: 0,
          completed: false,
          type: 'saving',
          icon: '💰'
        }
      ],
      updateQuestProgress: (id, progress) => set((state) => ({
        quests: state.quests.map(q => q.id === id ? { ...q, progress } : q)
      })),
      completeQuest: (id) => set((state) => ({
        quests: state.quests.map(q => q.id === id ? { ...q, completed: true, progress: 100 } : q)
      })),
      resetQuests: () => set((state) => ({
        quests: state.quests.map(q => ({ ...q, completed: false, progress: 0 }))
      })),

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
      },
      setTeenMode: (enabled, pin) => set((state) => ({
        parentalState: { ...state.parentalState, isTeenMode: enabled, parentPin: pin ?? state.parentalState.parentPin }
      })),
      setMonthlyLimit: (limit) => set((state) => ({
        parentalState: { ...state.parentalState, monthlyLimit: limit }
      })),
      toggleRestrictedCategory: (category) => set((state) => {
        const restricted = state.parentalState.restrictedCategories;
        const newRestricted = restricted.includes(category) 
          ? restricted.filter(c => c !== category)
          : [...restricted, category];
        return { parentalState: { ...state.parentalState, restrictedCategories: newRestricted } };
      }),
      updateParentalSettings: (updates) => set((state) => ({
        parentalState: { ...state.parentalState, ...updates }
      })),
      setupPin: (pin) => set((state) => ({
        parentalState: { 
          ...state.parentalState, 
          enabled: true, 
          parentPin: pin, 
          isTeenMode: true, 
          sessionUnlocked: true 
        }
      })),
      removePin: () => set((state) => ({
        parentalState: { 
          ...state.parentalState, 
          enabled: false, 
          parentPin: null, 
          isTeenMode: false, 
          sessionUnlocked: false 
        }
      })),
      unlockSession: () => set((state) => ({
        parentalState: { ...state.parentalState, sessionUnlocked: true, isTeenMode: false }
      })),
      lockSession: () => set((state) => ({
        parentalState: { ...state.parentalState, sessionUnlocked: false, isTeenMode: state.parentalState.enabled ? true : state.parentalState.isTeenMode }
      })),
      requestTransactionApproval: (tx) => set((state) => ({
        parentalState: { ...state.parentalState, pendingTransactions: [tx, ...state.parentalState.pendingTransactions] }
      })),
      approveTransaction: (id) => set((state) => {
        const tx = state.parentalState.pendingTransactions.find(t => t.id === id);
        if (!tx) return state;
        return {
          transactions: [tx, ...state.transactions],
          parentalState: { ...state.parentalState, pendingTransactions: state.parentalState.pendingTransactions.filter(t => t.id !== id) }
        };
      }),
      denyTransaction: (id) => set((state) => ({
        parentalState: { ...state.parentalState, pendingTransactions: state.parentalState.pendingTransactions.filter(t => t.id !== id) }
      })),
      verifyPin: (pin) => {
        const state = get();
        return state.parentalState.parentPin === pin;
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
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
