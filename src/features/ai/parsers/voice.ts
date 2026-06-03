import { Category } from '@/types';
import { Transaction } from '@/types';

export function parseVoiceLocally(transcript: string, date: string): Partial<Transaction> {
  const lower = transcript.toLowerCase();

  // Extract amount
  const amountMatch = lower.match(/(\d+)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  // Extract category
  let category: Category = 'Shopping';
  if (/food|dinner|lunch|breakfast|eat|starbucks|restaurant/.test(lower)) category = 'Food';
  else if (/uber|ola|rapido|cab|ride|transport|fuel|petrol/.test(lower)) category = 'Transport';
  else if (/movie|cinema|netflix|show|entertainment/.test(lower)) category = 'Entertainment';
  else if (/medicine|doctor|health|medical|hospital/.test(lower)) category = 'Health';
  else if (/bill|recharge|electricity|water|utilities/.test(lower)) category = 'Utilities';

  // Extract merchant - very simple logic
  let merchant = transcript;
  const merchantMatch = lower.match(/(?:at|from|to)\s+([a-z\s]+)(?:\s+for|$)/);
  if (merchantMatch) {
    merchant = merchantMatch[1].trim();
  }

  return {
    amount,
    category,
    merchant: merchant.charAt(0).toUpperCase() + merchant.slice(1),
    date,
    type: 'debit',
    status: 'completed',
  };
}
