import type { Category } from "../../types";
import { inferCategory, inferType, toTitleCase } from "./common";

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

function extractAmount(text: string): number | null {
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

function extractMerchant(text: string, category: Category): string {
  const locPattern = /(?:at|from|on|to|for)\s+([A-Za-z][A-Za-z0-9 '&.-]{1,30}?)(?:\s+(?:for|on|at|from|in|worth|of|using|via|through|with|rs|inr|\d|$))/i;
  const m = text.match(locPattern);
  if (m?.[1]) {
    const candidate = m[1].trim();
    if (candidate.length >= 2 && candidate.length <= 35) return toTitleCase(candidate);
  }
  const inferred = inferCategory(text);
  return inferred === category ? category : toTitleCase(inferred);
}

function scoreConfidence(amount: number | null, text: string, merchant: string): number {
  let score = 0;
  if (amount !== null) score += 0.5;
  if (/(?:at|from|on|to|for)\s+\w/i.test(text)) score += 0.2;
  if (merchant !== 'Food' && merchant !== 'Income') score += 0.1;
  return Math.min(score, 1);
}

export function parseVoiceLocally(text: string, today: string): LocalParsedTransaction & { recurring?: string } {
  const type = inferType(text);
  const category = inferCategory(text);
  const amount = extractAmount(text) ?? 0;
  const merchant = extractMerchant(text, category);
  const confidence = scoreConfidence(amount || null, text, merchant);

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
    category,
    merchant,
    type,
    date: today,
    confidence,
    split: null,
    source: 'local',
    recurring,
  };
}
