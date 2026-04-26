/**
 * voiceParser.ts
 * Local NLP parser for spoken expense/income descriptions.
 * Works 100% offline — no API calls.
 * Returns the same ParsedTransaction shape as the Gemini parser.
 */

import type { Category } from '../types';

export interface LocalParsedTransaction {
  amount: number;
  category: Category;
  merchant: string;
  type: 'credit' | 'debit';
  date: string;
  confidence: number;
  split: null;
  source: 'local';
}

// ─── Merchant → Category map ────────────────────────────────────────────────
export const MERCHANT_CATEGORY_MAP: Record<string, string> = {
  // Food & delivery
  swiggy: 'Food', zomato: 'Food', dominos: 'Food', 'pizza hut': 'Food',
  mcdonalds: 'Food', mcd: 'Food', kfc: 'Food', subway: 'Food',
  starbucks: 'Food', 'cafe coffee day': 'Food', ccd: 'Food',
  blinkit: 'Food', zepto: 'Food', bigbasket: 'Food', dunzo: 'Food',
  grocery: 'Food', groceries: 'Food', restaurant: 'Food', cafe: 'Food',
  food: 'Food', lunch: 'Food', dinner: 'Food', breakfast: 'Food',
  coffee: 'Food', snack: 'Food', tea: 'Food', pizza: 'Food',

  // Transport
  uber: 'Transport', ola: 'Transport', rapido: 'Transport',
  metro: 'Transport', bus: 'Transport', train: 'Transport', auto: 'Transport',
  cab: 'Transport', taxi: 'Transport', petrol: 'Transport', fuel: 'Transport',
  irctc: 'Transport', flight: 'Transport', indigo: 'Transport',

  // Shopping
  amazon: 'Shopping', flipkart: 'Shopping', myntra: 'Shopping',
  meesho: 'Shopping', nykaa: 'Shopping', ajio: 'Shopping',
  shopping: 'Shopping', clothes: 'Shopping', shoes: 'Shopping',
  shirt: 'Shopping', dress: 'Shopping', jeans: 'Shopping',

  // Subscriptions
  netflix: 'Subscriptions', spotify: 'Subscriptions', hotstar: 'Subscriptions',
  'prime video': 'Subscriptions', 'amazon prime': 'Subscriptions',
  youtube: 'Subscriptions', 'youtube premium': 'Subscriptions',
  jio: 'Subscriptions', airtel: 'Subscriptions', vi: 'Subscriptions',
  subscription: 'Subscriptions', recharge: 'Subscriptions',

  // Entertainment
  movie: 'Entertainment', cinema: 'Entertainment', pvr: 'Entertainment',
  inox: 'Entertainment', bookmyshow: 'Entertainment', concert: 'Entertainment',
  game: 'Entertainment', gaming: 'Entertainment',

  // Utilities
  electricity: 'Utilities', water: 'Utilities', rent: 'Utilities',
  maintenance: 'Utilities', wifi: 'Utilities', internet: 'Utilities',
  gas: 'Utilities', lpg: 'Utilities', bill: 'Utilities',

  // Health
  pharmacy: 'Health', chemist: 'Health', hospital: 'Health',
  doctor: 'Health', medicine: 'Health', gym: 'Health',
  medical: 'Health', clinic: 'Health', apollo: 'Health',

  // Income
  salary: 'Income', 'salary received': 'Income', income: 'Income',
  freelance: 'Income', refund: 'Income', cashback: 'Income',
  reimbursement: 'Income', transfer: 'Income', received: 'Income',
};

// ─── Amount extraction ───────────────────────────────────────────────────────
function extractAmount(text: string): number | null {
  // "₹500", "rs 500", "500 rupees", "500 rs", "500", "5000.50"
  const patterns = [
    /[₹रु]\s*(\d+(?:[.,]\d+)?)/i,
    /(?:rs|inr|rupee[s]?)\.?\s*(\d+(?:[.,]\d+)?)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:rs|inr|rupee[s]?|bucks)/i,
    /(?:spent|paid|cost[s]?|buy|bought|spend|expense[d]?|for|worth)\s+(?:rs\.?\s*)?(\d+(?:[.,]\d+)?)/i,
    /(\d{1,6}(?:\.\d{1,2})?)/,
  ];
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m?.[1]) {
      const n = parseFloat(m[1].replace(',', ''));
      if (Number.isFinite(n) && n > 0 && n <= 999_999) return n;
    }
  }
  return null;
}

// ─── Merchant / description extraction ──────────────────────────────────────
function extractMerchant(text: string, category: Category): string {
  // Try "at <merchant>", "from <merchant>", "on <merchant>", "to <merchant>"
  const locPattern = /(?:at|from|on|to|for)\s+([A-Za-z][A-Za-z0-9 '&.-]{1,30}?)(?:\s+(?:for|on|at|from|in|worth|of|using|via|through|with|rs|inr|\d|$))/i;
  const m = text.match(locPattern);
  if (m?.[1]) {
    const candidate = m[1].trim();
    if (candidate.length >= 2 && candidate.length <= 35) {
      return toTitleCase(candidate);
    }
  }

  // Check known merchant names
  const lower = text.toLowerCase();
  for (const key of Object.keys(MERCHANT_CATEGORY_MAP)) {
    if (lower.includes(key)) return toTitleCase(key);
  }

  // Fallback to category
  return category;
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

// ─── Type detection (credit vs debit) ───────────────────────────────────────
function detectType(text: string): 'credit' | 'debit' {
  const creditWords = /\b(received|got|salary|income|refund|cashback|earned|credited|reimbursed|transfer in|deposited)\b/i;
  if (creditWords.test(text)) return 'credit';
  return 'debit';
}

// ─── Category detection ──────────────────────────────────────────────────────
function detectCategory(text: string, type: 'credit' | 'debit'): Category {
  if (type === 'credit') return 'Income';
  const lower = text.toLowerCase();
  for (const [keyword, category] of Object.entries(MERCHANT_CATEGORY_MAP)) {
    if (lower.includes(keyword)) return category;
  }
  return 'Food'; // default fallback
}

// ─── Confidence scoring ──────────────────────────────────────────────────────
function scoreConfidence(amount: number | null, text: string, merchant: string): number {
  let score = 0;
  if (amount !== null) score += 0.5;                            // has amount
  if (/(?:at|from|on|to|for)\s+\w/i.test(text)) score += 0.2; // has location keyword
  if (Object.keys(MERCHANT_CATEGORY_MAP).some(k => text.toLowerCase().includes(k))) score += 0.2; // known merchant
  if (merchant !== 'Food' && merchant !== 'Income') score += 0.1; // non-generic merchant
  return Math.min(score, 1);
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function parseVoiceLocally(text: string, today: string): LocalParsedTransaction & { recurring?: string } {
  const type = detectType(text);
  const category = detectCategory(text, type);
  const amount = extractAmount(text) ?? 0;
  const merchant = extractMerchant(text, category);
  const confidence = scoreConfidence(amount || null, text, merchant);

  // Advanced: Detect recurring patterns
  let recurring: string | undefined = undefined;
  if (/every\s+(month|week|year|day)/i.test(text)) {
    const m = text.match(/every\s+(month|week|year|day)/i);
    recurring = m?.[1].toLowerCase();
  } else if (/monthly|weekly|yearly|daily/i.test(text)) {
    const m = text.match(/(monthly|weekly|yearly|daily)/i);
    recurring = m?.[1].toLowerCase().replace('ly', '');
  }

  return {
    amount,
    category: category as any,
    merchant,
    type,
    date: today,
    confidence,
    split: null,
    source: 'local',
    recurring
  };
}
