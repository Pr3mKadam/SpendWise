import { useState } from 'react';
import { X, CreditCard, Zap, AlertCircle, CheckCircle2, IndianRupee, Loader2, Sparkles, PenLine } from 'lucide-react';
import { Transaction, Category } from '../types';
import { initiateRazorpayPayment } from '../utils/razorpaySync';
import { parseUPIPayment, rememberMerchant } from '../utils/razorpaySync';

interface UPISyncPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (tx: Transaction) => void;
}

type ModalState = 'form' | 'parsing' | 'success' | 'no-key' | 'correction';

const CATEGORIES: Category[] = [
  'Food', 'Transport', 'Shopping', 'Subscriptions',
  'Entertainment', 'Utilities', 'Health', 'Income', 'Transfer',
];

export default function UPISyncPaymentModal({ isOpen, onClose, onPaymentComplete }: UPISyncPaymentModalProps) {
  const [amount, setAmount]         = useState('');
  const [description, setDesc]      = useState('');
  const [upiId, setUpiId]           = useState('');
  const [state, setState]           = useState<ModalState>('form');
  const [lastTx, setLastTx]         = useState<Transaction | null>(null);
  const [corrCategory, setCorrCat]  = useState<Category>('Transfer');

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const keyId = localStorage.getItem('spendwise_rzp_key');
    if (!keyId) { setState('no-key'); return; }

    const rupees = parseFloat(amount);
    if (!rupees || rupees <= 0) return;

    initiateRazorpayPayment({
      keyId,
      amount: rupees,
      description: description.trim() || 'UPI Payment',
      prefillContact: upiId.trim() || undefined,
      onSuccess: async (result) => {
        // Phase 8.1+8.2 — AI parse the payment immediately after checkout success
        setState('parsing');

        const parsed = await parseUPIPayment(
          description.trim() || result.description,
          upiId.trim(),
        );

        const tx: Transaction = {
          id:          `rzp_pay_${result.razorpay_payment_id}`,
          date:        new Date().toISOString(),
          amount:      result.amount,
          type:        'debit',
          category:    parsed.category,
          merchant:    parsed.merchant,
          description: `Razorpay UPI · ${result.razorpay_payment_id}`,
          isNew:       true,
          confidence:  parsed.confidence,
          aiParsed:    parsed.aiParsed,
          tags:        ['upi', 'razorpay'],
        };

        setLastTx(tx);
        setCorrCat(parsed.category);
        onPaymentComplete(tx);
        setState('success');
      },
      onFailure: () => {
        // user cancelled — stay on form
        setState('form');
      },
    });
  };

  const handleCorrection = () => {
    if (!lastTx) return;
    setState('correction');
  };

  const applyCorrection = () => {
    if (!lastTx) return;
    // Phase 8.3 — remember the corrected category for this UPI VPA
    rememberMerchant(upiId.trim(), lastTx.merchant, corrCategory);
    // Notify parent with corrected tx — parent will update via re-add
    onPaymentComplete({ ...lastTx, category: corrCategory });
    setState('success');
  };

  const handleClose = () => {
    setState('form');
    setAmount('');
    setDesc('');
    setUpiId('');
    setLastTx(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--surface-card)] rounded-2xl w-full max-w-md shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col animate-scale-in">

        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-[var(--border)]">
          <h3 className="flex items-center gap-2 font-manrope font-bold text-lg text-[var(--text-primary)]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--teal-dim)]">
              <CreditCard size={15} className="text-[var(--teal)]" />
            </div>
            Make UPI Payment
          </h3>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-[var(--surface-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── State: No API Key ── */}
        {state === 'no-key' && (
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-amber-500/10">
              <AlertCircle size={24} className="text-amber-500" />
            </div>
            <div>
              <p className="font-manrope font-bold text-base text-[var(--text-primary)] mb-1">No Razorpay Key Found</p>
              <p className="font-inter text-sm text-[var(--text-muted)]">
                Go to <span className="text-[var(--teal)] font-semibold">UPI Sync → Link Razorpay Data</span> and enter your test API key first.
              </p>
            </div>
            <button onClick={() => setState('form')} className="w-full py-2.5 rounded-xl font-inter font-bold text-sm text-white bg-[var(--teal)] border-none cursor-pointer">
              Go Back
            </button>
          </div>
        )}

        {/* ── State: AI Parsing ── */}
        {state === 'parsing' && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--teal-dim)]">
              <Loader2 size={24} className="text-[var(--teal)] animate-spin" />
            </div>
            <div>
              <p className="font-manrope font-bold text-base text-[var(--text-primary)] mb-1">Payment Captured ✓</p>
              <p className="font-inter text-sm text-[var(--text-muted)]">
                AI is detecting merchant & category…
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--teal)]">
              <Sparkles size={14} />
              <span className="font-inter text-xs font-medium">Gemini AI parsing</span>
            </div>
          </div>
        )}

        {/* ── State: Category Correction ── */}
        {state === 'correction' && lastTx && (
          <div className="p-6 space-y-4">
            <p className="font-inter text-sm text-[var(--text-muted)]">
              Select the correct category for <span className="font-semibold text-[var(--text-primary)]">{lastTx.merchant}</span>. This will be remembered for future payments to the same UPI ID.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCorrCat(cat)}
                  className={`py-2 px-3 rounded-lg font-inter text-xs font-semibold border transition-all cursor-pointer ${
                    corrCategory === cat
                      ? 'bg-[var(--teal)] text-white border-transparent'
                      : 'bg-[var(--surface-input)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--teal)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              onClick={applyCorrection}
              className="w-full py-2.5 rounded-xl font-inter font-bold text-sm text-white bg-[var(--teal)] border-none cursor-pointer"
            >
              Save & Remember
            </button>
          </div>
        )}

        {/* ── State: Success ── */}
        {state === 'success' && lastTx && (
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-green-500/10">
              <CheckCircle2 size={24} className="text-green-500" />
            </div>
            <div>
              <p className="font-manrope font-bold text-base text-[var(--text-primary)] mb-1">Payment Added!</p>
              <p className="font-inter text-2xl font-bold text-[var(--text-primary)]">₹{lastTx.amount.toFixed(2)}</p>
              <p className="font-inter text-sm text-[var(--text-muted)] mt-1">{lastTx.merchant}</p>
            </div>

            <div className="w-full p-3 rounded-xl bg-[var(--teal-dim)] border border-[var(--teal)]/20 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-inter text-xs text-[var(--text-muted)]">Category</span>
                <span className="font-inter text-xs font-bold text-[var(--teal)]">{lastTx.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-inter text-xs text-[var(--text-muted)]">Detection</span>
                <span className="font-inter text-xs font-bold flex items-center gap-1">
                  {lastTx.aiParsed
                    ? <><Sparkles size={10} className="text-[var(--teal)]" /> AI Parsed</>
                    : '⚡ Memory'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-inter text-xs text-[var(--text-muted)]">Confidence</span>
                <span className="font-inter text-xs font-bold text-[var(--text-primary)]">{Math.round(lastTx.confidence! * 100)}%</span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={handleCorrection}
                className="flex-1 py-2.5 rounded-xl font-inter font-semibold text-sm text-[var(--text-secondary)] bg-[var(--surface-input)] border border-[var(--border)] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PenLine size={13} /> Fix Category
              </button>
              <button onClick={handleClose} className="flex-1 py-2.5 rounded-xl font-inter font-bold text-sm text-white bg-[var(--teal)] border-none cursor-pointer">
                Done
              </button>
            </div>
          </div>
        )}

        {/* ── State: Form ── */}
        {state === 'form' && (
          <form onSubmit={handlePay} className="p-6 space-y-4">
            {/* Test mode banner */}
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-2.5 items-start">
              <Zap size={15} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="font-inter text-xs text-[var(--text-secondary)] leading-5">
                <span className="font-bold text-blue-500">Test Mode:</span> Use UPI ID{' '}
                <code className="bg-blue-500/10 px-1 rounded text-blue-500">success@razorpay</code> in the
                checkout to simulate a successful payment.
              </p>
            </div>

            {/* Amount */}
            <div>
              <label className="block font-inter text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Amount
              </label>
              <div className="relative">
                <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full bg-[var(--surface-input)] border border-[var(--border)] rounded-xl py-3 pl-9 pr-4 text-sm font-inter text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal)] transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-inter text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Description / Merchant
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDesc(e.target.value)}
                placeholder="e.g. Zomato food order, Uber ride, groceries…"
                className="w-full bg-[var(--surface-input)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-inter text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal)] transition-colors"
              />
              <p className="font-inter text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
                <Sparkles size={9} className="text-[var(--teal)]" />
                Gemini AI will auto-detect merchant & category from this description.
              </p>
            </div>

            {/* UPI ID (optional) */}
            <div>
              <label className="block font-inter text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Your UPI ID <span className="font-normal text-[var(--text-muted)] normal-case tracking-normal">(optional — used for memory)</span>
              </label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="you@upi or merchant@upi"
                className="w-full bg-[var(--surface-input)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-inter text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal)] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full mt-2 py-3 rounded-xl border-none font-inter font-bold text-sm text-white bg-[var(--teal)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard size={15} />
              Pay ₹{parseFloat(amount || '0').toFixed(2)} via UPI
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
