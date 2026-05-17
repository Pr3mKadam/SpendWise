import { Category } from "../../types";

export interface AIParseResult {
  merchant: string;
  category: Category;
  amount?: number;
  date?: string;
  type?: 'credit' | 'debit';
  confidence: number;
}

/**
 * Uses Gemini AI (if key present) or local heuristics to analyze a transaction string.
 * Supports extracting multiple transactions from a single sentence (e.g., "500 on food and 700 on travel").
 */
export async function processNaturalLanguageExpense(text: string, currencyContext?: string): Promise<AIParseResult[] | null> {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (GEMINI_API_KEY) {
    try {
      const prompt = `Analyze this transaction description and extract ALL distinct expense/income items as a JSON ARRAY of objects.
Description: "${text}"
${currencyContext ? `Context: User's base currency is ${currencyContext}.` : ''}

For example, if description is "500 on food and 700 on travel", return an array with TWO objects: one for food (500) and one for travel (700).

Each object in the JSON array must have:
- merchant: The business, person name, or short description (e.g. "Food", "Starbucks", "Travel", "Bus ticket")
- category: One of [Food, Subscriptions, Transport, Entertainment, Shopping, Utilities, Health, Travel, Income, Transfer]
- amount: Numeric value
- type: "credit" if money was received/earned, "debit" if spent/paid (default: "debit")
- confidence: 0.0 to 1.0

Return ONLY the JSON array of objects.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const cleanJson = rawText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        return arr.map(item => ({
          merchant: item.merchant || text,
          category: (item.category as Category) || 'Shopping',
          amount: parseFloat(item.amount) || 0,
          type: item.type || 'debit',
          confidence: item.confidence || 0.9,
        }));
      }
    } catch (e) {
      console.warn("AI Transaction Parse failed, falling back to local heuristics:", e);
    }
  }

  // Local Heuristics Fallback for multiple items
  // Split by "and", "&", ",", ";", "+" if they separate different amounts/items
  const parts = text.split(/\b(?:and|&|,|;|\+)\b/i).map(p => p.trim()).filter(Boolean);
  
  const results: AIParseResult[] = [];

  for (const part of parts) {
    const lower = part.toLowerCase();
    let category: Category = 'Shopping';
    
    if (/zomato|swiggy|food|cafe|restaurant|eat|lunch|dinner|snack/.test(lower)) category = 'Food';
    else if (/uber|ola|rapido|metro|bus|train|flight|fuel|travel|cab/.test(lower)) category = 'Transport';
    else if (/netflix|spotify|amazon|prime|youtube|hotstar/.test(lower)) category = 'Subscriptions';
    else if (/electricity|water|bill|recharge|mobile|broadband/.test(lower)) category = 'Utilities';
    else if (/doctor|hospital|pharma|med|health/.test(lower)) category = 'Health';
    else if (/movie|game|play|event|party/.test(lower)) category = 'Entertainment';

    const amountMatch =
      part.match(/(?:rs\.?|inr|₹|\$|€|£|¥)\s*([\d,]+\.?\d*)/i) ||
      part.match(/\b([\d,]+\.?\d*)\s*(?:rs\.?|inr|rupees?|\$|€|£|¥)\b/i) ||
      part.match(/\b(\d{2,}[.,]?\d*)\b/);
    
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined;
    const isCredit = /\b(income|salary|received|credited|payment received|earned|bonus|refund|cashback|reward)\b/i.test(part);

    // Only add if we found an amount or if there's only one part
    if (amount !== undefined || parts.length === 1) {
      results.push({
        merchant: part || text,
        category,
        amount: amount || 0,
        type: isCredit ? 'credit' : 'debit',
        confidence: 0.7,
      });
    }
  }

  if (results.length === 0) {
    return [{
      merchant: text,
      category: 'Shopping',
      amount: parseFloat(text.replace(/[^0-9.]/g, '')) || 0,
      type: 'debit',
      confidence: 0.5,
    }];
  }

  return results;
}
