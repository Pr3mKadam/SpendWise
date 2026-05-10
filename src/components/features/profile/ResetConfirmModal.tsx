import React from 'react';
import { Trash2 } from 'lucide-react';

export interface ResetConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetConfirmModal({ onClose, onConfirm }: ResetConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--surface-card)] rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in border border-red-500/20">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="text-red-500 w-6 h-6" />
        </div>
        <h3 className="font-manrope font-bold text-xl text-center text-[var(--text-primary)] mb-2">Delete all data?</h3>
        <p className="font-inter text-sm text-[var(--text-secondary)] text-center mb-8">
          This action cannot be undone. All your transactions, budgets, goals, and history will be permanently wiped.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-input)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
          >
            Yes, delete it
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetConfirmModal;
