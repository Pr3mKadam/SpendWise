import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export interface PayFormProps {
  onSetView: (view: any) => void;
  onPay: (amount: number, description: string) => void;
  currency: string;
}

export function PayForm({ onSetView, onPay, currency }: PayFormProps) {
  const [payAmount, setPayAmount] = useState('');
  const [payDesc, setPayDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rupees = parseFloat(payAmount);
    if (!rupees || rupees <= 0) return;
    onPay(rupees, payDesc.trim());
  };

  return (
    <div className="max-w-md mx-auto py-8 animate-scale-in">
      <button onClick={() => onSetView('dashboard')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 border-none bg-transparent cursor-pointer font-semibold">
        <ArrowLeft size={18} /> Cancel
      </button>
      <div className="card p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-manrope font-bold">UPI Payment</h2>
          <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 text-[length:var(--fs-overline)] font-bold uppercase tracking-widest">Test Mode</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative p-6 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)] text-center">
            <span className="block text-[length:var(--fs-overline)] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Amount to Pay</span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-manrope font-bold text-[var(--text-muted)]">{currency}</span>
              <input type="number" step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="bg-transparent border-none text-5xl font-manrope font-extrabold text-[var(--text-primary)] w-full max-w-[200px] outline-none text-center" placeholder="0" autoFocus />
            </div>
          </div>
          <div>
            <label className="block text-[length:var(--fs-overline)] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Description / Merchant</label>
            <input type="text" value={payDesc} onChange={e => setPayDesc(e.target.value)} placeholder="What's this for?" className="w-full p-4 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] outline-none text-sm font-inter" />
          </div>
          <button type="submit" className="w-full py-4 rounded-xl bg-[var(--teal)] text-white font-bold border-none cursor-pointer shadow-xl shadow-teal-500/20 active:scale-[0.98] transition-all">Proceed to Payment</button>
        </form>
      </div>
    </div>
  );
}

export default PayForm;
