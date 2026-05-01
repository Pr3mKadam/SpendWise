import { Transaction, Category } from '../types';
import { analyzeTransactionString } from './aiAnalyzer';

// ─── Merchant Memory (Phase 8.3) ────────────────────────────────────────────
const MEMORY_KEY = 'spendwise_merchant_memory';

type MerchantMemory = Record<string, { merchant: string; category: string }>;

function loadMerchantMemory(): MerchantMemory {
  try { return JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}'); } catch { return {}; }
}
function saveMerchantMemory(m: MerchantMemory) {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(m));
}

/** After AI parse or manual correction — remember this UPI VPA mapping. */
export function rememberMerchant(upiVPA: string, merchant: string, category: string) {
  if (!upiVPA) return;
  const m = loadMerchantMemory();
  m[upiVPA.toLowerCase()] = { merchant, category };
  saveMerchantMemory(m);
}

/**
 * Parse a UPI payment description with Gemini AI.
 * Falls back to simple keyword heuristics if Gemini is unavailable.
 * Uses merchant memory to skip repeat AI calls for known VPAs.
 */
export async function parseUPIPayment(
  description: string,
  upiVPA = '',
): Promise<{ merchant: string; category: Category; confidence: number; aiParsed: boolean }> {
  const vpaKey = upiVPA.toLowerCase();

  // 1 — Check merchant memory first (Phase 8.3)
  if (vpaKey) {
    const memory = loadMerchantMemory();
    if (memory[vpaKey]) {
      return {
        merchant: memory[vpaKey].merchant,
        category: memory[vpaKey].category as Category,
        confidence: 1.0,
        aiParsed: false, // from memory — no AI call
      };
    }
  }

  // 2 — Attempt AI Analysis
  const aiResult = await analyzeTransactionString(description || upiVPA);
  if (aiResult) {
    const out = {
      merchant: aiResult.merchant || description || upiVPA || 'UPI Payment',
      category: aiResult.category || 'Shopping',
      confidence: 0.95,
      aiParsed: true,
    };
    if (vpaKey) rememberMerchant(vpaKey, out.merchant, out.category);
    return out;
  }

  // 3 — Offline Heuristics Parse (Fallback)
  const desc = (description || upiVPA).toLowerCase();
  const cat: Category =
    /zomato|swiggy|food|cafe|restaurant|eat|lunch|dinner|pizza|burger/.test(desc) ? 'Food' :
    /uber|ola|rapido|metro|bus|train|flight|fuel|petrol/.test(desc) ? 'Transport' :
    /netflix|spotify|amazon|prime|youtube|hotstar|sub/.test(desc) ? 'Subscriptions' :
    /amazon|flipkart|myntra|mall|shop|store/.test(desc) ? 'Shopping' :
    /electricity|water|bill|recharge|mobile|broadband|wifi/.test(desc) ? 'Utilities' :
    /doctor|hospital|pharma|med|health|clinic/.test(desc) ? 'Health' :
    /movie|game|play|event|party|concert/.test(desc) ? 'Entertainment' :
    'Transfer';

  const out = {
    merchant: description || upiVPA || 'UPI Payment',
    category: cat,
    confidence: 0.8,
    aiParsed: false,
  };

  if (vpaKey) rememberMerchant(vpaKey, out.merchant, out.category);
  return out;
}


export interface RazorpayAuth {
  keyId: string;
  keySecret: string;
}

/**
 * Fetches recent captured payments from Razorpay API and converts them into SpendWise transactions.
 */
export async function fetchRazorpayTransactions(auth: RazorpayAuth): Promise<Transaction[]> {
  const credentials = btoa(`${auth.keyId}:${auth.keySecret}`);
  
  // We'll fetch the latest 50 payments.
  const response = await fetch('https://api.razorpay.com/v1/payments?count=50', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.description || 'Failed to authenticate or fetch from Razorpay API.');
  }

  const data = await response.json();
  const payments = data.items || [];
  
  // Convert standard Razorpay payments (payments received by the merchant) strictly as INCOMES.
  const transactions: Transaction[] = [];

  for (const p of payments) {
    // Only sink successful transactions that actually added to the balance natively
    if (p.status !== 'captured') continue;

    // Convert Unix timestamp to ISO Date
    const isoDate = new Date(p.created_at * 1000).toISOString();
    
    // Amount is in smallest currency unit (paise/cents). Divide by 100.
    const realAmount = typeof p.amount === 'number' ? p.amount / 100 : 0;
    if (realAmount <= 0) continue;

    const t: Transaction = {
      id: `rzp_${p.id}`,
      date: isoDate,
      amount: realAmount,
      type: 'credit', // Incomes are 'credit' inside SpendWise (reduces net-debt/adds to balance)
      // Attempt to intelligently categorize business sales/receipts
      category: p.method === 'upi' ? 'Transfer' as Category : 'Salary' as Category,
      merchant: p.email || p.contact || `Razorpay - ${p.method?.toUpperCase() || 'Gateway'}`,
      description: p.description || `Payment via ${p.method}`,
      isNew: true,
      confidence: 1.0,
      aiParsed: false
    };

    transactions.push(t);
  }

  return transactions;
}

// ─── UPI Payment Checkout ───────────────────────────────────────────────────

export interface RazorpayPaymentOptions {
  keyId: string;
  amount: number;         // in rupees — converted to paise internally
  description: string;
  prefillName?: string;
  prefillEmail?: string;
  prefillContact?: string;
  onSuccess: (details: RazorpayPaymentResult) => void;
  onFailure?: (error: any) => void;
}

export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  amount: number;         // in rupees
  description: string;
  method: string;
}

/** Opens the Razorpay checkout popup for a UPI payment. */
export function initiateRazorpayPayment(opts: RazorpayPaymentOptions): void {
  const RazorpaySDK = (window as any).Razorpay;
  if (!RazorpaySDK) {
    alert('Razorpay SDK not loaded. Check your internet connection.');
    return;
  }

  const rzp = new RazorpaySDK({
    key: opts.keyId,
    amount: Math.round(opts.amount * 100), // convert to paise
    currency: 'INR',
    name: 'SpendWise',
    description: opts.description,
    prefill: {
      name: opts.prefillName ?? '',
      email: opts.prefillEmail ?? '',
      contact: opts.prefillContact ?? '',
    },
    theme: { color: '#14b8a6' },
    handler: function (response: any) {
      opts.onSuccess({
        razorpay_payment_id: response.razorpay_payment_id ?? `demo_${Date.now()}`,
        amount: opts.amount,
        description: opts.description,
        method: 'upi',
      });
    },
    modal: {
      ondismiss: () => opts.onFailure?.({ message: 'Payment cancelled by user' }),
    },
  });

  rzp.open();
}
