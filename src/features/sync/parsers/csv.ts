import { Transaction, Category } from '@/types';
import {
  inferCategory,
  inferType,
  toTitleCase,
} from '@/features/ai/parsers/common';
import { formatLocalYYYYMMDD } from '@/utils/date';

export function parseCSVLocally(csvContent: string): Transaction[] {
  const lines = csvContent.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else current += ch;
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z]/g, ''));

  const colIdx = {
    date: headers.findIndex(h =>
      ['date', 'transactiondate', 'txdate', 'posted', 'valudate'].includes(h)
    ),
    merchant: headers.findIndex(h =>
      ['merchant', 'description', 'payee', 'name', 'vendor', 'narration', 'particulars'].includes(h)
    ),
    amount: headers.findIndex(h =>
      ['amount', 'value', 'sum', 'debit', 'credit', 'txnamount', 'transactionamount'].includes(h)
    ),
    type: headers.findIndex(h => ['type', 'txtype', 'transactiontype', 'crdr'].includes(h)),
    category: headers.findIndex(h => ['category', 'kind'].includes(h)),
  };

  if (colIdx.date === -1) colIdx.date = 0;
  if (colIdx.merchant === -1) colIdx.merchant = 1;
  if (colIdx.amount === -1) colIdx.amount = 2;

  const transactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length < 2 || row.every(c => !c)) continue;

    const rawDate = row[colIdx.date] ?? '';
    const rawMerchant = row[colIdx.merchant] ?? 'Unknown';
    const rawAmount = row[colIdx.amount] ?? '0';
    const rawType = colIdx.type >= 0 ? (row[colIdx.type] ?? '') : '';
    const rawCategory = colIdx.category >= 0 ? (row[colIdx.category] ?? '') : '';

    let date = formatLocalYYYYMMDD(new Date());
    const cleaned = rawDate.replace(/['"]/g, '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) date = cleaned;
    else {
      const m = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
      if (m) date = `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
      else {
        const d = new Date(cleaned);
        if (!isNaN(d.getTime())) date = formatLocalYYYYMMDD(d);
      }
    }

    const amount = Math.abs(parseFloat(rawAmount.replace(/[^0-9.-]/g, '')) || 0);
    if (amount === 0) continue;

    const typeStr = rawType.toLowerCase();
    let type: 'credit' | 'debit';
    if (typeStr.includes('cr') || typeStr.includes('credit')) type = 'credit';
    else if (typeStr.includes('dr') || typeStr.includes('debit')) type = 'debit';
    else type = inferType(rawMerchant, parseFloat(rawAmount.replace(/[^0-9.-]/g, '')));

    const category: Category = rawCategory
      ? toTitleCase(rawCategory) as Category
      : type === 'credit'
        ? 'Income'
        : inferCategory(rawMerchant);

    transactions.push({
      id: `csv-${Date.now()}-${i}`,
      date,
      merchant: rawMerchant
        .replace(/^["']|["']$/g, '')
        .trim()
        .slice(0, 80),
      amount,
      category,
      type,
      description: rawMerchant.slice(0, 120),
      status: 'completed',
    } as Transaction);
  }

  if (transactions.length > 0) {
    const newest = new Date(Math.max(...transactions.map(t => new Date(t.date).getTime())));
    const now = new Date();
    const shiftMs = now.getTime() - newest.getTime();
    if (shiftMs > 24 * 60 * 60 * 1000) {
      transactions.forEach(t => {
        const d = new Date(t.date);
        d.setTime(d.getTime() + shiftMs);
        t.date = formatLocalYYYYMMDD(d);
      });
    }
  }

  return transactions;
}
