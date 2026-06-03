import { IntentHandler, formatCurrency, todayISO } from './types';
import { useStore } from '@/store';

export const handleDataQuery: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { searchQuery, period } = command.entities;
  const transactions = store.transactions;
  const now = new Date();

  const filtered = transactions.filter(t => {
    const tDate = new Date(t.date);
    const isThisMonth =
      tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    const isToday = t.date === todayISO();

    if (period === 'month' && !isThisMonth) return false;
    if (period === 'today' && !isToday) return false;

    if (searchQuery?.startsWith('merchant_')) {
      const m = searchQuery.replace('merchant_', '').toLowerCase();
      return t.merchant.toLowerCase().includes(m);
    }
    if (searchQuery?.startsWith('category_')) {
      const c = searchQuery.replace('category_', '').toLowerCase();
      return t.category.toLowerCase() === c;
    }
    return true;
  });

  const total = filtered.reduce((sum, t) => sum + (t.type === 'debit' ? t.amount : -t.amount), 0);
  const absTotal = Math.abs(total);
  const pLabel = period === 'today' ? 'Today' : period === 'month' ? 'This month' : 'Total';

  if (searchQuery === 'balance') {
    const bal = transactions.reduce(
      (sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount),
      0
    );
    return { success: true, message: `💰 Your current balance is ${formatCurrency(bal)}.` };
  }

  const entityLabel = searchQuery?.includes('_') ? searchQuery.split('_')[1] : searchQuery;
  return {
    success: true,
    message: `📊 ${pLabel} ${entityLabel}: ${formatCurrency(absTotal)}.`,
  };
};

export const handleQueryReport: IntentHandler = ({ command }) => {
  const store = useStore.getState();
  const { period, category } = command.entities;
  const transactions = store.transactions;
  const now = new Date();

  const filtered = transactions.filter(t => {
    const tDate = new Date(t.date);
    if (period === 'month')
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    if (period === 'week') {
      const diff = now.getTime() - tDate.getTime();
      return diff >= 0 && diff <= 7 * 86400000;
    }
    if (period === 'today') return t.date === todayISO();
    return true;
  });

  const totalIncome = filtered
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filtered
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const pLabel = period === 'today' ? 'Today' : period === 'week' ? 'This week' : 'This month';

  if (category === 'Income') {
    return {
      success: true,
      message: `📊 ${pLabel}'s total income: ${formatCurrency(totalIncome)}.`,
    };
  }

  return {
    success: true,
    message: `📊 ${pLabel} overview: You spent ${formatCurrency(totalExpense)}${totalIncome > 0 ? ` and earned ${formatCurrency(totalIncome)}` : ''}.`,
  };
};
