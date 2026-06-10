import React, { useState, useRef, useEffect } from 'react';
import { Wand2, Sparkles, Loader2, Check, X, Mic, Camera, Paperclip } from 'lucide-react';
import { processNaturalLanguageExpense } from '@/features/ai/parsers/nlp';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '@/types';
import { AIInputTools } from '@/features/ai/components/AIInputTools';
import { compressImage } from '@/utils/imageUtils';
import { recognizeReceipt, parseOfflineReceipt } from '@/features/ai/parsers/ocr';
import { parseVoiceLocally } from '@/features/ai/parsers/voice';
import { parseVoiceWithGemini } from '@/core/api/VoiceService';
import { useCurrency } from '@/contexts/CurrencyContext';
import ReceiptScanner from '@/features/ai/components/ReceiptScanner';
import { haptic } from '@/core/haptic';
import { predictCategory } from '@/utils/merchantMapper';
import { useCategories } from '@/hooks/useCategories';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';

interface MagicInputProps {
  onAdd: (transaction: Transaction) => void;
  externalInput?: string;
  onInputChange?: (val: string) => void;
  transactions?: Transaction[];
  onFocus?: () => void;
  autoFocus?: boolean;
}

export default function MagicInput({
  onAdd,
  externalInput,
  onInputChange,
  transactions,
  onFocus,
  autoFocus,
}: MagicInputProps) {
  const { activeCurrency } = useCurrency();
  const { suggestedCategories, mergedIcons } = useCategories();
  const [localInput, setLocalInput] = useState('');
  const input = externalInput !== undefined ? externalInput : localInput;
  const setInput = onInputChange || setLocalInput;
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<Partial<Transaction>[] | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | undefined>();
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prediction && prediction.length > 0) {
      setTimeout(() => {
        const modalContainer = document.querySelector('[role="dialog"]');
        if (modalContainer) {
          modalContainer.scrollTo({
            top: modalContainer.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  }, [prediction]);

  const handleProcess = async () => {
    // Dismiss soft keyboard on mobile devices immediately
    document.getElementById('magic-input-field')?.blur();

    if (!input.trim()) {
      setScanStatus('⚠️ Please enter an expense description');
      setTimeout(() => setScanStatus(undefined), 2000);
      return;
    }
    setIsProcessing(true);
    const results = await processNaturalLanguageExpense(input, activeCurrency);

    if (!results || results.length === 0) {
      // Fallback: create a minimal transaction from the raw text
      const amount = parseFloat(input.replace(/[^0-9.]/g, '')) || 0;
      const fallbackResult = {
        merchant: input.trim(),
        category: 'Shopping' as any,
        amount,
        type: 'debit' as const,
        confidence: 0.3,
      };
      setPrediction([fallbackResult]);
      setScanStatus('⚠️ Could not fully parse — please review and edit below');
      setIsProcessing(false);
      return;
    }

    // Intelligent Default: If merchant matches history, suggest previous category
    const enrichedResults = results.map(res => {
      if (res && res.merchant) {
        if (transactions) {
          const match = transactions.find(
            t => t.merchant.toLowerCase() === res.merchant.toLowerCase()
          );
          if (match) {
            res.category = match.category;
          } else if (res.category === 'Shopping' || res.category === 'Uncategorized') {
            res.category = predictCategory(res.merchant);
          }
        } else if (res.category === 'Shopping' || res.category === 'Uncategorized') {
          res.category = predictCategory(res.merchant);
        }
      }
      return res;
    });

    setPrediction(enrichedResults);
    setIsProcessing(false);
  };

  const updatePrediction = (
    idx: number,
    field: 'merchant' | 'category' | 'amount' | 'type',
    value: any
  ) => {
    setPrediction(prev => {
      if (!prev) return prev;
      const newPred = [...prev];
      newPred[idx] = { ...newPred[idx], [field]: value };
      return newPred;
    });
  };

  const handleConfirm = () => {
    if (prediction && prediction.length > 0) {
      const invalid = prediction.find(p => !p.amount || p.amount <= 0);
      if (invalid) {
        setScanStatus('⚠️ Amount must be greater than 0');
        setTimeout(() => setScanStatus(undefined), 2000);
        return;
      }
      prediction.forEach((p, index) => {
        onAdd({
          ...(p as Transaction),
          id: `magic-${Date.now()}-${index}`,
          date: p.date || formatLocalYYYYMMDD(new Date()),
          type: p.type || 'debit',
        });
      });
      haptic.success();
      setPrediction(null);
      setInput('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    setScanStatus('📷 Compressing image...');

    try {
      const reader = new FileReader();
      reader.onload = async event => {
        const base64Url = event.target?.result as string;
        setScanStatus('🔍 Extracting text locally...');
        try {
          const compressed = await compressImage(base64Url, 800, 0.75);
          const rawText = await recognizeReceipt(
            `data:${compressed.mimeType};base64,${compressed.base64}`
          );
          const res = parseOfflineReceipt(rawText);
          setPrediction([res]);
          setScanStatus('✅ Receipt scanned! Review and confirm.');
        } catch (err) {
          setScanStatus('❌ Scan failed. Try a clearer photo.');
        } finally {
          setIsScanning(false);
          setTimeout(() => setScanStatus(undefined), 3000);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsScanning(false);
      setScanStatus('❌ Failed to read file.');
    }
  };

  const handleVoiceInput = () => {
    // @ts-expect-error SpeechRecognition types not in DOM lib
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setScanStatus('🚫 Voice not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => {
      setIsListening(true);
      setScanStatus('🎙️ Listening...');
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setScanStatus(`✅ Heard: "${transcript}"`);
      setInput(transcript);
      setIsProcessing(true);

      try {
        const results = await processNaturalLanguageExpense(transcript, activeCurrency);
        if (!results || results.length === 0) {
          throw new Error('No results from NLP');
        }

        const enrichedResults = results.map(res => {
          if (res && res.merchant) {
            if (transactions) {
              const match = transactions.find(
                t => t.merchant.toLowerCase() === res.merchant.toLowerCase()
              );
              if (match) {
                res.category = match.category;
              } else if (res.category === 'Shopping' || res.category === 'Uncategorized') {
                res.category = predictCategory(res.merchant);
              }
            } else if (res.category === 'Shopping' || res.category === 'Uncategorized') {
              res.category = predictCategory(res.merchant);
            }
          }
          return res;
        });
        setPrediction(enrichedResults);
      } catch (err) {
        console.error('Voice NLP parsing failed, falling back to local:', err);
        const today = formatLocalYYYYMMDD(new Date());
        const res = parseVoiceLocally(transcript, today);
        setPrediction([res]);
      }

      setIsProcessing(false);
      setIsListening(false);
      setTimeout(() => setScanStatus(undefined), 3000);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setScanStatus('❌ Voice error. Try again.');
    };

    recognition.start();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto space-y-4">
      <div className="relative group w-full">
        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--teal)] to-blue-500 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative w-full bg-[var(--surface-card)] border border-[var(--border)] rounded-[30px] p-1.5 flex items-center justify-between gap-2 shadow-xl overflow-hidden">
          <div className="pl-3.5 text-[var(--teal)] flex-shrink-0 flex items-center">
            <Wand2 size={20} />
          </div>
          <input
            id="magic-input-field"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleProcess()}
            onFocus={onFocus}
            placeholder="Try '200 on food'..."
            autoFocus={autoFocus}
            className="flex-1 bg-transparent border-none py-3 px-1 text-base text-[var(--text-primary)] font-medium outline-none placeholder:text-[var(--text-muted)] placeholder:opacity-50"
            style={{ minWidth: 0, width: '100%', outline: 'none' }}
          />
          <button
            onClick={handleProcess}
            disabled={isProcessing || !input.trim()}
            className="p-3 bg-[var(--teal)] text-white border-none rounded-2xl cursor-pointer shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center min-w-[48px] flex-shrink-0"
          >
            {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
          </button>
        </div>

        {/* Scan Status Overlay */}
        <AnimatePresence>
          {scanStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 -top-12 flex justify-center z-50 pointer-events-none"
            >
              <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-full px-4 py-2 shadow-xl flex items-center gap-2">
                {isScanning ? (
                  <Loader2 size={14} className="animate-spin text-[var(--teal)]" />
                ) : null}
                <span className="text-[length:var(--fs-overline)] font-bold font-inter text-[var(--text-primary)]">
                  {scanStatus}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Suggestions */}
      <div className="flex flex-wrap gap-2 px-2 mt-3">
        {suggestedCategories.map(catName => {
          const icon = mergedIcons[catName] || '🏷️';
          let prompt = `Spent 500 on ${catName}`;
          if (catName === 'Food') prompt = '500 on food and 300 on coffee';
          if (catName === 'Transport') prompt = 'Uber ride for 300';
          if (catName === 'Education') prompt = 'Bought books for 1200';
          if (catName === 'Business') prompt = 'Cloud subscription for 2500';

          return (
            <button
              key={catName}
              onClick={() => {
                setInput(prompt);
                handleProcess();
              }}
              className="px-4 py-2 bg-[var(--surface-card)] border border-[var(--border)] shadow-sm rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--teal)] hover:text-[var(--teal)] hover:shadow-[0_4px_12px_rgba(45,212,191,0.15)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <span>{icon}</span> {catName}
            </button>
          );
        })}
      </div>

      <AIInputTools
        isScanning={isScanning}
        isListening={isListening}
        scanStatus={scanStatus}
        handleFileChange={handleFileChange}
        handleVoiceInput={handleVoiceInput}
        onOpenScanner={() => setShowScanner(true)}
        fileInputRef={fileInputRef}
      />

      <ReceiptScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onExtracted={data => {
          onAdd({
            id: `magic-${Date.now()}`,
            amount: data.amount,
            merchant: data.merchant,
            category: 'Uncategorized',
            date: data.date,
            type: 'debit',
            status: 'completed',
            tags: ['ocr'],
          });
          haptic.success();
          setShowScanner(false);
        }}
      />

      <AnimatePresence>
        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="relative mt-4 z-10 bg-[var(--surface-card)] border border-[var(--teal)]/30 rounded-3xl p-6 shadow-2xl overflow-hidden w-full"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--teal)] to-blue-500" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-[length:var(--fs-overline)] font-bold uppercase text-[var(--teal)] tracking-widest">
                Local AI Prediction ({prediction.length}{' '}
                {prediction.length === 1 ? 'item' : 'items'})
              </span>
              <button
                onClick={() => setPrediction(null)}
                className="p-1 text-[var(--text-muted)] hover:text-red-500 bg-transparent border-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 pr-1 mb-6">
              {prediction.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 bg-[var(--surface-bg)] rounded-2xl border border-[var(--border)]"
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <input
                      type="text"
                      value={item.merchant || ''}
                      onChange={e => updatePrediction(idx, 'merchant', e.target.value)}
                      className="text-lg font-black text-[var(--text-primary)] bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--teal)] outline-none w-full truncate"
                    />
                    <select
                      value={item.category || 'Shopping'}
                      onChange={e => updatePrediction(idx, 'category', e.target.value)}
                      className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-wider bg-[var(--surface-bg)] border-none outline-none cursor-pointer w-max"
                    >
                      {[
                        'Food',
                        'Shopping',
                        'Transport',
                        'Entertainment',
                        'Subscriptions',
                        'Utilities',
                        'Health',
                        'Travel',
                        'Education',
                        'Business',
                        'Income',
                        'Uncategorized',
                      ].map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <div className="flex items-center">
                      <button
                        onClick={() =>
                          updatePrediction(idx, 'type', item.type === 'debit' ? 'credit' : 'debit')
                        }
                        className={`text-xl font-black bg-transparent border-none cursor-pointer px-1 rounded ${item.type === 'debit' ? 'text-red-500' : 'text-green-500'}`}
                      >
                        {item.type === 'debit' ? '-' : '+'}
                      </button>
                      <span className="text-xl font-black text-[var(--teal)]">
                        {activeCurrency}
                      </span>
                      <input
                        type="number"
                        value={item.amount || ''}
                        onChange={e =>
                          updatePrediction(idx, 'amount', parseFloat(e.target.value) || 0)
                        }
                        className="text-xl font-black text-[var(--teal)] bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--teal)] outline-none w-20 text-right"
                      />
                    </div>
                    <span className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-wider">
                      {item.type || 'debit'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 bg-[var(--teal)] text-white border-none rounded-xl font-bold cursor-pointer hover:bg-[#0d9488] transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} /> CONFIRM ALL ({prediction.length})
              </button>
              <button
                onClick={() => setPrediction(null)}
                className="flex-1 py-3 bg-red-500/10 text-red-500 border-none rounded-xl font-bold cursor-pointer hover:bg-red-500/20 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
