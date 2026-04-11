import { Transaction } from '../types';

export function exportTransactionsToCSV(transactions: Transaction[]) {
  // 1. Define Headers
  const headers = ['Date', 'Merchant', 'Category', 'Type', 'Amount', 'Tags', 'AI Parsed'];

  // 2. Map data
  const rows = transactions.map(tx => {
    return [
      tx.date,
      `"${tx.merchant.replace(/"/g, '""')}"`, // escape quotes and wrap in quotes
      tx.category,
      tx.type,
      tx.amount.toFixed(2),
      tx.tags ? `"${tx.tags.join(', ')}"` : '',
      tx.aiParsed ? 'Yes' : 'No'
    ];
  });

  // 3. Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // 4. Create Blob and Trigger Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `SpendWise_Export_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
