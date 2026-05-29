import { useState } from 'react';
import { Lock, Baby, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';
import { PinInput } from '@/components/ui/PinInput';

export function ParentalPinGate({ onContinueAsKid, onUnlocked }: { onContinueAsKid?: () => void, onUnlocked?: () => void }) {
  const store = useStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    const isValid = await store.verifyPin(pin);
    if (isValid) {
      store.unlockSession();
      onUnlocked?.();
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface-card)] rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Parent PIN Required</h2>
        <p className="text-sm text-[var(--text-muted)] text-center mb-6">
          Enter your parent PIN to access full settings and features.
        </p>
        
        <PinInput value={pin} onChange={(v: string) => { setPin(v); setError(''); }} error={error} label="Enter PIN" />
        
        <button
          onClick={handleUnlock}
          disabled={pin.length !== 4}
          className="mt-6 w-full py-3 rounded-xl bg-[var(--teal)] text-[#042f2e] font-semibold text-sm hover:bg-[var(--teal-light)] disabled:opacity-40"
        >
          Unlock Full Access
        </button>

        {onContinueAsKid && (
          <button
            onClick={onContinueAsKid}
            className="mt-4 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium"
          >
            Continue in Kid Mode
          </button>
        )}
      </div>
    </div>
  );
}

export function KidModeBanner({ onParentLogin }: { onParentLogin: () => void }) {
  return (
    <div className="bg-purple-500 text-white px-4 py-2 flex items-center justify-between text-sm sticky top-0 z-[60]">
      <div className="flex items-center gap-2 font-medium">
        <Baby className="w-4 h-4" />
        Kid Mode Active
      </div>
      <button 
        onClick={onParentLogin}
        className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
      >
        Parent Login <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
