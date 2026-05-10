import { Transaction } from '../types';

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
    download: `spendwise-export-${new Date().toISOString().split('T')[0]}.csv`,
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
    download: `spendwise-export-${new Date().toISOString().split('T')[0]}.json`,
  });
  a.click();
  URL.revokeObjectURL(url);
}
