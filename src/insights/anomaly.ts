import { Transaction } from '@/types/finance';

export interface AnomalyResult {
  transaction: Transaction;
  reason: string;
  zScore: number;
}

export function detectAnomalies(transactions: Transaction[]): AnomalyResult[] {
  const debits = transactions.filter(t => t.type === 'debit');
  
  // Group by category
  const byCategory: Record<string, Transaction[]> = {};
  debits.forEach(t => {
    const cat = t.category || 'Uncategorized';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(t);
  });
  
  const anomalies: AnomalyResult[] = [];
  
  Object.entries(byCategory).forEach(([category, txs]) => {
    if (txs.length < 3) return; // Need at least 3 to calculate stdDev meaningfully
    
    const amounts = txs.map(t => t.amount);
    const sum = amounts.reduce((a, b) => a + b, 0);
    const mean = sum / txs.length;
    
    const sqDiffs = amounts.map(a => Math.pow(a - mean, 2));
    const variance = sqDiffs.reduce((a, b) => a + b, 0) / txs.length;
    const stdDev = Math.sqrt(variance);
    
    txs.forEach(t => {
      const zScore = stdDev > 0 ? (t.amount - mean) / stdDev : 0;
      
      // If amount is > mean + 2*stdDev AND amount > 2 * mean (to avoid flagging small variations)
      if (zScore > 2 && t.amount > mean * 2) {
        anomalies.push({
          transaction: t,
          reason: `Higher than usual for ${category}`,
          zScore
        });
      }
    });
  });
  
  // Sort by Z-score descending
  return anomalies.sort((a, b) => b.zScore - a.zScore);
}
