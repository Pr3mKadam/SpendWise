import { Transaction } from '../types';

/**
 * Validates and parses a JSON file containing an array of transactions.
 * Returns the valid transactions and any errors encountered.
 */
export async function parseTransactionsJSON(file: File): Promise<{ transactions: Transaction[], errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (!Array.isArray(parsed)) {
          return resolve({ transactions: [], errors: ['JSON must be an array of transactions.'] });
        }

        const validTransactions: Transaction[] = [];
        const errors: string[] = [];

        parsed.forEach((item: any, index: number) => {
          // Basic validation
          if (!item.amount || !item.merchant || !item.category || !item.date) {
            errors.push(`Row ${index + 1}: Missing required fields (amount, merchant, category, date).`);
            return;
          }

          validTransactions.push({
            id: item.id || `imported-${Date.now()}-${index}`,
            amount: Number(item.amount),
            merchant: item.merchant,
            category: item.category,
            date: item.date,
            type: item.type === 'credit' ? 'credit' : 'debit',
            description: item.description || '',
            tags: Array.isArray(item.tags) ? item.tags : (item.tags ? [item.tags] : []),
            status: item.status || 'completed'
          });
        });

        resolve({ transactions: validTransactions, errors });
      } catch (err) {
        resolve({ transactions: [], errors: ['Invalid JSON file.'] });
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
