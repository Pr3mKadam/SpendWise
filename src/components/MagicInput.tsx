import { useState, useRef, useEffect } from 'react';
import { Plus, CheckCircle2, X, ListTree } from 'lucide-react';
import { Transaction } from '../types';
import { parseUPISMS } from '../utils/upiParser';
import { useCategories } from '../hooks/useCategories';
import { useParentalControl } from '../contexts/ParentalControlContext';
import { parseVoiceLocally } from '../utils/voiceParser';
import { compressImage } from '../utils/imageUtils';
import { recognizeReceipt, parseOfflineReceipt } from '../utils/tesseractParser';
import { PasteUPI } from './magic/PasteUPI';
import { AIInputTools } from './magic/AIInputTools';
import { CategorySelect } from './magic/CategorySelect';

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


  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError]   = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const fileInputRef                = useRef<HTMLInputElement>(null);

  const [status, setStatus]         = useState<Status>('idle');
  const [lastAdded, setLastAdded]   = useState<Transaction | null>(null);
  const [errorMsg, setErrorMsg]     = useState('');
  const [splits, setSplits]         = useState<{ merchant: string; amount: number; category: string }[] | null>(null);
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
      splits.forEach((s, idx) => {
        onAddTransaction({
          id:          `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
          date,
          amount:      s.amount,
          category:    s.category as Transaction['category'],
          merchant:    s.merchant,
          type:        'debit',
          description: `Part of ${merchantTrim}`,
          isNew:       true,
          aiParsed:    false,
        });
      });
      setStatus('success');
      setSplits(null);
      resetForm();
    } else {
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
    }
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


    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      let base64Content: string;
      let mimeType: string;

      try {
        // ── Compress image to max 800px / 75% quality before sending ────────
        setScanError('📷 Compressing image...');
        const compressed = await compressImage(base64Url, 800, 0.75);
        base64Content = compressed.base64;
        mimeType = compressed.mimeType;
      } catch {
        // Compression failed — use original
        base64Content = base64Url.split(',')[1];
        mimeType = file.type || 'image/jpeg';
      }

      setScanError('🔍 Extracting text locally...');
      try {
        const dataUrl = `data:${mimeType};base64,${base64Content}`;
        const rawText = await recognizeReceipt(dataUrl);
        const res = parseOfflineReceipt(rawText);

        if (res.amount) setAmountStr(String(res.amount));
        if (res.merchant) setMerchant(res.merchant);
        if (res.type === 'credit' || res.type === 'debit') setType(res.type);
        if (res.category && allCategories.includes(res.category)) {
           setCategory(res.category);
        } else {
           setCategory(allCategories[0]);
        }
        if (res.date) setDate(res.date);
        if (res.splits) setSplits(res.splits);
        else setSplits(null);

        setScanError('✅ Receipt scanned offline! Review & tap Add.');
      } catch (offlineErr) {
        setScanError('❌ Failed to parse receipt. Try a clearer photo.');
      } finally {
        setIsScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setScanError('❌ Failed to read image file.');
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceInput = () => {
    // @ts-ignore - Vendor prefixes
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('🚫 Voice not supported. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Indian English for better rupee/merchant detection
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError('🎙️ Listening... speak now');
    };

    recognition.onresult = async (event: any) => {
      // Show interim results as user speaks
      const interim = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(' ');
      if (!event.results[event.results.length - 1].isFinal) {
        setVoiceError(`Heard: "${interim}"`);
        return;
      }

      // Pick the best final transcript
      const finalResult = event.results[event.results.length - 1];
      const transcript = Array.from(finalResult as any)
        .map((alt: any) => alt.transcript)
        .join(' ').trim();

      if (!transcript) {
        setVoiceError('No speech detected. Try again.');
        setIsListening(false);
        return;
      }

      setVoiceError(`✅ Heard: "${transcript}" — Parsing...`);
      const today = new Date().toISOString().split('T')[0];

      // ── Step 1: Local parser (instant, no API) ──────────────────────────
      const local = parseVoiceLocally(transcript, today);

      const applyResult = (res: typeof local, src: string) => {
        if (res.amount > 0) setAmountStr(String(res.amount));
        if (res.merchant) setMerchant(res.merchant);
        setType(res.type);
        if (allCategories.includes(res.category)) setCategory(res.category);
        else if (res.type === 'credit' && allCategories.includes('Income')) setCategory('Income');
        else setCategory(allCategories[0]);
        setDate(today);
        setNote(transcript);
        setVoiceError(`✅ Filled via ${src}. Review & tap Add.`);
      };

      if (local.confidence >= 0.75) {
        applyResult(local, 'local parser');
        setIsListening(false);
        setTimeout(() => setVoiceError(''), 4000);
        return;
      } else if (local.amount > 0) {
        // Best effort
        applyResult(local, 'local parser (low confidence)');
        setIsListening(false);
        setTimeout(() => setVoiceError(''), 4000);
        return;
      } else {
        setVoiceError(`Could not parse: "${transcript}" — Fill manually.`);
        setIsListening(false);
        setTimeout(() => setVoiceError(''), 5000);
      }
    };

    recognition.onerror = (event: any) => {
      const msgs: Record<string, string> = {
        'not-allowed': '🚫 Microphone blocked. Allow mic in browser settings.',
        'no-speech': 'No speech detected. Tap mic and speak clearly.',
        'network': 'Network error. Voice works offline too — try again.',
        'aborted': 'Listening cancelled.',
      };
      setVoiceError(msgs[event.error] || `Voice error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
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
      <div className="flex rounded-xl p-1 mb-4 relative overflow-hidden" style={{ background: 'var(--surface-input)' }}>
        <button
          type="button"
          onClick={setExpenseMode}
          className="flex flex-1 items-center justify-center py-2.5 rounded-lg text-[13px] font-bold transition-all z-10"
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
          className="flex flex-1 items-center justify-center py-2.5 rounded-lg text-[13px] font-bold transition-all z-10"
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

      <CategorySelect
        category={category}
        setCategory={setCategory}
        allCategories={allCategories}
        mergedIcons={mergedIcons}
        pasteOpen={pasteOpen}
        setPasteOpen={setPasteOpen}
      />

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
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-sm text-white transition-all transform hover:scale-[1.02] active:scale-95"
        style={{
          background: !canSubmit ? 'var(--border)' : 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)',
          boxShadow: !canSubmit ? 'none' : '0 4px 14px -4px rgba(20, 184, 166, 0.4)',
          cursor:     !canSubmit ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-inter)',
          border:     'none',
        }}
      >
        <Plus size={18} strokeWidth={2.5} />
        Add transaction
      </button>

      <PasteUPI
        pasteOpen={pasteOpen}
        setPasteOpen={setPasteOpen}
        pasteText={pasteText}
        setPasteText={setPasteText}
        handleApplyPaste={handleApplyPaste}
        pasteHint={pasteHint}
      />

      <AIInputTools
        isScanning={isScanning}
        isListening={isListening}
        scanStatus={scanError || voiceError || undefined}
        handleFileChange={handleFileChange}
        handleVoiceInput={handleVoiceInput}
        fileInputRef={fileInputRef}
      />

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
