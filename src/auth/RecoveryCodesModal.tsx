import { useState } from 'react';
import { CheckCircle2, Copy, ShieldCheck } from 'lucide-react';

interface RecoveryCodesModalProps {
  codes: string[];
  onConfirm: () => void;
}

export function RecoveryCodesModal({ codes, onConfirm }: RecoveryCodesModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface-card,#1e293b)] rounded-2xl shadow-2xl w-full max-w-md border border-[var(--border-subtle,#334155)] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--teal,#14b8a6)]/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[var(--teal,#14b8a6)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary,#f1f5f9)]">
                Recovery Codes
              </h2>
              <p className="text-sm text-[var(--text-secondary,#94a3b8)] mt-0.5">
                Save these codes in a safe place. Each code can be used only once.
              </p>
            </div>
          </div>

          <div className="bg-[var(--bg,#0f172a)] rounded-xl p-4 mb-4 border border-[var(--border-subtle,#334155)]">
            <div className="grid grid-cols-1 gap-2">
              {codes.map((code, i) => (
                <code
                  key={i}
                  className="block font-mono text-sm tracking-wider text-[var(--teal,#14b8a6)] bg-[var(--surface-input,#1e293b)] rounded-lg px-3 py-2 text-center select-all"
                >
                  {code}
                </code>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-[var(--surface-input,#1e293b)] border border-[var(--border,#334155)] text-[var(--text-primary,#f1f5f9)] hover:bg-[var(--surface-hover,#334155)] transition-all duration-200 flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[var(--teal,#14b8a6)]" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy to clipboard
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-[var(--teal,#14b8a6)] text-slate-900 hover:bg-[var(--teal-light,#2dd4bf)] transition-all duration-200 flex items-center justify-center gap-2"
            >
              I've saved these codes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
