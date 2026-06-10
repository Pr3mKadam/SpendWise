import { Transaction, SavingsGoal } from '@/types';

export interface GoalSuggestion {
  title: string;
  emoji: string;
  targetAmount: number;
  reason: string;
  category: 'emergency' | 'vacation' | 'sinking' | 'investment';
}

export function suggestGoals(
  transactions: Transaction[],
  existingGoals: SavingsGoal[]
): GoalSuggestion[] {
  const suggestions: GoalSuggestion[] = [];
  const existingNames = new Set(existingGoals.map(g => g.name.toLowerCase()));

  // 1. Emergency Fund suggestion
  if (!existingNames.has('emergency fund')) {
    const monthlyAvg =
      transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0) /
      Math.max(1, 3);
    suggestions.push({
      title: 'Emergency Fund',
      emoji: '🛡️',
      targetAmount: monthlyAvg * 6,
      reason: 'Financial experts recommend saving 3–6 months of expenses as a safety net.',
      category: 'emergency',
    });
  }

  // 2. Check seasonal patterns (high travel spend)
  const travelSpend = transactions.filter(t => t.category === 'Travel' && t.type === 'debit');
  if (travelSpend.length >= 3 && !existingNames.has('holiday fund')) {
    suggestions.push({
      title: 'Holiday Fund',
      emoji: '✈️',
      targetAmount: travelSpend.reduce((s, t) => s + t.amount, 0) / travelSpend.length,
      reason: `You've taken ${travelSpend.length} trips recently — save up for the next one!`,
      category: 'vacation',
    });
  }

  // 3. Subscription/annual bills sinking fund
  const subs = transactions.filter(t => t.isRecurring);
  if (subs.length >= 2 && !existingNames.has('annual bills')) {
    const annualTotal = subs.reduce((s, t) => s + t.amount, 0) * 12;
    suggestions.push({
      title: 'Annual Bills Fund',
      emoji: '📋',
      targetAmount: annualTotal,
      reason: `You have ${subs.length} recurring expenses. Set aside money for annual renewals.`,
      category: 'sinking',
    });
  }

  return suggestions;
}
