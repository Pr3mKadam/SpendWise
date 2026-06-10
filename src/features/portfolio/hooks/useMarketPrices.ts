import { useEffect, useState, useCallback, useRef } from 'react';
import { useStore } from '@/store';
import { getMarketQuote, MarketQuote } from '@/utils/marketData';

const SYMBOL_MAP: Record<string, string> = {
  'reliance': 'RELIANCE',
  'tcs': 'TCS',
  'hdfc': 'HDFCBANK',
  'infosys': 'INFY',
  'icici': 'ICICIBANK',
  'sbi': 'SBIN',
  'airtel': 'BHARTIARTL',
  'itc': 'ITC',
  'wipro': 'WIPRO',
  'hcl': 'HCLTECH',
};

function guessSymbol(name: string): string | null {
  const lower = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [key, symbol] of Object.entries(SYMBOL_MAP)) {
    if (lower.includes(key)) return symbol;
  }
  return null;
}

export function useMarketPrices() {
  const assets = useStore(s => s.assets);
  const updateAsset = useStore(s => s.updateAsset);
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  const refreshAll = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    const investmentAssets = assets.filter(a => a.type === 'investment');
    const newQuotes: Record<string, MarketQuote> = {};

    await Promise.allSettled(
      investmentAssets.map(async asset => {
        const symbol = guessSymbol(asset.name);
        if (!symbol) return;
        const quote = await getMarketQuote(symbol);
        newQuotes[asset.id] = quote;
        updateAsset(asset.id, {
          balance: quote.price,
          lastUpdated: quote.lastUpdated,
        });
      })
    );

    setQuotes(prev => ({ ...prev, ...newQuotes }));
    setLoading(false);
    fetchingRef.current = false;
  }, [assets, updateAsset]);

  useEffect(() => {
    const t = setTimeout(() => refreshAll(), 0);
    const interval = setInterval(() => refreshAll(), 5 * 60_000);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, [refreshAll]);

  return { quotes, loading, refreshAll };
}
