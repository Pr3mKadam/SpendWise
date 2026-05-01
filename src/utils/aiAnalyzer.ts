import { GoogleGenerativeAI } from "@google/generative-ai";
import { Transaction, Category } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

export const VALID_CATEGORIES: Category[] = [
  'Food', 
  'Subscriptions', 
  'Transport', 
  'Entertainment', 
  'Shopping', 
  'Utilities', 
  'Health', 
  'Income', 
  'Transfer'
];

/**
 * Analyzes a raw string (SMS, UPI description, etc.) to extract transaction details.
 */
export async function analyzeTransactionString(raw: string): Promise<Partial<Transaction> | null> {
  if (!API_KEY) {
    console.warn("No Gemini API key found. Falling back to heuristic parsing.");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are an expert financial assistant for SpendWise.
      Analyze this raw transaction message (it could be an SMS or a UPI description) and extract the following in JSON format:
      - merchant: The name of the merchant/person.
      - amount: The numerical amount.
      - category: One of [${VALID_CATEGORIES.join(", ")}].
      - type: "debit" or "credit".

      Message: "${raw}"

      Respond ONLY with valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return {
      merchant: data.merchant || "Unknown",
      amount: Math.abs(parseFloat(data.amount)) || 0,
      category: data.category as Category,
      type: data.type as 'credit' | 'debit' || 'debit',
      date: new Date().toISOString().split('T')[0],
      id: `ai-${Date.now()}`
    };
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
}

/**
 * Parses raw CSV content using Gemini for smarter mapping.
 */
export async function parseCSVWithAI(csvContent: string): Promise<Transaction[]> {
  if (!API_KEY) return [];

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are an expert data parser. Parse this CSV content into a list of SpendWise transactions.
      Each transaction should have:
      - date: YYYY-MM-DD
      - merchant: string
      - amount: number (positive)
      - category: One of [${VALID_CATEGORIES.join(", ")}]
      - type: "debit" or "credit"

      CSV Content:
      ${csvContent.substring(0, 5000)} // Limit context

      Respond ONLY with a JSON array of objects.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI CSV Parsing failed:", error);
    return [];
  }
}

/**
 * Chat with Gemini for financial advice based on transaction history.
 */
export async function getFinancialAdvice(query: string, transactions: Transaction[]): Promise<string> {
  if (!API_KEY) return "AI Advisor is unavailable without an API key.";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Summarize history for context
    const summary = transactions.slice(-20).map(t => `${t.date}: ${t.merchant} - ${t.amount} (${t.category})`).join("\n");
    
    const prompt = `
      You are the SpendWise AI Financial Advisor.
      User History (Last 20 transactions):
      ${summary}

      User Question: "${query}"

      Provide concise, actionable financial advice based on the user's spending habits.
      Focus on saving, budgeting, and identifying patterns.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Advice failed:", error);
    return "I'm having trouble analyzing your finances right now. Please try again later.";
  }
}

/**
 * Process conversational expense logging (Voice-to-Text).
 */
export async function processNaturalLanguageExpense(input: string): Promise<Partial<Transaction> | null> {
  if (!API_KEY) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Extract transaction details from this conversational input: "${input}"
      JSON Format:
      - merchant: string
      - amount: number
      - category: One of [${VALID_CATEGORIES.join(", ")}]
      - type: "debit" or "credit"
      
      Example: "I spent 40 bucks on a movie" -> { merchant: "Movie", amount: 40, category: "Entertainment", type: "debit" }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return {
      ...data,
      date: new Date().toISOString().split('T')[0],
      id: `nlp-${Date.now()}`
    };
  } catch (error) {
    console.error("NLP Expense failed:", error);
    return null;
  }
}

/**
 * Generates a comprehensive monthly financial report.
 */
export async function generateMonthlyReport(month: string, transactions: Transaction[]): Promise<string> {
  if (!API_KEY) return "No API key.";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const summary = transactions.map(t => `${t.merchant}: ${t.amount} (${t.category})`).join(", ");
    
    const prompt = `
      Generate a witty and insightful monthly financial report for ${month}.
      Transaction Summary: ${summary}
      
      Include:
      1. A summary of the total spend.
      2. The "Category of the Month" (highest spend).
      3. 3 specific tips to save more next month.
      4. A humorous observation about their spending.
      
      Use Markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Report generation failed.";
  }
}

/**
 * Analyzes spending patterns to assign a "Spending Archetype".
 */
export async function getSpendingPersonality(transactions: Transaction[]): Promise<{
  archetype: string;
  description: string;
  traits: string[];
  advice: string;
}> {
  if (!API_KEY) throw new Error("No API key");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const summary = transactions.slice(-50).map(t => `${t.merchant}: ${t.amount} (${t.category})`).join(", ");
    
    const prompt = `
      Analyze these 50 transactions and determine a "Spending Personality Archetype" for the user.
      Examples of archetypes: "The Strategic Minimalist", "The Urban Foodie", "The Tech Enthusiast", "The Subscription King", "The Impulse Spender".
      
      Transactions: ${summary}
      
      Respond ONLY with a valid JSON object:
      {
        "archetype": "string",
        "description": "one sentence summary",
        "traits": ["trait 1", "trait 2", "trait 3"],
        "advice": "one short actionable tip"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Personality Analysis failed:", error);
    return {
      archetype: "The Mystery Spender",
      description: "Your spending patterns are unique and still being decoded.",
      traits: ["Unpredictable", "Eclectic", "Secretive"],
      advice: "Keep logging transactions to reveal your true spending nature."
    };
  }
}
