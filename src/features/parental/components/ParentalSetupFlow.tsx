import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Save, Lock, Camera } from 'lucide-react';
import { PinInput } from '@/components/ui/PinInput';
import { ChildQRScanner } from '@/features/parental/components/ChildQRScanner';

interface ParentalSetupFlowProps {
  setupStep: 'welcome' | 'pin' | 'limits';
  setSetupStep: (step: 'welcome' | 'pin' | 'limits') => void;
  newPin: string;
  setNewPin: (pin: string) => void;
  pinError: string;
  handleSetPin: () => void;
  completeSetup: () => void;
  settings: any;
  updateSettings: (updates: any) => void;
}

export const ParentalSetupFlow: React.FC<ParentalSetupFlowProps> = ({
  setupStep,
  setSetupStep,
  newPin,
  setNewPin,
  pinError,
  handleSetPin,
  completeSetup,
  settings,
  updateSettings
}) => {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-4 animate-slide-up">
      {setupStep === 'welcome' && (
        <div className="card p-8 flex flex-col items-center text-center shadow-xl border border-[var(--teal)]/10">
          <div className="w-20 h-20 rounded-full bg-[var(--teal)]/10 flex items-center justify-center mb-6">
            <ShieldCheck className="w-10 h-10 text-[var(--teal)]" />
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mb-4 font-manrope">Parental Controls</h2>
          <p className="text-[var(--text-muted)] mb-10 text-lg max-w-md">
            Enable parental controls to monitor spending, approve high-value transactions, and manage chores.
          </p>
          <button
            onClick={() => setSetupStep('pin')}
            className="w-full py-4 rounded-2xl bg-[var(--teal)] text-white font-bold text-lg hover:opacity-90 flex items-center justify-center gap-3 transition-all shadow-lg shadow-teal-500/25 mb-4"
          >
            Get Started <ArrowRight className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setShowScanner(true)}
            className="w-full py-4 rounded-2xl bg-[var(--surface-input)] text-[var(--teal)] border border-[var(--teal)]/20 font-bold text-lg hover:bg-[var(--teal)]/10 flex items-center justify-center gap-3 transition-all"
          >
            I'm a Child (Scan Parent QR) <Camera className="w-6 h-6" />
          </button>
        </div>
      )}

      <ChildQRScanner
        show={showScanner}
        onClose={() => setShowScanner(false)}
        onSuccess={(parentId) => {
          updateSettings({ enabled: true, isTeenMode: true, ageGroup: 'teen', parentId });
          setShowScanner(false);
          completeSetup();
        }}
      />

      {setupStep === 'pin' && (
        <div className="card p-8 flex flex-col items-center shadow-xl border border-[var(--teal)]/10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-manrope text-center">Set Parental PIN</h2>
          <p className="text-sm text-[var(--text-muted)] mb-10 text-center">
            This PIN will be required to unlock parental settings and approve transactions.
          </p>
          <PinInput 
            value={newPin} 
            onChange={setNewPin} 
            error={pinError} 
            label="Create New PIN" 
          />
          <button
            onClick={handleSetPin}
            disabled={newPin.length !== 4}
            className="mt-10 w-full py-4 rounded-2xl bg-[var(--teal)] text-white font-bold text-lg hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-teal-500/25"
          >
            Confirm PIN
          </button>
        </div>
      )}

      {setupStep === 'limits' && (
        <div className="card p-8 shadow-xl border border-[var(--teal)]/10">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-manrope">Approval Limits</h2>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            Set thresholds for when your child needs your approval to spend.
          </p>
          
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-semibold text-[var(--text-primary)]">Max Transaction Amount</label>
                <span className="text-xl font-bold text-[var(--teal)] font-manrope">${settings.maxTransactionAmount}</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={settings.maxTransactionAmount}
                onChange={(e) => updateSettings({ maxTransactionAmount: Number(e.target.value) })}
                className="w-full accent-[var(--teal)]"
              />
              <p className="text-xs text-[var(--text-muted)] mt-4 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 leading-relaxed italic">
                Any single transaction above this amount will be held for your approval.
              </p>
            </div>

            <div className="flex items-center justify-between p-6 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]">
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Require Approval for All</h4>
                <p className="text-xs text-[var(--text-muted)]">Always notify me of new spending</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireApprovalForAll}
                  onChange={(e) => updateSettings({ requireApprovalForAll: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-[var(--border-color)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--teal)] shadow-inner"></div>
              </label>
            </div>
          </div>

          <button
            onClick={completeSetup}
            className="mt-10 w-full py-4 rounded-2xl bg-[var(--teal)] text-white font-bold text-lg hover:opacity-90 flex items-center justify-center gap-3 transition-all shadow-lg shadow-teal-500/25"
          >
            Complete Setup <Save className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
