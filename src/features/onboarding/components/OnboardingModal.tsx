import { useState, useRef, useEffect } from 'react';
import { STORAGE_KEYS } from '@/constants';
import { OnboardingSidebar } from '@/features/onboarding/components/OnboardingSidebar';
import { OnboardingStep1, CurrencySymbol } from '@/features/onboarding/components/OnboardingStep1';
import { OnboardingStep2, UserRole } from '@/features/onboarding/components/OnboardingStep2';
import { OnboardingStep3 } from '@/features/onboarding/components/OnboardingStep3';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SpendWiseConfig {
  initialBalance: number;
  currency: string;
  name?: string;
  balanceAnchorNet?: number;
  onboardingComplete: boolean;
  createdAt: string;
  phone?: string;
  occupation?: string;
  monthlyGoal?: number;
  location?: string;
  userRole: UserRole;
}

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
  const [focused, setFocused] = useState(false);

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
  const isValid = !isNaN(numericValue) && numericValue > 0;

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
      initialBalance: numericValue,
      currency,
      name: name.trim(),
      phone: preferredPhone,
      userRole,
      occupation: occupation.trim(),
      location: location.trim(),
      monthlyGoal: parseFloat(monthlyGoal),
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
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
          maxWidth: '820px',
          borderRadius: '24px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        }}
      >
        <OnboardingSidebar />

        <OnboardingStep1
          step={step}
          currency={currency}
          setCurrency={setCurrency}
          rawValue={rawValue}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
          focused={focused}
          setFocused={setFocused}
          isValid={isValid}
          handleNextStep={handleNextStep}
          inputRef={inputRef}
        />

        <OnboardingStep2 step={step} userRole={userRole} setUserRole={setUserRole} setStep={setStep} />

        <OnboardingStep3
          step={step}
          name={name}
          setName={setName}
          userRole={userRole}
          occupation={occupation}
          setOccupation={setOccupation}
          location={location}
          setLocation={setLocation}
          monthlyGoal={monthlyGoal}
          setMonthlyGoal={setMonthlyGoal}
          handleFinalSubmit={handleFinalSubmit}
        />
      </div>
    </div>
  );
}
