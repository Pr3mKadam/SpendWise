import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  fetchParentalSettings,
  saveParentalSettings,
  clearParentalSettings,
  approveTransaction,
  rejectTransaction,
} from '../lib/supabaseData';

// ── Types ────────────────────────────────────────────────────────

export type AgeGroup = 'child' | 'teen' | 'adult';

export interface ParentalSettings {
  enabled: boolean;
  pin: string; // SHA-256 hex hash of 4-digit PIN
  kidMode: boolean;
  ageGroup: AgeGroup;
  maxTransactionAmount: number; // 0 = no limit
  allowedCategories: string[]; // empty = all allowed
  hideBalances: boolean;
  hideAnalytics: boolean;
  blockAddTransactions: boolean;
  sessionUnlocked: boolean; // true after parent enters PIN this session
}

type ParentalControlContextValue = {
  settings: ParentalSettings;
  isKidMode: boolean;
  sessionUnlocked: boolean;
  cloudSyncing: boolean;
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  removePin: (pin: string) => Promise<boolean>;
  updateSettings: (updates: Partial<Omit<ParentalSettings, 'pin'>>) => void;
  lockSession: () => void;
  unlockSession: (pin: string) => Promise<boolean>;
  canAddTransaction: (amount: number, category: string) => { allowed: boolean; reason?: string };
  sendPasswordResetEmail: () => Promise<boolean>;
  // Pending approval helpers
  approvePendingTransaction: (txId: string) => Promise<void>;
  rejectPendingTransaction: (txId: string) => Promise<void>;
};

// ── Helpers ──────────────────────────────────────────────────────

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const LOCAL_KEY = 'spendwise_parental_settings';

function defaultSettings(): ParentalSettings {
  return {
    enabled: false,
    pin: '',
    kidMode: false,
    ageGroup: 'teen',
    maxTransactionAmount: 0,
    allowedCategories: [],
    hideBalances: false,
    hideAnalytics: false,
    blockAddTransactions: false,
    sessionUnlocked: false,
  };
}

function loadLocalSettings(): ParentalSettings {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return { ...defaultSettings(), ...JSON.parse(raw), sessionUnlocked: false };
  } catch {/* ignore */}
  return defaultSettings();
}

function persistLocal(s: ParentalSettings) {
  const { sessionUnlocked, ...toSave } = s;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(toSave));
}

function settingsToCloud(s: ParentalSettings): Record<string, unknown> {
  const { sessionUnlocked, ...rest } = s;
  return rest as unknown as Record<string, unknown>;
}

function cloudToSettings(raw: Record<string, unknown>): ParentalSettings {
  return { ...defaultSettings(), ...(raw as Partial<ParentalSettings>), sessionUnlocked: false };
}

// ── Context ──────────────────────────────────────────────────────

const ParentalControlContext = createContext<ParentalControlContextValue | null>(null);

export function ParentalControlProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ParentalSettings>(loadLocalSettings);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── On Login: load cloud settings (overrides local if cloud has data) ──
  useEffect(() => {
    if (!user) return;
    setCloudSyncing(true);
    fetchParentalSettings(user.id)
      .then((cloud) => {
        if (cloud && cloud.enabled) {
          const fromCloud = cloudToSettings(cloud);
          // Keep sessionUnlocked = false always on fresh load
          setSettings({ ...fromCloud, sessionUnlocked: false });
          persistLocal(fromCloud);
        }
      })
      .catch(console.error)
      .finally(() => setCloudSyncing(false));
  }, [user?.id]);

  // ── Debounced cloud save whenever settings change ──
  const pushToCloud = useCallback((s: ParentalSettings) => {
    if (!user) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const payload = settingsToCloud(s);
      saveParentalSettings(user.id, payload).catch(console.error);
    }, 1000);
  }, [user]);

  const applySettings = useCallback((updater: (prev: ParentalSettings) => ParentalSettings) => {
    setSettings((prev) => {
      const next = updater(prev);
      persistLocal(next);
      pushToCloud(next);
      return next;
    });
  }, [pushToCloud]);

  const updateSettings = useCallback((updates: Partial<Omit<ParentalSettings, 'pin'>>) => {
    applySettings((s) => ({ ...s, ...updates }));
  }, [applySettings]);

  const setupPin = useCallback(async (pin: string) => {
    const hash = await sha256(pin);
    applySettings((s) => ({ ...s, enabled: true, pin: hash, kidMode: true, sessionUnlocked: true }));
  }, [applySettings]);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    const hash = await sha256(pin);
    return hash === settings.pin;
  }, [settings.pin]);

  const changePin = useCallback(async (oldPin: string, newPin: string): Promise<boolean> => {
    const oldHash = await sha256(oldPin);
    if (oldHash !== settings.pin) return false;
    const newHash = await sha256(newPin);
    applySettings((s) => ({ ...s, pin: newHash }));
    return true;
  }, [settings.pin, applySettings]);

  const removePin = useCallback(async (pin: string): Promise<boolean> => {
    const hash = await sha256(pin);
    if (hash !== settings.pin) return false;
    const reset = defaultSettings();
    setSettings(reset);
    persistLocal(reset);
    // Clear from cloud too
    if (user) clearParentalSettings(user.id).catch(console.error);
    return true;
  }, [settings.pin, user]);

  const lockSession = useCallback(() => {
    setSettings((s) => ({ ...s, sessionUnlocked: false, kidMode: s.enabled ? true : s.kidMode }));
  }, []);

  const unlockSession = useCallback(async (pin: string): Promise<boolean> => {
    const hash = await sha256(pin);
    if (hash !== settings.pin) return false;
    setSettings((s) => ({ ...s, sessionUnlocked: true, kidMode: false }));
    return true;
  }, [settings.pin]);

  const canAddTransaction = useCallback((amount: number, category: string): { allowed: boolean; reason?: string } => {
    if (!settings.enabled || !settings.kidMode) return { allowed: true };
    if (settings.blockAddTransactions) return { allowed: false, reason: 'Adding transactions is disabled by your parent.' };
    if (settings.maxTransactionAmount > 0 && amount > settings.maxTransactionAmount) {
      return { allowed: false, reason: `Amount exceeds the ₹${settings.maxTransactionAmount} limit set by your parent. It will be sent for approval.` };
    }
    if (settings.allowedCategories.length > 0 && !settings.allowedCategories.includes(category)) {
      return { allowed: false, reason: `The "${category}" category is restricted. It will be sent for approval.` };
    }
    return { allowed: true };
  }, [settings]);

  // ── PIN Recovery: trigger Supabase password-reset / magic link ──
  const sendPasswordResetEmail = useCallback(async (): Promise<boolean> => {
    if (!user?.email) return false;
    try {
      const { supabase } = await import('../services/supabaseClient');
      if (!supabase) return false;
      const { error } = await supabase.auth.signInWithOtp({ email: user.email });
      return !error;
    } catch {
      return false;
    }
  }, [user]);

  // ── Pending transaction approval helpers ──
  const approvePendingTransaction = useCallback(async (txId: string) => {
    if (!user) return;
    await approveTransaction(user.id, txId);
  }, [user]);

  const rejectPendingTransaction = useCallback(async (txId: string) => {
    if (!user) return;
    await rejectTransaction(user.id, txId);
  }, [user]);

  const isKidMode = settings.enabled && settings.kidMode && !settings.sessionUnlocked;

  const value = useMemo<ParentalControlContextValue>(() => ({
    settings,
    isKidMode,
    sessionUnlocked: settings.sessionUnlocked,
    cloudSyncing,
    setupPin,
    verifyPin,
    changePin,
    removePin,
    updateSettings,
    lockSession,
    unlockSession,
    canAddTransaction,
    sendPasswordResetEmail,
    approvePendingTransaction,
    rejectPendingTransaction,
  }), [settings, isKidMode, cloudSyncing, setupPin, verifyPin, changePin, removePin,
      updateSettings, lockSession, unlockSession, canAddTransaction,
      sendPasswordResetEmail, approvePendingTransaction, rejectPendingTransaction]);

  return (
    <ParentalControlContext.Provider value={value}>
      {children}
    </ParentalControlContext.Provider>
  );
}

export function useParentalControl(): ParentalControlContextValue {
  const ctx = useContext(ParentalControlContext);
  if (!ctx) throw new Error('useParentalControl must be used within ParentalControlProvider');
  return ctx;
}
