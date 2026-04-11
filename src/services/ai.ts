import type { Category } from '../types';

// ─── Exported Types ────────────────────────────────────────────────────────────

export interface SplitItem {
  amount:   number;
  category: string;
  merchant: string;
}

export interface ParsedTransaction {
  amount:     number;
  category:   Category;
  merchant:   string;
  type:       'credit' | 'debit';
  date:       string;            // YYYY-MM-DD
  confidence: number;            // 0.0 – 1.0
  split:      SplitItem[] | null;
}

// ─── Typed Error ───────────────────────────────────────────────────────────────

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AIServiceError';
    Object.setPrototypeOf(this, AIServiceError.prototype);
  }
}

// ─── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT_TEMPLATE = `You are a financial transaction parser. Extract structured data from natural language \
expense descriptions. Return ONLY valid JSON — no markdown, no explanation, nothing else.

Output schema:
{
  amount: number (always positive),
  category: 'Food'|'Transport'|'Subscriptions'|'Entertainment'|'Shopping'|'Utilities'|'Health'|'Income',
  merchant: string (2-40 chars, title case),
  type: 'credit'|'debit',
  date: 'YYYY-MM-DD' (extract if mentioned, else use today: {TODAY}),
  confidence: number 0.0-1.0,
  split: null | [{amount: number, category: string, merchant: string}]
}

If confidence < 0.7, still return best guess.`;

// ─── Gemini Config ─────────────────────────────────────────────────────────────

const MODEL   = 'gemini-2.0-flash';
const API_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

// ─── Main Exported Function ────────────────────────────────────────────────────

/**
 * Calls the Google Gemini API to parse a natural language expense description.
 *
 * @param text  - The raw user-provided expense description.
 * @param today - Today's date in YYYY-MM-DD format (injected by the caller).
 * @returns A structured {@link ParsedTransaction} on success.
 * @throws  {@link AIServiceError} on any failure — caller should fall back to
 *          the regex-based parser in `src/data/mockData.ts`.
 */
export async function parseTransaction(
  text: string,
  today: string,
): Promise<ParsedTransaction> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (!apiKey) {
    throw new AIServiceError(
      'VITE_GEMINI_API_KEY is not set. Falling back to local parser.',
    );
  }

  // Replace {TODAY} placeholder with the caller-supplied date
  const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{TODAY}', today);

  // ── Build the request ──────────────────────────────────────────────────────
  let response: Response;
  try {
    response = await fetch(API_URL(apiKey), {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role:  'user',
            parts: [{ text }],
          },
        ],
        generationConfig: {
          // Tells Gemini to return raw JSON — no markdown fences
          responseMimeType: 'application/json',
          temperature:      0.1,   // low temperature for deterministic parsing
          maxOutputTokens:  512,
        },
      }),
    });
  } catch (networkError) {
    throw new AIServiceError(
      `Network error contacting Gemini API: ${String(networkError)}`,
      networkError,
    );
  }

  // ── Handle HTTP-level errors ───────────────────────────────────────────────
  if (!response.ok) {
    let body = '';
    try { body = await response.text(); } catch { /* ignore */ }
    throw new AIServiceError(
      `Gemini API returned HTTP ${response.status}: ${body}`,
    );
  }

  // ── Parse the Gemini response envelope ────────────────────────────────────
  let envelope: GeminiResponse;
  try {
    envelope = (await response.json()) as GeminiResponse;
  } catch (jsonError) {
    throw new AIServiceError(
      'Failed to parse Gemini API response as JSON.',
      jsonError,
    );
  }

  const rawText = envelope?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!rawText) {
    throw new AIServiceError('Gemini API returned an empty content block.');
  }

  // ── Parse the model's JSON output ─────────────────────────────────────────
  // responseMimeType: 'application/json' means rawText should already be clean
  // JSON, but we strip any accidental fences just in case.
  const cleaned = rawText.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseError) {
    throw new AIServiceError(
      `Model returned non-JSON text: "${cleaned.slice(0, 200)}"`,
      parseError,
    );
  }

  // ── Validate the shape of the parsed object ────────────────────────────────
  const validated = validateParsedTransaction(parsed);
  if (!validated) {
    throw new AIServiceError(
      `Model JSON did not match ParsedTransaction schema: ${JSON.stringify(parsed).slice(0, 300)}`,
    );
  }

  return validated;
}

// ─── Financial coach (Gemini) ─────────────────────────────────────────────────

export interface CoachContext {
  currency:              string;
  currentBalance:        number;
  predictedEndOfMonth:   number;
  totalSpentMonth:       number;
  totalIncomeMonth:      number;
  dailySpendRate:        number;
  daysLeftInMonth:       number;
  dataQuality:           'low' | 'medium' | 'high';
  topCategories:         { name: string; amount: number; percent: number }[];
}

const COACH_SYSTEM = `You are a concise, supportive financial coach. You receive numeric spending summaries only.
Write exactly 2–3 short sentences (under 400 characters total). Be specific with numbers and the user's currency symbol.
Focus on: spending patterns, whether month-end balance looks healthy, one concrete habit to try.
No markdown, no bullet characters, no JSON, no preamble — output only the coaching sentences.`;

/**
 * Returns a short coaching paragraph, or null if the API key is missing or the call fails.
 */
export async function generateCoachInsight(ctx: CoachContext): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) return null;

  const userPayload = [
    `Currency: ${ctx.currency}`,
    `Current balance: ${ctx.currentBalance}`,
    `Predicted balance at month-end (from 30-day daily spend × days left): ${ctx.predictedEndOfMonth}`,
    `This month income: ${ctx.totalIncomeMonth}, expenses: ${ctx.totalSpentMonth}`,
    `30-day average daily debit rate: ${ctx.dailySpendRate}`,
    `Days left in month: ${ctx.daysLeftInMonth}`,
    `Projection data quality (debit sample): ${ctx.dataQuality}`,
    `Top spending categories: ${JSON.stringify(ctx.topCategories)}`,
  ].join('\n');

  let response: Response;
  try {
    response = await fetch(API_URL(apiKey), {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: COACH_SYSTEM }] },
        contents:           [{ role: 'user', parts: [{ text: userPayload }] }],
        generationConfig: {
          temperature:     0.45,
          maxOutputTokens: 256,
        },
      }),
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  let envelope: GeminiResponse;
  try {
    envelope = (await response.json()) as GeminiResponse;
  } catch {
    return null;
  }

  const rawText = envelope?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const cleaned = rawText.trim().replace(/^["']|["']$/g, '').trim();
  return cleaned.length > 0 ? cleaned.slice(0, 600) : null;
}

// ─── Gemini Response Types (minimal) ──────────────────────────────────────────

interface GeminiPart     { text: string }
interface GeminiContent  { parts: GeminiPart[]; role: string }
interface GeminiCandidate { content: GeminiContent; finishReason?: string }
interface GeminiResponse  { candidates: GeminiCandidate[] }

// ─── Schema Validation ─────────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set<string>([
  'Food', 'Transport', 'Subscriptions', 'Entertainment',
  'Shopping', 'Utilities', 'Health', 'Income',
]);

function validateParsedTransaction(raw: unknown): ParsedTransaction | null {
  if (typeof raw !== 'object' || raw === null) return null;

  const obj = raw as Record<string, unknown>;

  const amount     = obj['amount'];
  const category   = obj['category'];
  const merchant   = obj['merchant'];
  const type       = obj['type'];
  const date       = obj['date'];
  const confidence = obj['confidence'];
  const split      = obj['split'];

  if (typeof amount !== 'number'     || amount < 0)                              return null;
  if (typeof category !== 'string'   || !VALID_CATEGORIES.has(category))         return null;
  if (typeof merchant !== 'string'   || merchant.length < 2 || merchant.length > 40) return null;
  if (type !== 'credit' && type !== 'debit')                                     return null;
  if (typeof date !== 'string'       || !/^\d{4}-\d{2}-\d{2}$/.test(date))      return null;
  if (typeof confidence !== 'number' || confidence < 0 || confidence > 1)        return null;

  let validatedSplit: SplitItem[] | null = null;
  if (split !== null) {
    if (!Array.isArray(split)) return null;
    const items: SplitItem[] = [];
    for (const item of split) {
      if (typeof item !== 'object' || item === null) return null;
      const s = item as Record<string, unknown>;
      if (typeof s['amount']   !== 'number') return null;
      if (typeof s['category'] !== 'string') return null;
      if (typeof s['merchant'] !== 'string') return null;
      items.push({
        amount:   s['amount']   as number,
        category: s['category'] as string,
        merchant: s['merchant'] as string,
      });
    }
    validatedSplit = items.length > 0 ? items : null;
  }

  return {
    amount,
    category:   category as Category,
    merchant,
    type,
    date,
    confidence,
    split: validatedSplit,
  };
}
