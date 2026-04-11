import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

// ── Types ────────────────────────────────────────────────────────

export type AgeGroup = 'child' | 'teen' | 'adult';

export interface ParentalSettings {
  enabled: boolean;
  pin: string; // hashed 4-digit PIN (stored as SHA-256 hex)
  kidMode: boolean;
  ageGroup: AgeGroup;
  maxTransactionAmount: number; // 0 = no limit
  allowedCategories: string[]; // empty = all allowed
  hideBalances: boolean;
  hideAnalytics: boolean;
  blockAddTransactions: boolean;
  sessionUnlocked: boolean; // true after parent enters PIN in current session
}

type ParentalControlContextValue = {
  settings: ParentalSettings;
  isKidMode: boolean;
  sessionUnlocked: boolean;
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  removePin: (pin: string) => Promise<boolean>;
  updateSettings: (updates: Partial<Omit<ParentalSettings, 'pin'>>) => void;
  lockSession: () => void;
  unlockSession: (pin: string) => Promise<boolean>;
  canAddTransaction: (amount: number, category: string) => { allowed: boolean; reason?: string };
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

const STORAGE_KEY = 'spendwise_parental_settings';

function loadSettings(): ParentalSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings(), ...JSON.parse(raw), sessionUnlocked: false };
  } catch {/* ignore */}
  return defaultSettings();
}

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

function saveSettings(s: ParentalSettings) {
  const { sessionUnlocked, ...toSave } = s;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

// ── Context ──────────────────────────────────────────────────────

const ParentalControlContext = createContext<ParentalControlContextValue | null>(null);

export function ParentalControlProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ParentalSettings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<Omit<ParentalSettings, 'pin'>>) => {
    setSettings((s) => ({ ...s, ...updates }));
  }, []);

  const setupPin = useCallback(async (pin: string) => {
    const hash = await sha256(pin);
    setSettings((s) => ({ ...s, enabled: true, pin: hash, kidMode: true, sessionUnlocked: true }));
  }, []);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    const hash = await sha256(pin);
    return hash === settings.pin;
  }, [settings.pin]);

  const changePin = useCallback(async (oldPin: string, newPin: string): Promise<boolean> => {
    const oldHash = await sha256(oldPin);
    if (oldHash !== settings.pin) return false;
    const newHash = await sha256(newPin);
    setSettings((s) => ({ ...s, pin: newHash }));
    return true;
  }, [settings.pin]);

  const removePin = useCallback(async (pin: string): Promise<boolean> => {
    const hash = await sha256(pin);
    if (hash !== settings.pin) return false;
    setSettings(defaultSettings());
    return true;
  }, [settings.pin]);

  const lockSession = useCallback(() => {
    setSettings((s) => ({ ...s, sessionUnlocked: false }));
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
      return { allowed: false, reason: `Transactions above ${settings.maxTransactionAmount} are not allowed.` };
    }
    if (settings.allowedCategories.length > 0 && !settings.allowedCategories.includes(category)) {
      return { allowed: false, reason: `The "${category}" category is restricted by your parent.` };
    }
    return { allowed: true };
  }, [settings]);

  const isKidMode = settings.enabled && settings.kidMode && !settings.sessionUnlocked;

  const value = useMemo<ParentalControlContextValue>(() => ({
    settings,
    isKidMode,
    sessionUnlocked: settings.sessionUnlocked,
    setupPin,
    verifyPin,
    changePin,
    removePin,
    updateSettings,
    lockSession,
    unlockSession,
    canAddTransaction,
  }), [settings, isKidMode, setupPin, verifyPin, changePin, removePin, updateSettings, lockSession, unlockSession, canAddTransaction]);

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
