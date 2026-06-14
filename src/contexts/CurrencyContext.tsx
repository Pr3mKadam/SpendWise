/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { STORAGE_KEYS } from '@/constants';
import { EXCHANGE_RATE_API_KEY } from '@/config/env';

export type CurrencyCode = '$' | '€' | '£' | '₹' | '¥' | 'A$' | 'C$' | 'AED' | 'S$' | 'SAR';

interface CurrencyContextType {
  baseCurrency: CurrencyCode;
  activeCurrency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  convert: (amount: number, from?: CurrencyCode, to?: CurrencyCode) => number;
  format: (amount: number, currency?: CurrencyCode) => string;
  setActiveCurrency: (code: CurrencyCode) => void;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Fallback rates relative to USD (1.0) — used when API is unavailable
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  $: 1.0,
  '€': 0.92,
  '£': 0.79,
  '₹': 83.12,
  '¥': 151.42,
  A$: 1.52,
  C$: 1.35,
  AED: 3.67,
  S$: 1.34,
  SAR: 3.75,
};

const CACHE_KEY = 'spendwise_exchange_rates';
const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const ISO_TO_CODE: Record<string, CurrencyCode> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  AED: 'AED',
  SGD: 'S$',
  SAR: 'SAR',
};

function getISOCode(code: CurrencyCode): string {
  switch (code) {
    case '$':
      return 'USD';
    case '€':
      return 'EUR';
    case '£':
      return 'GBP';
    case '₹':
      return 'INR';
    case '¥':
      return 'JPY';
    case 'A$':
      return 'AUD';
    case 'C$':
      return 'CAD';
    case 'AED':
      return 'AED';
    case 'S$':
      return 'SGD';
    case 'SAR':
      return 'SAR';
    default:
      return 'USD';
  }
}

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (raw) {
        const config = JSON.parse(raw);
        if (config.currency) return config.currency as CurrencyCode;
      }
    } catch {
      /* silently ignore — non-critical */
    }
    return '₹';
  });

  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (raw) {
        const c = JSON.parse(raw);
        if (c.currency) return c.currency as CurrencyCode;
      }
    } catch {
      /* silently ignore — non-critical */
    }
    return '₹';
  });

  const [rates, setRates] = useState<Record<CurrencyCode, number>>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_EXPIRY_MS) {
          return { ...FALLBACK_RATES, ...parsed.rates };
        }
      }
    } catch {
      /* silently ignore — non-critical */
    }
    return { ...FALLBACK_RATES };
  });

  const fetchLiveRates = useCallback(async (): Promise<Record<string, number>> => {
    const apiKey = EXCHANGE_RATE_API_KEY;
    const url = apiKey
      ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
      : 'https://api.frankfurter.app/latest?from=USD';
    const res = await fetch(url);
    const data = await res.json();
    const rawRates: Record<string, number> = apiKey
      ? (data as { conversion_rates: Record<string, number> }).conversion_rates
      : (data as { rates: Record<string, number> }).rates;
    return rawRates;
  }, []);

  const refreshRates = useCallback(async () => {
    try {
      const rawRates = await fetchLiveRates();
      const mapped: Partial<Record<CurrencyCode, number>> = {};
      for (const [iso, code] of Object.entries(ISO_TO_CODE)) {
        if (rawRates[iso]) mapped[code] = rawRates[iso];
      }
      const updated = { ...FALLBACK_RATES, ...mapped } as Record<CurrencyCode, number>;
      setRates(updated);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: updated, timestamp: Date.now() }));
    } catch (e) {
      console.warn('[CurrencyContext] Failed to fetch live rates, using fallback:', e);
    }
  }, [fetchLiveRates]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshRates();
  }, [refreshRates]);

  useEffect(() => {
    const handleConfigChange = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
        if (raw) {
          const config = JSON.parse(raw);
          if (config.currency) {
            setBaseCurrency(config.currency as CurrencyCode);
            setActiveCurrency(config.currency as CurrencyCode);
          }
        }
      } catch {
        /* silently ignore — non-critical */
      }
    };
    window.addEventListener('spendwise-config-updated', handleConfigChange);
    window.addEventListener('storage', handleConfigChange);
    return () => {
      window.removeEventListener('spendwise-config-updated', handleConfigChange);
      window.removeEventListener('storage', handleConfigChange);
    };
  }, []);

  const convert = (
    amount: number,
    from: CurrencyCode = baseCurrency,
    to: CurrencyCode = activeCurrency
  ) => {
    if (from === to) return amount;
    const amountInUSD = amount / rates[from];
    return amountInUSD * rates[to];
  };

  const format = (amount: number, currency: CurrencyCode = activeCurrency) => {
    const converted = convert(amount, baseCurrency, currency);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: getISOCode(currency),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
      .format(converted)
      .replace(/[A-Z]{3}/, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        baseCurrency,
        activeCurrency,
        rates,
        convert,
        format,
        setActiveCurrency,
        refreshRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};
