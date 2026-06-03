import React, { RefObject } from 'react';
import { Check, ArrowRight } from 'lucide-react';

export type CurrencySymbol = '$' | '£' | '€' | '₹';

const CURRENCIES: { sym: CurrencySymbol; label: string }[] = [
  { sym: '$', label: 'USD' },
  { sym: '£', label: 'GBP' },
  { sym: '€', label: 'EUR' },
  { sym: '₹', label: 'INR' },
];

interface OnboardingStep1Props {
  step: number;
  currency: CurrencySymbol;
  setCurrency: (c: CurrencySymbol) => void;
  rawValue: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  focused: boolean;
  setFocused: (f: boolean) => void;
  isValid: boolean;
  handleNextStep: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
}

export function OnboardingStep1({
  step,
  currency,
  setCurrency,
  rawValue,
  handleChange,
  handleKeyDown,
  focused,
  setFocused,
  isValid,
  handleNextStep,
  inputRef,
}: OnboardingStep1Props) {
  const placeholder = `e.g. 5,200.00`;

  return (
    <div
      className="flex-1 p-6 md:p-10 transition-all duration-300"
      style={{ background: '#ffffff', display: step === 1 ? 'block' : 'none' }}
    >
      <div className="mb-7">
        <h3
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '6px',
          }}
        >
          Let's get started
        </h3>
        <p
          style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)' }}
        >
          Enter your current balance to begin tracking
        </p>
      </div>

      <div className="mb-5">
        <label
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: '10px',
          }}
        >
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
                <span
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '17px',
                    fontWeight: 700,
                    color: selected ? 'var(--teal)' : 'var(--text-secondary)',
                  }}
                >
                  {sym}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '9px',
                    fontWeight: 600,
                    color: selected ? 'var(--teal)' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <label
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: '10px',
          }}
        >
          Current Balance
        </label>
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '22px',
              fontWeight: 700,
              color: focused || rawValue ? 'var(--teal)' : '#a0aec0',
              transition: 'color 150ms',
            }}
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
              width: '100%',
              boxSizing: 'border-box',
              background: focused ? '#ffffff' : '#f8fafc',
              borderRadius: '14px',
              padding: '18px 20px 18px 48px',
              border: focused ? '2px solid var(--teal)' : '2px solid #edf2f7',
              outline: 'none',
              fontFamily: 'var(--font-manrope)',
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              boxShadow: focused ? '0 0 0 4px var(--teal-dim)' : 'none',
              transition: 'all 200ms ease',
            }}
          />
          {isValid && (
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: 'var(--teal-dim)' }}
            >
              <Check size={14} style={{ color: 'var(--teal)' }} />
            </span>
          )}
        </div>
        {rawValue && !isValid && (
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '12px',
              color: 'var(--red)',
              marginTop: '6px',
            }}
          >
            Please enter a valid positive number
          </p>
        )}
      </div>

      <button
        onClick={handleNextStep}
        disabled={!isValid}
        style={{
          width: '100%',
          height: '52px',
          borderRadius: '12px',
          border: 'none',
          cursor: isValid ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-inter)',
          fontSize: '15px',
          fontWeight: 600,
          color: '#ffffff',
          background: isValid ? 'var(--teal)' : '#a0aec0',
          transition: 'background 200ms ease, box-shadow 200ms ease, transform 80ms',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
        onMouseEnter={e => {
          if (isValid) {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--teal-light)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px var(--teal-glow)';
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = isValid
            ? 'var(--teal)'
            : '#a0aec0';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
        }}
      >
        Select Role
        <ArrowRight size={16} />
      </button>

      {step === 1 && (
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: '16px',
          }}
        >
          You can always update your balance later
        </p>
      )}
    </div>
  );
}
