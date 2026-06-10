import { X, Share, PlusSquare, ArrowUp } from 'lucide-react';

interface IOSInstallModalProps {
  onClose: () => void;
}

export default function IOSInstallModal({ onClose }: IOSInstallModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-[var(--surface-card)] rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-scale-in border border-[var(--teal)]/20 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[var(--surface-input)] text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors border-none cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Glow effect */}
        <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-[var(--teal)]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="text-center mt-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[var(--teal-dim)] flex items-center justify-center mx-auto mb-4 border border-[var(--teal)]/20 shadow-inner">
            <span className="text-2xl">📱</span>
          </div>
          <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">
            Install SpendWise
          </h3>
          <p className="font-inter text-xs text-[var(--text-muted)] mt-1">
            Add SpendWise to your iOS Home Screen for full offline capabilities & secure biometric
            access.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-5 mb-6">
          {/* Step 1 */}
          <div className="flex items-start gap-4 p-3 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]/40">
            <div className="w-8 h-8 rounded-lg bg-[var(--teal-dim)] text-[var(--teal)] flex items-center justify-center font-bold text-xs shrink-0 border border-[var(--teal)]/10">
              1
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                Tap the Share Button <Share size={12} className="text-[var(--teal)]" />
              </p>
              <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mt-0.5">
                Find the share option in Safari's bottom navigation bar.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 p-3 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]/40">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-500/10">
              2
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                Select 'Add to Home Screen' <PlusSquare size={12} className="text-indigo-500" />
              </p>
              <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mt-0.5">
                Scroll down the action sheet menu to find this option.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 p-3 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]/40">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/10">
              3
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                Tap 'Add' <ArrowUp size={12} className="text-amber-500 rotate-45" />
              </p>
              <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mt-0.5">
                Tap the "Add" button in the upper-right corner of your screen.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-[var(--teal)] text-white font-inter font-bold text-xs uppercase tracking-wider hover:opacity-90 shadow-md active:scale-98 transition-all border-none cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
