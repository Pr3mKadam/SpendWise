import { Category } from "../../types";

export const VALID_CATEGORIES: Category[] = [
  'Food',
  'Subscriptions',
  'Transport',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Health',
  'Income',
  'Transfer',
];

// ─── Merchant → Category map ────────────────────────────────────────────────
export const MERCHANT_CATEGORY_MAP: Record<string, Category> = {
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

export function inferCategory(text: string): Category {
  const lower = text.toLowerCase();
  for (const [keyword, category] of Object.entries(MERCHANT_CATEGORY_MAP)) {
    if (lower.includes(keyword)) return category as Category;
  }
  return 'Shopping';
}

export function inferType(text: string, amount?: number): 'credit' | 'debit' {
  const lower = text.toLowerCase();
  const creditSignals = ['credited', 'received', 'salary', 'income', 'refund', 'cashback', 'cr ', 'credit', 'neft cr', 'deposited', 'earned'];
  if (creditSignals.some(s => lower.includes(s))) return 'credit';
  if (amount !== undefined && amount < 0) return 'credit';
  return 'debit';
}

export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
