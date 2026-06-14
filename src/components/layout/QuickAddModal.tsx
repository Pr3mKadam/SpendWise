import React from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import MagicInput from '@/features/ai/components/MagicInput';
import { Transaction } from '@/types';
import { haptic } from '@/core/haptic';

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
  const dragControls = useDragControls();

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
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150) {
                haptic.light();
                onClose();
              }
            }}
            onAnimationComplete={() => {
              setTimeout(() => {
                const input = document.getElementById('magic-input-field');
                if (input) input.focus();
              }, 450);
            }}
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-[var(--surface-card)] rounded-[var(--radius-sheet)] rounded-b-none border-t border-[var(--border)] shadow-2xl p-4 sm:p-6 pb-12 overflow-y-auto"
            style={{ maxHeight: 'min(85vh, 85dvh)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-add-title"
          >
            {/* Focus Trap Anchor (Top) */}
            <div
              tabIndex={0}
              onFocus={() => {
                // Focus the close button if tabbed backwards from modal start
                const closeBtn = document.getElementById('modal-close-btn');
                closeBtn?.focus();
              }}
            />

            {/* Pull Bar (Android/iOS style) - Click & drag trigger */}
            <div
              onPointerDown={e => dragControls.start(e)}
              className="w-12 h-1.5 bg-[var(--border)] rounded-full mx-auto mb-6 opacity-50 cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[var(--teal-dim)] rounded-2xl">
                  <Zap className="text-[var(--teal)]" size={20} aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="quick-add-title"
                    className="text-[length:var(--fs-title)] font-bold text-[var(--text-primary)]"
                    style={{ fontFamily: 'var(--font-manrope)' }}
                  >
                    Quick Add
                  </h2>
                  <p className="text-[length:var(--fs-caption)] text-[var(--text-muted)] font-medium">
                    Add transaction via text, voice, or OCR
                  </p>
                </div>
              </div>
              <button
                id="modal-close-btn"
                onClick={() => {
                  haptic.light();
                  onClose();
                }}
                className="p-2 hover:bg-[var(--border)] rounded-full transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X size={20} className="text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4">
              <MagicInput
                onAdd={tx => {
                  haptic.success();
                  onAdd(tx);
                }}
                onAllAdded={onClose}
                transactions={transactions}
              />

              <div className="flex items-center justify-center p-4">
                <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] font-bold uppercase tracking-[0.1em] text-center">
                  Tip: Say "Spent 500 on Coffee" or scan a receipt
                </p>
              </div>

              {/* Bottom keyboard spacer */}
              <div className="h-28 md:hidden" aria-hidden="true" />
            </div>

            {/* Focus Trap Anchor (Bottom) */}
            <div
              tabIndex={0}
              onFocus={() => {
                // Focus the magic input if tabbed forward from modal end
                const input = document.querySelector('input[name="magic-input"]');
                (input as HTMLElement)?.focus();
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
