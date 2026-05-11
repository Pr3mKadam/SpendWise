import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Building, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface PlaidLinkProps {
  onSetView: (view: any) => void;
  onPlaidLinkSuccess: (bankName: string, id: string) => void;
}

const MOCK_BANKS = [
  { id: 'chase', name: 'Chase Bank', color: '#117ACA' },
  { id: 'boa', name: 'Bank of America', color: '#E31837' },
  { id: 'hdfc', name: 'HDFC Bank', color: '#004C8F' },
  { id: 'icici', name: 'ICICI Bank', color: '#F05A28' },
  { id: 'sbi', name: 'State Bank of India', color: '#00539B' },
];

export default function PlaidLink({ onSetView, onPlaidLinkSuccess }: PlaidLinkProps) {
  const [step, setStep] = useState<'intro' | 'select' | 'connecting' | 'success'>('intro');
  const [selectedBank, setSelectedBank] = useState<typeof MOCK_BANKS[0] | null>(null);

  useEffect(() => {
    if (step === 'connecting' && selectedBank) {
      const timer = setTimeout(() => {
        setStep('success');
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (step === 'success' && selectedBank) {
      const timer = setTimeout(() => {
        onPlaidLinkSuccess(selectedBank.name, `plaid-${selectedBank.id}-${Date.now()}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, selectedBank, onPlaidLinkSuccess]);

  return (
    <div className="max-w-md mx-auto py-8 px-4 animate-fade-in">
      {step === 'intro' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <button onClick={() => onSetView('select-source')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors bg-transparent border-none font-semibold cursor-pointer mx-auto">
            <ArrowLeft size={18} /> Back
          </button>
          
          <div className="w-16 h-16 rounded-3xl bg-black flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20">
            <Building size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold font-manrope text-[var(--text-primary)] mb-3">Connect your bank</h2>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            SpendWise uses Plaid (simulated) to securely link your bank accounts. We never see or store your login credentials.
          </p>
          
          <div className="space-y-4 text-left mb-8">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-input)]">
              <ShieldCheck size={20} className="text-green-500" />
              <div>
                <p className="font-bold text-sm text-[var(--text-primary)]">Bank-level Security</p>
                <p className="text-xs text-[var(--text-muted)]">Your data is encrypted end-to-end.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setStep('select')}
            className="w-full py-4 rounded-xl bg-black text-white font-bold transition-all hover:opacity-90 shadow-lg"
          >
            Continue
          </button>
        </motion.div>
      )}

      {step === 'select' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => setStep('intro')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors bg-transparent border-none font-semibold cursor-pointer">
            <ArrowLeft size={18} /> Back
          </button>
          <h2 className="text-xl font-bold font-manrope text-[var(--text-primary)] mb-6">Select your bank</h2>
          <div className="grid gap-3">
            {MOCK_BANKS.map(bank => (
              <button 
                key={bank.id}
                onClick={() => { setSelectedBank(bank); setStep('connecting'); }}
                className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--teal)] bg-[var(--surface-card)] transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: bank.color + '15', color: bank.color }}>
                  <Building size={20} />
                </div>
                <span className="font-bold text-[var(--text-primary)]">{bank.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 'connecting' && selectedBank && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 flex flex-col items-center">
          <Loader2 size={48} className="text-[var(--teal)] animate-spin mb-6" />
          <h2 className="text-xl font-bold font-manrope text-[var(--text-primary)] mb-2">Connecting to {selectedBank.name}</h2>
          <p className="text-sm text-[var(--text-muted)]">Please wait while we establish a secure connection.</p>
        </motion.div>
      )}

      {step === 'success' && selectedBank && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-20">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold font-manrope text-[var(--text-primary)] mb-2">Account Linked!</h2>
          <p className="text-sm text-[var(--text-muted)]">Your {selectedBank.name} account has been successfully connected.</p>
        </motion.div>
      )}
    </div>
  );
}
