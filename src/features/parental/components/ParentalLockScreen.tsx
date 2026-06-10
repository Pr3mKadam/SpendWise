import React from 'react';
import { Lock } from 'lucide-react';
import { PinInput } from '@/components/ui/PinInput';

interface ParentalLockScreenProps {
  unlockPin: string;
  setUnlockPin: (pin: string) => void;
  unlockError: string;
  setUnlockError: (error: string) => void;
  handleUnlock: () => void;
}

export const ParentalLockScreen: React.FC<ParentalLockScreenProps> = ({
  unlockPin,
  setUnlockPin,
  unlockError,
  setUnlockError,
  handleUnlock,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 animate-fade-in">
      <div className="card max-w-sm w-full p-8 flex flex-col items-center text-center shadow-2xl border border-[var(--teal)]/10">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 animate-pulse">
          <Lock className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-manrope">
          Parental Lock
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Access to parental controls and sensitive settings is restricted. Enter your PIN to
          continue.
        </p>

        <PinInput
          value={unlockPin}
          onChange={(v: string) => {
            setUnlockPin(v);
            setUnlockError('');
          }}
          error={unlockError}
          label="Enter Parent PIN"
        />

        <button
          onClick={handleUnlock}
          disabled={unlockPin.length !== 4}
          className="mt-8 w-full py-3.5 rounded-xl bg-[var(--teal)] text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-teal-500/20"
        >
          Unlock Access
        </button>
      </div>
    </div>
  );
};
