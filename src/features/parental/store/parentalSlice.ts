import { StateCreator } from 'zustand';
import { Transaction, Category } from '@/types';
import { SpendWiseStore, ParentalControlState } from '@/store/index';
import { hashPin, verifyPinHash } from '@/core/security';

export interface ParentalSlice {
  parentalState: ParentalControlState;
  setTeenMode: (enabled: boolean, pin?: string) => void;
  setMonthlyLimit: (limit: number | null) => void;
  toggleRestrictedCategory: (category: Category) => void;
  updateParentalSettings: (updates: Partial<ParentalControlState>) => void;
  removePin: () => void;
  unlockSession: () => void;
  lockSession: () => void;
  requestTransactionApproval: (tx: Transaction) => void;
  approveTransaction: (id: string) => void;
  denyTransaction: (id: string) => void;
  verifyPin: (pin: string) => Promise<boolean>;
  setupPin: (pin: string) => Promise<void>;
  togglePrivacy: () => void;
  setAllowance: (amount: number, frequency: 'weekly' | 'monthly') => void;
  setSpendingCap: (cap: number | null) => void;
  payAllowance: () => void;
  getAllowanceDue: () => boolean;
}

export const createParentalSlice: StateCreator<
  SpendWiseStore,
  [['zustand/persist', unknown]],
  [],
  ParentalSlice
> = (set, get) => ({
  parentalState: {
    enabled: false,
    isTeenMode: false,
    ageGroup: 'teen',
    parentPinHash: null,
    parentId: null,
    monthlyLimit: null,

    restrictedCategories: [],
    pendingTransactions: [],
    hideBalances: false,
    hideAnalytics: false,
    blockAddTransactions: false,
    sessionUnlocked: false,
    requireApproval: false,
    allowanceAmount: 0,
    allowanceFrequency: 'monthly',
    spendingCapWeekly: null,
    lastAllowancePayout: null,
  },
  setTeenMode: (enabled, pinHash) =>
    set(state => ({
      parentalState: {
        ...state.parentalState,
        isTeenMode: enabled,
        parentPinHash: pinHash ?? state.parentalState.parentPinHash,
      },
    })),

  setMonthlyLimit: limit =>
    set(state => ({
      parentalState: { ...state.parentalState, monthlyLimit: limit },
    })),
  toggleRestrictedCategory: category =>
    set(state => {
      const restricted = state.parentalState.restrictedCategories;
      const newRestricted = restricted.includes(category)
        ? restricted.filter(c => c !== category)
        : [...restricted, category];
      return { parentalState: { ...state.parentalState, restrictedCategories: newRestricted } };
    }),
  updateParentalSettings: updates =>
    set(state => ({
      parentalState: { ...state.parentalState, ...updates },
    })),
  setupPin: async pin => {
    const pinHash = await hashPin(pin);
    set(state => ({
      parentalState: {
        ...state.parentalState,
        enabled: true,
        parentPinHash: pinHash,
        isTeenMode: true,
        sessionUnlocked: true,
      },
    }));
  },

  removePin: () =>
    set(state => ({
      parentalState: {
        ...state.parentalState,
        enabled: false,
        parentPinHash: null,
        parentId: null,
        isTeenMode: false,
        sessionUnlocked: false,
      },
    })),

  unlockSession: () =>
    set(state => ({
      parentalState: { ...state.parentalState, sessionUnlocked: true, isTeenMode: false },
    })),
  lockSession: () =>
    set(state => ({
      parentalState: {
        ...state.parentalState,
        sessionUnlocked: false,
        isTeenMode: state.parentalState.enabled ? true : state.parentalState.isTeenMode,
      },
    })),
  requestTransactionApproval: tx =>
    set(state => ({
      parentalState: {
        ...state.parentalState,
        pendingTransactions: [tx, ...state.parentalState.pendingTransactions],
      },
    })),
  approveTransaction: id =>
    set(state => {
      const tx = state.parentalState.pendingTransactions.find(t => t.id === id);
      if (!tx) return state;
      return {
        transactions: [tx, ...state.transactions],
        parentalState: {
          ...state.parentalState,
          pendingTransactions: state.parentalState.pendingTransactions.filter(t => t.id !== id),
        },
      };
    }),
  denyTransaction: id =>
    set(state => ({
      parentalState: {
        ...state.parentalState,
        pendingTransactions: state.parentalState.pendingTransactions.filter(t => t.id !== id),
      },
    })),
  verifyPin: async pin => {
    const state = get();
    if (!state.parentalState.parentPinHash) return false;
    return await verifyPinHash(pin, state.parentalState.parentPinHash);
  },

  togglePrivacy: () =>
    set(state => ({
      parentalState: { ...state.parentalState, hideBalances: !state.parentalState.hideBalances },
    })),

  setAllowance: (amount, frequency) =>
    set(state => ({
      parentalState: {
        ...state.parentalState,
        allowanceAmount: amount,
        allowanceFrequency: frequency,
      },
    })),

  setSpendingCap: cap =>
    set(state => ({
      parentalState: { ...state.parentalState, spendingCapWeekly: cap },
    })),

  payAllowance: () =>
    set(state => ({
      parentalState: {
        ...state.parentalState,
        lastAllowancePayout: new Date().toISOString().split('T')[0],
      },
    })),

  getAllowanceDue: () => {
    const state = get();
    const { lastAllowancePayout, allowanceFrequency } = state.parentalState;
    if (!lastAllowancePayout) return true;
    const last = new Date(lastAllowancePayout + 'T00:00:00');
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - last.getTime()) / 86400000);
    return allowanceFrequency === 'weekly' ? diffDays >= 7 : diffDays >= 30;
  },
});
