import { Transaction } from "../../types";
import { inferCategory, inferType } from "./common";

export async function analyzeTransactionString(raw: string): Promise<Partial<Transaction> | null> {
  const amountMatch = raw.match(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i)
    || raw.match(/([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|₹)/i)
    || raw.match(/\b(\d{2,}(?:\.\d{1,2})?)\b/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

  let merchant = 'Unknown';
  const toMatch = raw.match(/(?:to|at|paid to)\s+([A-Za-z0-9 &'.@-]+?)(?:\s+on|\s+for|\s+\d|$)/i);
  const fromMatch = raw.match(/(?:from|by)\s+([A-Za-z0-9 &'.@-]+?)(?:\s+on|\s+for|\s+\d|$)/i);
  if (toMatch?.[1]) merchant = toMatch[1].trim();
  else if (fromMatch?.[1]) merchant = fromMatch[1].trim();

  const type = inferType(raw, amount);
  const category = type === 'credit' ? 'Income' : inferCategory(raw);

  return {
    merchant: merchant.slice(0, 50),
    amount,
    category,
    type,
    date: new Date().toISOString().split('T')[0],
    id: `sms-${Date.now()}`,
    description: raw.slice(0, 120),
  };
}

export async function processNaturalLanguageExpense(input: string): Promise<Partial<Transaction> | null> {
  const lower = input.toLowerCase();

  const amountPatterns = [
    /(?:spent|paid|cost|costs?|buying?|bought|₹|rs\.?)\s*(\d[\d,]*(?:\.\d{1,2})?)/i,
    /(\d[\d,]*(?:\.\d{1,2})?)\s*(?:rupees?|bucks?|rs\.?|₹|inr)/i,
    /(\d{2,}(?:\.\d{1,2})?)/,
  ];
  let amount = 0;
  for (const pattern of amountPatterns) {
    const m = input.match(pattern);
    if (m) { amount = parseFloat(m[1].replace(/,/g, '')); break; }
  }
  if (amount === 0) return null;

  let merchant = 'Unknown';
  const merchantPatterns = [
    /(?:on|at|from|to|for)\s+([A-Za-z0-9'&\- ]+?)(?:\s+(?:for|yesterday|today|this|last)|$)/i,
    /([A-Za-z]{3,}(?:\s+[A-Za-z]+)?)\s+(?:order|bill|subscription)/i,
  ];
  for (const pattern of merchantPatterns) {
    const m = input.match(pattern);
    if (m?.[1] && m[1].trim().length > 1) { merchant = m[1].trim(); break; }
  }

  const type: 'credit' | 'debit' = lower.includes('received') || lower.includes('got paid') || lower.includes('earned') ? 'credit' : 'debit';
  const category = type === 'credit' ? 'Income' : inferCategory(input);

  let date = new Date().toISOString().split('T')[0];
  if (lower.includes('yesterday')) {
    const d = new Date(); d.setDate(d.getDate() - 1);
    date = d.toISOString().split('T')[0];
  }

  return {
    merchant: merchant.slice(0, 60),
    amount,
    category,
    type,
    date,
    description: input.slice(0, 120),
    id: `nlp-${Date.now()}`,
  };
}
