import { useState, useRef, useEffect } from 'react';
import { Shield, TrendingUp, Target, Zap, ArrowRight, Check } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'professional' | 'business';

export interface SpendWiseConfig {
  initialBalance:     number;
  currency:           string;
  name?:              string;
  balanceAnchorNet?:  number;
  onboardingComplete: boolean;
  createdAt:          string;
  phone?:             string;
  occupation?:        string;
  monthlyGoal?:       number;
  location?:          string;
  userRole:           UserRole;
}

type CurrencySymbol = '$' | '£' | '€' | '₹';

import { STORAGE_KEYS } from '../../../constants';
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
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) return null;
    return JSON.parse(raw) as SpendWiseConfig;
  } catch {
    return null;
  }
}

function saveConfig(config: SpendWiseConfig): void {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface OnboardingModalProps {
  onComplete: (config: SpendWiseConfig) => void;
  preferredName?: string;
  preferredPhone?: string;
}

export default function OnboardingModal({ onComplete, preferredName, preferredPhone }: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currency, setCurrency] = useState<CurrencySymbol>('₹'); // Default to ₹ as per user audio
  const [rawValue, setRawValue] = useState('');
  const [focused, setFocused]   = useState(false);
  
  // Advanced fields
  const [name, setName] = useState(preferredName || '');
  const [userRole, setUserRole] = useState<UserRole>('professional');
  const [occupation, setOccupation] = useState('');
  const [location, setLocation] = useState('');
  const [monthlyGoal, setMonthlyGoal] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    if (step === 1) inputRef.current?.focus(); 
  }, [step]);

  const numericValue = parseFloat(rawValue.replace(/,/g, ''));
  const isValid      = !isNaN(numericValue) && numericValue > 0;
  const placeholder  = `e.g. 5,200.00`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawValue(e.target.value.replace(/[^\d,.]/g, ''));
  };

  const handleNextStep = () => {
    if (!isValid) return;
    setStep(2);
  };

  const handleFinalSubmit = () => {
    if (!name || !occupation || !location || !monthlyGoal) return;

    const config: SpendWiseConfig = {
      initialBalance:     numericValue,
      currency,
      name:               name.trim(),
      phone:              preferredPhone,
      userRole,
      occupation:         occupation.trim(),
      location:           location.trim(),
      monthlyGoal:        parseFloat(monthlyGoal),
      onboardingComplete: true,
      createdAt:          new Date().toISOString(),
    };
    saveConfig(config);
    onComplete(config);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 1 && isValid) setStep(2);
      else if (step === 2) setStep(3);
      else if (step === 3) handleFinalSubmit();
    }
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
          className="flex-shrink-0 flex flex-col justify-between p-6 md:p-10 w-full md:max-w-[280px] md:min-h-[400px]"
          style={{
            background: 'var(--sidebar-bg)',
          }}
        >
          {/* Brand */}
          <div>
            <div className="mb-4 md:mb-8">
              <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: '20px', color: '#ffffff', letterSpacing: '-0.5px' }}>
                SpendWise
              </span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-manrope)', fontSize: '22px', fontWeight: 700, color: '#ffffff', lineHeight: 1.3, marginBottom: '8px' }}>
              Your smart<br />finance copilot
            </h2>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              Personalize your suite in 3 steps.<br />Securely stored on device.
            </p>
          </div>

          {/* Feature list */}
          <div className="mt-8 space-y-3 hidden md:block">
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
          <div className="mt-6 md:mt-8 flex items-center gap-2">
            <Shield size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
              All data stored locally on your device
            </span>
          </div>
        </div>

        {/* ── Right Panel — White form ── */}
        <div className="flex-1 p-6 md:p-10 transition-all duration-300" style={{ background: '#ffffff', display: step === 1 ? 'block' : 'none' }}>

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
          
          {/* CTA Button Step 1 */}
          <button
            onClick={handleNextStep}
            disabled={!isValid}
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
            Select Role
            <ArrowRight size={16} />
          </button>
        </div>
        
        {/* Step 2 Panel — Role Selection */}
        <div className="flex-1 p-6 md:p-10 transition-all duration-300" style={{ background: '#ffffff', display: step === 2 ? 'block' : 'none' }}>
          <div className="mb-7">
            <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Choose your Persona
            </h3>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)' }}>
              We'll customize your tools based on your role
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {[
              { id: 'student', title: 'Student', desc: 'Habit building & learning focus', icon: '🎓' },
              { id: 'professional', title: 'Professional', desc: 'Net worth & goals focus', icon: '💼' },
              { id: 'business', title: 'Business Owner', desc: 'Cash flow & analytics focus', icon: '🏢' },
            ].map((role) => {
              const isSelected = userRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setUserRole(role.id as UserRole)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '16px',
                    border: isSelected ? '2px solid var(--teal)' : '2px solid #edf2f7',
                    background: isSelected ? 'var(--teal-dim)' : '#f8fafc',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{role.icon}</span>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-manrope)', fontSize: '15px', fontWeight: 700, color: isSelected ? 'var(--teal)' : 'var(--text-primary)' }}>
                      {role.title}
                    </h4>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {role.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setStep(3)}
            style={{
              width:          '100%',
              height:         '52px',
              borderRadius:   '12px',
              border:         'none',
              cursor:         'pointer',
              fontFamily:     'var(--font-inter)',
              fontSize:       '15px',
              fontWeight:     600,
              color:          '#ffffff',
              background:     'var(--teal)',
              transition:     'background 200ms ease, box-shadow 200ms ease',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '8px',
            }}
          >
            Almost There
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Step 3 Panel — Final Details */}
        <div className="flex-1 p-6 md:p-10 transition-all duration-300" style={{ background: '#ffffff', display: step === 3 ? 'block' : 'none' }}>
           <div className="mb-7">
            <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Finalize Profile
            </h3>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)' }}>
              All fields are required to secure your account
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl py-3 px-4 text-sm focus:outline-none transition-all"
                style={{ background: '#f8fafc', border: '2px solid #edf2f7', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}
                onFocus={e => { e.target.style.border = '2px solid var(--teal)'; e.target.style.background = '#ffffff'; }}
                onBlur={e => { e.target.style.border = '2px solid #edf2f7'; e.target.style.background = '#f8fafc'; }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Occupation
              </label>
              <input
                type="text"
                placeholder={userRole === 'student' ? "e.g. University Student" : "e.g. Software Engineer"}
                value={occupation}
                onChange={e => setOccupation(e.target.value)}
                className="w-full rounded-xl py-3 px-4 text-sm focus:outline-none transition-all"
                style={{ background: '#f8fafc', border: '2px solid #edf2f7', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}
                onFocus={e => { e.target.style.border = '2px solid var(--teal)'; e.target.style.background = '#ffffff'; }}
                onBlur={e => { e.target.style.border = '2px solid #edf2f7'; e.target.style.background = '#f8fafc'; }}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. London"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-sm focus:outline-none transition-all"
                  style={{ background: '#f8fafc', border: '2px solid #edf2f7', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}
                  onFocus={e => { e.target.style.border = '2px solid var(--teal)'; e.target.style.background = '#ffffff'; }}
                  onBlur={e => { e.target.style.border = '2px solid #edf2f7'; e.target.style.background = '#f8fafc'; }}
                />
              </div>
              
              <div className="flex-1">
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Target Monthly Income
                </label>
                <input
                  type="number"
                  placeholder="5000"
                  value={monthlyGoal}
                  onChange={e => setMonthlyGoal(e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-sm focus:outline-none transition-all"
                  style={{ background: '#f8fafc', border: '2px solid #edf2f7', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}
                  onFocus={e => { e.target.style.border = '2px solid var(--teal)'; e.target.style.background = '#ffffff'; }}
                  onBlur={e => { e.target.style.border = '2px solid #edf2f7'; e.target.style.background = '#f8fafc'; }}
                />
              </div>
            </div>
          </div>

          {/* CTA Button Step 3 */}
          <button
            onClick={handleFinalSubmit}
            disabled={!name || !occupation || !location || !monthlyGoal}
            style={{
              width:          '100%',
              height:         '52px',
              borderRadius:   '12px',
              border:         'none',
              cursor:         (name && occupation && location && monthlyGoal) ? 'pointer' : 'not-allowed',
              fontFamily:     'var(--font-inter)',
              fontSize:       '15px',
              fontWeight:     600,
              color:          '#ffffff',
              background:     (name && occupation && location && monthlyGoal) ? 'var(--teal)' : '#a0aec0',
              transition:     'all 200ms ease',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '8px',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--teal-light)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px var(--teal-glow)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--teal)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            Go to Dashboard
            <ArrowRight size={16} />
          </button>

          {step === 1 && (
             <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>
               You can always update your balance later
             </p>
          )}
        </div>
      </div>
    </div>
  );
}
