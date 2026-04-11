import { useState, useRef } from 'react';
import { Sparkles, Loader2, Zap, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Transaction } from '../types';
import { parseTransaction as aiParseTransaction, AIServiceError } from '../services/ai';
import { parseTransaction as regexParseTransaction, CATEGORY_ICONS, CATEGORY_COLORS } from '../data/mockData';

interface MagicInputProps {
  onAddTransaction: (tx: Transaction) => void;
  currency?: string;
}

type Status = 'idle' | 'processing' | 'success' | 'error';

export default function MagicInput({ onAddTransaction, currency = '$' }: MagicInputProps) {
  const EXAMPLE_PROMPTS = [
    `Spent ${currency}45 on Uber ride home`,
    `Netflix charged ${currency}15.99 monthly`,
    `Received ${currency}500 freelance payment`,
    `Bought groceries at Whole Foods ${currency}78.43`,
    `Starbucks coffee ${currency}6.75`,
  ];

  const MAX_CHARS = 280;

  const [text, setText]               = useState('');
  const [status, setStatus]           = useState<Status>('idle');
  const [lastParsed, setLastParsed]   = useState<Transaction | null>(null);
  const [errorMsg, setErrorMsg]       = useState('');
  const [lowConfidence, setLowConfidence] = useState(false);
  const successTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef                   = useRef<HTMLTextAreaElement>(null);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;

  const clearSuccess = () => {
    if (successTimer.current) clearTimeout(successTimer.current);
  };

  const handleSubmit = async () => {
    if (!text.trim() || status === 'processing' || isOverLimit) return;

    clearSuccess();
    setStatus('processing');
    setErrorMsg('');
    setLowConfidence(false);

    try {
      const today = new Date().toISOString().split('T')[0];
      let tx: Transaction;

      try {
        // ── Cloud parse (Gemini) ──────────────────────────────────────────────
        const parsed = await aiParseTransaction(text, today);
        tx = {
          id:          `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          date:        parsed.date,
          amount:      parsed.amount,
          category:    parsed.category,
          merchant:    parsed.merchant,
          type:        parsed.type,
          description: text.trim(),
          isNew:       true,
          confidence:  parsed.confidence,
          aiParsed:    true,
        };
        if (parsed.confidence < 0.7) setLowConfidence(true);
      } catch (aiErr) {
        if (aiErr instanceof AIServiceError) {
          // ── Regex fallback ────────────────────────────────────────────────
          tx = { ...regexParseTransaction(text), aiParsed: false };
        } else {
          throw aiErr; // unexpected — let outer catch handle it
        }
      }

      // Basic sanity checks
      if (tx.amount <= 0 || tx.amount > 1_000_000) {
        throw new Error('Amount looks unusual — please double-check and try again.');
      }

      onAddTransaction(tx);
      setLastParsed(tx);
      setStatus('success');
      setText('');

      successTimer.current = setTimeout(() => setStatus('idle'), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not parse the transaction. Try rephrasing.';
      setErrorMsg(message);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExampleClick = (prompt: string) => {
    setText(prompt);
    textareaRef.current?.focus();
  };

  const isProcessing = status === 'processing';

  return (
    <div className="glass-card animate-fade-in-up rounded-2xl p-4 sm:p-5" style={{ animationDelay: '0.4s' }}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-white">
          <Zap className="h-5 w-5 text-amber-400" />
          Quick add
        </h2>
      </div>

      {/* Example prompt pills */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {EXAMPLE_PROMPTS.slice(0, 3).map(prompt => (
          <button
            key={prompt}
            onClick={() => handleExampleClick(prompt)}
            disabled={isProcessing}
            className="rounded-full border border-slate-700/60 bg-slate-800/40 px-2.5 py-1 text-[10px] font-medium text-slate-500 transition-all hover:border-slate-600 hover:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {prompt.length > 28 ? prompt.slice(0, 28) + '…' : prompt}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={'Paste bank SMS or describe your expense…\n\nE.g. "Spent $45 on Uber" or "Netflix $15.99"'}
          rows={4}
            className={`w-full resize-none rounded-xl border bg-slate-800/40 px-4 py-3 text-sm text-white placeholder-slate-600 transition-all focus:outline-none focus:ring-2 sm:rows-5 ${
            isOverLimit
              ? 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20'
              : 'border-slate-700/60 focus:border-blue-500/50 focus:ring-blue-500/20'
          }`}
          disabled={isProcessing}
        />

        {/* Character counter */}
        <div
          className={`absolute bottom-3 right-3 text-[10px] font-medium transition-colors ${
            isOverLimit ? 'text-red-400' : charCount > MAX_CHARS * 0.8 ? 'text-amber-400' : 'text-slate-600'
          }`}
        >
          {charCount}/{MAX_CHARS}
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || isProcessing || isOverLimit}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Parsing…</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span>Parse & Add Transaction</span>
          </>
        )}
      </button>

      {/* ── Status Feedback ── */}
      {status === 'success' && lastParsed && (
        <div className="mt-3 animate-fade-in-up overflow-hidden rounded-xl border border-blue-500/25 bg-blue-500/10">
          <div className="flex items-start gap-3 px-3.5 py-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-blue-400">Transaction added!</p>
              </div>

              {/* Low-confidence warning */}
              {lowConfidence && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  Low confidence — please verify
                </div>
              )}

              {/* Transaction details */}
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[lastParsed.category]}20`,
                    color:           CATEGORY_COLORS[lastParsed.category],
                  }}
                >
                  {CATEGORY_ICONS[lastParsed.category]} {lastParsed.category}
                </span>
                <span className="text-[11px] font-bold text-slate-300">
                  {lastParsed.type === 'credit' ? '+' : '-'}$
                  {lastParsed.amount.toFixed(2)}
                </span>
                <span className="text-[11px] text-slate-500">{lastParsed.merchant}</span>
              </div>
            </div>
            <button
              onClick={() => setStatus('idle')}
              className="flex-shrink-0 text-slate-600 hover:text-slate-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 animate-fade-in-up overflow-hidden rounded-xl border border-red-500/25 bg-red-500/10">
          <div className="flex items-start gap-3 px-3.5 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-400">Parse failed</p>
              <p className="mt-0.5 text-[11px] text-red-300/70">{errorMsg}</p>
            </div>
            <button
              onClick={() => setStatus('idle')}
              className="flex-shrink-0 text-slate-600 hover:text-slate-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Keyboard hint */}
      <p className="mt-3 text-[10px] text-slate-600">
        Press{' '}
        <kbd className="rounded bg-slate-800/80 px-1 py-0.5 font-mono text-slate-500">
          {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
        </kbd>{' '}
        +{' '}
        <kbd className="rounded bg-slate-800/80 px-1 py-0.5 font-mono text-slate-500">↵</kbd>{' '}
        to submit quickly
      </p>
    </div>
  );
}
