import { useState, useRef, useEffect } from 'react';
import { Plus, CheckCircle2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Transaction } from '../types';
import { parseUPISMS } from '../utils/upiParser';
import { useCategories } from '../hooks/useCategories';
import { useParentalControl } from '../contexts/ParentalControlContext';

interface MagicInputProps {
  onAddTransaction: (tx: Transaction) => void;
  currency?: string;
}

type Status = 'idle' | 'success' | 'error';

function parseAmountInput(raw: string): number {
  const n = parseFloat(raw.replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : NaN;
}

export default function MagicInput({ onAddTransaction, currency = '$' }: MagicInputProps) {
  const { mergedIcons, allCategories } = useCategories();
  const { canAddTransaction } = useParentalControl();

  const [amountStr, setAmountStr]   = useState('');
  const [merchant, setMerchant]     = useState('');
  const [category, setCategory]     = useState('Food');
  const [type, setType]             = useState<'debit' | 'credit'>('debit');
  const [date, setDate]             = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote]             = useState('');

  const [pasteOpen, setPasteOpen]   = useState(false);
  const [pasteText, setPasteText]   = useState('');
  const [pasteHint, setPasteHint]   = useState<string | null>(null);

  const [status, setStatus]         = useState<Status>('idle');
  const [lastAdded, setLastAdded]   = useState<Transaction | null>(null);
  const [errorMsg, setErrorMsg]     = useState('');
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!allCategories.length) return;
    if (!allCategories.includes(category)) {
      setCategory(allCategories.includes('Food') ? 'Food' : allCategories[0]);
    }
  }, [allCategories, category]);

  const setExpenseMode = () => {
    setType('debit');
    if (category === 'Income') {
      setCategory(allCategories.includes('Food') ? 'Food' : allCategories[0]);
    }
  };

  const setIncomeMode = () => {
    setType('credit');
    if (allCategories.includes('Income')) setCategory('Income');
  };

  const resetForm = () => {
    setAmountStr('');
    setMerchant('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setPasteHint(null);
  };

  const handleSubmit = () => {
    if (successTimer.current) clearTimeout(successTimer.current);
    setErrorMsg('');

    const amount = parseAmountInput(amountStr);
    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMsg('Enter a valid amount greater than zero.');
      setStatus('error');
      successTimer.current = setTimeout(() => setStatus('idle'), 3500);
      return;
    }
    if (amount > 1_000_000) {
      setErrorMsg('Amount is too large — please double-check.');
      setStatus('error');
      successTimer.current = setTimeout(() => setStatus('idle'), 3500);
      return;
    }

    const check = canAddTransaction(amount, category);
    if (!check.allowed) {
      setErrorMsg(check.reason || 'Not allowed by Parental Controls.');
      setStatus('error');
      successTimer.current = setTimeout(() => setStatus('idle'), 3500);
      return;
    }

    const merchantTrim = merchant.trim() || (type === 'credit' ? 'Income' : 'Expense');
    const noteTrim = note.trim();
    const tags = noteTrim.match(/#[a-zA-Z0-9_-]+/g)?.map(t => t.slice(1).toLowerCase());

    const tx: Transaction = {
      id:          `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date,
      amount,
      category:    category as Transaction['category'],
      merchant:    merchantTrim,
      type,
      description: noteTrim || undefined,
      isNew:       true,
      aiParsed:    false,
      tags:        tags?.length ? tags : undefined,
    };

    onAddTransaction(tx);
    setLastAdded(tx);
    setStatus('success');
    resetForm();
    successTimer.current = setTimeout(() => setStatus('idle'), 4000);
  };

  const handleApplyPaste = () => {
    setPasteHint(null);
    const raw = pasteText.trim();
    if (!raw) {
      setPasteHint('Paste an SMS or message first.');
      return;
    }

    const upi = parseUPISMS(raw);
    if (upi?.amount != null && Number.isFinite(upi.amount) && upi.amount > 0) {
      setAmountStr(String(upi.amount));
      setMerchant((upi.merchant || '').trim() || '');
      const t = upi.type === 'credit' ? 'credit' : 'debit';
      setType(t);
      const cat = typeof upi.category === 'string' ? upi.category : t === 'credit' ? 'Income' : 'Food';
      setCategory(allCategories.includes(cat) ? cat : (t === 'credit' && allCategories.includes('Income') ? 'Income' : allCategories[0]));
      setNote(raw);
      setPasteHint('Fields updated from message. Review and tap Add.');
      return;
    }

    setPasteHint('No Rs/INR amount found. Enter amount and details manually above.');
  };

  const amountNum = parseAmountInput(amountStr);
  const canSubmit = Number.isFinite(amountNum) && amountNum > 0 && amountNum <= 1_000_000;

  return (
    <div className="card px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Add transaction
        </h3>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: '#f0f2f5', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}
        >
          Manual
        </span>
      </div>

      {/* Expense / Income */}
      <div className="flex rounded-xl p-1 mb-4" style={{ background: '#f5f7fa' }}>
        <button
          type="button"
          onClick={setExpenseMode}
          className="flex flex-1 items-center justify-center py-2.5 rounded-xl text-xs font-semibold transition-all"
          style={{
            fontFamily: 'var(--font-inter)',
            background: type === 'debit' ? 'var(--surface-card)' : 'transparent',
            color: type === 'debit' ? 'var(--red)' : 'var(--text-muted)',
            boxShadow: type === 'debit' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={setIncomeMode}
          className="flex flex-1 items-center justify-center py-2.5 rounded-xl text-xs font-semibold transition-all"
          style={{
            fontFamily: 'var(--font-inter)',
            background: type === 'credit' ? 'var(--surface-card)' : 'transparent',
            color: type === 'credit' ? 'var(--green)' : 'var(--text-muted)',
            boxShadow: type === 'credit' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Income
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label
            htmlFor="tx-amount"
            style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}
          >
            Amount ({currency})
          </label>
          <input
            id="tx-amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={amountStr}
            onChange={e => setAmountStr(e.target.value.replace(/[^\d.,]/g, ''))}
            className="w-full rounded-xl text-sm focus:outline-none"
            style={{
              background:   '#f8fafc',
              border:       '2px solid transparent',
              padding:      '12px 14px',
              fontFamily:   'var(--font-manrope)',
              fontSize:     '18px',
              fontWeight:   700,
              color:        'var(--text-primary)',
            }}
            onFocus={e => { e.target.style.border = '2px solid var(--teal)'; }}
            onBlur={e => { e.target.style.border = '2px solid transparent'; }}
          />
        </div>
        <div>
          <label
            htmlFor="tx-date"
            style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}
          >
            Date
          </label>
          <input
            id="tx-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-xl text-sm focus:outline-none"
            style={{
              background: '#f8fafc',
              border:     '2px solid transparent',
              padding:    '12px 14px',
              fontFamily: 'var(--font-inter)',
              color:      'var(--text-primary)',
            }}
            onFocus={e => { e.target.style.border = '2px solid var(--teal)'; }}
            onBlur={e => { e.target.style.border = '2px solid transparent'; }}
          />
        </div>
      </div>

      <div className="mb-3">
        <label
          htmlFor="tx-merchant"
          style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}
        >
          Merchant / label
        </label>
        <input
          id="tx-merchant"
          type="text"
          placeholder={type === 'credit' ? 'e.g. Salary, Refund' : 'e.g. Starbucks, Rent'}
          value={merchant}
          onChange={e => setMerchant(e.target.value)}
          className="w-full rounded-xl text-sm focus:outline-none"
          style={{
            background: '#f8fafc',
            border:     '2px solid transparent',
            padding:    '12px 14px',
            fontFamily: 'var(--font-inter)',
            color:      'var(--text-primary)',
          }}
          onFocus={e => { e.target.style.border = '2px solid var(--teal)'; }}
          onBlur={e => { e.target.style.border = '2px solid transparent'; }}
        />
      </div>

      <div className="mb-3">
        <label
          htmlFor="tx-category"
          style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}
        >
          Category
        </label>
        <select
          id="tx-category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full rounded-xl text-sm focus:outline-none appearance-none cursor-pointer"
          style={{
            background: '#f8fafc',
            border:     '2px solid transparent',
            padding:    '12px 14px',
            fontFamily: 'var(--font-inter)',
            color:      'var(--text-primary)',
          }}
        >
          {allCategories.map(c => (
            <option key={c} value={c}>
              {(mergedIcons[c] ? `${mergedIcons[c]} ` : '') + c}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="tx-note"
          style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}
        >
          Note (optional)
        </label>
        <input
          id="tx-note"
          type="text"
          placeholder="#tags supported · e.g. #work lunch"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full rounded-xl text-sm focus:outline-none"
          style={{
            background: '#f8fafc',
            border:     '2px solid transparent',
            padding:    '10px 14px',
            fontFamily: 'var(--font-inter)',
            color:      'var(--text-primary)',
          }}
          onFocus={e => { e.target.style.border = '2px solid var(--teal)'; }}
          onBlur={e => { e.target.style.border = '2px solid transparent'; }}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl font-semibold text-sm text-white transition-all"
        style={{
          background: !canSubmit ? '#a0aec0' : 'var(--teal)',
          cursor:     !canSubmit ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-inter)',
          border:     'none',
        }}
      >
        <Plus size={16} strokeWidth={2.5} />
        Add transaction
      </button>

      {/* Optional UPI paste — no AI */}
      <div className="mt-4 border-t border-[var(--border-subtle,#e2e8f0)] pt-4">
        <button
          type="button"
          onClick={() => setPasteOpen(o => !o)}
          className="flex w-full items-center justify-between text-left"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-inter)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}
        >
          <span>Paste UPI / bank SMS (auto-fill)</span>
          {pasteOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {pasteOpen && (
          <div className="mt-3 space-y-2">
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="Paste message containing Rs. or INR amount…"
              rows={3}
              className="w-full resize-none rounded-xl text-sm focus:outline-none"
              style={{
                background: '#f8fafc',
                border: '2px solid #edf2f7',
                padding: '10px 12px',
                fontFamily: 'var(--font-inter)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="button"
              onClick={handleApplyPaste}
              className="w-full py-2 rounded-xl text-xs font-semibold"
              style={{
                background: '#edf2f7',
                color: 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Apply to form
            </button>
            {pasteHint && (
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', margin: 0 }}>
                {pasteHint}
              </p>
            )}
          </div>
        )}
      </div>

      {status === 'success' && lastAdded && (
        <div className="mt-3 rounded-xl px-4 py-3 flex items-start gap-3 animate-fade-in-up" style={{ background: 'var(--green-dim)' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--green)', marginTop: '2px', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>Added</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', marginTop: '2px' }}>
              {mergedIcons[lastAdded.category] || '📦'} {lastAdded.category} · {lastAdded.type === 'credit' ? '+' : '-'}{currency}{lastAdded.amount.toFixed(2)} · {lastAdded.merchant}
            </p>
          </div>
          <button type="button" onClick={() => setStatus('idle')} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>
      )}

      {status === 'error' && errorMsg && (
        <div className="mt-3 rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: 'var(--red-dim)' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--red)', margin: 0 }}>{errorMsg}</p>
          <button type="button" onClick={() => setStatus('idle')} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
