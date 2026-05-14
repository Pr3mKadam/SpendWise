import type { Category } from '../types';
import type { VoiceCommand } from '../lib/voiceCommands/types';

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

export const parseMasterVoiceWithGemini = async (text: string, today: string): Promise<VoiceCommand> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `Parse this natural language voice command into a structured JSON object for a personal finance application.
            Today's date is ${today}.
            Command: "${text}"

            Return a valid JSON object matching this schema exactly:
            {
              "intent": "BUDGET_UPDATE" | "TRANSACTION_ADD" | "LIABILITY_ADD" | "PORTFOLIO_UPDATE" | "GOAL_ADD" | "SUBSCRIPTION_ADD" | "REPORT_EXPORT" | "QUERY_REPORT" | "BATCH_TRANSACTIONS" | "SETTINGS_TOGGLE" | "DATA_QUERY" | "TRANSACTION_DELETE" | "QUEST_ACTION" | "SEARCH_ACTION" | "NAVIGATE" | "HELP" | "UNKNOWN",
              "entities": {
                "category": "string (e.g. Food, Transport, Shopping)",
                "amount": "number (extract amount in INR, handle lakh/crore)",
                "name": "string (merchant name, liability name, goal name)",
                "period": "string (e.g. yesterday, today, month, week)",
                "view": "string (e.g. dashboard, analytics, budget, goals, shared, history, sync, profile, portfolio, subscriptions, UNDO)",
                "type": "debit" | "credit",
                "settingKey": "theme" | "privacy" | "notifications" | "biometric" | "shake" | "currency",
                "settingValue": "on" | "off" | "toggle",
                "searchQuery": "string (search term)",
                "items": [{"amount": "number", "category": "string", "name": "string"}] (for batch operations)
              },
              "confidence": "number between 0 and 1",
              "rawTranscript": "${text}",
              "summary": "Short human readable summary of the action"
            }
            Do not include any extra text or markdown formatting. Just the JSON.` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to parse voice command with Gemini');
  }

  const data = await response.json();
  const resultText = data.candidates[0].content.parts[0].text;
  
  try {
    const result = JSON.parse(resultText);
    return result as VoiceCommand;
  } catch (e) {
    console.error('Failed to parse Gemini response as JSON:', resultText);
    throw new Error('Invalid response from Gemini');
  }
};
