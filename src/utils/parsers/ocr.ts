import Tesseract from 'tesseract.js';
import { Transaction } from "../../types";
import { MERCHANT_CATEGORY_MAP } from "./common";

export async function recognizeReceipt(imageBase64: string): Promise<string> {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageBase64,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            // Optional: You could emit progress to a global state or callback
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

  // Enhanced amount detection
  const amountRegex = /(?:total|amount|sum|due|pay|grand total)?\s*[:$₹Rs]?\s*(\d+[.,]\d{2})/i;
  
  for (const line of lines) {
    // Look for individual line items
    const match = line.match(/(\d+(?:[.,]\d{2}))(?:\s|$)/);
    if (match) {
      const amt = parseFloat(match[1].replace(',', '.'));
      const desc = line.replace(match[0], '').trim().replace(/[^a-zA-Z0-9\s]/g, '');
      if (amt > 0 && desc.length > 2) {
        let cat = 'Other';
        const lowerDesc = desc.toLowerCase();
        for (const [merch, c] of Object.entries(MERCHANT_CATEGORY_MAP)) {
          if (lowerDesc.includes(merch)) { cat = c; break; }
        }
        items.push({ label: desc, amount: amt, category: cat });
      }
    }
  }

  // Find Total Amount (Look for largest amount near "total" keywords)
  const totalKeywords = ['total', 'amount', 'due', 'pay', 'sum', 'net', 'final', 'grand total'];
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (totalKeywords.some(kw => lowerLine.includes(kw))) {
      const match = line.match(amountRegex);
      if (match) {
        const parsed = parseFloat(match[1].replace(',', '.'));
        if (parsed > totalAmount) totalAmount = parsed;
      }
    }
  }

  // Fallback: If no "total" keyword found, use the maximum amount found in the receipt
  if (totalAmount === 0) {
    const allNums = items.map(i => i.amount);
    totalAmount = allNums.length > 0 ? Math.max(...allNums) : 0;
  }

  // Merchant Detection (Premium: Check top 5 lines, exclude common receipt words)
  let merchant = 'Receipt';
  const excludeWords = /total|tax|invoice|receipt|date|order|tel|phone|store|cashier|item|qty|price/i;
  for (const line of lines.slice(0, 8)) {
    if (line.length > 3 && !line.match(/\d{3,}/) && !excludeWords.test(line)) {
      merchant = line.replace(/[^a-zA-Z\s]/g, '').trim();
      if (merchant.length > 2) break;
    }
  }

  // Final mapping check
  let category = 'Other';
  for (const [merch, cat] of Object.entries(MERCHANT_CATEGORY_MAP)) {
    if (rawText.toLowerCase().includes(merch)) {
      category = cat;
      if (merchant === 'Receipt' || merchant.length < 3) {
        merchant = merch.charAt(0).toUpperCase() + merch.slice(1);
      }
      break;
    }
  }

  return {
    amount: totalAmount,
    merchant: merchant || 'Unknown Merchant',
    category,
    date: new Date().toISOString().split('T')[0],
    type: 'debit',
    description: 'Scanned via SpendWise Vision',
    splits: items.length > 1 ? items.filter(i => i.amount < totalAmount * 0.9) : undefined
  };
}
