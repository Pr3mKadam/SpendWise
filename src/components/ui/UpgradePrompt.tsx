import { Sparkles } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  onSeePlans: () => void;
  onClose: () => void;
}

export function UpgradePrompt({ feature, onSeePlans, onClose }: UpgradePromptProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/45 backdrop-blur-[12px]" />
      <div
        className="relative z-10 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center"
        style={{
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'var(--teal-dim)' }}
          >
            <Sparkles size={32} className="text-[var(--teal)]" />
          </div>
        </div>
        <h3 className="font-manrope font-bold text-lg mb-2">Upgrade to Pro</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Upgrade to Pro to unlock {feature}.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-none bg-[var(--surface-input)] text-sm font-bold cursor-pointer transition-all hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            Maybe Later
          </button>
          <button
            onClick={onSeePlans}
            className="flex-1 py-3 rounded-xl border-none bg-[var(--teal)] text-white text-sm font-bold cursor-pointer transition-all hover:bg-[var(--teal-light)]"
          >
            See Plans
          </button>
        </div>
      </div>
    </div>
  );
}
