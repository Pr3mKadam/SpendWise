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
 * Supports extracting multiple transactions from a single sentence (e.g., "500 on food 700 on travel 800 on subscription").
 */
export async function processNaturalLanguageExpense(text: string, currencyContext?: string): Promise<AIParseResult[] | null> {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (GEMINI_API_KEY) {
    try {
      const prompt = `Analyze this transaction description and extract ALL distinct expense/income items as a JSON ARRAY of objects.
Description: "${text}"
${currencyContext ? `Context: User's base currency is ${currencyContext}.` : ''}

For example, if description is "500 on food 700 on travel 800 on subscription", return an array with THREE objects.

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

  // Local Heuristics Fallback for multiple items (Highly advanced tokenizer)
  const results: AIParseResult[] = [];
  
  // Find all number occurrences in the text (e.g., 500, 700, 1,200.50)
  const numberMatches = Array.from(text.matchAll(/\b(\d+[\d,]*\.?\d*)\b/g));

  if (numberMatches.length > 1) {
    // We have multiple numbers! Determine if it's Amount-First or Description-First
    const firstIndex = numberMatches[0].index!;
    const textBeforeFirst = text.slice(0, firstIndex).trim();
    const isAmountFirst = textBeforeFirst.length === 0 || /^(?:rs\.?|inr|₹|\$|€|£|¥)$/i.test(textBeforeFirst);

    for (let i = 0; i < numberMatches.length; i++) {
      const match = numberMatches[i];
      const amountStr = match[1];
      const amount = parseFloat(amountStr.replace(/,/g, ''));
      let desc = '';

      if (isAmountFirst) {
        // Description is the text between this number and the next number
        const start = match.index! + match[0].length;
        const end = i < numberMatches.length - 1 ? numberMatches[i + 1].index! : text.length;
        desc = text.slice(start, end).trim();
        // Clean up leading/trailing connectors
        desc = desc.replace(/^(?:on|and|&|,|;|\+|for)\s+/i, '').replace(/\s+(?:and|&|,|;|\+|for|on)$/i, '').trim();
        if (!desc) desc = `Expense ${i + 1}`;
      } else {
        // Description is the text between the previous number (or 0) and this number
        const start = i === 0 ? 0 : numberMatches[i - 1].index! + numberMatches[i - 1][0].length;
        const end = match.index!;
        desc = text.slice(start, end).trim();
        desc = desc.replace(/^(?:on|and|&|,|;|\+|for)\s+/i, '').replace(/\s+(?:and|&|,|;|\+|for|on)$/i, '').trim();
        if (!desc) desc = `Expense ${i + 1}`;
      }

      // Determine category from desc
      const lower = desc.toLowerCase();
      let category: Category = 'Shopping';
      if (/zomato|swiggy|food|cafe|restaurant|eat|lunch|dinner|snack|starbucks|coffee/.test(lower)) category = 'Food';
      else if (/uber|ola|rapido|metro|bus|train|flight|fuel|travel|cab/.test(lower)) category = 'Transport';
      else if (/netflix|spotify|amazon|prime|youtube|hotstar|sub|susbcription|subscription/.test(lower)) category = 'Subscriptions';
      else if (/electricity|water|bill|recharge|mobile|broadband/.test(lower)) category = 'Utilities';
      else if (/doctor|hospital|pharma|med|health/.test(lower)) category = 'Health';
      else if (/movie|game|play|event|party/.test(lower)) category = 'Entertainment';

      const isCredit = /\b(income|salary|received|credited|payment received|earned|bonus|refund|cashback|reward)\b/i.test(desc);

      results.push({
        merchant: desc,
        category,
        amount,
        type: isCredit ? 'credit' : 'debit',
        confidence: 0.8,
      });
    }
  } else {
    // Single number or fallback splitting by "and", "&", ",", ";", "+"
    const parts = text.split(/\b(?:and|&|,|;|\+)\b/i).map(p => p.trim()).filter(Boolean);
    
    for (const part of parts) {
      const lower = part.toLowerCase();
      let category: Category = 'Shopping';
      
      if (/zomato|swiggy|food|cafe|restaurant|eat|lunch|dinner|snack|starbucks|coffee/.test(lower)) category = 'Food';
      else if (/uber|ola|rapido|metro|bus|train|flight|fuel|travel|cab/.test(lower)) category = 'Transport';
      else if (/netflix|spotify|amazon|prime|youtube|hotstar|sub|susbcription|subscription/.test(lower)) category = 'Subscriptions';
      else if (/electricity|water|bill|recharge|mobile|broadband/.test(lower)) category = 'Utilities';
      else if (/doctor|hospital|pharma|med|health/.test(lower)) category = 'Health';
      else if (/movie|game|play|event|party/.test(lower)) category = 'Entertainment';

      const amountMatch =
        part.match(/(?:rs\.?|inr|₹|\$|€|£|¥)\s*([\d,]+\.?\d*)/i) ||
        part.match(/\b([\d,]+\.?\d*)\s*(?:rs\.?|inr|rupees?|\$|€|£|¥)\b/i) ||
        part.match(/\b(\d{2,}[.,]?\d*)\b/);
      
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined;
      const isCredit = /\b(income|salary|received|credited|payment received|earned|bonus|refund|cashback|reward)\b/i.test(part);

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
