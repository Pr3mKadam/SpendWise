import { Category } from "../../types";

export interface AIParseResult {
  merchant: string;
  category: Category;
  amount?: number;
  date?: string;
  confidence: number;
}

/**
 * Uses Gemini AI (if key present) or local heuristics to analyze a transaction string.
 */
export async function processNaturalLanguageExpense(text: string): Promise<AIParseResult | null> {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (GEMINI_API_KEY) {
    try {
      const prompt = `Analyze this transaction description and extract details in JSON format.
Description: "${text}"

Required JSON fields:
- merchant: The business or person name (e.g., "Swiggy", "Amazon")
- category: One of [Food, Subscriptions, Transport, Entertainment, Shopping, Utilities, Health, Travel, Income, Transfer]
- amount: Numeric value if present
- confidence: 0.0 to 1.0

Return ONLY the JSON.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, response_mime_type: "application/json" }
        })
      });

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        return {
          merchant: parsed.merchant || text,
          category: (parsed.category as Category) || 'Shopping',
          amount: parsed.amount,
          confidence: parsed.confidence || 0.9,
        };
      }
    } catch (e) {
      console.warn("AI Transaction Parse failed:", e);
    }
  }

  // Local Heuristics Fallback
  const lower = text.toLowerCase();
  let category: Category = 'Shopping';
  
  if (/zomato|swiggy|food|cafe|restaurant|eat|lunch|dinner/.test(lower)) category = 'Food';
  else if (/uber|ola|rapido|metro|bus|train|flight|fuel/.test(lower)) category = 'Transport';
  else if (/netflix|spotify|amazon|prime|youtube|hotstar/.test(lower)) category = 'Subscriptions';
  else if (/electricity|water|bill|recharge|mobile|broadband/.test(lower)) category = 'Utilities';
  else if (/doctor|hospital|pharma|med|health/.test(lower)) category = 'Health';
  else if (/movie|game|play|event|party/.test(lower)) category = 'Entertainment';

  return {
    merchant: text,
    category,
    confidence: 0.7,
  };
}
