import { Transaction, Category } from '@/types';

export interface CategoryAmount {
  category: Category;
  amount: number;
}

export function effectiveCategoryAmounts(tx: Transaction): CategoryAmount[] {
  if (tx.splits && tx.splits.length > 0) {
    return tx.splits.map(s => ({
      category: s.category,
      amount: s.amount,
    }));
  }
  return [{ category: tx.category, amount: tx.amount }];
}

export function effectiveTotal(tx: Transaction): number {
  if (tx.splits && tx.splits.length > 0) {
    return tx.splits.reduce((sum, s) => sum + s.amount, 0);
  }
  return tx.amount;
}
