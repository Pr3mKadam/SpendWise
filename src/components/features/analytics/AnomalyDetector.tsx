import React from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '../../../types/finance';
import { detectAnomalies } from '../../../utils/insights/anomaly';
import { AlertTriangle, Sparkles } from 'lucide-react';

interface AnomalyDetectorProps {
  transactions: Transaction[];
  currency: string;
}

export function AnomalyDetector({ transactions, currency }: AnomalyDetectorProps) {
  const anomalies = detectAnomalies(transactions);

  if (anomalies.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="text-green-500" size={24} />
        </div>
        <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">No Anomalies Detected</h4>
        <p className="text-xs text-[var(--text-muted)]">Your spending patterns are consistent across all categories.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Anomaly Detection</p>
          <p className="text-xs text-[var(--text-muted)]">Unusual spikes in your spending</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-600 px-2 py-1 rounded-full">
          {anomalies.length} Flagged
        </span>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {anomalies.map((anomaly, i) => (
          <motion.div
            key={anomaly.transaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)] hover:border-red-500/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="text-red-500" size={16} />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {anomaly.transaction.merchant || 'Unknown Merchant'}
                  </p>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {anomaly.transaction.category} • {new Date(anomaly.transaction.date).toLocaleDateString()}
                  </p>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {anomaly.reason}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {currency}{anomaly.transaction.amount.toLocaleString()}
                </p>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', color: 'var(--red)', fontWeight: 600 }}>
                  Z-Score: {anomaly.zScore.toFixed(1)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
          "Tip: Anomalies are detected using Z-score analysis. If a transaction is more than 2 standard deviations from the mean for that category, it's flagged."
        </p>
      </div>
    </div>
  );
}
