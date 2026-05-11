import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Wallet, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Web3LinkProps {
  onSetView: (view: any) => void;
  onWeb3LinkSuccess: (walletName: string, id: string) => void;
}

const MOCK_WALLETS = [
  { id: 'metamask', name: 'MetaMask', color: '#F6851B' },
  { id: 'phantom', name: 'Phantom', color: '#AB9FF2' },
  { id: 'walletconnect', name: 'WalletConnect', color: '#3B99FC' },
  { id: 'coinbase', name: 'Coinbase Wallet', color: '#0052FF' },
];

export default function Web3Link({ onSetView, onWeb3LinkSuccess }: Web3LinkProps) {
  const [step, setStep] = useState<'intro' | 'select' | 'connecting' | 'success'>('intro');
  const [selectedWallet, setSelectedWallet] = useState<typeof MOCK_WALLETS[0] | null>(null);

  useEffect(() => {
    if (step === 'connecting' && selectedWallet) {
      const timer = setTimeout(() => {
        setStep('success');
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (step === 'success' && selectedWallet) {
      const timer = setTimeout(() => {
        onWeb3LinkSuccess(selectedWallet.name, `web3-${selectedWallet.id}-${Date.now()}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, selectedWallet, onWeb3LinkSuccess]);

  return (
    <div className="max-w-md mx-auto py-8 px-4 animate-fade-in">
      {step === 'intro' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <button onClick={() => onSetView('select-source')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors bg-transparent border-none font-semibold cursor-pointer mx-auto">
            <ArrowLeft size={18} /> Back
          </button>
          
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[var(--teal)]/20" style={{ background: 'var(--teal)' }}>
            <Wallet size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold font-manrope text-[var(--text-primary)] mb-3">Connect Web3 Wallet</h2>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            Connect your crypto wallet to automatically track your digital assets and NFT portfolio in SpendWise.
          </p>
          
          <div className="space-y-4 text-left mb-8">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-input)] border border-[var(--border)]">
              <ShieldCheck size={20} className="text-[var(--teal)]" />
              <div>
                <p className="font-bold text-sm text-[var(--text-primary)]">Read-Only Access</p>
                <p className="text-xs text-[var(--text-muted)]">We only request permission to view your balances.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setStep('select')}
            className="w-full py-4 rounded-xl bg-[var(--teal)] text-white font-bold transition-all hover:opacity-90 shadow-lg shadow-[var(--teal)]/20 border-none cursor-pointer"
          >
            Select Wallet
          </button>
        </motion.div>
      )}

      {step === 'select' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => setStep('intro')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors bg-transparent border-none font-semibold cursor-pointer">
            <ArrowLeft size={18} /> Back
          </button>
          <h2 className="text-xl font-bold font-manrope text-[var(--text-primary)] mb-6">Choose your wallet</h2>
          <div className="grid gap-3">
            {MOCK_WALLETS.map(wallet => (
              <button 
                key={wallet.id}
                onClick={() => { setSelectedWallet(wallet); setStep('connecting'); }}
                className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--teal)] bg-[var(--surface-card)] transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: wallet.color + '15', color: wallet.color }}>
                  <Wallet size={20} />
                </div>
                <span className="font-bold text-[var(--text-primary)]">{wallet.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 'connecting' && selectedWallet && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 flex flex-col items-center">
          <Loader2 size={48} className="text-[var(--teal)] animate-spin mb-6" />
          <h2 className="text-xl font-bold font-manrope text-[var(--text-primary)] mb-2">Connecting {selectedWallet.name}...</h2>
          <p className="text-sm text-[var(--text-muted)]">Please approve the connection request in your wallet.</p>
        </motion.div>
      )}

      {step === 'success' && selectedWallet && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-20">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold font-manrope text-[var(--text-primary)] mb-2">Wallet Linked!</h2>
          <p className="text-sm text-[var(--text-muted)]">Your {selectedWallet.name} wallet has been successfully connected.</p>
        </motion.div>
      )}
    </div>
  );
}
