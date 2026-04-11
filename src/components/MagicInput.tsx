import { useState, useRef } from 'react';
import { Loader2, Zap, AlertTriangle, CheckCircle2, X, Bot } from 'lucide-react';
import { Transaction } from '../types';
import { parseTransaction as aiParseTransaction, AIServiceError } from '../services/ai';
import { parseTransaction as regexParseTransaction } from '../data/mockData';
import { parseUPISMS } from '../utils/upiParser';
import { useCategories } from '../hooks/useCategories';

interface MagicInputProps {
  onAddTransaction: (tx: Transaction) => void;
  currency?: string;
}

type Status = 'idle' | 'processing' | 'success' | 'error';

export default function MagicInput({ onAddTransaction, currency = '$' }: MagicInputProps) {
  const { mergedIcons } = useCategories();
  const EXAMPLE_PROMPTS = [
    `Spent ${currency}45 on Uber`,
    `Netflix ${currency}15.99 monthly`,
    `Rs. 200.00 debited from a/c to UPI/Swiggy`,
  ];

  const MAX_CHARS = 280;
  const [text, setText] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [lastParsed, setLastParsed] = useState<Transaction | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [lowConfidence, setLowConfidence] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;

  const handleSubmit = async () => {
    if (!text.trim() || status === 'processing' || isOverLimit) return;
    if (successTimer.current) clearTimeout(successTimer.current);
    setStatus('processing'); setErrorMsg(''); setLowConfidence(false);

    try {
      const today = new Date().toISOString().split('T')[0];
      let tx: Transaction;
      const tags = text.match(/#[a-zA-Z0-9_-]+/g)?.map(t => t.slice(1).toLowerCase());
      
      const upiAttempt = parseUPISMS(text);

      if (upiAttempt && upiAttempt.amount) {
        tx = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          date: today,
          amount: upiAttempt.amount,
          category: upiAttempt.category as any,
          merchant: upiAttempt.merchant || 'UPI Transfer',
          type: upiAttempt.type as any,
          description: text.trim(),
          isNew: true,
          confidence: 0.9,
          aiParsed: true,
          tags: tags?.length ? [...tags, 'upi-sms'] : ['upi-sms']
        };
      } else {
        try {
          const parsed = await aiParseTransaction(text, today);
          tx = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date: parsed.date, amount: parsed.amount, category: parsed.category, merchant: parsed.merchant, type: parsed.type, description: text.trim(), isNew: true, confidence: parsed.confidence, aiParsed: true, tags: tags?.length ? tags : undefined };
          if (parsed.confidence < 0.7) setLowConfidence(true);
        } catch (aiErr) {
          if (aiErr instanceof AIServiceError) { tx = { ...regexParseTransaction(text), aiParsed: false, tags: tags?.length ? tags : undefined }; }
          else throw aiErr;
        }
      }

      if (tx.amount <= 0 || tx.amount > 1_000_000) throw new Error('Amount looks unusual — please double-check.');
      onAddTransaction(tx);
      setLastParsed(tx); setStatus('success'); setText('');
      successTimer.current = setTimeout(() => setStatus('idle'), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not parse the transaction. Try rephrasing.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSubmit(); }
  };

  const isProcessing = status === 'processing';

  return (
    <div className="card px-5 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Magic Input
        </h3>
        <span
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: 'var(--teal-dim)', color: 'var(--teal)', fontFamily: 'var(--font-inter)' }}
        >
          <Zap size={11} />
          AI Powered
        </span>
      </div>

      {/* Example pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {EXAMPLE_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => { setText(p); textareaRef.current?.focus(); }}
            disabled={isProcessing}
            className="rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50"
            style={{ background: '#f5f7fa', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', border: 'none', cursor: 'pointer' }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="relative mb-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={'Describe a transaction…\n\n"Spent $45 on Uber" or "Netflix $15.99"'}
          rows={4}
          disabled={isProcessing}
          className="w-full resize-none rounded-xl text-sm transition-all focus:outline-none"
          style={{
            background: '#f8fafc',
            border: isOverLimit ? '2px solid var(--red)' : '2px solid transparent',
            padding: '12px 14px 28px 14px',
            fontFamily: 'var(--font-inter)',
            fontSize: '13px',
            color: 'var(--text-primary)',
            boxShadow: 'none',
          }}
          onFocus={e => { if (!isOverLimit) e.target.style.border = '2px solid var(--teal)'; }}
          onBlur={e => { if (!isOverLimit) e.target.style.border = '2px solid transparent'; }}
        />
        <div
          className="absolute bottom-2 right-3 text-xs"
          style={{ color: isOverLimit ? 'var(--red)' : charCount > MAX_CHARS * 0.8 ? 'var(--amber)' : 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}
        >
          {charCount}/{MAX_CHARS}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || isProcessing || isOverLimit}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl font-semibold text-sm text-white transition-all"
        style={{
          background: isProcessing || !text.trim() || isOverLimit ? '#a0aec0' : 'var(--teal)',
          cursor: isProcessing || !text.trim() || isOverLimit ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-inter)',
          border: 'none',
        }}
      >
        {isProcessing ? (
          <><Loader2 size={16} className="animate-spin" /> Parsing…</>
        ) : (
          <><Zap size={15} /> Parse & Add Transaction</>
        )}
      </button>

      {/* Success feedback */}
      {status === 'success' && lastParsed && (
        <div className="mt-3 rounded-xl px-4 py-3 flex items-start gap-3 animate-fade-in-up" style={{ background: 'var(--green-dim)' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--green)', marginTop: '2px', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>✓ Added!</p>
              {lastParsed.aiParsed && (
                <span className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}>
                  <Bot size={8} /> AI
                </span>
              )}
            </div>
            {lowConfidence && (
              <p style={{ fontSize: '11px', color: 'var(--amber)', fontFamily: 'var(--font-inter)', marginTop: '2px' }}>⚠ Low confidence — please verify</p>
            )}
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', marginTop: '2px' }}>
              {mergedIcons[lastParsed.category] || '📦'} {lastParsed.category} · {lastParsed.type === 'credit' ? '+' : '-'}{currency}{lastParsed.amount.toFixed(2)} · {lastParsed.merchant}
            </p>
          </div>
          <button onClick={() => setStatus('idle')} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error feedback */}
      {status === 'error' && (
        <div className="mt-3 rounded-xl px-4 py-3 flex items-start gap-3 animate-fade-in-up" style={{ background: 'var(--red-dim)' }}>
          <AlertTriangle size={16} style={{ color: 'var(--red)', marginTop: '2px', flexShrink: 0 }} />
          <div className="flex-1">
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--red)' }}>Parse failed</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', marginTop: '2px' }}>{errorMsg}</p>
          </div>
          <button onClick={() => setStatus('idle')} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
