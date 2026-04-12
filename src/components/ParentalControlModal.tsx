import { useState, useEffect } from 'react';
import {
  Shield, Lock, Unlock, Eye, EyeOff, Baby, User as _User, ChevronRight,
  X, Check, AlertTriangle, Settings, Trash2, DollarSign, Tag as _Tag,
  ShieldCheck, ShieldOff, RefreshCw, Mail, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { useParentalControl, type AgeGroup } from '../contexts/ParentalControlContext';
import type { Transaction } from '../types';

// ── PIN Pad ───────────────────────────────────────────────────────

function PinDot({ filled }: { filled: boolean }) {
  return (
    <div
      className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
        filled
          ? 'bg-[var(--teal)] border-[var(--teal)] scale-110'
          : 'border-[var(--text-dim)]'
      }`}
    />
  );
}

interface PinInputProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  error?: string;
}

function PinInput({ value, onChange, label, error }: PinInputProps) {
  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  const press = (d: string) => {
    if (d === '⌫') { onChange(value.slice(0, -1)); return; }
    if (value.length < 4) onChange(value + d);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {label && <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>}
      {/* Dots */}
      <div className="flex gap-4 my-1">
        {[0,1,2,3].map(i => <PinDot key={i} filled={i < value.length} />)}
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 -mt-1">
          <AlertTriangle className="w-3 h-3" /> {error}
        </p>
      )}
      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2 mt-1">
        {digits.map((d, i) => (
          d === '' ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onClick={() => press(d)}
              className={`w-14 h-14 rounded-2xl text-lg font-semibold transition-all duration-150 select-none
                ${d === '⌫'
                  ? 'bg-transparent text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10'
                  : 'bg-[var(--surface-input)] text-[var(--text-primary)] hover:bg-[var(--teal-dim)] hover:text-[var(--teal)] active:scale-95 shadow-sm'
                }`}
            >
              {d}
            </button>
          )
        ))}
      </div>
    </div>
  );
}

// ── Toggle ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[var(--teal)]' : 'bg-[var(--surface-input)]'
      }`}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ── Section Row ────────────────────────────────────────────────────

function Row({
  icon: Icon,
  label,
  sub,
  right,
  iconColor = 'text-[var(--teal)]',
  iconBg = 'bg-[var(--teal-dim)]',
}: {
  icon: React.ElementType;
  label: string;
  sub?: string;
  right: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {sub && <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────

interface ParentalControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingTransactions?: Transaction[];
  onApproveTx?: (txId: string) => void;
  onRejectTx?: (txId: string) => void;
}

type Screen =
  | 'home'
  | 'setup-pin'
  | 'confirm-pin'
  | 'unlock'
  | 'forgot-pin'
  | 'change-pin-old'
  | 'change-pin-new'
  | 'change-pin-confirm'
  | 'remove-pin';

const AGE_GROUPS: { value: AgeGroup; label: string; emoji: string; desc: string }[] = [
  { value: 'child', label: 'Child', emoji: '🧒', desc: 'Under 12 · Strict limits' },
  { value: 'teen', label: 'Teen', emoji: '🧑', desc: '13–17 · Moderate limits' },
  { value: 'adult', label: 'Adult', emoji: '🙋', desc: '18+ · Light oversight' },
];

const ALL_CATEGORIES = [
  'Food & Drink','Shopping','Transport','Entertainment','Health',
  'Education','Housing','Utilities','Travel','Personal','Other',
];

export default function ParentalControlModal({ isOpen, onClose, pendingTransactions = [], onApproveTx, onRejectTx }: ParentalControlModalProps) {
  const pc = useParentalControl();
  const { settings, setupPin, verifyPin, changePin, removePin, updateSettings, lockSession, sendPasswordResetEmail } = pc;

  const [screen, setScreen] = useState<Screen>('home');
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [pinError, setPinError] = useState('');
  const [busy, setBusy] = useState(false);
  const [maxAmount, setMaxAmount] = useState(String(settings.maxTransactionAmount || ''));
  const [showSuccess, setShowSuccess] = useState('');

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setScreen(settings.enabled && !settings.sessionUnlocked ? 'unlock' : 'home');
      setPin1(''); setPin2(''); setPinError(''); setBusy(false); setShowSuccess('');
      setMaxAmount(String(settings.maxTransactionAmount || ''));
    }
  }, [isOpen, settings.enabled, settings.sessionUnlocked]);

  const flash = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(''), 2500);
  };

  // ── Handlers ──────────────────────────────────────────────────

  const handleSetupNext = () => {
    if (pin1.length !== 4) { setPinError('Please enter exactly 4 digits'); return; }
    setPinError('');
    setPin2('');
    setScreen('confirm-pin');
  };

  const handleSetupConfirm = async () => {
    if (pin2 !== pin1) { setPinError('PINs do not match — try again'); setPin2(''); return; }
    setBusy(true);
    await setupPin(pin1);
    setBusy(false);
    flash('Parental controls enabled! 🎉');
    setScreen('home');
  };

  const handleUnlock = async () => {
    setBusy(true);
    const ok = await pc.unlockSession(pin1);
    setBusy(false);
    if (!ok) { setPinError('Incorrect PIN'); setPin1(''); return; }
    setScreen('home');
  };

  const handleChangePinOld = async () => {
    setBusy(true);
    const ok = await verifyPin(pin1);
    setBusy(false);
    if (!ok) { setPinError('Incorrect current PIN'); setPin1(''); return; }
    setPinError(''); setPin2('');
    setScreen('change-pin-new');
  };



  const handleRemovePin = async () => {
    setBusy(true);
    const ok = await removePin(pin1);
    setBusy(false);
    if (!ok) { setPinError('Incorrect PIN'); setPin1(''); return; }
    flash('Parental controls removed');
    setScreen('home');
  };

  const handleMaxAmountSave = () => {
    const v = parseFloat(maxAmount);
    updateSettings({ maxTransactionAmount: isNaN(v) || v < 0 ? 0 : v });
    flash('Spending limit saved');
  };

  const toggleCategory = (cat: string) => {
    const curr = settings.allowedCategories;
    if (curr.includes(cat)) {
      updateSettings({ allowedCategories: curr.filter(c => c !== cat) });
    } else {
      updateSettings({ allowedCategories: [...curr, cat] });
    }
  };

  if (!isOpen) return null;

  // ── PIN Screens ────────────────────────────────────────────────

  const pinScreens: Record<string, React.ReactNode> = {
    'setup-pin': (
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-[var(--teal-dim)] flex items-center justify-center mb-2">
          <Lock className="w-7 h-7 text-[var(--teal)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Create Parent PIN</h2>
        <p className="text-sm text-[var(--text-muted)] text-center max-w-[240px]">
          This 4-digit PIN will be required to manage parental settings
        </p>
        <div className="mt-4">
          <PinInput value={pin1} onChange={(v) => { setPin1(v); setPinError(''); }} label="Enter your PIN" error={pinError} />
        </div>
        <div className="flex gap-3 mt-4 w-full max-w-xs">
          <button onClick={() => setScreen('home')} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]">
            Cancel
          </button>
          <button
            onClick={handleSetupNext}
            disabled={pin1.length !== 4}
            className="flex-1 py-2.5 rounded-xl bg-[var(--teal)] text-[#042f2e] font-semibold text-sm hover:bg-[var(--teal-light)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    ),

    'confirm-pin': (
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-[var(--teal-dim)] flex items-center justify-center mb-2">
          <ShieldCheck className="w-7 h-7 text-[var(--teal)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Confirm PIN</h2>
        <p className="text-sm text-[var(--text-muted)]">Re-enter the same PIN</p>
        <div className="mt-4">
          <PinInput value={pin2} onChange={(v) => { setPin2(v); setPinError(''); }} label="Confirm your PIN" error={pinError} />
        </div>
        <button
          onClick={handleSetupConfirm}
          disabled={pin2.length !== 4 || busy}
          className="mt-4 w-full max-w-xs py-2.5 rounded-xl bg-[var(--teal)] text-[#042f2e] font-semibold text-sm hover:bg-[var(--teal-light)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Enable Parental Controls
        </button>
      </div>
    ),

    'unlock': (
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-2">
          <Shield className="w-7 h-7 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Parent PIN Required</h2>
        <p className="text-sm text-[var(--text-muted)] text-center max-w-[240px]">
          Enter your parent PIN to manage parental control settings
        </p>
        <div className="mt-4">
          <PinInput value={pin1} onChange={(v) => { setPin1(v); setPinError(''); }} label="Enter Parent PIN" error={pinError} />
        </div>
        <button
          onClick={handleUnlock}
          disabled={pin1.length !== 4 || busy}
          className="mt-4 w-full max-w-xs py-2.5 rounded-xl bg-[var(--teal)] text-[#042f2e] font-semibold text-sm hover:bg-[var(--teal-light)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
          Unlock Settings
        </button>
        <button
          onClick={() => { setPin1(''); setPinError(''); setScreen('forgot-pin'); }}
          className="text-xs text-[var(--teal)] hover:underline mt-1"
        >
          Forgot PIN?
        </button>
        <button onClick={onClose} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] mt-1">
          Cancel
        </button>
      </div>
    ),

    'forgot-pin': (
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-1">
          <Mail className="w-7 h-7 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Forgot PIN?</h2>
        <p className="text-sm text-[var(--text-muted)] text-center max-w-[260px]">
          We'll send a magic link to your registered email address. Clicking it will sign you back in and let you reset the parental PIN.
        </p>
        {showSuccess === 'email_sent' ? (
          <div className="flex flex-col items-center gap-2 mt-2">
            <CheckCircle className="w-8 h-8 text-[var(--teal)]" />
            <p className="text-sm text-[var(--teal)] font-semibold">Magic link sent! Check your inbox.</p>
          </div>
        ) : (
          <button
            onClick={async () => {
              setBusy(true);
              const ok = await sendPasswordResetEmail();
              setBusy(false);
              if (ok) setShowSuccess('email_sent');
              else setPinError('Could not send email. Are you signed in?');
            }}
            disabled={busy}
            className="mt-2 w-full max-w-xs py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-400 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Send Magic Link
          </button>
        )}
        {pinError && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {pinError}
          </p>
        )}
        <button onClick={() => { setScreen('unlock'); setPinError(''); setShowSuccess(''); }}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] mt-1">
          Back
        </button>
      </div>
    ),

    'remove-pin': (
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-2">
          <ShieldOff className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Remove Controls</h2>
        <p className="text-sm text-[var(--text-muted)] text-center max-w-[240px]">
          Enter your PIN to confirm removing all parental controls
        </p>
        <div className="mt-4">
          <PinInput value={pin1} onChange={(v) => { setPin1(v); setPinError(''); }} label="Enter PIN to confirm" error={pinError} />
        </div>
        <div className="flex gap-3 mt-4 w-full max-w-xs">
          <button onClick={() => setScreen('home')} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]">
            Cancel
          </button>
          <button
            onClick={handleRemovePin}
            disabled={pin1.length !== 4 || busy}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Remove
          </button>
        </div>
      </div>
    ),
  };

  const isSubScreen = screen !== 'home';

  // ── Home Screen ────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isSubScreen) onClose(); }}
    >
      <div className="card modal-enter w-full max-w-[460px] max-h-[90vh] overflow-y-auto shadow-2xl relative">

        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-xl bg-[var(--teal-dim)] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[var(--teal)]" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-[var(--text-primary)]">Parental Controls</h2>
            <p className="text-xs text-[var(--text-muted)]">
              {settings.enabled ? (settings.sessionUnlocked ? 'Unlocked · Parent view' : 'PIN protected') : 'Not configured'}
            </p>
          </div>
          {!isSubScreen && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)]">
              <X className="w-4 h-4" />
            </button>
          )}
          {isSubScreen && (
            <button onClick={() => { setScreen('home'); setPin1(''); setPin2(''); setPinError(''); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Success Toast */}
        {showSuccess && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-[var(--teal-dim)] border border-[var(--teal)]/20 flex items-center gap-2 text-sm text-[var(--teal)] animate-fade-in-up">
            <Check className="w-4 h-4 flex-shrink-0" /> {showSuccess}
          </div>
        )}

        {/* Body */}
        <div className="p-5">

          {/* PIN sub-screens */}
          {isSubScreen && pinScreens[screen] && (
            <div className="py-4">{pinScreens[screen]}</div>
          )}

          {/* Home screen */}
          {screen === 'home' && (
            <div className="space-y-1">

              {/* Enable/Disable section */}
              <div className="rounded-2xl bg-[var(--surface-input)] p-4 mb-4">
                {!settings.enabled ? (
                  <div className="flex flex-col items-center gap-3 py-2 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--teal-dim)] flex items-center justify-center">
                      <Shield className="w-8 h-8 text-[var(--teal)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">Parental controls not set up</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1 max-w-[280px] mx-auto">
                        Set a 4-digit PIN to enable kid-friendly mode, spending limits, and more.
                      </p>
                    </div>
                    <button
                      onClick={() => { setPin1(''); setPinError(''); setScreen('setup-pin'); }}
                      className="mt-2 px-6 py-2.5 rounded-xl bg-[var(--teal)] text-[#042f2e] font-semibold text-sm hover:bg-[var(--teal-light)] flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Set Up Parental PIN
                    </button>
                  </div>
                ) : (
                  <div className="space-y-0 divide-y divide-[var(--border)]">

                    {/* Kid Mode */}
                    <Row
                      icon={Baby}
                      label="Kid Mode"
                      sub={settings.kidMode ? 'Active — restricted view enabled' : 'Off — full access'}
                      iconColor="text-purple-400"
                      iconBg="bg-purple-500/10"
                      right={
                        <Toggle
                          checked={settings.kidMode}
                          onChange={(v) => updateSettings({ kidMode: v })}
                        />
                      }
                    />

                    {/* Hide Balances */}
                    <Row
                      icon={settings.hideBalances ? EyeOff : Eye}
                      label="Hide Balances"
                      sub="Blur financial totals in kid mode"
                      iconColor="text-blue-400"
                      iconBg="bg-blue-500/10"
                      right={
                        <Toggle
                          checked={settings.hideBalances}
                          onChange={(v) => updateSettings({ hideBalances: v })}
                        />
                      }
                    />

                    {/* Hide Analytics */}
                    <Row
                      icon={Eye}
                      label="Hide Analytics"
                      sub="Block access to analytics tab"
                      iconColor="text-indigo-400"
                      iconBg="bg-indigo-500/10"
                      right={
                        <Toggle
                          checked={settings.hideAnalytics}
                          onChange={(v) => updateSettings({ hideAnalytics: v })}
                        />
                      }
                    />

                    {/* Block Add Transactions */}
                    <Row
                      icon={Lock}
                      label="Block Adding Transactions"
                      sub="Kids cannot add new transactions"
                      iconColor="text-red-400"
                      iconBg="bg-red-500/10"
                      right={
                        <Toggle
                          checked={settings.blockAddTransactions}
                          onChange={(v) => updateSettings({ blockAddTransactions: v })}
                        />
                      }
                    />

                    {/* Session lock */}
                    <Row
                      icon={Lock}
                      label="Lock Session"
                      sub="Re-enable PIN gate right now"
                      iconColor="text-amber-500"
                      iconBg="bg-amber-500/10"
                      right={
                        <button
                          onClick={() => { lockSession(); onClose(); }}
                          className="text-xs font-medium text-amber-500 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/10"
                        >
                          Lock
                        </button>
                      }
                    />
                  </div>
                )}
              </div>

              {/* Age group */}
              {settings.enabled && (
                <>
                  <p className="text-label px-1 mb-2">Age Profile</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {AGE_GROUPS.map(ag => (
                      <button
                        key={ag.value}
                        onClick={() => updateSettings({ ageGroup: ag.value })}
                        className={`p-3 rounded-2xl border-2 text-center transition-all duration-150 ${
                          settings.ageGroup === ag.value
                            ? 'border-[var(--teal)] bg-[var(--teal-dim)]'
                            : 'border-[var(--border)] hover:border-[var(--teal)]/40'
                        }`}
                      >
                        <div className="text-2xl mb-1">{ag.emoji}</div>
                        <div className="text-xs font-semibold text-[var(--text-primary)]">{ag.label}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{ag.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Spending limit */}
                  <p className="text-label px-1 mb-2">Spending Limit</p>
                  <div className="rounded-2xl bg-[var(--surface-input)] p-4 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-[var(--teal)]" />
                      <span className="text-sm font-medium text-[var(--text-primary)]">Max transaction amount</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mb-3">Set 0 to allow any amount</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={maxAmount}
                        onChange={e => setMaxAmount(e.target.value)}
                        className="input-field flex-1 text-sm"
                        placeholder="e.g. 500"
                      />
                      <button
                        onClick={handleMaxAmountSave}
                        className="px-4 py-2 rounded-xl bg-[var(--teal)] text-[#042f2e] font-semibold text-sm hover:bg-[var(--teal-light)]"
                      >
                        Save
                      </button>
                    </div>
                    {settings.maxTransactionAmount > 0 && (
                      <p className="text-xs text-[var(--teal)] mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Limit set at {settings.maxTransactionAmount}
                      </p>
                    )}
                  </div>

                  {/* Allowed categories */}
                  <p className="text-label px-1 mb-2">Allowed Categories</p>
                  <div className="rounded-2xl bg-[var(--surface-input)] p-4 mb-4">
                    <p className="text-xs text-[var(--text-muted)] mb-3">
                      {settings.allowedCategories.length === 0
                        ? 'All categories are allowed. Select categories to restrict to only those.'
                        : `Only selected categories allowed (${settings.allowedCategories.length}/${ALL_CATEGORIES.length})`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_CATEGORIES.map(cat => {
                        const isSelected = settings.allowedCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border ${
                              isSelected
                                ? 'bg-[var(--teal)] text-[#042f2e] border-[var(--teal)]'
                                : settings.allowedCategories.length > 0
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--teal)]/40'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                    {settings.allowedCategories.length > 0 && (
                      <button
                        onClick={() => updateSettings({ allowedCategories: [] })}
                        className="mt-3 text-xs text-[var(--text-muted)] hover:text-red-400 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Clear restrictions (allow all)
                      </button>
                    )}
                  </div>

                   {/* Pending Approval Queue */}
                    {pendingTransactions.length > 0 && (
                      <>
                        <p className="text-label px-1 mt-2 mb-2">Pending Approvals
                          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                            {pendingTransactions.length}
                          </span>
                        </p>
                        <div className="rounded-2xl bg-[var(--surface-input)] divide-y divide-[var(--border)] mb-4 overflow-hidden">
                          {pendingTransactions.map(tx => (
                            <div key={tx.id} className="flex items-center gap-3 p-3">
                              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4 text-amber-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{tx.merchant}</p>
                                <p className="text-xs text-[var(--text-muted)]">{tx.category} · {tx.type === 'debit' ? '-' : '+'}{tx.amount.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => onApproveTx?.(tx.id)}
                                  className="p-1.5 rounded-lg bg-[var(--teal-dim)] text-[var(--teal)] hover:bg-[var(--teal)] hover:text-white transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onRejectTx?.(tx.id)}
                                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* PIN management */}
                    <p className="text-label px-1 mb-2">Security</p>
                  <div className="rounded-2xl bg-[var(--surface-input)] divide-y divide-[var(--border)] mb-2">
                    <button
                      onClick={() => { setPin1(''); setPin2(''); setPinError(''); setScreen('change-pin-old'); }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-[var(--surface-hover)] rounded-t-2xl text-left"
                    >
                      <Settings className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-sm text-[var(--text-primary)]">Change PIN</span>
                      <ChevronRight className="w-4 h-4 text-[var(--text-dim)] ml-auto" />
                    </button>
                    <button
                      onClick={() => { setPin1(''); setPinError(''); setScreen('remove-pin'); }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-red-500/5 rounded-b-2xl text-left group"
                    >
                      <ShieldOff className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-400">Remove Parental Controls</span>
                      <ChevronRight className="w-4 h-4 text-red-300 ml-auto" />
                    </button>
                  </div>
                </>
              )}


            </div>
          )}

          {/* Change PIN old */}
          {screen === 'change-pin-old' && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Settings className="w-8 h-8 text-[var(--teal)]" />
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Change PIN</h2>
              <p className="text-sm text-[var(--text-muted)]">Enter your current PIN</p>
              <div className="mt-4">
                <PinInput value={pin1} onChange={(v) => { setPin1(v); setPinError(''); }} label="Current PIN" error={pinError} />
              </div>
              <button
                onClick={handleChangePinOld}
                disabled={pin1.length !== 4 || busy}
                className="mt-4 w-full max-w-xs py-2.5 rounded-xl bg-[var(--teal)] text-[#042f2e] font-semibold text-sm hover:bg-[var(--teal-light)] disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify & Continue'}
              </button>
            </div>
          )}

          {screen === 'change-pin-new' && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Lock className="w-8 h-8 text-[var(--teal)]" />
              <h2 className="text-xl font-bold text-[var(--text-primary)]">New PIN</h2>
              <p className="text-sm text-[var(--text-muted)]">Enter your new 4-digit PIN</p>
              <div className="mt-4">
                <PinInput value={pin2} onChange={(v) => { setPin2(v); setPinError(''); }} label="New PIN" error={pinError} />
              </div>
              <button
                onClick={async () => {
                  if (pin2.length !== 4) { setPinError('Enter 4 digits'); return; }
                  setBusy(true);
                  const ok = await changePin(pin1, pin2);
                  setBusy(false);
                  if (!ok) { setPinError('Change failed'); return; }
                  flash('PIN changed successfully');
                  setScreen('home');
                }}
                disabled={pin2.length !== 4 || busy}
                className="mt-4 w-full max-w-xs py-2.5 rounded-xl bg-[var(--teal)] text-[#042f2e] font-semibold text-sm hover:bg-[var(--teal-light)] disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Set New PIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
