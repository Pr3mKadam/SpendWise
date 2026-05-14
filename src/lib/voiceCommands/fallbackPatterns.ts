/**
 * Fallback Patterns — SpendWise Master Voice Engine
 *
 * Contains regex patterns for local command parsing when Gemini is unavailable.
 */

import { VoiceCommand, VoiceIntent, VoiceEntities, AppView } from './types';

// Utility for Indian Number Parsing and Category normalization is still in main commandParser.ts
// We import them from there in the actual implementation, but here we define the patterns.

export interface Pattern {
  intent: VoiceIntent;
  regex: RegExp;
  extract: (match: RegExpMatchArray, transcript: string, helpers: any) => VoiceEntities;
  summarize: (entities: VoiceEntities) => string;
  confidence: number;
}

export const FALLBACK_PATTERNS: Pattern[] = [
  // ── HELP ───────────────────────────────────────────────────────────────────
  {
    intent: 'HELP',
    regex: /\b(help|commands|what can I say|how do I use|tutorial|guide|options)\b/i,
    extract: () => ({}),
    summarize: () => 'Showing supported voice commands…',
    confidence: 0.98,
  },

  // ── REPORT EXPORT ───────────────────────────────────────────────────────────
  {
    intent: 'REPORT_EXPORT',
    regex: /\b(export|generate|download|create|send)\b.*\b(pdf|report|statement|csv|excel)\b/i,
    extract: () => ({}),
    summarize: () => 'Exporting PDF report…',
    confidence: 0.95,
  },
  
  // ── QUERY REPORT ────────────────────────────────────────────────────────────
  {
    intent: 'QUERY_REPORT',
    regex: /\b(summarise|summarize|summary|overview|report|stats|total)\b.*\b(month|week|today|spending|expenses|income)\b/i,
    extract: (_match, transcript) => {
      const period = /month/i.test(transcript) ? 'month' : /week/i.test(transcript) ? 'week' : /today/i.test(transcript) ? 'today' : 'month';
      const type = /income/i.test(transcript) ? 'income' : 'spending';
      return { period, category: type === 'income' ? 'Income' : undefined };
    },
    summarize: (e) => `Summarising ${e.period || 'this month'}'s ${e.category === 'Income' ? 'income' : 'spending'}…`,
    confidence: 0.9,
  },

  // ── BUDGET UPDATE ───────────────────────────────────────────────────────────
  {
    intent: 'BUDGET_UPDATE',
    regex: /\b(increase|decrease|change|set|update|raise|lower|reduce|modify)\b.*\b(budget|limit|spending)\b/i,
    extract: (_match, transcript, { normalizeCategory, parseIndianNumber }) => {
      const catMatch = transcript.match(/\b(?:budget|limit|spending)\b\s+(?:for|of|on)?\s+(\w+)/i);
      const category = catMatch ? normalizeCategory(catMatch[1]) : undefined;
      const fromTo = transcript.match(/from\s+([\d,.a-z\s]+(?:lakh|crore|k)?)\s+to\s+([\d,.a-z\s]+(?:lakh|crore|k)?)/i);
      const toOnly = transcript.match(/to\s+([\d,.a-z\s]+(?:lakh|crore|k|hundred)?)/i);
      const amount = fromTo ? parseIndianNumber(fromTo[2]) ?? undefined : toOnly ? parseIndianNumber(toOnly[1]) ?? undefined : undefined;
      return { category, amount };
    },
    summarize: (e) => `Update ${e.category || 'budget'} limit to ₹${(e.amount ?? 0).toLocaleString('en-IN')}`,
    confidence: 0.85,
  },

  // ── TRANSACTION ADD ─────────────────────────────────────────────────────────
  {
    intent: 'TRANSACTION_ADD',
    regex: /\b(spent|paid|bought|added|expense|received|earned|salary|income)\b/i,
    extract: (_match, transcript, { normalizeCategory, parseIndianNumber }) => {
      const isCredit = /\b(received|earned|salary|income|got)\b/i.test(transcript);
      const amountMatch = transcript.match(/([\d,.]+(?:\s*(?:lakh|crore|k|thousand|hundred))?)/i);
      const amount = amountMatch ? parseIndianNumber(amountMatch[1]) ?? undefined : undefined;
      const onMatch = transcript.match(/(?:on|at|for|from)\s+([\w\s]+?)(?:\s+(?:today|yesterday|last|this|for|from|in)|\.|$)/i);
      const name = onMatch ? onMatch[1].trim() : (isCredit ? 'Income' : undefined);
      const category = isCredit ? 'Income' : (name ? normalizeCategory(name) : 'Miscellaneous');
      const period = /yesterday/i.test(transcript) ? 'yesterday' : /today/i.test(transcript) ? 'today' : undefined;
      return { amount, name, category, type: isCredit ? 'credit' : 'debit', period };
    },
    summarize: (e) => `Add ₹${(e.amount ?? 0).toLocaleString('en-IN')} ${e.type === 'credit' ? 'income' : 'expense'}${e.name ? ` — ${e.name}` : ''}`,
    confidence: 0.88,
  },

  // ── UNDO LAST COMMAND ────────────────────────────────────────────────────────
  {
    intent: 'NAVIGATE' as VoiceIntent,
    regex: /\b(undo|revert|cancel last|take back|reverse)\b/i,
    extract: () => ({ view: 'UNDO' as AppView }),
    summarize: () => 'Undo last command',
    confidence: 0.95,
  },

  // ── NAVIGATE ────────────────────────────────────────────────────────────────
  {
    intent: 'NAVIGATE',
    regex: /\b(go to|open|show|navigate to|take me to|switch to|view)\b\s+(\w+)/i,
    extract: (_match, transcript, { NAV_MAP }) => {
      const words = transcript.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
      let view: AppView | undefined;
      for (const word of words) {
        if (NAV_MAP[word]) { view = NAV_MAP[word]; break; }
      }
      return { view };
    },
    summarize: (e) => `Navigate to ${e.view || 'dashboard'}`,
    confidence: 0.92,
  },

  // ── SETTINGS TOGGLE ────────────────────────────────────────────────────────
  {
    intent: 'SETTINGS_TOGGLE',
    regex: /\b(turn|switch|enable|disable|set|toggle)\b.*\b(dark mode|light mode|privacy|notifications|biometric|shake|currency)\b/i,
    extract: (_match, transcript) => {
      const isOff = /\b(disable|off|hide)\b/i.test(transcript);
      const isOn = /\b(enable|on|show)\b/i.test(transcript);
      const val = isOff ? 'off' : isOn ? 'on' : 'toggle';
      let key = 'unknown';
      if (/dark|light/i.test(transcript)) key = 'theme';
      else if (/privacy/i.test(transcript)) key = 'privacy';
      
      return { settingKey: key, settingValue: val };
    },
    summarize: (e) => `Adjusting ${e.settingKey} to ${e.settingValue}…`,
    confidence: 0.9,
  },
];
