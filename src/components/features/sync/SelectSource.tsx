import React from 'react';
import { ArrowLeft, Landmark, Zap, UploadCloud, ChevronRight } from 'lucide-react';

export interface SelectSourceProps {
  onSetView: (view: any) => void;
}

export function SelectSource({ onSetView }: SelectSourceProps) {
  return (
    <div className="max-w-2xl mx-auto py-8 animate-scale-in">
      <button onClick={() => onSetView('dashboard')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors border-none bg-transparent cursor-pointer font-semibold">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>
      <h2 className="text-headline mb-2">Connect a Source</h2>
      <p className="text-caption mb-8">Choose how you'd like to bring in your transaction data.</p>
      
      <div className="grid gap-4">
        {[
          { id: 'upi-link', icon: <Landmark size={24} />, label: 'Link UPI App', sub: 'GPay, PhonePe, Paytm, etc.', color: 'var(--teal)', bg: 'var(--teal-dim)' },
          { id: 'plaid-link', icon: <Landmark size={24} />, label: 'Link Bank Account (Plaid)', sub: 'HDFC, ICICI, Chase, BoA, etc.', color: '#000000', bg: 'rgba(0,0,0,0.1)' },
          { id: 'rzp-link', icon: <Zap size={24} />, label: 'Connect Razorpay', sub: 'Sync your Razorpay developer keys', color: '#3395FF', bg: 'rgba(51,149,255,0.1)' },
          { id: 'web3-link', icon: <Zap size={24} />, label: 'Connect Web3 Wallet', sub: 'MetaMask, Phantom, WalletConnect', color: '#F6851B', bg: 'rgba(246,133,27,0.1)' },
          { id: 'csv', label: 'CSV Import', sub: 'Already integrated in sidebar', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', disabled: true }
        ].map(opt => (
          <button 
            key={opt.id}
            onClick={() => !opt.disabled && onSetView(opt.id as any)}
            className={`w-full flex items-center gap-5 p-6 rounded-2xl border ${opt.disabled ? 'opacity-50 cursor-default border-[var(--border)]' : 'border-[var(--border)] hover:border-[var(--teal)] hover:shadow-lg hover:shadow-teal-500/5 cursor-pointer bg-[var(--surface-card)]'} transition-all text-left`}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: opt.bg, color: opt.color }}>
              {opt.icon || <UploadCloud size={24} />}
            </div>
            <div className="flex-1">
              <p className="font-manrope font-bold text-lg text-[var(--text-primary)]">{opt.label}</p>
              <p className="font-inter text-sm text-[var(--text-muted)] mt-1">{opt.sub}</p>
            </div>
            {!opt.disabled && <ChevronRight size={20} className="text-[var(--text-muted)]" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SelectSource;
