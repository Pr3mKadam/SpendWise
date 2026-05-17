import React from 'react';
import { AlertCircle, Check, X, Clock } from 'lucide-react';
import { Transaction } from '../../../../types';

interface PendingApprovalsProps {
  pendingTransactions: Transaction[];
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
}

export const PendingApprovals: React.FC<PendingApprovalsProps> = ({
  pendingTransactions,
  handleApprove,
  handleReject
}) => {
  return (
    <div className="card p-6 shadow-lg border border-[var(--border-color)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-amber-500" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)] font-manrope">Pending Approvals</h3>
      </div>
      
      {pendingTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-[var(--background-secondary)]/50 rounded-2xl border-2 border-dashed border-[var(--border-color)]">
          <div className="w-12 h-12 rounded-full bg-[var(--background-primary)] flex items-center justify-center mb-3">
            <Check className="w-6 h-6 text-[var(--teal)] opacity-50" />
          </div>
          <p className="text-[var(--text-muted)] text-sm">All transactions approved</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTransactions.map(t => (
            <div key={t.id} className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] hover:border-[var(--teal)]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                    {t.merchant}
                    {t.amount > 100 && <AlertCircle className="w-4 h-4 text-amber-500" />}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">{t.category}</p>
                </div>
                <span className="text-xl font-bold text-[var(--text-primary)] font-manrope">${t.amount}</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(t.id)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--teal)] text-white text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleReject(t.id)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
