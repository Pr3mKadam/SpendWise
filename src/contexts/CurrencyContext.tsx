import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS } from '../constants';

export type CurrencyCode = '$' | '€' | '£' | '₹' | '¥' | 'A$' | 'C$' | 'AED';

interface CurrencyContextType {
  baseCurrency: CurrencyCode;
  activeCurrency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  convert: (amount: number, from?: CurrencyCode, to?: CurrencyCode) => number;
  format: (amount: number, currency?: CurrencyCode) => string;
  setActiveCurrency: (code: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Simulated rates relative to USD (1.0)
const SIMULATED_RATES: Record<CurrencyCode, number> = {
  '$':   1.0,
  '€':   0.92,
  '£':   0.79,
  '₹':   83.12,
  '¥':   151.42,
  'A$':  1.52,
  'C$':  1.35,
  'AED': 3.67,
};

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (raw) {
        const config = JSON.parse(raw);
        if (config.currency) return config.currency as CurrencyCode;
      }
    } catch { /* ignore */ }
    return '₹'; // Default to Rupees as requested
  });

  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (raw) {
        const c = JSON.parse(raw);
        if (c.currency) return c.currency as CurrencyCode;
      }
    } catch { /* ignore */ }
    return '₹';
  });

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
      } catch { /* ignore */ }
    };

    window.addEventListener('spendwise-config-updated', handleConfigChange);
    window.addEventListener('storage', handleConfigChange);

    return () => {
      window.removeEventListener('spendwise-config-updated', handleConfigChange);
      window.removeEventListener('storage', handleConfigChange);
    };
  }, []);

  const convert = (amount: number, from: CurrencyCode = baseCurrency, to: CurrencyCode = activeCurrency) => {
    if (from === to) return amount;
    // Convert to USD first, then to target
    const amountInUSD = amount / SIMULATED_RATES[from];
    return amountInUSD * SIMULATED_RATES[to];
  };

  const format = (amount: number, currency: CurrencyCode = activeCurrency) => {
    const converted = convert(amount, baseCurrency, currency);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: getISOCode(currency),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(converted).replace(/[A-Z]{3}/, currency); // Replace ISO with our custom symbol if needed
  };

  const getISOCode = (code: CurrencyCode): string => {
    switch (code) {
      case '$':   return 'USD';
      case '€':   return 'EUR';
      case '£':   return 'GBP';
      case '₹':   return 'INR';
      case '¥':   return 'JPY';
      case 'A$':  return 'AUD';
      case 'C$':  return 'CAD';
      case 'AED': return 'AED';
      default:    return 'USD';
    }
  };

  return (
    <CurrencyContext.Provider value={{
      baseCurrency,
      activeCurrency,
      rates: SIMULATED_RATES,
      convert,
      format,
      setActiveCurrency,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};
