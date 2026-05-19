import { Transaction } from '@/types';

export const shareTransactions = async (transactions: Transaction[], currency: string = '$') => {
  if (!navigator.share) {
    alert('Sharing is not supported on this browser.');
    return;
  }

  const total = transactions.reduce((acc, tx) => acc + (tx.type === 'debit' ? -tx.amount : tx.amount), 0);
  const text = `SpendWise Report\n` +
    `Total Transactions: ${transactions.length}\n` +
    `Net Balance: ${total >= 0 ? '+' : '-'}${currency}${Math.abs(total).toFixed(2)}\n\n` +
    `Top 5 Transactions:\n` +
    transactions.slice(0, 5).map(tx => `${tx.date} | ${tx.merchant} | ${currency}${tx.amount}`).join('\n');

  try {
    await navigator.share({
      title: 'SpendWise Financial Report',
      text: text,
      url: window.location.origin
    });
  } catch (err) {
    console.error('Error sharing:', err);
  }
};
