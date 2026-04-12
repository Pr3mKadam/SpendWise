import { Transaction, Category } from '../types';

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
