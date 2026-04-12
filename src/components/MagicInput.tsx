import { useState, useRef, useEffect } from 'react';
import { Plus, CheckCircle2, X, ChevronDown, ChevronUp, Camera, Loader2, ListTree } from 'lucide-react';
import { Transaction } from '../types';
import { parseUPISMS } from '../utils/upiParser';
import { useCategories } from '../hooks/useCategories';
import { useParentalControl } from '../contexts/ParentalControlContext';
import { parseReceiptImage, SplitItem } from '../services/ai';

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

  const [splits, setSplits]         = useState<SplitItem[] | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError]   = useState('');
  const fileInputRef                = useRef<HTMLInputElement>(null);

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
    const baseTags = noteTrim.match(/#[a-zA-Z0-9_-]+/g)?.map(t => t.slice(1).toLowerCase()) || [];

    if (splits && splits.length > 0) {
      const parentId = `receipt-${Date.now().toString(36)}`;
      const parentTags = [...baseTags, parentId];
      
      let sum = 0;
      splits.forEach((split, idx) => {
        sum += split.amount;
        const splitTx: Transaction = {
          id:          `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
          date,
          amount:      split.amount,
          category:    split.category as Transaction['category'],
          merchant:    split.merchant,
          type,
          description: `Split from ${merchantTrim}${noteTrim ? ` · ${noteTrim}` : ''}`,
          isNew:       true,
          aiParsed:    true,
          tags:        parentTags,
        };
        onAddTransaction(splitTx);
      });
      
      // If the parent amount exists and is significantly larger than the tracked splits, 
      // add a remainder 'Uncategorized' transaction.
      if (amount - sum > 0.05) {
        onAddTransaction({
          id: `${Date.now()}-rem-${Math.random().toString(36).slice(2, 7)}`,
          date, amount: Math.round((amount - sum) * 100) / 100, category: 'General',
          merchant: merchantTrim, type, description: 'Uncategorized remainder', 
          isNew: true, aiParsed: true, tags: parentTags
        });
      }

      setSplits(null);
      setScanError('');
      setStatus('success');
      resetForm();
      successTimer.current = setTimeout(() => setStatus('idle'), 4000);
      return;
    }

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
      tags:        baseTags.length ? baseTags : undefined,
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError('');
    setIsScanning(true);
    setSplits(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      const base64Content = base64Url.split(',')[1];
      const mimeType = file.type;

      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await parseReceiptImage(base64Content, mimeType, today);
        
        setAmountStr(String(res.amount));
        setMerchant(res.merchant);
        setType(res.type);
        if (allCategories.includes(res.category)) setCategory(res.category);
        else if (res.type === 'credit' && allCategories.includes('Income')) setCategory('Income');
        else setCategory(allCategories[0]);
        setDate(res.date);
        if (res.split && res.split.length > 0) {
          setSplits(res.split);
          setScanError('Multiple items found! Review splits below.');
        } else {
          setScanError('Scan successful!');
        }
      } catch (err: any) {
        setScanError(err?.message || 'Failed to parse receipt.');
      } finally {
        setIsScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setScanError('Failed to read file.');
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
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
        <div className="relative">
          <button
            type="button"
            id="tx-category"
            onClick={() => {
              // Ensure we close paste if it's open so things don't overlap too much
              if (pasteOpen) setPasteOpen(false);
              document.getElementById('category-dropdown-menu')?.classList.toggle('hidden');
            }}
            onBlur={() => {
              // Use a slight timeout to allow click events on options to fire first
              setTimeout(() => {
                const menu = document.getElementById('category-dropdown-menu');
                if (menu && !menu.classList.contains('hidden')) {
                  menu.classList.add('hidden');
                }
              }, 150);
            }}
            className="w-full flex items-center justify-between rounded-xl text-sm text-left focus:outline-none transition-all"
            style={{
              background: '#f8fafc',
              border:     '2px solid transparent',
              padding:    '12px 14px',
              fontFamily: 'var(--font-inter)',
              color:      'var(--text-primary)',
            }}
            onFocus={e => { e.currentTarget.style.border = '2px solid var(--teal)'; }}
          >
            <span>{(mergedIcons[category] ? `${mergedIcons[category]} ` : '') + category}</span>
            <ChevronDown size={16} className="text-[var(--text-muted)]" />
          </button>

          {/* Absolute dropdown menu */}
          <div
            id="category-dropdown-menu"
            className="hidden absolute top-full left-0 w-full mt-2 py-2 rounded-xl shadow-xl z-50 animate-scale-in"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              maxHeight: '220px',
              overflowY: 'auto'
            }}
          >
            {allCategories.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCategory(c);
                  document.getElementById('category-dropdown-menu')?.classList.add('hidden');
                }}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--surface-input)] flex items-center gap-2"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: category === c ? 'var(--teal)' : 'var(--text-primary)',
                  fontWeight: category === c ? 600 : 400,
                  background: category === c ? 'var(--teal-dim)' : 'transparent',
                }}
              >
                <span>{(mergedIcons[c] ? `${mergedIcons[c]}` : '')}</span>
                <span>{c}</span>
                {category === c && <CheckCircle2 size={14} className="ml-auto" style={{ color: 'var(--teal)' }} />}
              </button>
            ))}
          </div>
        </div>
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

      {/* AI Receipt Scanner */}
      <div className="mt-4 border-t border-[var(--border-subtle,#e2e8f0)] pt-4">
        <label
          className="flex w-full items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
          style={{
            background: 'var(--teal-dim)',
            color: 'var(--teal)',
            border: '1px dashed var(--teal-glow)',
            fontFamily: 'var(--font-inter)',
          }}
        >
          {isScanning ? <><Loader2 size={16} className="animate-spin" /> Scanning...</> : <><Camera size={16} /> Snap Receipt (AI)</>}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isScanning}
          />
        </label>
        
        {scanError && (
          <p className="mt-2 text-center text-xs font-semibold" style={{ color: splits ? 'var(--teal)' : 'var(--red)', fontFamily: 'var(--font-inter)' }}>
            {scanError}
          </p>
        )}

        {splits && splits.length > 0 && (
          <div className="mt-3 p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #edf2f7' }}>
            <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}>
              <ListTree size={14} /> AI Found {splits.length} Items:
            </p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {splits.map((s, idx) => (
                <div key={idx} className="flex justify-between text-xs items-center p-1.5 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid #edf2f7' }}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[11px] truncate" style={{ color: 'var(--text-primary)' }}>{s.merchant}</p>
                    <p className="text-[10px] text-muted truncate" style={{ color: 'var(--text-muted)' }}>{s.category}</p>
                  </div>
                  <span className="font-semibold text-[11px] tabular-nums shrink-0 ml-2">{currency}{s.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-2 text-center text-muted" style={{ color: 'var(--text-muted)' }}>
              Tapping "Add transaction" will save these as individual split transactions.
            </p>
          </div>
        )}
      </div>

      {status === 'success' && (
        <div className="mt-3 rounded-xl px-4 py-3 flex items-start gap-3 animate-fade-in-up" style={{ background: 'var(--green-dim)' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--green)', marginTop: '2px', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>Success</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', marginTop: '2px' }}>
              {lastAdded 
                ? <>{mergedIcons[lastAdded.category] || '📦'} {lastAdded.category} · {lastAdded.type === 'credit' ? '+' : '-'}{currency}{lastAdded.amount.toFixed(2)} · {lastAdded.merchant}</>
                : "Transactions added successfully!"}
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
