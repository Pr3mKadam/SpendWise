import type { Category } from '../types';

export interface VoiceParsedTransaction {
  amount: number;
  category: Category;
  merchant: string;
  type: 'credit' | 'debit';
  date: string;
  recurring?: string;
}

export const parseVoiceWithGemini = async (text: string, today: string): Promise<VoiceParsedTransaction> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `Parse this voice command for a financial transaction: "${text}". 
            Today's date is ${today}.
            Return a JSON object with fields: 
            - amount (number)
            - category (string, must be one of: Food, Transport, Shopping, Bills, Entertainment, Health, Education, Investment, Income, Others)
            - merchant (string)
            - type (string, must be 'credit' or 'debit')
            - date (string, YYYY-MM-DD)
            - recurring (string, optional, e.g., month, week, year, day if specified).
            If a field is not found, use null or omit it. Be smart about relative dates like 'yesterday' or 'last week'.` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Gemini API Error:', error);
    throw new Error('Failed to parse voice command with Gemini');
  }

  const data = await response.json();
  const resultText = data.candidates[0].content.parts[0].text;
  
  try {
    const result = JSON.parse(resultText);
    return {
      amount: result.amount || 0,
      category: result.category || 'Others',
      merchant: result.merchant || 'Unknown Merchant',
      type: result.type || 'debit',
      date: result.date || today,
      recurring: result.recurring
    };
  } catch (e) {
    console.error('Failed to parse Gemini response as JSON:', resultText);
    throw new Error('Invalid response from Gemini');
  }
};
