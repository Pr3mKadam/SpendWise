import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { Transaction } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

interface ReceiptGalleryProps {
  transactions: Transaction[];
  currency?: string;
}

export default function ReceiptGallery({ transactions, currency = '$' }: ReceiptGalleryProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  const withReceipts = useMemo(() => {
    return transactions.filter(tx => tx.receiptUrl && !tx.deletedAt);
  }, [transactions]);

  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    withReceipts.forEach(tx => {
      const month = tx.date.substring(0, 7);
      if (!groups[month]) groups[month] = [];
      groups[month].push(tx);
    });
    const sorted = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sorted.map(m => {
      const d = new Date(m + '-01');
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      return { month: m, label, txs: groups[m] };
    });
  }, [withReceipts]);

  if (withReceipts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-headline">Receipt Gallery</h2>
          <p className="text-caption mt-1">No receipts attached to any transactions yet.</p>
        </div>
        <EmptyState message="No receipts found" subMessage="Attach receipts when editing transactions to see them here." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-headline">Receipt Gallery</h2>
        <p className="text-caption mt-1">{withReceipts.length} receipt{withReceipts.length !== 1 ? 's' : ''} attached</p>
      </div>

      {grouped.map(group => (
        <div key={group.month}>
          <h3 className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--text-muted)] mb-3">{group.label}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {group.txs.map(tx => (
              <button key={tx.id}
                onClick={() => setLightbox(tx.receiptUrl!)}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-input)] cursor-pointer hover:border-[var(--teal)] transition-all text-left"
              >
                <img src={tx.receiptUrl} alt={`Receipt: ${tx.merchant}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                  <p className="text-white text-[11px] font-bold truncate">{tx.merchant}</p>
                  <p className="text-white/70 text-[10px] font-semibold">
                    {tx.type === 'debit' ? '-' : '+'}{currency}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {lightbox && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label="Receipt lightbox">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md border-none cursor-pointer">
              <X size={20} />
            </button>
            <img src={lightbox} alt="Receipt" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
