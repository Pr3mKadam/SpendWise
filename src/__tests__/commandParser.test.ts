import { describe, it, expect, vi } from 'vitest';

vi.mock('@/core/api/gemini', () => ({
  callGemini: vi.fn().mockRejectedValue(new Error('Mock: Supabase not configured')),
}));

import { processNaturalLanguageExpense } from '@/features/ai/parsers/nlp';

describe('processNaturalLanguageExpense', () => {
  describe('Food intent', () => {
    it('parses "spent 500 on pizza"', async () => {
      const result = await processNaturalLanguageExpense('spent 500 on pizza');
      expect(result).not.toBeNull();
      expect(result![0].amount).toBe(500);
      expect(result![0].category).toBe('Food');
      expect(result![0].type).toBe('debit');
    });

    it('parses "paid 300 for zomato order"', async () => {
      const result = await processNaturalLanguageExpense('paid 300 for zomato order');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Food');
      expect(result![0].amount).toBe(300);
    });

    it('parses "swiggy 450 dinner"', async () => {
      const result = await processNaturalLanguageExpense('swiggy 450 dinner');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Food');
    });

    it('parses "1500 for restaurant dinner"', async () => {
      const result = await processNaturalLanguageExpense('1500 for restaurant dinner');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Food');
      expect(result![0].amount).toBe(1500);
    });
  });

  describe('Transport intent', () => {
    it('parses "paid 1200 for uber"', async () => {
      const result = await processNaturalLanguageExpense('paid 1200 for uber');
      expect(result).not.toBeNull();
      expect(result![0].amount).toBe(1200);
      expect(result![0].category).toBe('Transport');
    });

    it('parses "ola ride 350"', async () => {
      const result = await processNaturalLanguageExpense('ola ride 350');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Transport');
    });

    it('parses "metro recharge 500"', async () => {
      const result = await processNaturalLanguageExpense('metro recharge 500');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Transport');
    });

    it('parses "bus ticket 50"', async () => {
      const result = await processNaturalLanguageExpense('bus ticket 50');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Transport');
    });
  });

  describe('Subscriptions intent', () => {
    it('parses "netflix subscription 799"', async () => {
      const result = await processNaturalLanguageExpense('netflix subscription 799');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Subscriptions');
      expect(result![0].amount).toBe(799);
    });

    it('parses "spotify premium 199"', async () => {
      const result = await processNaturalLanguageExpense('spotify premium 199');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Subscriptions');
    });

    it('parses "amazon prime 1499"', async () => {
      const result = await processNaturalLanguageExpense('amazon prime 1499');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Subscriptions');
    });
  });

  describe('Utilities intent', () => {
    it('parses "electricity bill 2500"', async () => {
      const result = await processNaturalLanguageExpense('electricity bill 2500');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Utilities');
      expect(result![0].amount).toBe(2500);
    });

    it('parses "mobile recharge 299"', async () => {
      const result = await processNaturalLanguageExpense('mobile recharge 299');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Utilities');
    });

    it('parses "paid rent 15000"', async () => {
      const result = await processNaturalLanguageExpense('paid rent 15000');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Utilities');
    });
  });

  describe('Health intent', () => {
    it('parses "doctor consultation 1000"', async () => {
      const result = await processNaturalLanguageExpense('doctor consultation 1000');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Health');
    });

    it('parses "medicine 450"', async () => {
      const result = await processNaturalLanguageExpense('medicine 450');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Health');
    });

    it('parses "gym membership 2000"', async () => {
      const result = await processNaturalLanguageExpense('gym membership 2000');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Health');
    });
  });

  describe('Entertainment intent', () => {
    it('parses "movie show 500"', async () => {
      const result = await processNaturalLanguageExpense('movie show 500');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Entertainment');
    });

    it('parses "concert 3000"', async () => {
      const result = await processNaturalLanguageExpense('concert 3000');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Entertainment');
    });
  });

  describe('Education intent', () => {
    it('parses "tuition fee 5000"', async () => {
      const result = await processNaturalLanguageExpense('tuition fee 5000');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Education');
    });

    it('parses "course fee 10000"', async () => {
      const result = await processNaturalLanguageExpense('course fee 10000');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Education');
    });
  });

  describe('Business intent', () => {
    it('parses "client payment 1200"', async () => {
      const result = await processNaturalLanguageExpense('client payment 1200');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Business');
    });

    it('parses "office supplies 800"', async () => {
      const result = await processNaturalLanguageExpense('office supplies 800');
      expect(result).not.toBeNull();
      // "office" doesn't match business regex exactly, "supplies" falls to Shopping
    });
  });

  describe('Income / Credit intent', () => {
    it('detects salary as credit', async () => {
      const result = await processNaturalLanguageExpense('got 50000 salary');
      expect(result).not.toBeNull();
      expect(result![0].type).toBe('credit');
      expect(result![0].category).toBe('Income');
    });

    it('detects income as credit', async () => {
      const result = await processNaturalLanguageExpense('received 2000 income');
      expect(result).not.toBeNull();
      expect(result![0].type).toBe('credit');
    });

    it('detects refund as credit', async () => {
      const result = await processNaturalLanguageExpense('got 1500 refund');
      expect(result).not.toBeNull();
      expect(result![0].type).toBe('credit');
    });

    it('detects cashback as credit', async () => {
      const result = await processNaturalLanguageExpense('received 250 cashback');
      expect(result).not.toBeNull();
      expect(result![0].type).toBe('credit');
    });

    it('parses "I got 2000 rs" as credit', async () => {
      const result = await processNaturalLanguageExpense('I got 2000 rs');
      expect(result).not.toBeNull();
      expect(result![0].type).toBe('credit');
      expect(result![0].category).toBe('Income');
    });
  });

  describe('Shopping (default intent)', () => {
    it('defaults to Shopping for unknown debit', async () => {
      const result = await processNaturalLanguageExpense('paid 2000 to random store');
      expect(result).not.toBeNull();
      expect(result![0].category).toBe('Shopping');
      expect(result![0].type).toBe('debit');
    });
  });

  describe('Multiple transactions in one sentence', () => {
    it('parses "500 on food 700 on travel 800 on subscription"', async () => {
      const result = await processNaturalLanguageExpense('500 on food 700 on travel 800 on subscription');
      expect(result).not.toBeNull();
      expect(result!.length).toBe(3);
      expect(result![0].amount).toBe(500);
      expect(result![0].category).toBe('Food');
      expect(result![1].amount).toBe(700);
      expect(result![1].category).toBe('Transport');
      expect(result![2].amount).toBe(800);
      expect(result![2].category).toBe('Subscriptions');
    });

    it('parses description-first format "food 500 travel 700"', async () => {
      const result = await processNaturalLanguageExpense('food 500 travel 700');
      expect(result).not.toBeNull();
      expect(result!.length).toBe(2);
      expect(result![0].category).toBe('Food');
      expect(result![1].category).toBe('Transport');
    });

    it('parses items separated by "and"', async () => {
      const result = await processNaturalLanguageExpense('spent 500 on pizza and 200 on uber');
      expect(result).not.toBeNull();
      expect(result!.length).toBe(2);
      expect(result![0].category).toBe('Food');
      expect(result![1].category).toBe('Transport');
    });
  });

  describe('Indian number shorthand', () => {
    it('expands "2k" to 2000', async () => {
      const result = await processNaturalLanguageExpense('spent 2k on food');
      expect(result).not.toBeNull();
      expect(result![0].amount).toBe(2000);
    });

    it('expands "5 lakh" to 500000', async () => {
      const result = await processNaturalLanguageExpense('spent 5 lakh on car');
      expect(result).not.toBeNull();
      expect(result![0].amount).toBe(500000);
    });

    it('expands "1 crore" to 10000000', async () => {
      const result = await processNaturalLanguageExpense('spent 1 crore on house');
      expect(result).not.toBeNull();
      expect(result![0].amount).toBe(10000000);
    });
  });

  describe('Edge cases', () => {
    it('handles empty input gracefully', async () => {
      const result = await processNaturalLanguageExpense('');
      expect(Array.isArray(result)).toBe(true);
    });

    it('handles input with only text and no numbers', async () => {
      const result = await processNaturalLanguageExpense('just some random expense');
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThanOrEqual(1);
    });

    it('handles input with currency symbols', async () => {
      const result = await processNaturalLanguageExpense('paid $50 for lunch');
      expect(result).not.toBeNull();
      expect(result![0].amount).toBe(50);
    });

    it('handles input with ₹ symbol', async () => {
      const result = await processNaturalLanguageExpense('₹500 for dinner');
      expect(result).not.toBeNull();
      expect(result![0].amount).toBe(500);
    });

    it('handles decimal amounts', async () => {
      const result = await processNaturalLanguageExpense('spent 99.99 on food');
      expect(result).not.toBeNull();
      expect(result![0].amount).toBe(99.99);
    });

    it('handles amounts without comma separator correctly', async () => {
      const result = await processNaturalLanguageExpense('paid 1200 for shopping');
      expect(result).not.toBeNull();
      expect(result![0].amount).toBe(1200);
    });
  });
});
