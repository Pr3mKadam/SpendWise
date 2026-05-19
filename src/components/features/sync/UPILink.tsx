import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { UPI_PROVIDERS } from '@/parsers/upi';

export interface UPILinkProps {
  onSetView: (view: any) => void;
  onUPILinkSuccess: (provider: typeof UPI_PROVIDERS[0], id: string) => void;
}

type WizardStep = 'upi-select' | 'upi-credentials' | 'upi-connecting' | 'upi-success';

export function UPILink({ onSetView, onUPILinkSuccess }: UPILinkProps) {
  const [wizardStep, setWizardStep] = useState<WizardStep>('upi-select');
  const [selectedProvider, setSelectedProvider] = useState<typeof UPI_PROVIDERS[0] | null>(null);
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');

  const handleVerifyAndLink = () => {
    setWizardStep('upi-connecting');
    setTimeout(() => setWizardStep('upi-success'), 2000);
    setTimeout(() => {
      if (selectedProvider) {
        onUPILinkSuccess(selectedProvider, upiId);
      }
    }, 3500);
  };

  return (
    <div className="max-w-md mx-auto py-8 animate-scale-in">
      <button onClick={() => onSetView('select-source')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 border-none bg-transparent cursor-pointer font-semibold">
        <ArrowLeft size={18} /> Back
      </button>
      
      {wizardStep === 'upi-select' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-manrope font-bold text-[var(--text-primary)] mb-6">Select App</h2>
          {UPI_PROVIDERS.map((p: any) => (
            <button key={p.id} onClick={() => { setSelectedProvider(p); setWizardStep('upi-credentials'); }} className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-[var(--teal)] transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: p.color }}>{p.icon}</div>
              <span className="font-inter font-bold text-[var(--text-primary)]">{p.name}</span>
              <ChevronRight size={18} className="ml-auto text-[var(--text-muted)]" />
            </button>
          ))}
        </div>
      )}

      {wizardStep === 'upi-credentials' && selectedProvider && (
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-white text-3xl shadow-lg" style={{ background: selectedProvider.color }}>{selectedProvider.icon}</div>
          <h3 className="text-xl font-manrope font-bold mb-2">Connect {selectedProvider.name}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-8">Enter your UPI ID to sync your history.</p>
          <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="name@upi" className="w-full p-4 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] focus:border-[var(--teal)] outline-none font-inter text-center text-lg mb-4" />
          {upiError && <p className="text-red-500 text-xs mb-4">{upiError}</p>}
          <button onClick={handleVerifyAndLink} className="w-full py-4 rounded-xl bg-[var(--teal)] text-white font-bold border-none cursor-pointer">Verify & Link</button>
        </div>
      )}

      {wizardStep === 'upi-connecting' && (
        <div className="text-center py-12">
          <Loader2 size={48} className="animate-spin text-[var(--teal)] mx-auto mb-4" />
          <p className="font-manrope font-bold text-lg">Connecting to {selectedProvider?.name}...</p>
        </div>
      )}

      {wizardStep === 'upi-success' && (
        <div className="text-center py-12 animate-bounce-in">
          <CheckCircle2 size={64} className="text-[var(--teal)] mx-auto mb-4" />
          <p className="font-manrope font-bold text-xl">Success! Syncing History...</p>
        </div>
      )}
    </div>
  );
}

export default UPILink;
