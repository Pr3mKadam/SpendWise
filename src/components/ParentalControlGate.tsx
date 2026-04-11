import { useState } from 'react';
import { Shield, Lock, Unlock, Baby, AlertCircle, RefreshCw } from 'lucide-react';
import { useParentalControl } from '../contexts/ParentalControlContext';

// ── PIN Dot ──────────────────────────────────────────────────────

function PinDot({ filled }: { filled: boolean }) {
  return (
    <div
      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
        filled ? 'bg-[var(--teal)] border-[var(--teal)] scale-110' : 'border-[var(--text-dim)]'
      }`}
    />
  );
}

// ── PIN Gate overlay shown right after authentication ────────────
// When parental controls are active and the session is not yet unlocked,
// this full-screen overlay sits on top of the app, prompting for the parent PIN
// or allowing continued use in kid mode.

export function ParentalPinGate({ onContinueAsKid }: { onContinueAsKid: () => void }) {
  const { settings, unlockSession } = useParentalControl();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showKidConfirm, setShowKidConfirm] = useState(false);

  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  const press = (d: string) => {
    if (d === '⌫') { setPin(p => p.slice(0, -1)); setError(''); return; }
    if (pin.length < 4) setPin(p => p + d);
  };

  const handleUnlock = async () => {
    if (pin.length !== 4) return;
    setBusy(true);
    const ok = await unlockSession(pin);
    setBusy(false);
    if (!ok) {
      setError('Incorrect PIN — try again');
      setPin('');
    }
  };

  const ageLabel = {
    child: 'Child Mode 🧒',
    teen: 'Teen Mode 🧑',
    adult: 'Supervised Mode 🙋',
  }[settings.ageGroup] ?? 'Kid Mode';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-5%] w-[35%] h-[35%] rounded-full bg-[var(--teal)]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[380px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--teal-dim)] mb-4 shadow-lg shadow-[var(--teal)]/10">
            <Shield className="w-8 h-8 text-[var(--teal)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Spend<span className="text-[var(--teal)]">Wise</span>
          </h1>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold">
            <Lock className="w-3 h-3" />
            Parental Control Active
          </div>
        </div>

        {/* Card */}
        <div className="card p-6 shadow-2xl shadow-black/20">
          <h2 className="text-lg font-bold text-[var(--text-primary)] text-center mb-1">
            Parent or Kid?
          </h2>
          <p className="text-sm text-[var(--text-muted)] text-center mb-6">
            Enter the parent PIN to unlock full access, or continue in {ageLabel}.
          </p>

          {/* PIN Dots */}
          <div className="flex justify-center gap-5 mb-4">
            {[0,1,2,3].map(i => <PinDot key={i} filled={i < pin.length} />)}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {digits.map((d, i) => (
              d === '' ? (
                <div key={i} />
              ) : (
                <button
                  key={i}
                  onClick={() => press(d)}
                  className={`h-14 rounded-2xl text-lg font-semibold transition-all duration-150 select-none active:scale-95 ${
                    d === '⌫'
                      ? 'bg-transparent text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10'
                      : 'bg-[var(--surface-input)] text-[var(--text-primary)] hover:bg-[var(--teal-dim)] hover:text-[var(--teal)] shadow-sm'
                  }`}
                >
                  {d}
                </button>
              )
            ))}
          </div>

          {/* Unlock button */}
          <button
            onClick={handleUnlock}
            disabled={pin.length !== 4 || busy}
            className="w-full py-3 rounded-xl bg-[var(--teal)] text-[#042f2e] font-semibold text-sm hover:bg-[var(--teal-light)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3 transition-all"
          >
            {busy
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <Unlock className="w-4 h-4" />
            }
            Unlock as Parent
          </button>

          {/* Continue as kid */}
          <button
            onClick={() => setShowKidConfirm(true)}
            className="w-full py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-input)] flex items-center justify-center gap-2 transition-all"
          >
            <Baby className="w-4 h-4" />
            Continue in {ageLabel}
          </button>
        </div>

        <p className="text-center text-xs text-[var(--text-dim)] mt-5">
          SpendWise · Parental Controls are active for this account
        </p>
      </div>

      {/* Kid confirm dialog */}
      {showKidConfirm && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div className="card modal-enter w-full max-w-[320px] p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <Baby className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-bold text-[var(--text-primary)] mb-2">Enter {ageLabel}?</h3>
            <p className="text-sm text-[var(--text-muted)] mb-5">
              Some features will be restricted based on parental settings. You can switch later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowKidConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowKidConfirm(false); onContinueAsKid(); }}
                className="flex-1 py-2.5 rounded-xl bg-purple-500 text-white font-semibold text-sm hover:bg-purple-400 flex items-center justify-center gap-2"
              >
                <Baby className="w-4 h-4" /> Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Kid Mode Banner ──────────────────────────────────────────────
// Shown at the top of the main shell when kid mode is active

export function KidModeBanner({ onParentLogin }: { onParentLogin: () => void }) {
  const { settings, lockSession: _lockSession } = useParentalControl();

  const ageLabel = {
    child: '🧒 Child Mode',
    teen: '🧑 Teen Mode',
    adult: '🙋 Supervised Mode',
  }[settings.ageGroup] ?? '🔒 Kid Mode';

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-purple-500/10 via-[var(--teal)]/10 to-purple-500/10 border-b border-purple-500/10">
      <div className="flex items-center gap-2 flex-1">
        <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-purple-400">{ageLabel}</span>
        <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
          · Some features are restricted by parental controls
        </span>
      </div>
      <button
        onClick={onParentLogin}
        className="text-xs font-semibold text-[var(--teal)] hover:underline flex items-center gap-1"
      >
        <Unlock className="w-3 h-3" /> Parent Login
      </button>
    </div>
  );
}
