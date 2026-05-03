import { Transaction } from "../../types";

/**
 * SpendWise Local Advisor Engine
 * Provides contextual financial advice based on transaction history without any cloud dependency.
 */
export async function getFinancialAdvice(query: string, transactions: Transaction[]): Promise<string> {
  const q = query.toLowerCase();
  
  const debits = transactions.filter(t => t.type === 'debit');
  const credits = transactions.filter(t => t.type === 'credit');
  const totalSpent = debits.reduce((a, t) => a + t.amount, 0);
  const totalIncome = credits.reduce((a, t) => a + t.amount, 0);
  const net = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? Math.round((net / totalIncome) * 100) : 0;

  // Analysis of top categories
  const byCategory: Record<string, number> = {};
  debits.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
  });
  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const topCat = sortedCategories[0];

  // Logic for nonsensical or unrelated queries
  const isFinancial = /spend|save|money|budget|cost|income|buy|expense|transaction|worth|wealth|rich|poor|tax|debt/i.test(q);
  if (q.length < 3 || (!isFinancial && q.split(' ').length < 2)) {
    return "I am your SpendWise financial advisor. I cannot answer non-financial questions. How can I help you with your budget or spending today?";
  }

  // Savings Advice
  if (q.includes('save') || q.includes('saving')) {
    if (savingsRate < 10) {
      return `Your current savings rate is **${savingsRate}%**. To improve this, I recommend aiming for the 50/30/20 rule: 50% for needs, 30% for wants, and **20% for savings**. Try reducing your ${topCat ? topCat[0] : 'discretionary'} spending next week.`;
    }
    return `Great job! Your savings rate is **${savingsRate}%**, which is above the healthy 20% benchmark. To level up, consider moving your surplus into a high-yield investment or emergency fund.`;
  }

  // Category specific queries
  if (q.includes('spend') || q.includes('expense') || q.includes('where')) {
    if (!topCat) return "You haven't logged enough transactions for me to analyze your spending yet. Start adding your daily expenses!";
    return `You've spent a total of **₹${totalSpent.toLocaleString()}** recently. Your biggest expense category is **${topCat[0]}** (₹${topCat[1].toLocaleString()}), accounting for **${Math.round((topCat[1] / totalSpent) * 100)}%** of your total spending.`;
  }

  // Budget queries
  if (q.includes('budget')) {
    if (net < 0) {
      return `You're currently in a deficit of **₹${Math.abs(net).toLocaleString()}**. I suggest creating a strict 'Zero-Based Budget' where every rupee is assigned a job before the month starts to stop the leak.`;
    }
    return `Your budget looks healthy with a **₹${net.toLocaleString()}** surplus. Have you considered setting up automated transfers to your savings goals to 'pay yourself first'?`;
  }

  // General catch-all financial advice
  return `Based on your **${transactions.length} transactions**, you have a net balance of **₹${net.toLocaleString()}**. Your spending is most active in **${topCat ? topCat[0] : 'various categories'}**. Would you like to set a specific savings goal for next month?`;
}
