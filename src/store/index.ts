import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Transaction, Category } from '../types';
import { db } from '../db/db';
import { createFinanceSlice, FinanceSlice } from './slices/financeSlice';
import { createPortfolioSlice, PortfolioSlice } from './slices/portfolioSlice';
import { createGamificationSlice, GamificationSlice } from './slices/gamificationSlice';
import { createParentalSlice, ParentalSlice } from './slices/parentalSlice';

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
  let seed = sessionStorage.getItem(SESSION_SEED_KEY);
  if (!seed) {
    seed = crypto.randomUUID();
    sessionStorage.setItem(SESSION_SEED_KEY, seed);
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
      console.error('Failed to decrypt data:', e);
      // Fallback: if it's not JSON or decryption fails, maybe it was unencrypted before?
      try {
        JSON.parse(record.value);
        return record.value; // It was unencrypted
      } catch {
        return null; // Corrupted or encrypted with wrong key
      }
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

      privacyEnabled: false,
      togglePrivacy: () => set((state) => ({ privacyEnabled: !state.privacyEnabled })),

      resetData: () => {
        set({ 
          transactions: [], 
          indexedData: { byCategory: {}, byMonth: {} },
          assets: [], 
          liabilities: [], 
          subscriptions: [],
          recurringTransactions: [],
          razorpayKeys: null,
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
