import { Transaction, BudgetSuggestion } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';

/**
 * Analyzes last 3 months of spending to suggest smart budget limits.
 * Applies the 110% rule: suggest 10% buffer above average for most categories,
 * or 90% for categories that look reducible.
 */
export function generateBudgetSuggestions(transactions: Transaction[]): BudgetSuggestion[] {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const threeMonthsAgoStr = formatLocalYYYYMMDD(threeMonthsAgo);

  const recentDebits = transactions.filter(
    t => t.type === 'debit' && t.date >= threeMonthsAgoStr
  );

  if (recentDebits.length === 0) return [];

  // Group by category
  const byCategory: Record<string, { total: number; months: Set<string>; count: number }> = {};

  recentDebits.forEach(t => {
    const month = t.date.slice(0, 7); // YYYY-MM
    if (!byCategory[t.category]) {
      byCategory[t.category] = { total: 0, months: new Set(), count: 0 };
    }
    byCategory[t.category].total += t.amount;
    byCategory[t.category].months.add(month);
    byCategory[t.category].count++;
  });

  const HIGH_SPEND_CATEGORIES = ['Food & Dining', 'Entertainment', 'Shopping', 'Travel'];
  const ESSENTIAL_CATEGORIES = ['Rent', 'Utilities', 'Healthcare', 'Education', 'Insurance'];

  const suggestions: BudgetSuggestion[] = [];

  Object.entries(byCategory).forEach(([category, data]) => {
    const monthCount = Math.max(data.months.size, 1);
    const avgSpend = data.total / monthCount;

    // Need at least 2 months of data or 3+ transactions for confidence
    const confidence: 'high' | 'medium' | 'low' =
      monthCount >= 3 ? 'high' : monthCount >= 2 || data.count >= 3 ? 'medium' : 'low';

    let suggestedLimit: number;
    let reasoning: string;

    if (ESSENTIAL_CATEGORIES.some(ec => category.toLowerCase().includes(ec.toLowerCase()))) {
      // Essentials: set exact average (can't really cut these)
      suggestedLimit = Math.ceil(avgSpend / 100) * 100;
      reasoning = `Essential expense. Based on ₹${Math.round(avgSpend).toLocaleString()}/mo average.`;
    } else if (HIGH_SPEND_CATEGORIES.some(hc => category.toLowerCase().includes(hc.toLowerCase()))) {
      // Discretionary: suggest 90% of average to encourage reduction
      suggestedLimit = Math.ceil(avgSpend * 0.9 / 100) * 100;
      reasoning = `Set 10% below your ₹${Math.round(avgSpend).toLocaleString()}/mo average to build savings.`;
    } else {
      // Others: 110% buffer
      suggestedLimit = Math.ceil(avgSpend * 1.1 / 100) * 100;
      reasoning = `10% buffer above your ₹${Math.round(avgSpend).toLocaleString()}/mo average.`;
    }

    suggestions.push({
      category,
      suggestedLimit: Math.max(suggestedLimit, 100), // minimum ₹100
      avgSpend,
      reasoning,
      confidence,
    });
  });

  // Sort by avg spend descending
  return suggestions.sort((a, b) => (b.avgSpend || 0) - (a.avgSpend || 0));
}
