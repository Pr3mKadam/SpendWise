import { Transaction } from "../../types";

export async function getFinancialAdvice(query: string, transactions: Transaction[]): Promise<string> {
  const lower = query.toLowerCase();
  const totalSpent = transactions.filter(t => t.type === 'debit').reduce((a, t) => a + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'credit').reduce((a, t) => a + t.amount, 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalSpent) / totalIncome) * 100) : 0;

  const byCategory: Record<string, number> = {};
  transactions.filter(t => t.type === 'debit').forEach(t => {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
  });
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  if (lower.includes('save') || lower.includes('saving')) {
    return savingsRate >= 20
      ? `Great discipline! You're saving **${savingsRate}%** of your income. Consider channeling surplus into an index fund or SIP for long-term growth.`
      : `Your current savings rate is **${savingsRate}%**. Aim for at least 20%. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`;
  }

  if (lower.includes('spend') || lower.includes('budget')) {
    return topCategory
      ? `Your biggest expense category is **${topCategory[0]}** at ₹${topCategory[1].toFixed(0)}. Setting a monthly cap here could free up significant savings.`
      : `Start by categorizing all your transactions consistently. Visibility is the first step to better budgeting.`;
  }

  if (lower.includes('invest') || lower.includes('investment')) {
    return savingsRate > 10
      ? `With a ${savingsRate}% savings rate, you have room to invest. Consider Nifty 50 index funds or PPF for tax-efficient long-term returns.`
      : `Focus on building a 3-6 month emergency fund first before investing. Then explore mutual funds via SIP.`;
  }

  if (transactions.length === 0) {
    return `Start by logging your daily expenses. Even a week of data will reveal surprising patterns in your spending habits.`;
  }

  return `Based on your last ${transactions.length} transactions, you've spent ₹${totalSpent.toFixed(0)} against ₹${totalIncome.toFixed(0)} income — a **${savingsRate}%** savings rate. ${savingsRate >= 20 ? 'You\'re on track!' : 'Try to cut discretionary spending to hit the 20% savings target.'}`;
}
