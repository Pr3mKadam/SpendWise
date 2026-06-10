import { SUPABASE_URL } from '@/config/env';

const MFAPI_BASE = 'https://api.mfapi.in/mf';
const PRICE_PROXY = `${SUPABASE_URL}/functions/v1/price-proxy`;

export interface PriceResult {
  symbol: string;
  price: number;
  currency: string;
  updatedAt: string;
}

export async function fetchMutualFundNAV(schemeCode: string): Promise<PriceResult | null> {
  try {
    const res = await fetch(`${MFAPI_BASE}/${schemeCode}`);
    const data = await res.json();
    const nav = parseFloat(data.data?.[0]?.nav);
    if (isNaN(nav)) return null;
    return { symbol: schemeCode, price: nav, currency: 'INR', updatedAt: new Date().toISOString() };
  } catch {
    return null;
  }
}

export async function fetchEquityPrice(symbol: string): Promise<PriceResult | null> {
  try {
    const res = await fetch(`${PRICE_PROXY}?symbol=${encodeURIComponent(symbol)}`);
    const data = await res.json();
    if (data.price)
      return { symbol, price: data.price, currency: 'INR', updatedAt: new Date().toISOString() };
    return null;
  } catch {
    return null;
  }
}

export async function refreshAllPrices(
  assets: Array<{ id: string; symbol: string; type: string }>
): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  const results = await Promise.allSettled(
    assets.map(async a => {
      if (a.type === 'mutual_fund') return fetchMutualFundNAV(a.symbol);
      if (a.type === 'equity' || a.type === 'etf') return fetchEquityPrice(a.symbol);
      return null;
    })
  );
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) prices[assets[i].id] = r.value.price;
  });
  return prices;
}
