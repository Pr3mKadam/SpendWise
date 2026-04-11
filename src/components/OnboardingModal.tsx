import { useState, useRef, useEffect } from 'react';
import { Lock } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SpendWiseConfig {
  initialBalance:     number;
  currency:           CurrencySymbol;
  onboardingComplete: boolean;
  createdAt:          string;
}

type CurrencySymbol = '$' | '£' | '€' | '₹';

const STORAGE_KEY = 'spendwise_config_v1';

const CURRENCIES: CurrencySymbol[] = ['$', '£', '€', '₹'];

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function loadConfig(): SpendWiseConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SpendWiseConfig;
  } catch {
    return null;
  }
}

function saveConfig(config: SpendWiseConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface OnboardingModalProps {
  onComplete: (config: SpendWiseConfig) => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currency, setCurrency]     = useState<CurrencySymbol>('$');
  const [rawValue, setRawValue]     = useState('');
  const [focused, setFocused]       = useState(false);
  const inputRef                    = useRef<HTMLInputElement>(null);

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Derived state ────────────────────────────────────────────────────────────
  const numericValue  = parseFloat(rawValue.replace(/,/g, ''));
  const isValid       = !isNaN(numericValue) && numericValue > 0;
  const placeholder   = `${currency}5,200.00`;

  // ── Input handler — allow digits, commas, one decimal point ─────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    // Strip anything that isn't a digit, comma, or period
    const cleaned = v.replace(/[^\d,.]/g, '');
    setRawValue(cleaned);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!isValid) return;
    const config: SpendWiseConfig = {
      initialBalance:     numericValue,
      currency,
      onboardingComplete: true,
      createdAt:          new Date().toISOString(),
    };
    saveConfig(config);
    onComplete(config);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) handleSubmit();
  };

  return (
    /* ── Full-viewport overlay ── */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(14, 19, 29, 0.85)' }}
    >
      {/* ── Modal card ── */}
      <div
        className="w-full animate-fade-in-up"
        style={{
          maxWidth:     '460px',
          background:   '#151c2c',
          borderRadius: '24px',
          padding:      '40px',
          boxShadow:    '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >

        {/* 1 ── Brand name */}
        <p
          style={{
            fontFamily:   'Manrope, sans-serif',
            fontSize:     '18px',
            fontWeight:   600,
            color:        '#578cff',
            marginBottom: '24px',
          }}
        >
          SpendWise
        </p>

        {/* 2 ── Headline */}
        <h1
          style={{
            fontFamily:   'Manrope, sans-serif',
            fontSize:     '28px',
            fontWeight:   700,
            color:        '#ffffff',
            marginBottom: '8px',
            lineHeight:   1.2,
          }}
        >
          Let's set up your account
        </h1>

        {/* 3 ── Sub-headline */}
        <p
          style={{
            fontFamily:   'Inter, sans-serif',
            fontSize:     '14px',
            fontWeight:   400,
            color:        '#c2c6d7',
            marginBottom: '32px',
          }}
        >
          We need one number to get started
        </p>

        {/* 4 ── Label + currency pills row */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            marginBottom:   '12px',
          }}
        >
          {/* Label */}
          <span
            style={{
              fontFamily:    'Inter, sans-serif',
              fontSize:      '11px',
              fontWeight:    500,
              color:         '#c2c6d7',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Your Current Balance
          </span>

          {/* Currency pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {CURRENCIES.map((sym) => {
              const selected = sym === currency;
              return (
                <button
                  key={sym}
                  onClick={() => setCurrency(sym)}
                  style={{
                    width:           '36px',
                    height:          '36px',
                    borderRadius:    '50%',
                    border:          'none',
                    cursor:          'pointer',
                    fontFamily:      'Inter, sans-serif',
                    fontSize:        '14px',
                    fontWeight:      600,
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    transition:      'transform 0.15s, box-shadow 0.15s',
                    background:      selected ? '#578cff' : '#1e2535',
                    color:           selected ? '#ffffff' : '#c2c6d7',
                    boxShadow:       selected ? '0 4px 12px rgba(87,140,255,0.35)' : 'none',
                    transform:       'scale(1)',
                  }}
                  onMouseEnter={e => {
                    if (!selected) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                  }}
                  aria-label={`Select currency ${sym}`}
                  aria-pressed={selected}
                >
                  {sym}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5 ── Balance input */}
        <div style={{ marginBottom: '24px', position: 'relative' }}>
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
              background:   '#1e2535',
              borderRadius: '16px',
              padding:      '20px 24px',
              border:       'none',
              outline:      'none',
              fontFamily:   'Manrope, sans-serif',
              fontSize:     '28px',
              fontWeight:   600,
              color:        '#ffffff',
              caretColor:   '#578cff',
              boxShadow:    focused
                ? '0 0 0 2px rgba(87,140,255,0.4)'
                : '0 0 0 2px transparent',
              transition:   'box-shadow 0.2s ease',
            }}
          />
          {/* Placeholder color override via pseudo-element workaround: inline style on the input
              handles the glow; placeholder colour is set globally in index.css */}
        </div>

        {/* 6 ── CTA button */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          id="onboarding-submit"
          style={{
            width:         '100%',
            height:        '56px',
            borderRadius:  '50px',
            border:        'none',
            cursor:        isValid ? 'pointer' : 'not-allowed',
            fontFamily:    'Inter, sans-serif',
            fontSize:      '16px',
            fontWeight:    600,
            color:         '#ffffff',
            background:    'linear-gradient(135deg, #578cff 0%, #3d6fe8 100%)',
            opacity:       isValid ? 1 : 0.4,
            transition:    'box-shadow 0.2s ease, opacity 0.2s ease',
            display:       'flex',
            alignItems:    'center',
            justifyContent:'center',
            gap:           '8px',
          }}
          onMouseEnter={e => {
            if (isValid)
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(87,140,255,0.35)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          Get started →
        </button>

        {/* 7 ── Privacy note */}
        <div
          style={{
            marginTop:      '20px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '6px',
          }}
        >
          <Lock
            style={{
              width:  '14px',
              height: '14px',
              color:  '#3a4255',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily:  'Inter, sans-serif',
              fontSize:    '12px',
              fontWeight:  400,
              color:       '#3a4255',
            }}
          >
            Your data never leaves this device
          </span>
        </div>

      </div>
    </div>
  );
}
