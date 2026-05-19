import { StateCreator } from 'zustand';
import { SavingsGoal } from '@/types';
import { SharedStorage } from '@/lib/crdt';
import { SpendWiseStore } from '@/store/index';

export interface VaultData {
  total: number;
  count: number;
  history: { date: string; amount: number; merchant: string }[];
}

export interface UserPreferences {
  fontSize: string;
  darkMode: boolean;
  highContrast: boolean;
  hapticsEnabled: boolean;
  shakeEnabled: boolean;
  biometricEnabled: boolean;
  avatar: string | null;
}

export interface SecuredSlice {
  goals: SavingsGoal[];
  setGoals: (goals: SavingsGoal[] | ((prev: SavingsGoal[]) => SavingsGoal[])) => void;
  
  sharedData: SharedStorage;
  setSharedData: (data: SharedStorage | ((prev: SharedStorage) => SharedStorage)) => void;
  
  merchantMemory: Record<string, { merchant: string; category: string }>;
  setMerchantMemory: (
    mem:
      | Record<string, { merchant: string; category: string }>
      | ((
          prev: Record<string, { merchant: string; category: string }>
        ) => Record<string, { merchant: string; category: string }>)
  ) => void;
  
  readNotificationIds: string[];
  setReadNotificationIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  
  snoozedNotifications: Record<string, number>;
  setSnoozedNotifications: (
    snoozed: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)
  ) => void;

  // BUG-02 fix: Round-Up Vault moved from localStorage to encrypted IDB
  roundUpVault: VaultData;
  setRoundUpVault: (vault: VaultData | ((prev: VaultData) => VaultData)) => void;

  userPreferences: UserPreferences;
  setUserPreferences: (
    prefs: UserPreferences | ((prev: UserPreferences) => UserPreferences)
  ) => void;
}

export const createSecuredSlice: StateCreator<
  SpendWiseStore,
  [['zustand/persist', unknown]],
  [],
  SecuredSlice
> = (set) => ({
  goals: [],
  setGoals: (goalsOrUpdater) =>
    set((state) => ({
      goals: typeof goalsOrUpdater === 'function' ? goalsOrUpdater(state.goals) : goalsOrUpdater,
    })),

  sharedData: {
    groups: [],
    members: [],
    walletEntries: [],
    expenses: [],
    goals: [],
    deleted_ids: [],
  },
  setSharedData: (dataOrUpdater) =>
    set((state) => ({
      sharedData:
        typeof dataOrUpdater === 'function' ? dataOrUpdater(state.sharedData) : dataOrUpdater,
    })),

  merchantMemory: {},
  setMerchantMemory: (memOrUpdater) =>
    set((state) => ({
      merchantMemory:
        typeof memOrUpdater === 'function' ? memOrUpdater(state.merchantMemory) : memOrUpdater,
    })),

  readNotificationIds: [],
  setReadNotificationIds: (idsOrUpdater) =>
    set((state) => ({
      readNotificationIds:
        typeof idsOrUpdater === 'function'
          ? idsOrUpdater(state.readNotificationIds)
          : idsOrUpdater,
    })),

  snoozedNotifications: {},
  setSnoozedNotifications: (snoozedOrUpdater) =>
    set((state) => ({
      snoozedNotifications:
        typeof snoozedOrUpdater === 'function'
          ? snoozedOrUpdater(state.snoozedNotifications)
          : snoozedOrUpdater,
    })),

  // BUG-02 fix: vault migrated from localStorage to encrypted IDB
  roundUpVault: { total: 0, count: 0, history: [] },
  setRoundUpVault: (vaultOrUpdater) =>
    set((state) => ({
      roundUpVault:
        typeof vaultOrUpdater === 'function'
          ? vaultOrUpdater(state.roundUpVault)
          : vaultOrUpdater,
    })),

  userPreferences: {
    fontSize: 'text-base',
    darkMode: typeof window !== 'undefined' ? document.documentElement.getAttribute('data-theme') === 'dark' : false,
    highContrast: false,
    hapticsEnabled: true,
    shakeEnabled: true,
    biometricEnabled: false,
    avatar: null,
  },
  setUserPreferences: (prefsOrUpdater) =>
    set((state) => ({
      userPreferences:
        typeof prefsOrUpdater === 'function'
          ? prefsOrUpdater(state.userPreferences)
          : prefsOrUpdater,
    })),
});
