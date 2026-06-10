import { createClient } from '@/core/api/client';
import { marketQuoteSchema } from '@/core/api/validation';

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  lastUpdated: string;
}

const MARKET_CACHE = new Map<string, { quote: MarketQuote; fetchedAt: number }>();
const CACHE_TTL = 60_000;

const yahooClient = createClient({
  defaultTimeout: 6_000,
  defaultRetries: 1,
});

async function fetchFromYahooFinance(symbol: string): Promise<MarketQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=1d`;
    const raw = await yahooClient.get<{
      chart?: { result?: { meta?: { regularMarketPrice: number; chartPreviousClose: number; symbol: string } }[] };
    }>(url, { timeout: 6_000 });

    const result = raw?.chart?.result?.[0];
    if (!result?.meta) return null;

    const price = result.meta.regularMarketPrice;
    const prevClose = result.meta.chartPreviousClose;
    const change = price - prevClose;
    const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;

    const quote = {
      symbol,
      name: result.meta.symbol || symbol,
      price,
      change: Math.round(change * 100) / 100,
      changePct: Math.round(changePct * 100) / 100,
      lastUpdated: new Date().toISOString(),
    };

    return marketQuoteSchema.parse(quote);
  } catch {
    return null;
  }
}

export async function getMarketQuote(symbol: string): Promise<MarketQuote> {
  const cached = MARKET_CACHE.get(symbol);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.quote;
  }

  const live = await fetchFromYahooFinance(symbol);
  if (live) {
    MARKET_CACHE.set(symbol, { quote: live, fetchedAt: Date.now() });
    return live;
  }

  return {
    symbol,
    name: symbol,
    price: 0,
    change: 0,
    changePct: 0,
    lastUpdated: new Date().toISOString(),
  };
}

export async function getNiftyIndex(): Promise<MarketQuote> {
  return getMarketQuote('NIFTY');
}

export async function getSensexIndex(): Promise<MarketQuote> {
  return getMarketQuote('SENSEX');
}
