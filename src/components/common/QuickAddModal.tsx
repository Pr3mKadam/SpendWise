import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import MagicInput from '../features/ai/MagicInput';
import { Transaction } from '../../types';
import { haptic } from '../../lib/haptic';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: Transaction) => void;
  transactions: Transaction[];
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  transactions,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150) {
                haptic.light();
                onClose();
              }
            }}
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-[var(--surface-card)] rounded-t-[32px] border-t border-[var(--border)] shadow-2xl p-6 pb-12 max-h-[85vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-add-title"
          >
            {/* Focus Trap Anchor (Top) */}
            <div tabIndex={0} onFocus={() => {
              // Focus the close button if tabbed backwards from modal start
              const closeBtn = document.getElementById('modal-close-btn');
              closeBtn?.focus();
            }} />

            {/* Pull Bar (Android/iOS style) */}
            <div className="w-12 h-1.5 bg-[var(--border)] rounded-full mx-auto mb-6 opacity-50" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[var(--teal-dim)] rounded-2xl">
                  <Zap className="text-[var(--teal)]" size={20} aria-hidden="true" />
                </div>
                <div>
                  <h2 
                    id="quick-add-title"
                    className="text-lg font-black text-[var(--text-primary)]" 
                    style={{ fontFamily: 'var(--font-manrope)' }}
                  >
                    Quick Add
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-medium">Add transaction via text, voice, or OCR</p>
                </div>
              </div>
              <button 
                id="modal-close-btn"
                onClick={() => {
                  haptic.light();
                  onClose();
                }}
                className="p-2 hover:bg-[var(--border)] rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} className="text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4">
              <MagicInput 
                onAdd={(tx) => {
                  haptic.success();
                  onAdd(tx);
                  onClose();
                }}
                transactions={transactions}
                autoFocus
              />
              
              <div className="flex items-center justify-center p-4">
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-[0.1em] text-center">
                  Tip: Say "Spent 500 on Coffee" or scan a receipt
                </p>
              </div>
            </div>

            {/* Focus Trap Anchor (Bottom) */}
            <div tabIndex={0} onFocus={() => {
              // Focus the magic input if tabbed forward from modal end
              const input = document.querySelector('input[name="magic-input"]');
              (input as HTMLElement)?.focus();
            }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
