import { Transaction } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';

export function exportCSV(transactions: Transaction[]) {
  const headers = ['Date', 'Merchant', 'Category', 'Type', 'Amount', 'Description'];
  const rows = transactions.map(tx => [
    tx.date,
    `"${tx.merchant.replace(/"/g, '""')}"`,
    tx.category,
    tx.type,
    tx.type === 'credit' ? tx.amount : -tx.amount,
    `"${(tx.description ?? '').replace(/"/g, '""')}"`,
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `spendwise-export-${formatLocalYYYYMMDD(new Date())}.csv`,
  });
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJSON(transactions: Transaction[]) {
  const data = JSON.stringify(transactions, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `spendwise-export-${formatLocalYYYYMMDD(new Date())}.json`,
  });
  a.click();
  URL.revokeObjectURL(url);
}
