import { Transaction, Category } from '../types';

export const UPI_PROVIDERS = [
  { id: 'gpay', name: 'Google Pay', color: '#1a73e8', icon: 'G' },
  { id: 'phonepe', name: 'PhonePe', color: '#5f259f', icon: 'P' },
  { id: 'paytm', name: 'Paytm', color: '#002970', icon: 'T' },
  { id: 'cred', name: 'CRED', color: '#000000', icon: 'C' },
  { id: 'bhim', name: 'BHIM UPI', color: '#f37021', icon: 'B' },
];

function randomDateInLast(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * days));
  return d.toISOString().split('T')[0];
}

const mockMerchants = [
  { name: 'Swiggy / Instamart', amount: [200, 500], cat: 'Food' },
  { name: 'Zomato Online', amount: [250, 400], cat: 'Food' },
  { name: 'Uber Trips', amount: [150, 600], cat: 'Transport' },
  { name: 'Amazon Pay', amount: [800, 3000], cat: 'Shopping' },
  { name: 'Blinkit Grocery', amount: [300, 1200], cat: 'Food' },
  { name: 'Netflix Subscription', amount: [199, 649], cat: 'Subscriptions' },
  { name: 'Spotify Premium', amount: [119, 119], cat: 'Subscriptions' },
  { name: 'Jio Prepaid Recharge', amount: [239, 299], cat: 'Utilities' },
  { name: 'Apollo Pharmacy', amount: [400, 1500], cat: 'Health' },
  { name: 'BookMyShow', amount: [300, 800], cat: 'Entertainment' },
  { name: 'Starbucks / Tata', amount: [250, 450], cat: 'Food' },
];

export function generateMockUPITransactions(provider: string, count: number = 10): Transaction[] {
  const txs: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const merchantRef = mockMerchants[Math.floor(Math.random() * mockMerchants.length)];
    const amount = Math.floor(
      Math.random() * (merchantRef.amount[1] - merchantRef.amount[0] + 1)
    ) + merchantRef.amount[0];

    const upiIds = ['@okicici', '@okhdfcbank', '@ybl', '@paytm', '@ibl'];
    const upiSuffix = upiIds[Math.floor(Math.random() * upiIds.length)];

    txs.push({
      id: `upi-${provider}-${Date.now()}-${i}`,
      date: randomDateInLast(30),
      amount: amount,
      merchant: `UPI/${merchantRef.name.substring(0, 8).toUpperCase()}${upiSuffix}`,
      category: merchantRef.cat as Category,
      type: 'debit',
      aiParsed: true, // indicates it was parsed securely
      tags: ['upi-sync', provider],
      isNew: true,
    });
  }

  // Add one fake "Received" transaction just for realism
  txs.push({
    id: `upi-${provider}-rcv-${Date.now()}`,
    date: randomDateInLast(5),
    amount: 1500,
    merchant: 'UPI/Ramesh Friend@okaxis',
    category: 'Income',
    type: 'credit',
    aiParsed: true,
    tags: ['upi-sync', provider, 'split'],
    isNew: true,
  });

  return txs.sort((a, b) => b.date.localeCompare(a.date));
}

// Simple Regex-based parser for Indian Bank SMS patterns
// Captures Amount, Merchant, and Type from standard SMS
export function parseUPISMS(text: string): Partial<Transaction> | null {
  const lower = text.toLowerCase();
  
  // Look for amount: Rs 150.00, INR 50, Rs. 1,000
  const amountMatch = text.match(/(?:rs\.?|inr)\s*([\d,]+\.?\d*)/i);
  if (!amountMatch) return null;
  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

  // Look for type
  let type: 'credit' | 'debit' = 'debit';
  if (lower.includes('credited') || lower.includes('deposited') || lower.includes('received')) {
    type = 'credit';
  } else if (lower.includes('debited') || lower.includes('spent') || lower.includes('sent')) {
    type = 'debit';
  } else {
    // default debit if unknown
  }

  // Look for merchant (anything after "to " or "vpa " or "info:")
  let merchant = 'Unknown UPI/Bank';
  const toMatch = text.match(/\bto\s+([A-Za-z0-9@\s]+?)(?:on\s|ref|upi|\.|$)/i);
  if (toMatch && type === 'debit') {
    merchant = toMatch[1].trim();
  }

  const fromMatch = text.match(/\bfrom\s+([A-Za-z0-9@\s]+?)(?:on\s|ref|upi|\.|$)/i);
  if (fromMatch && type === 'credit') {
    merchant = fromMatch[1].trim();
  }
  
  // Further cleanup
  if (merchant.length > 25) merchant = merchant.substring(0, 25);
  merchant = merchant.replace(/a\/c|account/gi, '').trim();

  return {
    amount,
    merchant,
    type,
    category: type === 'credit' ? 'Income' : 'Shopping', // Fallback, would need AI/Categorizer for better accuracy
  };
}
