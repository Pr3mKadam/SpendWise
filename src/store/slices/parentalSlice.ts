import { StateCreator } from 'zustand';
import { Transaction, Category } from '../../types';
import { SpendWiseStore, ParentalControlState } from '../index';

export interface ParentalSlice {
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
}

export const createParentalSlice: StateCreator<SpendWiseStore, [["zustand/persist", unknown]], [], ParentalSlice> = (set, get) => ({
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
});
