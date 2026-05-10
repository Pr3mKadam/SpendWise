import React, { useState } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';

export interface RazorpayLinkProps {
  onSetView: (view: any) => void;
  onConnect: (keyId: string, secret: string) => void;
}

export function RazorpayLink({ onSetView, onConnect }: RazorpayLinkProps) {
  const [rzpKeyId, setRzpKeyId] = useState('');
  const [rzpSecret, setRzpSecret] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rzpKeyId.trim() || !rzpSecret.trim()) return;
    onConnect(rzpKeyId.trim(), rzpSecret.trim());
  };

  return (
    <div className="max-w-md mx-auto py-8 animate-scale-in">
      <button onClick={() => onSetView('select-source')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 border-none bg-transparent cursor-pointer font-semibold">
        <ArrowLeft size={18} /> Back
      </button>
      <div className="card p-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6"><Zap size={32} className="text-[#3395FF]" /></div>
        <h2 className="text-2xl font-manrope font-bold mb-2">Razorpay Credentials</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">Use your test keys for simulation.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Key ID</label>
            <input type="text" value={rzpKeyId} onChange={e => setRzpKeyId(e.target.value)} placeholder="rzp_test_..." className="w-full p-4 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] outline-none text-sm font-inter" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Key Secret</label>
            <input type="password" value={rzpSecret} onChange={e => setRzpSecret(e.target.value)} placeholder="••••••••••••" className="w-full p-4 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] outline-none text-sm font-inter" />
          </div>
          <button type="submit" disabled={!rzpKeyId || !rzpSecret} className="w-full py-4 rounded-xl bg-[var(--teal)] text-white font-bold border-none cursor-pointer disabled:opacity-50 mt-4 shadow-lg shadow-teal-500/10">Save & Connect</button>
        </form>
      </div>
    </div>
  );
}

export default RazorpayLink;
