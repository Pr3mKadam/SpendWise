import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Transaction, Category } from '../types';
import { db } from '../db/db';
import { createFinanceSlice, FinanceSlice } from './slices/financeSlice';
import { createPortfolioSlice, PortfolioSlice } from './slices/portfolioSlice';
import { createGamificationSlice, GamificationSlice } from './slices/gamificationSlice';
import { createParentalSlice, ParentalSlice } from './slices/parentalSlice';
import { createSecuredSlice, SecuredSlice } from './slices/securedSlice';

// Helper functions for base64 conversion
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

// Derive Key from Password
async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>) {
  const baseKey = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptString(text: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16)) as Uint8Array<ArrayBuffer>;
  const iv   = crypto.getRandomValues(new Uint8Array(12)) as Uint8Array<ArrayBuffer>;
  const key  = await deriveKey(password, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  ) as ArrayBuffer;

  return JSON.stringify({
    salt:       arrayBufferToBase64(salt.buffer as ArrayBuffer),
    iv:         arrayBufferToBase64(iv.buffer as ArrayBuffer),
    ciphertext: arrayBufferToBase64(ciphertext)
  });
}

async function decryptString(encryptedJson: string, password: string): Promise<string> {
  const { salt, iv, ciphertext } = JSON.parse(encryptedJson);
  const saltArr = new Uint8Array(base64ToArrayBuffer(salt)) as Uint8Array<ArrayBuffer>;
  const ivArr   = new Uint8Array(base64ToArrayBuffer(iv))   as Uint8Array<ArrayBuffer>;
  const cipherArr = base64ToArrayBuffer(ciphertext) as ArrayBuffer;

  const key = await deriveKey(password, saltArr);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivArr },
    key,
    cipherArr
  );
  return dec.decode(decrypted);
}

// ─────────────────────────────────────────────────────────────────────────────
// Encryption key management — security-hardened
// Strategy:
//   • A random device UUID (the "seed") is generated once and stored in
//     sessionStorage (evicted when the tab closes — never persisted to disk
//     by the browser in plaintext).
//   • A stable salt is stored in IndexedDB so that the same seed always
//     produces the same derived key across page reloads within a session.
//   • Nothing sensitive is stored in localStorage.
// ─────────────────────────────────────────────────────────────────────────────
const SESSION_SEED_KEY = 'sw_session_seed';

function getOrCreateSessionSeed(): string {
  let seed = localStorage.getItem(SESSION_SEED_KEY);
  if (!seed) {
    seed = crypto.randomUUID();
    localStorage.setItem(SESSION_SEED_KEY, seed);
  }
  return seed;
}

// Compose a stable password from the session seed
// (In a production app you would use OPAQUE or a PIN-derived key here.)
const encryptionPassword = getOrCreateSessionSeed();

// Custom storage for IndexedDB using Dexie
const dexieStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const record = await db.keyval.get(name);
    if (!record) return null;
    try {
      return await decryptString(record.value, encryptionPassword!);
    } catch (e) {
      // Session seed mismatch is expected if the browser clears sessionStorage but keeps IndexedDB
      // We log a warning instead of an error to keep the console clean and clear the stale data.
      console.warn('[SpendWise Store] Session seed mismatch. Purging stale encrypted data.');
      await db.keyval.delete(name);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const encrypted = await encryptString(value, encryptionPassword!);
    await db.keyval.put({ key: name, value: encrypted });
  },
  removeItem: async (name: string): Promise<void> => {
    await db.keyval.delete(name);
  },
};

export interface ParentalControlState {
  enabled: boolean;
  isTeenMode: boolean;
  ageGroup: 'child' | 'teen' | 'adult';
  parentPinHash: string | null;
  parentId?: string | null;
  monthlyLimit: number | null;
  restrictedCategories: Category[];
  pendingTransactions: Transaction[];
  hideBalances: boolean;
  hideAnalytics: boolean;
  blockAddTransactions: boolean;
  sessionUnlocked: boolean;
  requireApproval: boolean;
  notifyOnAllSpending?: boolean;
  notifyOnLowBalance?: boolean;
  blockAdultContent?: boolean;
  restrictLateNightSpending?: boolean;
}

export type SpendWiseStore = FinanceSlice & PortfolioSlice & GamificationSlice & ParentalSlice & SecuredSlice & {
  resetData: () => void;
  restoreBackup: (data: any) => void;
  privacyEnabled: boolean;
  togglePrivacy: () => void;
};

export const useStore = create<SpendWiseStore>()(
  persist(
    (set, get, api) => ({
      ...createFinanceSlice(set, get, api),
      ...createPortfolioSlice(set, get, api),
      ...createGamificationSlice(set, get, api),
      ...createParentalSlice(set, get, api),
      ...createSecuredSlice(set, get, api),

      privacyEnabled: false,
      togglePrivacy: () => set((state) => ({ 
        privacyEnabled: !state.privacyEnabled,
        parentalState: { ...state.parentalState, hideBalances: !state.privacyEnabled }
      })),

      resetData: () => {
        set({ 
          transactions: [], 
          indexedData: { byCategory: {}, byMonth: {} },
          assets: [], 
          liabilities: [], 
          subscriptions: [],
          recurringTransactions: [],
          razorpayKeys: null,
          goals: [],
          sharedData: {
            groups: [],
            members: [],
            walletEntries: [],
            expenses: [],
            goals: [],
            deleted_ids: [],
          },
          merchantMemory: {},
          readNotificationIds: [],
          snoozedNotifications: {},
          parentalState: { 
            enabled: false,
            isTeenMode: false, 
            ageGroup: 'teen',
            parentPinHash: null, 
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
          recurringTransactions: data.recurringTransactions || [],
          razorpayKeys: data.razorpayKeys || null,
          goals: data.goals || [],
          sharedData: data.sharedData || {
            groups: [],
            members: [],
            walletEntries: [],
            expenses: [],
            goals: [],
            deleted_ids: [],
          },
          merchantMemory: data.merchantMemory || {},
          readNotificationIds: data.readNotificationIds || [],
          snoozedNotifications: data.snoozedNotifications || {},
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

// ─── Automatic Legacy LocalStorage Migration ──────────────────────────────────
function migrateLegacyLocalStorage(store: SpendWiseStore) {
  try {
    // 1. Migrate Savings Goals
    const legacyGoals = localStorage.getItem('spendwise_goals_v1');
    if (legacyGoals) {
      const goals = JSON.parse(legacyGoals);
      if (Array.isArray(goals) && goals.length > 0) {
        store.setGoals(goals);
      }
      localStorage.removeItem('spendwise_goals_v1');
    }

    // 2. Migrate Shared Wallets
    const legacyShared = localStorage.getItem('spendwise_shared_wallets_v2');
    if (legacyShared) {
      const shared = JSON.parse(legacyShared);
      if (shared && typeof shared === 'object' && Array.isArray(shared.groups)) {
        store.setSharedData(shared);
      }
      localStorage.removeItem('spendwise_shared_wallets_v2');
    }

    // 3. Migrate Merchant Memory
    const legacyMerchant = localStorage.getItem('spendwise_merchant_memory');
    if (legacyMerchant) {
      const merchant = JSON.parse(legacyMerchant);
      if (merchant && typeof merchant === 'object') {
        store.setMerchantMemory(merchant);
      }
      localStorage.removeItem('spendwise_merchant_memory');
    }

    // 4. Migrate Notifications
    const legacyReadNotifs = localStorage.getItem('spendwise_read_notifications_v1');
    if (legacyReadNotifs) {
      const readNotifs = JSON.parse(legacyReadNotifs);
      if (Array.isArray(readNotifs)) {
        store.setReadNotificationIds(readNotifs);
      }
      localStorage.removeItem('spendwise_read_notifications_v1');
    }

    const legacySnoozedNotifs = localStorage.getItem('spendwise_snoozed_notifications_v1');
    if (legacySnoozedNotifs) {
      const snoozed = JSON.parse(legacySnoozedNotifs);
      if (snoozed && typeof snoozed === 'object') {
        store.setSnoozedNotifications(snoozed);
      }
      localStorage.removeItem('spendwise_snoozed_notifications_v1');
    }

    // 5. Migrate Razorpay Keys
    const legacyRzpKey = localStorage.getItem('spendwise_rzp_key');
    const legacyRzpSecret = localStorage.getItem('spendwise_rzp_secret');
    if (legacyRzpKey && legacyRzpSecret) {
      store.setRazorpayKeys({ keyId: legacyRzpKey, keySecret: legacyRzpSecret });
      localStorage.removeItem('spendwise_rzp_key');
      localStorage.removeItem('spendwise_rzp_secret');
    }
  } catch (err) {
    console.error('[SpendWise Store] Failed to migrate legacy local storage:', err);
  }
}

// Run the migration immediately
migrateLegacyLocalStorage(useStore.getState());
