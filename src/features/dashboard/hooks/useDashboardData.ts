import { useMemo } from 'react';
import { Transaction } from '@/types';
import { FinanceState } from '@/types/state';

export function useDashboardData(
  transactions: Transaction[],
  monthlyStats: FinanceState['monthlyStats'],
  monthlyHistory: FinanceState['monthlyHistory'],
  balanceTrend: FinanceState['balanceTrend'],
) {
  // Chart Data
  const chartData = useMemo(() => {
    return monthlyHistory.slice(-6).map(m => ({
      month: m.month.length === 7
        ? new Date(m.month + '-01').toLocaleDateString('en-IN', { month: 'short' })
        : m.month,
      Income: Math.round(m.income),
      Expenses: Math.round(m.expenses),
    }));
  }, [monthlyHistory]);

  // Recent Merchants
  const recentMerchants = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const tx of transactions) {
      if (!seen.has(tx.merchant)) { seen.add(tx.merchant); result.push(tx.merchant); }
      if (result.length >= 4) break;
    }
    return result;
  }, [transactions]);

  // Recent Transactions (Desktop)
  const recentTx = useMemo(() => transactions.slice(0, 6), [transactions]);

  // Recent Transactions (Mobile)
  const recentTransactionsMobile = useMemo(() => transactions.slice(0, 5), [transactions]);

  // Balance Trend Percentage
  const trendPct = useMemo(() => {
    if (!balanceTrend || balanceTrend.length < 2) return 0;
    const first = balanceTrend[0].balance;
    const last = balanceTrend[balanceTrend.length - 1].balance;
    if (first === 0) return 0;
    return ((last - first) / Math.abs(first)) * 100;
  }, [balanceTrend]);

  // Balance Trend Direction (Mobile)
  const trendUp = monthlyStats.totalIncome >= monthlyStats.totalExpenses;

  // Savings Rate
  const savingsRate = useMemo(() => {
    if (monthlyStats.totalIncome <= 0) return 0;
    return Math.max(0, Math.round(
      ((monthlyStats.totalIncome - monthlyStats.totalExpenses) / monthlyStats.totalIncome) * 100
    ));
  }, [monthlyStats]);

  // Subscription Spend (Mobile)
  const subSpend = useMemo(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return transactions
      .filter(t => t.type === 'debit' && t.category === 'Subscriptions' && t.date.startsWith(monthStr))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // AI Insights
  const insights = useMemo(() => {
    const now = new Date();
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthStr = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

    const thisMonthTx = transactions.filter(t => t.date.startsWith(thisMonthStr) && t.type === 'debit');
    const prevMonthTx = transactions.filter(t => t.date.startsWith(prevMonthStr) && t.type === 'debit');

    const catSpend: Record<string, number> = {};
    thisMonthTx.forEach(t => { catSpend[t.category] = (catSpend[t.category] || 0) + t.amount; });
    const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];

    const prevCatSpend: Record<string, number> = {};
    prevMonthTx.forEach(t => { prevCatSpend[t.category] = (prevCatSpend[t.category] || 0) + t.amount; });

    const topCatChange = topCat && prevCatSpend[topCat[0]]
      ? ((topCat[1] - prevCatSpend[topCat[0]]) / prevCatSpend[topCat[0]]) * 100
      : null;

    const prevMonthTotalExpenses = prevMonthTx.reduce((sum, t) => sum + t.amount, 0);
    const thisMonthTotalExpenses = thisMonthTx.reduce((sum, t) => sum + t.amount, 0);
    const totalExpensesChange = prevMonthTotalExpenses > 0 
      ? ((thisMonthTotalExpenses - prevMonthTotalExpenses) / prevMonthTotalExpenses) * 100
      : null;

    return { topCat, topCatChange, savingsRate, totalExpensesChange };
  }, [transactions, savingsRate]);

  return {
    chartData,
    recentMerchants,
    recentTx,
    recentTransactionsMobile,
    trendPct,
    trendUp,
    savingsRate,
    subSpend,
    insights,
  };
}
