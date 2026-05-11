import { Transaction } from "../../types";

/**
 * SpendWise Local Advisor Engine
 * Provides contextual financial advice based on transaction history without any cloud dependency.
 */
export async function getFinancialAdvice(query: string, transactions: Transaction[]): Promise<string> {
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

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (GEMINI_API_KEY) {
    try {
      const prompt = `You are a sophisticated financial advisor for SpendWise. 
The user is asking: "${query}"

Here is their current financial summary:
- Total Income: ₹${totalIncome.toLocaleString()}
- Total Spent: ₹${totalSpent.toLocaleString()}
- Net Savings: ₹${net.toLocaleString()}
- Savings Rate: ${savingsRate}%
- Top Spending Category: ${topCat ? `${topCat[0]} (₹${topCat[1].toLocaleString()})` : 'N/A'}

Provide personalized, insightful, and actionable financial advice based on their query and data. 
Keep the response concise (2-3 paragraphs max), encouraging, and professional. 
Use markdown for formatting. 
If appropriate, you can include exactly one of the following action tags at the end of your response to give the user a quick action button:
[ACTION:CREATE_BUDGET]
[ACTION:VIEW_ANALYTICS]
[ACTION:SET_GOAL]

If the query is not related to finance, politely redirect them to ask about their budget or spending.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (error) {
      console.error("Gemini Advisor failed, falling back to local engine:", error);
    }
  }

  // Local Fallback Engine
  const q = query.toLowerCase();
  
  // Logic for nonsensical or unrelated queries
  const isFinancial = /spend|save|money|budget|cost|income|buy|expense|transaction|worth|wealth|rich|poor|tax|debt/i.test(q);
  if (q.length < 3 || (!isFinancial && q.split(' ').length < 2)) {
    return "I am your SpendWise financial advisor. I cannot answer non-financial questions. How can I help you with your budget or spending today?";
  }

  // Savings Advice
  if (q.includes('save') || q.includes('saving')) {
    if (savingsRate < 10) {
      return `Your current savings rate is **${savingsRate}%**. To improve this, I recommend aiming for the 50/30/20 rule: 50% for needs, 30% for wants, and **20% for savings**. Try reducing your ${topCat ? topCat[0] : 'discretionary'} spending next week.\n\n[ACTION:SET_GOAL]`;
    }
    return `Great job! Your savings rate is **${savingsRate}%**, which is above the healthy 20% benchmark. To level up, consider moving your surplus into a high-yield investment or emergency fund.\n\n[ACTION:SET_GOAL]`;
  }

  // Largest expense queries
  if (q.includes('largest') || q.includes('biggest') || q.includes('highest') || q.includes('most expensive')) {
    if (debits.length === 0) return "You haven't logged any expenses yet.";
    const largest = debits.reduce((max, t) => t.amount > max.amount ? t : max, debits[0]);
    return `Your largest single expense recently was **${largest.merchant}** for **₹${largest.amount.toLocaleString()}** on ${new Date(largest.date).toLocaleDateString()}. This was categorized under **${largest.category}**.\n\n[ACTION:VIEW_ANALYTICS]`;
  }

  // Category specific queries
  if (q.includes('spend') || q.includes('expense') || q.includes('where')) {
    if (!topCat) return "You haven't logged enough transactions for me to analyze your spending yet. Start adding your daily expenses!";
    return `You've spent a total of **₹${totalSpent.toLocaleString()}** recently. Your biggest expense category is **${topCat[0]}** (₹${topCat[1].toLocaleString()}), accounting for **${Math.round((topCat[1] / totalSpent) * 100)}%** of your total spending.\n\n[ACTION:VIEW_ANALYTICS]`;
  }

  // Budget queries
  if (q.includes('budget')) {
    if (net < 0) {
      return `You're currently in a deficit of **₹${Math.abs(net).toLocaleString()}**. I suggest creating a strict 'Zero-Based Budget' where every rupee is assigned a job before the month starts to stop the leak.\n\n[ACTION:CREATE_BUDGET]`;
    }
    return `Your budget looks healthy with a **₹${net.toLocaleString()}** surplus. Have you considered setting up automated transfers to your savings goals to 'pay yourself first'?\n\n[ACTION:CREATE_BUDGET]`;
  }

  // General catch-all financial advice
  return `Based on your **${transactions.length} transactions**, you have a net balance of **₹${net.toLocaleString()}**. Your spending is most active in **${topCat ? topCat[0] : 'various categories'}**. Would you like to set a specific savings goal for next month?\n\n[ACTION:SET_GOAL]`;
}

export interface GeneratedQuest {
  id: string;
  title: string;
  description: string;
  reward: string;
  type: 'category' | 'uncategorized' | 'budget' | 'streak' | 'savings' | 'logging';
  completed: boolean;
}

export function generateQuests(transactions: Transaction[]): GeneratedQuest[] {
  const debits = transactions.filter(t => t.type === 'debit');
  
  const byCategory: Record<string, number> = {};
  debits.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
  });
  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const topCat = sortedCategories[0];

  const quests: GeneratedQuest[] = [];

  // Quest 1: Uncategorized
  const uncategorized = transactions.filter(t => !t.category || t.category === 'Uncategorized');
  if (uncategorized.length > 0) {
    quests.push({
      id: 'quest_uncat',
      title: 'Cleanup Crew',
      description: `Categorize ${uncategorized.length} uncategorized transactions.`,
      reward: '+30 XP',
      type: 'uncategorized',
      completed: false
    });
  }

  // Quest 2: Top Category reduction
  if (topCat) {
    quests.push({
      id: 'quest_topcat',
      title: `${topCat[0]} Diet`,
      description: `Reduce spending on ${topCat[0]} this week.`,
      reward: '+50 XP',
      type: 'category',
      completed: false
    });
  }

  // Quest 3: Streak/Logging
  const recentLogging = transactions.filter(t => new Date(t.date) >= new Date(Date.now() - 86400000));
  if (recentLogging.length === 0) {
    quests.push({
      id: 'quest_log',
      title: 'Active Tracker',
      description: 'Log your first transaction today.',
      reward: '+20 XP',
      type: 'logging',
      completed: false
    });
  } else {
    quests.push({
      id: 'quest_streak',
      title: 'Streak Saver',
      description: 'Maintain your daily tracking streak.',
      reward: '+40 XP',
      type: 'streak',
      completed: false
    });
  }

  // Quest 4: Savings
  const credits = transactions.filter(t => t.type === 'credit');
  if (credits.length > 0 && quests.length < 4) {
    quests.push({
      id: 'quest_savings',
      title: 'Rainy Day Fund',
      description: 'Transfer 10% of recent income to savings.',
      reward: '+60 XP',
      type: 'savings',
      completed: false
    });
  }

  // Quest 5: Subscription Audit
  const recurringCount = transactions.filter(t => t.tags?.includes('recurring')).length;
  if (recurringCount > 2) {
    quests.push({
      id: 'quest_sub_audit',
      title: 'Subscription Scout',
      description: 'Review and audit your recurring subscriptions.',
      reward: '+35 XP',
      type: 'logging',
      completed: false
    });
  }

  // Quest 6: Income Diversifier
  const incomeSources = new Set(credits.map(t => t.merchant)).size;
  if (incomeSources < 2) {
    quests.push({
      id: 'quest_income_boost',
      title: 'Income Explorer',
      description: 'Explore or log a secondary income source.',
      reward: '+75 XP',
      type: 'savings',
      completed: false
    });
  }

  // Return max 3 quests
  return quests.slice(0, 3);
}
