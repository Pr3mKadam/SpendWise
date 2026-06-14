import { describe, it, expect, vi } from 'vitest';

vi.mock('@/config/env', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  GEMINI_PROXY_URL: '/functions/v1/gemini-proxy',
  SETU_ENV: 'sandbox',
  SETU_WEBHOOK_URL: '',
  SENTRY_DSN: '',
  DEMO_MODE: false,
  VAPID_PUBLIC_KEY: '',
  PLAID_CLIENT_ID: '',
  LOG_LEVEL: 'INFO',
  APP_VERSION: '0.0.0',
  RAZORPAY_PROXY_URL: '/functions/v1/razorpay-proxy',
  RESEND_API_KEY: '',
  validateEnv: () => [],
}));

// ─── inferCategory ────────────────────────────────────────────────────────────

describe('inferCategory', () => {
  async function testInfer() {
    const mod = await import('@/features/ai/parsers/common');
    return mod.inferCategory;
  }

  it('classifies food mentions', async () => {
    const fn = await testInfer();
    expect(fn('pizza hut delivery')).toBe('Food');
    expect(fn('restaurant dinner')).toBe('Food');
    expect(fn('swiggy order')).toBe('Food');
    expect(fn('dhaba lunch')).toBe('Food');
  });

  it('classifies transport mentions', async () => {
    const fn = await testInfer();
    expect(fn('uber ride')).toBe('Transport');
    expect(fn('ola cab')).toBe('Transport');
    expect(fn('metro recharge')).toBe('Transport');
    expect(fn('bus ticket')).toBe('Transport');
    expect(fn('rapido bike')).toBe('Transport');
  });

  it('classifies travel mentions', async () => {
    const fn = await testInfer();
    expect(fn('hotel booking')).toBe('Travel');
    expect(fn('airbnb stay')).toBe('Travel');
    expect(fn('holiday trip goa')).toBe('Travel');
    expect(fn('vacation resort')).toBe('Travel');
  });

  it('classifies medical mentions', async () => {
    const fn = await testInfer();
    expect(fn('pharmacy medicine')).toBe('Health');
    expect(fn('doctor consultation')).toBe('Health');
    expect(fn('hospital bill')).toBe('Health');
    expect(fn('blood test')).toBe('Health');
  });

  it('falls back to merchant keyword map', async () => {
    const fn = await testInfer();
    expect(fn('bigbasket order')).toBe('Food');
    expect(fn('electricity bill')).toBe('Utilities');
    expect(fn('netflix subscription')).toBe('Subscriptions');
    expect(fn('uber cab')).toBe('Transport');
    expect(fn('salary credited')).toBe('Income');
  });

  it('returns Food for common dish names', async () => {
    const fn = await testInfer();
    expect(fn('biryani parcel')).toBe('Food');
  });

  it('is case-insensitive', async () => {
    const fn = await testInfer();
    expect(fn('PIZZA HUT')).toBe('Food');
    expect(fn('SwIgGy')).toBe('Food');
  });
});

// ─── inferType ────────────────────────────────────────────────────────────────

describe('inferType', () => {
  async function testInferType() {
    const mod = await import('@/features/ai/parsers/common');
    return mod.inferType;
  }

  it('classifies income-related text as credit', async () => {
    const fn = await testInferType();
    expect(fn('salary credited')).toBe('credit');
    expect(fn('got refund')).toBe('credit');
    expect(fn('income received')).toBe('credit');
  });

  it('classifies spending text as debit', async () => {
    const fn = await testInferType();
    expect(fn('payment made')).toBe('debit');
    expect(fn('spent on food')).toBe('debit');
    expect(fn('purchase at store')).toBe('debit');
  });

  it('defaults to debit', async () => {
    const fn = await testInferType();
    expect(fn('random unknown text')).toBe('debit');
  });
});

// ─── toTitleCase ──────────────────────────────────────────────────────────────

describe('toTitleCase', () => {
  async function testTitleCase() {
    const mod = await import('@/features/ai/parsers/common');
    return mod.toTitleCase;
  }

  it('capitalizes first letter of each word', async () => {
    const fn = await testTitleCase();
    expect(fn('hello world')).toBe('Hello World');
    expect(fn('zomato order')).toBe('Zomato Order');
  });

  it('handles single word', async () => {
    const fn = await testTitleCase();
    expect(fn('swiggy')).toBe('Swiggy');
  });

  it('handles empty string', async () => {
    const fn = await testTitleCase();
    expect(fn('')).toBe('');
  });
});

// ─── processNaturalLanguageExpense ────────────────────────────────────────────

describe('processNaturalLanguageExpense', () => {
  async function testProcessNL() {
    const mod = await import('@/features/ai/parsers/nlp');
    return mod.processNaturalLanguageExpense;
  }

  it('parses "spent 500 on pizza"', async () => {
    const fn = await testProcessNL();
    const result = await fn('spent 500 on pizza');
    expect(Array.isArray(result)).toBe(true);
    expect(result!.length).toBeGreaterThanOrEqual(1);
    expect(result![0].amount).toBe(500);
    expect(result![0].category).toBe('Food');
  });

  it('parses "paid 1200 for uber"', async () => {
    const fn = await testProcessNL();
    const result = await fn('paid 1200 for uber');
    expect(result!.length).toBeGreaterThanOrEqual(1);
    expect(result![0].amount).toBe(1200);
    expect(result![0].category).toBe('Transport');
  });

  it('parses amounts', async () => {
    const fn = await testProcessNL();
    const result = await fn('spent 1500 on dinner');
    expect(result![0].amount).toBe(1500);
  });

  it('handles empty input gracefully', async () => {
    const fn = await testProcessNL();
    const result = await fn('');
    expect(Array.isArray(result)).toBe(true);
  });

  it('detects credit type for income keywords', async () => {
    const fn = await testProcessNL();
    const result = await fn('got 2000 salary');
    expect(result![0].type).toBe('credit');
    expect(result![0].category).toBe('Income');
  });

  it('parses multiple transactions from one sentence', async () => {
    const fn = await testProcessNL();
    const result = await fn('1000 on food 700 on transport 8000 of income');
    expect(Array.isArray(result)).toBe(true);
    expect(result!.length).toBe(3);

    const food = result!.find(r => r.category === 'Food');
    expect(food).toBeDefined();
    expect(food!.amount).toBe(1000);
    expect(food!.type).toBe('debit');

    const transport = result!.find(r => r.category === 'Transport');
    expect(transport).toBeDefined();
    expect(transport!.amount).toBe(700);
    expect(transport!.type).toBe('debit');

    const income = result!.find(r => r.category === 'Income');
    expect(income).toBeDefined();
    expect(income!.amount).toBe(8000);
    expect(income!.type).toBe('credit');
  });

  it('merchant name for "of income" is cleaned to "Income" not "Of Income"', async () => {
    const fn = await testProcessNL();
    const result = await fn('8000 of income');
    expect(result!.length).toBeGreaterThanOrEqual(1);
    const item = result!.find(r => r.category === 'Income');
    expect(item).toBeDefined();
    // merchant should not start with "Of"
    expect(item!.merchant.toLowerCase()).not.toMatch(/^of\b/);
  });
});

// ─── parseVoiceLocally ────────────────────────────────────────────────────────

describe('parseVoiceLocally', () => {
  async function testParseVoice() {
    const mod = await import('@/features/ai/parsers/voice');
    return mod.parseVoiceLocally;
  }

  it('extracts amount and category from transcript', async () => {
    const fn = await testParseVoice();
    const result = fn('spent 500 on dinner', '2024-06-15');
    expect(result.amount).toBe(500);
    expect(result.category).toBe('Food');
    expect(result.type).toBe('debit');
  });

  it('identifies transport category', async () => {
    const fn = await testParseVoice();
    const result = fn('uber ride to airport', '2024-06-15');
    expect(result.category).toBe('Transport');
  });

  it('defaults to Shopping for unknown input', async () => {
    const fn = await testParseVoice();
    const result = fn('some random expense', '2024-06-15');
    expect(result.category).toBe('Shopping');
  });
});

// ─── UPI Parsing ──────────────────────────────────────────────────────────────

describe('parseUPIString', () => {
  async function testParseUPI() {
    const mod = await import('@/features/sync/parsers/upi');
    return mod.parseUPIString;
  }

  it('parses standard UPI message', async () => {
    const fn = await testParseUPI();
    const result = fn('₹500.00 debited from A/c X1234 via UPI: Paid to SHOP*PAYMENT on 15Jun24');
    expect(result).not.toBeNull();
    expect(result!.amount).toBe(500);
  });

  it('parses credited UPI message', async () => {
    const fn = await testParseUPI();
    const result = fn('₹2,000.00 credited to A/c X5678 via UPI: From FRIEND*REF on 10Jun24');
    expect(result).not.toBeNull();
    expect(result!.amount).toBe(2000);
  });

  it('returns null for non-UPI strings', async () => {
    const fn = await testParseUPI();
    expect(fn('just a random string')).toBeNull();
  });

  it('returns null for empty input', async () => {
    const fn = await testParseUPI();
    expect(fn('')).toBeNull();
  });
});
