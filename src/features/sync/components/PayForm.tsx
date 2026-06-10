import React, { useState } from 'react';
import { ArrowLeft, Zap, Smartphone, ChevronRight, Info, Send } from 'lucide-react';
import { UPI_APP_INTENTS, initiateUPIPayment } from '@/utils/upiPayment';
import { useStore } from '@/store';

export interface PayFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSetView: (view: any) => void;
  onPay: (amount: number, description: string) => void;
  currency: string;
}

type PayMode = 'select' | 'upi-id' | 'razorpay';

export function PayForm({ onSetView, onPay, currency }: PayFormProps) {
  const { razorpayKeys } = useStore();
  const [payMode, setPayMode] = useState<PayMode>('select');
  const [payAmount, setPayAmount] = useState('');
  const [payDesc, setPayDesc] = useState('');
  const [payeeVPA, setPayeeVPA] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [vpaError, setVpaError] = useState('');
  const [launched, setLaunched] = useState(false);

  const amount = parseFloat(payAmount) || 0;

  const validateVPA = (v: string) => /^[\w.-]+@[\w]+$/.test(v.trim());

  const handleUPIAppPay = (appId: string) => {
    if (!amount || amount <= 0) {
      setVpaError('Enter a valid amount first.');
      return;
    }
    if (!payeeVPA && payMode === 'upi-id') {
      setVpaError('Enter a valid UPI ID.');
      return;
    }

    const pa = payeeVPA.trim() || 'merchant@upi'; // fallback for generic any-app intent
    const pn = payeeName.trim() || 'Merchant';

    // If specific app, build app-specific URL
    const appConfig = UPI_APP_INTENTS.find(a => a.id === appId);
    const baseUrl = appConfig?.urlScheme || 'upi://pay';

    // Save pending payment + open UPI intent using the correct urlScheme
    initiateUPIPayment({ pa, pn, am: amount, tn: payDesc.trim() || `Payment to ${pn}` }, baseUrl);

    setLaunched(true);
  };

  const handleQuickAnyUPI = () => {
    if (!amount || amount <= 0) {
      setVpaError('Enter a valid amount first.');
      return;
    }
    if (!validateVPA(payeeVPA)) {
      setVpaError('Enter a valid UPI ID (e.g. name@upi).');
      return;
    }
    setVpaError('');

    initiateUPIPayment({
      pa: payeeVPA.trim(),
      pn: payeeName.trim() || payeeVPA.split('@')[0],
      am: amount,
      tn: payDesc.trim() || `Payment to ${payeeVPA}`,
    });
    setLaunched(true);
  };

  const handleRazorpay = () => {
    onPay(amount, payDesc.trim() || 'UPI Payment');
  };

  if (launched) {
    return (
      <div className="max-w-md mx-auto py-8 animate-scale-in text-center">
        <div className="text-6xl mb-6 animate-bounce">📱</div>
        <h2
          className="text-2xl font-manrope font-extrabold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          UPI App Launched
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Complete your payment in the UPI app. When you return to SpendWise, the transaction will
          be automatically detected and added.
        </p>
        <div className="card p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-muted)' }}>Amount</span>
            <span className="font-bold">
              {currency}
              {amount.toFixed(0)}
            </span>
          </div>
          {payeeVPA && (
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>To</span>
              <span className="font-bold font-mono text-xs">{payeeVPA}</span>
            </div>
          )}
          {payDesc && (
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Note</span>
              <span className="font-bold">{payDesc}</span>
            </div>
          )}
        </div>
        <div
          className="p-3 rounded-xl text-xs font-medium mb-6 flex items-start gap-2"
          style={{
            background: 'rgba(16,185,129,0.08)',
            color: 'var(--teal)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <Info size={14} className="shrink-0 mt-0.5" />
          When you return to SpendWise after paying, we'll automatically ask you to confirm the
          transaction.
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setLaunched(false);
              setPayMode('select');
            }}
            className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer border"
            style={{
              background: 'var(--surface-input)',
              color: 'var(--text-muted)',
              borderColor: 'var(--border)',
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => onSetView('dashboard')}
            className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer border-none"
            style={{ background: 'var(--teal)', color: 'white' }}
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 animate-scale-in">
      <button
        onClick={() => (payMode === 'select' ? onSetView('dashboard') : setPayMode('select'))}
        className="flex items-center gap-2 mb-6 border-none bg-transparent cursor-pointer font-semibold"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={18} />
        {payMode === 'select' ? 'Cancel' : 'Back'}
      </button>

      {/* ── Amount Input (always visible) ───────────────────────────── */}
      <div className="card p-6 mb-5">
        <span
          className="block text-[10px] font-black uppercase tracking-widest mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Amount
        </span>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-manrope font-bold" style={{ color: 'var(--text-muted)' }}>
            {currency}
          </span>
          <input
            type="number"
            step="0.01"
            min="1"
            value={payAmount}
            onChange={e => {
              setPayAmount(e.target.value);
              setVpaError('');
            }}
            className="bg-transparent border-none text-5xl font-manrope font-extrabold w-full max-w-[200px] outline-none text-center"
            style={{ color: 'var(--text-primary)' }}
            placeholder="0"
            autoFocus
          />
        </div>
        <input
          type="text"
          value={payDesc}
          onChange={e => setPayDesc(e.target.value)}
          placeholder="What's this payment for? (optional)"
          className="mt-4 w-full p-3 rounded-xl text-sm font-inter outline-none"
          style={{
            background: 'var(--surface-input)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {vpaError && <p className="text-xs text-red-500 font-medium mb-3 px-1">{vpaError}</p>}

      {/* ── Mode: Select ────────────────────────────────────────────── */}
      {payMode === 'select' && (
        <div className="space-y-3">
          <h2
            className="text-lg font-manrope font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Choose Payment Method
          </h2>

          {/* Native UPI — send to UPI ID */}
          <button
            onClick={() => setPayMode('upi-id')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl cursor-pointer text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background:
                'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(45,212,191,0.08) 100%)',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md shrink-0"
              style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)', color: 'white' }}
            >
              ₹
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-manrope font-bold text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                Send to UPI ID
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Opens any installed UPI app (GPay, PhonePe, Paytm...)
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}
            >
              <Smartphone size={10} /> Native
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Quick UPI App Chooser — each major app */}
          <div className="grid grid-cols-2 gap-3">
            {UPI_APP_INTENTS.slice(0, 4).map(app => (
              <button
                key={app.id}
                onClick={() => {
                  if (!amount || amount <= 0) {
                    setVpaError('Enter an amount first.');
                    return;
                  }
                  setVpaError('');
                  // Quick pay: no VPA needed, opens app generically
                  initiateUPIPayment({
                    pa: 'pay@upi', // placeholder — user enters in the app
                    pn: 'Merchant',
                    am: amount,
                    tn: payDesc.trim() || 'UPI Payment',
                  });
                  setLaunched(true);
                }}
                className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.97] text-left"
                style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm"
                  style={{ background: app.color }}
                >
                  {app.icon}
                </div>
                <div className="min-w-0">
                  <p
                    className="text-xs font-bold leading-tight truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {app.name}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    Quick pay
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Razorpay fallback */}
          {razorpayKeys?.keyId && (
            <button
              onClick={() => setPayMode('razorpay')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl cursor-pointer text-left transition-all"
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shrink-0"
                style={{ background: '#2B6CB0' }}
              >
                R
              </div>
              <div className="flex-1">
                <p
                  className="font-manrope font-bold text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Razorpay Gateway
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Web checkout popup (UPI + Cards)
                </p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      )}

      {/* ── Mode: UPI ID Entry ─────────────────────────────────────── */}
      {payMode === 'upi-id' && (
        <div className="space-y-4">
          <h2 className="text-lg font-manrope font-bold" style={{ color: 'var(--text-primary)' }}>
            Enter UPI Details
          </h2>
          <div>
            <label
              className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              UPI ID / VPA
            </label>
            <input
              type="text"
              value={payeeVPA}
              onChange={e => {
                setPayeeVPA(e.target.value);
                setVpaError('');
              }}
              placeholder="name@upi, mobile@paytm, etc."
              className="w-full p-4 rounded-xl font-mono text-sm outline-none"
              style={{
                background: 'var(--surface-input)',
                border: `1px solid ${vpaError ? '#ef4444' : 'var(--border)'}`,
                color: 'var(--text-primary)',
              }}
              autoFocus
            />
          </div>
          <div>
            <label
              className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Payee Name (optional)
            </label>
            <input
              type="text"
              value={payeeName}
              onChange={e => setPayeeName(e.target.value)}
              placeholder="Merchant name"
              className="w-full p-4 rounded-xl text-sm outline-none"
              style={{
                background: 'var(--surface-input)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Choose which UPI app to open */}
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-widest mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Open With
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {UPI_APP_INTENTS.map(app => (
                <button
                  key={app.id}
                  onClick={() => handleUPIAppPay(app.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all hover:scale-[1.04] active:scale-[0.97]"
                  style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm"
                    style={{ background: app.color }}
                  >
                    {app.icon}
                  </div>
                  <span
                    className="text-[10px] font-bold text-center leading-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {app.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleQuickAnyUPI}
            className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 border-none cursor-pointer shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all text-sm"
            style={{ background: 'var(--teal)', color: 'white' }}
          >
            <Send size={16} />
            Send {currency}
            {amount > 0 ? amount.toFixed(0) : '—'}
          </button>
        </div>
      )}

      {/* ── Mode: Razorpay ────────────────────────────────────────── */}
      {payMode === 'razorpay' && (
        <div className="space-y-4">
          <h2 className="text-lg font-manrope font-bold" style={{ color: 'var(--text-primary)' }}>
            Razorpay Checkout
          </h2>
          <div
            className="p-4 rounded-xl text-xs font-medium flex items-start gap-2"
            style={{
              background: 'rgba(59,130,246,0.08)',
              color: '#3b82f6',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            <Info size={14} className="shrink-0 mt-0.5" />
            Razorpay opens a web popup for UPI, card, and netbanking payments. The transaction will
            be automatically added on success.
          </div>
          <button
            onClick={handleRazorpay}
            disabled={!amount || amount <= 0}
            className="w-full py-4 rounded-xl font-bold text-sm border-none cursor-pointer disabled:opacity-50 active:scale-[0.98] transition-all"
            style={{ background: '#2B6CB0', color: 'white' }}
          >
            <Zap size={16} className="inline mr-2" />
            Open Razorpay — {currency}
            {amount > 0 ? amount.toFixed(0) : '—'}
          </button>
        </div>
      )}
    </div>
  );
}

export default PayForm;
