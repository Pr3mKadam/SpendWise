import { Transaction } from "@/types";

export async function generateMonthlyReport(month: string, transactions: Transaction[]): Promise<string> {
  const debits = transactions.filter(t => t.type === 'debit');
  const credits = transactions.filter(t => t.type === 'credit');
  const totalSpent = debits.reduce((a, t) => a + t.amount, 0);
  const totalIncome = credits.reduce((a, t) => a + t.amount, 0);
  const net = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? Math.round((net / totalIncome) * 100) : 0;

  const byCategory: Record<string, number> = {};
  debits.forEach(t => { byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount; });
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const topCat = sorted[0];

  const report = `
# Financial Report: ${month} 📊

### 💎 Executive Summary
This month, you had a total income of **₹${totalIncome.toLocaleString()}** and total expenses of **₹${totalSpent.toLocaleString()}**. 
Your net savings for the period is **₹${net.toLocaleString()}**, resulting in a savings rate of **${savingsRate}%**.

### 🔍 Spending Insights
- **Top Expense:** Your highest spending category was **${topCat ? topCat[0] : 'N/A'}**, where you spent **₹${topCat ? topCat[1].toLocaleString() : '0'}**.
- **Transaction Volume:** You processed **${debits.length}** debit transactions this month.
${savingsRate > 20 ? '- **Savings Performance:** Excellent! You are well above the 20% savings benchmark.' : '- **Savings Performance:** There is room for improvement. Aim to keep expenses below 80% of your income.'}

### 💡 Advisor Recommendations
1. **Reduce Friction:** Your spending in **${topCat ? topCat[0] : 'miscellaneous'}** is higher than usual. Consider setting a specific budget limit for this category next month.
2. **Automate Savings:** Since you have a surplus of **₹${net > 0 ? net.toLocaleString() : '0'}**, consider setting up an automated SIP or recurring deposit to grow your wealth.
3. **Review Subscriptions:** Monthly reports are a great time to audit your recurring payments. Check your 'Subscriptions' view to see if anything can be trimmed.

*This report was generated locally by SpendWise Advisor.*
  `;

  return report.trim();
}

export async function getSpendingPersonality(transactions: Transaction[]): Promise<{
  archetype: string;
  description: string;
  traits: string[];
  advice: string;
}> {
  const debits = transactions.filter(t => t.type === 'debit');
  const byCategory: Record<string, number> = {};
  debits.forEach(t => { byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount; });

  if (debits.length === 0) {
    return {
      archetype: 'The Blank Canvas',
      description: 'Your spending story is just beginning. Log more transactions to reveal your archetype.',
      traits: ['Data-shy', 'New starter', 'Full potential'],
      advice: 'Log at least 10 transactions to unlock your spending personality.',
    };
  }

  const total = Object.values(byCategory).reduce((a, b) => a + b, 0);
  const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const topCat = top[0]?.[0] ?? 'Shopping';
  const topPct = total > 0 ? Math.round((top[0]?.[1] ?? 0) / total * 100) : 0;

  const ARCHETYPES: Record<string, { archetype: string; description: string; traits: string[]; advice: string }> = {
    Food: {
      archetype: 'The Urban Foodie',
      description: `You live to eat — ${topPct}% of your spending goes toward food and dining.`,
      traits: ['Culinary explorer', 'Social spender', 'Experience-driven'],
      advice: 'Try meal prepping 3 days a week to cut food spend by up to 30%.',
    },
    Transport: {
      archetype: 'The Commuter',
      description: `Getting around is your biggest investment — ${topPct}% on transport.`,
      traits: ['Always on the move', 'Time optimizer', 'Urban navigator'],
      advice: 'Explore monthly transit passes or carpooling to cut transport costs.',
    },
    Subscriptions: {
      archetype: 'The Subscription King',
      description: `You love the digital life — ${topPct}% on subscriptions and memberships.`,
      traits: ['Digital native', 'Content lover', 'Comfort-driven'],
      advice: 'Audit your subscriptions quarterly. Cancel anything unused for 2+ weeks.',
    },
    Entertainment: {
      archetype: 'The Experience Chaser',
      description: `Life is short — ${topPct}% goes to entertainment and experiences.`,
      traits: ['YOLO mindset', 'Social butterfly', 'Memory collector'],
      advice: 'Set a monthly entertainment budget cap and stick to it guilt-free.',
    },
    Shopping: {
      archetype: 'The Retail Explorer',
      description: `Shopping is your cardio — ${topPct}% spent on products and goods.`,
      traits: ['Deal hunter', 'Brand-conscious', 'Impulse-prone'],
      advice: 'Apply a 24-hour rule before non-essential purchases.',
    },
    Health: {
      archetype: 'The Wellness Warrior',
      description: `You invest in your body — ${topPct}% on health and fitness.`,
      traits: ['Health-conscious', 'Disciplined', 'Long-term thinker'],
      advice: 'Great habit! Track ROI on health spend by monitoring energy and productivity.',
    },
    Utilities: {
      archetype: 'The Pragmatic Planner',
      description: `Essentials first — ${topPct}% on utilities and living costs.`,
      traits: ['Responsible', 'Low-risk', 'Needs-focused'],
      advice: 'With essentials covered, redirect surplus to an investment SIP.',
    },
  };

  return ARCHETYPES[topCat] ?? {
    archetype: 'The Strategic Minimalist',
    description: 'Your spending is balanced and diversified across categories.',
    traits: ['Disciplined', 'Balanced', 'Thoughtful'],
    advice: 'Your balanced approach is great. Focus on growing your income streams next.',
  };
}
