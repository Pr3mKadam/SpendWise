import { useState, useRef, useEffect } from 'react';
import { Shield, TrendingUp, Target, Zap, ArrowRight, Check } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SpendWiseConfig {
  initialBalance:     number;
  /** Sum(credits) − sum(debits) for transactions included when the user stated `initialBalance`. */
  balanceAnchorNet?:  number;
  currency:           CurrencySymbol;
  onboardingComplete: boolean;
  createdAt:          string;
}

type CurrencySymbol = '$' | '£' | '€' | '₹';

const STORAGE_KEY = 'spendwise_config_v1';
const CURRENCIES: { sym: CurrencySymbol; label: string }[] = [
  { sym: '$', label: 'USD' },
  { sym: '£', label: 'GBP' },
  { sym: '€', label: 'EUR' },
  { sym: '₹', label: 'INR' },
];

const FEATURES = [
  { icon: TrendingUp, text: 'AI-powered spending insights' },
  { icon: Target,     text: 'Smart budget tracking'       },
  { icon: Zap,        text: 'Natural language input'      },
  { icon: Shield,     text: '100% private — no servers'   },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function loadConfig(): SpendWiseConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as SpendWiseConfig;
    return c;
  } catch {
    return null;
  }
}

function saveConfig(config: SpendWiseConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/** Persist onboarding settings for offline / non-Supabase mode. */
export function persistLocalSpendWiseConfig(config: SpendWiseConfig): void {
  saveConfig(config);
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface OnboardingModalProps {
  onComplete: (config: SpendWiseConfig) => void | Promise<void>;
  /** Net ledger of transactions on screen when the user submits (credits − debits). */
  transactionLedgerNet: number;
  /** When true, privacy copy reflects cloud sync. */
  cloudMode?: boolean;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currency, setCurrency] = useState<CurrencySymbol>('$');
  const [rawValue, setRawValue] = useState('');
  const [focused, setFocused]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const numericValue = parseFloat(rawValue.replace(/,/g, ''));
  const isValid      = !isNaN(numericValue) && numericValue > 0;
  const placeholder  = `e.g. 5,200.00`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawValue(e.target.value.replace(/[^\d,.]/g, ''));
  };

  const handleSubmit = () => {
    if (!isValid) return;
    const config: SpendWiseConfig = {
      initialBalance:     numericValue,
      balanceAnchorNet:   transactionLedgerNet,
      currency,
      onboardingComplete: true,
      createdAt:          new Date().toISOString(),
    };
    if (!cloudMode) saveConfig(config);
    void Promise.resolve(onComplete(config));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) handleSubmit();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full animate-scale-in overflow-hidden flex flex-col md:flex-row"
        style={{
          maxWidth:     '820px',
          borderRadius: '24px',
          boxShadow:    '0 24px 80px rgba(0,0,0,0.2)',
        }}
      >

        {/* ── Left Panel — Dark sidebar (Finebank style) ── */}
        <div
          className="flex-shrink-0 flex flex-col justify-between p-8 md:p-10"
          style={{
            background: 'var(--sidebar-bg)',
            width: '100%',
            maxWidth: '280px',
            minHeight: '400px',
          }}
        >
          {/* Brand */}
          <div>
            <div className="mb-8">
              <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: '20px', color: '#ffffff', letterSpacing: '-0.5px' }}>
                <span style={{ fontWeight: 400 }}>SPEND</span>Wise<span style={{ color: 'var(--teal)' }}>.</span>AI
              </span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-manrope)', fontSize: '22px', fontWeight: 700, color: '#ffffff', lineHeight: 1.3, marginBottom: '8px' }}>
              Your smart<br />finance copilot
            </h2>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              Set up in 30 seconds. No account needed.
            </p>
          </div>

          {/* Feature list */}
          <div className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0" style={{ background: 'var(--teal-dim)' }}>
                  <Icon size={13} style={{ color: 'var(--teal)' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Privacy */}
          <div className="mt-8 flex items-center gap-2">
            <Shield size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
              All data stored locally on your device
            </span>
          </div>
        </div>

        {/* ── Right Panel — White form ── */}
        <div className="flex-1 p-8 md:p-10" style={{ background: '#ffffff' }}>

          <div className="mb-7">
            <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Let's get started
            </h3>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)' }}>
              Enter your current balance to begin tracking
            </p>
          </div>

          {/* Currency selector */}
          <div className="mb-5">
            <label style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
              Select Currency
            </label>
            <div className="flex gap-2">
              {CURRENCIES.map(({ sym, label }) => {
                const selected = sym === currency;
                return (
                  <button
                    key={sym}
                    onClick={() => setCurrency(sym)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: '10px',
                      border: selected ? '2px solid var(--teal)' : '2px solid #edf2f7',
                      background: selected ? 'var(--teal-dim)' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '17px', fontWeight: 700, color: selected ? 'var(--teal)' : 'var(--text-secondary)' }}>
                      {sym}
                    </span>
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: '9px', fontWeight: 600, color: selected ? 'var(--teal)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Balance input */}
          <div className="mb-6">
            <label style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
              Current Balance
            </label>
            <div className="relative">
              {/* Currency prefix */}
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ fontFamily: 'var(--font-manrope)', fontSize: '22px', fontWeight: 700, color: focused || rawValue ? 'var(--teal)' : '#a0aec0', transition: 'color 150ms' }}
              >
                {currency}
              </span>
              <input
                ref={inputRef}
                id="balance-input"
                type="text"
                inputMode="decimal"
                value={rawValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder}
                style={{
                  width:        '100%',
                  boxSizing:    'border-box',
                  background:   focused ? '#ffffff' : '#f8fafc',
                  borderRadius: '14px',
                  padding:      '18px 20px 18px 48px',
                  border:       focused ? '2px solid var(--teal)' : '2px solid #edf2f7',
                  outline:      'none',
                  fontFamily:   'var(--font-manrope)',
                  fontSize:     '26px',
                  fontWeight:   700,
                  color:        'var(--text-primary)',
                  boxShadow:    focused ? '0 0 0 4px var(--teal-dim)' : 'none',
                  transition:   'all 200ms ease',
                }}
              />
              {isValid && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: 'var(--teal-dim)' }}>
                  <Check size={14} style={{ color: 'var(--teal)' }} />
                </span>
              )}
            </div>
            {rawValue && !isValid && (
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--red)', marginTop: '6px' }}>
                Please enter a valid positive number
              </p>
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            id="onboarding-submit"
            style={{
              width:          '100%',
              height:         '52px',
              borderRadius:   '12px',
              border:         'none',
              cursor:         isValid ? 'pointer' : 'not-allowed',
              fontFamily:     'var(--font-inter)',
              fontSize:       '15px',
              fontWeight:     600,
              color:          '#ffffff',
              background:     isValid ? 'var(--teal)' : '#a0aec0',
              transition:     'background 200ms ease, box-shadow 200ms ease, transform 80ms',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '8px',
            }}
            onMouseEnter={e => {
              if (isValid) {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--teal-light)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px var(--teal-glow)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = isValid ? 'var(--teal)' : '#a0aec0';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            Start Tracking
            <ArrowRight size={16} />
          </button>

          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>
            You can always update your balance later
          </p>
        </div>
      </div>
    </div>
  );
}
