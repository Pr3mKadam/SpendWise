import { callGemini } from "@/services/gemini";
import { Category } from "@/types";

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
  try {
    const prompt = `Analyze this transaction description and extract ALL distinct expense/income items as a JSON ARRAY of objects.
Description: "${text}"
${currencyContext ? `Context: User's base currency is ${currencyContext}.` : ''}

For example:
- "500 on food 700 on travel 800 on subscription" -> 3 objects.
- "Spent 500 on food, got 2000 salary" -> 1 debit object (Food) and 1 credit object (Salary).
- "I got 2000 rs" or "received 5000 salary" -> 1 credit object (Income).

Each object in the JSON array must have:
- merchant: The business, person name, or short description (e.g. "Food", "Starbucks", "Travel", "Salary", "Refund", "Income", "Rahul")
- category: One of [Food, Subscriptions, Transport, Entertainment, Shopping, Utilities, Health, Travel, Education, Business, Income]
- amount: Numeric value
- type: "credit" if money was received, earned, got, won, refunded, deposited, salary, income, or cashback; "debit" if spent or paid.
- confidence: 0.0 to 1.0

Return ONLY the JSON array of objects.`;

    const data = await callGemini({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
    });

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const cleanJson = rawText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        return arr.map(item => ({
          merchant: item.merchant || text,
          category: (item.category as Category) || (item.type === 'credit' ? 'Income' : 'Shopping'),
          amount: parseFloat(item.amount) || 0,
          type: item.type || 'debit',
          confidence: item.confidence || 0.9,
        }));
      }
    } catch (e) {
      console.warn("AI Transaction Parse failed, falling back to local heuristics:", e);
    }

  // Helper functions
  const toTitleCase = (str: string) => str.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase());
  
  const expandIndianShorthand = (t: string) => {
    return t
      .replace(/\b(\d+(?:\.\d+)?)\s*[kK]\b/g, (_, n) => (parseFloat(n) * 1000).toString())
      .replace(/\b(\d+(?:\.\d+)?)\s*(?:lakh|lacs?|[lL])\b/g, (_, n) => (parseFloat(n) * 100000).toString())
      .replace(/\b(\d+(?:\.\d+)?)\s*(?:crores?|crs?)\b/g, (_, n) => (parseFloat(n) * 10000000).toString());
  };

  // Local Heuristics Fallback for multiple items (Highly advanced tokenizer)
  const results: AIParseResult[] = [];
  
  const expandedText = expandIndianShorthand(text);
  
  // Find all number occurrences in the text (e.g., 500, 700, 1,200.50)
  const numberMatches = Array.from(expandedText.matchAll(/\b(\d+[\d,]*\.?\d*)\b/g));

  // Helper to determine credit and category
  const analyzeItem = (desc: string, fullText: string): { category: Category; type: 'credit' | 'debit' } => {
    const lowerDesc = desc.toLowerCase();
    const lowerFull = fullText.toLowerCase();

    // Check explicit debit categories first
    let category: Category | null = null;
    if (/zomato|swiggy|food|cafe|restaurant|eat|lunch|dinner|snack|starbucks|coffee|burger|pizza|bakery|chai|grocery|groceries/.test(lowerDesc)) category = 'Food';
    else if (/transport|uber|ola|rapido|metro|bus|train|flight|fuel|travel|cab|ticket|auto|rickshaw/.test(lowerDesc)) category = 'Transport';
    else if (/netflix|spotify|amazon|prime|youtube|hotstar|sub|susbcription|subscription|apple music/.test(lowerDesc)) category = 'Subscriptions';
    else if (/electricity|water|bill|recharge|mobile|broadband|wifi|gas|rent|maintenance|emi|loan/.test(lowerDesc)) category = 'Utilities';
    else if (/doctor|hospital|pharma|med|health|clinic|gym|therapy|medicine/.test(lowerDesc)) category = 'Health';
    else if (/movie|game|play|event|party|concert|cinema|theatre|show/.test(lowerDesc)) category = 'Entertainment';
    else if (/school|college|tuition|course|books|education|class/.test(lowerDesc)) category = 'Education';
    else if (/business|office|freelance|client/.test(lowerDesc)) category = 'Business';

    // Explicit credit keywords that guarantee credit
    const hasExplicitCredit = /\b(income|salary|credited|payment received|earned|bonus|refund|cashback|reward|deposit|payout|allowance|freelance|interest|dividend|pocket money)\b/i.test(lowerDesc);

    // Ambiguous credit keywords (got, get, received, win, won, gain, profit, gift)
    // If these exist AND no debit category matched, it's credit/income! E.g. "I got 2000 rs"
    const hasAmbiguousCredit = /\b(got|get|received|win|won|gain|gained|profit|gift)\b/i.test(lowerDesc);

    // Explicit debit keywords
    const hasExplicitDebit = /\b(spent|spend|paid|pay|bought|buy|give|gave|sent)\b/i.test(lowerDesc);

    let type: 'credit' | 'debit' = 'debit';

    if (hasExplicitCredit) {
      type = 'credit';
    } else if (hasAmbiguousCredit && !category && !hasExplicitDebit) {
      type = 'credit';
    } else if (hasExplicitDebit) {
      type = 'debit';
    }

    // Assign final category
    if (type === 'credit') {
      return { category: category || 'Income', type };
    }

    return { category: category || 'Shopping', type };
  };

  if (numberMatches.length > 1) {
    // We have multiple numbers! Determine if it's Amount-First or Description-First
    const firstIndex = numberMatches[0].index!;
    const textBeforeFirst = expandedText.slice(0, firstIndex).trim();
    const cleanTextBeforeFirst = textBeforeFirst.replace(/\b(i|my|spent|spend|paid|pay|bought|buy|gave|give)\b/ig, '').trim();
    const isAmountFirst = cleanTextBeforeFirst.length === 0 || /^(?:rs\.?|inr|₹|\$|€|£|¥)$/i.test(cleanTextBeforeFirst);

    for (let i = 0; i < numberMatches.length; i++) {
      const match = numberMatches[i];
      const amountStr = match[1];
      const amount = parseFloat(amountStr.replace(/,/g, ''));
      let desc = '';

      if (isAmountFirst) {
        const start = match.index! + match[0].length;
        const end = i < numberMatches.length - 1 ? numberMatches[i + 1].index! : expandedText.length;
        desc = expandedText.slice(start, end).trim();
        desc = desc.replace(/^(?:on|and|&|,|;|\+|for)\s+/i, '').replace(/\s+(?:and|&|,|;|\+|for|on)$/i, '').trim();
      } else {
        const start = i === 0 ? 0 : numberMatches[i - 1].index! + numberMatches[i - 1][0].length;
        const end = match.index!;
        desc = expandedText.slice(start, end).trim();
        desc = desc.replace(/^(?:on|and|&|,|;|\+|for)\s+/i, '').replace(/\s+(?:and|&|,|;|\+|for|on)$/i, '').trim();
      }

      const rawMerchant = desc || `Expense ${i + 1}`;
      let cleanMerchant = rawMerchant
        .replace(/\b(\d+[\d,]*\.?\d*)\b/g, '')
        .replace(/\b(rs\.?|inr|rupees?|₹|\$|€|£|¥)\b/ig, '')
        .replace(/\b(spent|spend|paid|pay|got|received|on|for|at|to|from)\b/ig, '')
        .trim()
        .replace(/\s+/g, ' ');

      if (!cleanMerchant) cleanMerchant = rawMerchant;

      const { category, type } = analyzeItem(desc, expandedText);

      results.push({
        merchant: toTitleCase(cleanMerchant),
        category,
        amount,
        type,
        confidence: 0.8,
      });
    }
  } else {
    // Single number or fallback splitting by "and", "&", ",", ";", "+"
    const parts = expandedText.split(/\b(?:and|&|,|;|\+)\b/i).map(p => p.trim()).filter(Boolean);
    
    for (const part of parts) {
      const amountMatch =
        part.match(/(?:rs\.?|inr|₹|\$|€|£|¥)\s*([\d,]+\.?\d*)/i) ||
        part.match(/\b([\d,]+\.?\d*)\s*(?:rs\.?|inr|rupees?|\$|€|£|¥)\b/i) ||
        part.match(/\b(\d{2,}[.,]?\d*)\b/);
      
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined;
      const { category, type } = analyzeItem(part, expandedText);

      if (amount !== undefined || parts.length === 1) {
        const rawMerchant = part || expandedText;
        let cleanMerchant = rawMerchant
          .replace(/\b(\d+[\d,]*\.?\d*)\b/g, '')
          .replace(/\b(rs\.?|inr|rupees?|₹|\$|€|£|¥)\b/ig, '')
          .replace(/\b(spent|spend|paid|pay|got|received|on|for|at|to|from)\b/ig, '')
          .trim()
          .replace(/\s+/g, ' ');

        if (!cleanMerchant) cleanMerchant = rawMerchant;

        results.push({
          merchant: toTitleCase(cleanMerchant),
          category,
          amount: amount || 0,
          type,
          confidence: 0.8,
        });
      }
    }
  }

  if (results.length === 0) {
    const { category, type } = analyzeItem(expandedText, expandedText);
    return [{
      merchant: toTitleCase(expandedText),
      category,
      amount: parseFloat(expandedText.replace(/[^0-9.]/g, '')) || 0,
      type,
      confidence: 0.6,
    }];
  }

  return results;
}
