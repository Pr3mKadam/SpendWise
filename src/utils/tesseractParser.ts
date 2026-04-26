import Tesseract from 'tesseract.js';
import { Transaction } from '../types';
import { MERCHANT_CATEGORY_MAP } from './voiceParser';

export async function recognizeReceipt(imageBase64: string): Promise<string> {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageBase64,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    return text;
  } catch (error) {
    console.error("Tesseract OCR error:", error);
    throw new Error("Failed to extract text locally");
  }
}

export function parseOfflineReceipt(rawText: string): Partial<Transaction> & { splits?: any[] } {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  
  let totalAmount = 0;
  const items: { label: string; amount: number; category: string }[] = [];
  
  // Step 1: Extract Line Items
  // Pattern: "Item Description ... 99.99"
  for (const line of lines) {
    const amountMatch = line.match(/(?:[\s\₹\Rs]*)\s*(\d+(?:[.,]\d{2}))(?:\s|$)/);
    if (amountMatch) {
      const amt = parseFloat(amountMatch[1].replace(',', '.'));
      const desc = line.replace(amountMatch[0], '').trim().replace(/[^a-zA-Z0-9\s]/g, '');
      
      if (amt > 0 && desc.length > 2) {
        // Guess category for item
        let cat = 'Other';
        const lowerDesc = desc.toLowerCase();
        for (const [merch, c] of Object.entries(MERCHANT_CATEGORY_MAP)) {
          if (lowerDesc.includes(merch)) { cat = c; break; }
        }
        items.push({ label: desc, amount: amt, category: cat });
      }
    }
  }

  // Step 2: Specifically look for lines indicating "Total"
  const totalKeywords = ['total', 'amount', 'due', 'pay', 'sum', 'net', 'final'];
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (totalKeywords.some(kw => lowerLine.includes(kw))) {
      const numbers = line.match(/\d+(?:[.,]\d{2})/g);
      if (numbers) {
        const parsed = numbers.map(n => parseFloat(n.replace(',', '.')));
        const maxOnLine = Math.max(...parsed.filter(n => !isNaN(n)));
        if (maxOnLine > totalAmount) totalAmount = maxOnLine;
      }
    }
  }

  // Step 3: Fallback logic for Total
  if (totalAmount === 0) {
    const allNums = items.map(i => i.amount);
    totalAmount = allNums.length > 0 ? Math.max(...allNums) : 0;
    // If multiple items, and none is drastically larger, maybe the total is the sum?
    // But receipts usually have a subtotal and total. Let's stick to max or sum if it's clear.
  }

  // Filter out the 'Total' item from splits if it was captured as an item
  const finalSplits = items.filter(i => Math.abs(i.amount - totalAmount) > 0.01 && !totalKeywords.some(kw => i.label.toLowerCase().includes(kw)));

  // Step 4: Guess merchant (usually at the top)
  let merchant = 'Receipt';
  for (const line of lines.slice(0, 5)) {
    if (line.length > 3 && !line.match(/\d/) && !/total|tax|invoice|receipt|date|order/i.test(line)) {
      merchant = line.replace(/[^a-zA-Z\s]/g, '').trim();
      if (merchant.length > 2) break;
    }
  }

  // Step 5: Map category for whole receipt
  let category = 'Other';
  for (const [merch, cat] of Object.entries(MERCHANT_CATEGORY_MAP)) {
    if (rawText.toLowerCase().includes(merch)) {
      category = cat;
      if (merchant === 'Receipt') merchant = merch.charAt(0).toUpperCase() + merch.slice(1);
      break;
    }
  }

  return {
    amount: totalAmount,
    merchant: merchant || 'Unknown Merchant',
    category,
    date: new Date().toISOString().split('T')[0],
    type: 'debit',
    description: 'Scanned offline receipt',
    splits: finalSplits.length > 1 ? finalSplits : undefined
  };
}
