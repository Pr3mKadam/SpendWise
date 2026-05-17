import React, { useState, useRef } from 'react';
import { Wand2, Sparkles, Loader2, Check, X, Mic, Camera, Paperclip } from 'lucide-react';
import { processNaturalLanguageExpense } from '../../../utils/parsers/nlp';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '../../../types';
import { AIInputTools } from './AIInputTools';
import { compressImage } from '../../../utils/imageUtils';
import { recognizeReceipt, parseOfflineReceipt } from '../../../utils/parsers/ocr';
import { parseVoiceLocally } from '../../../utils/parsers/voice';
import { parseVoiceWithGemini } from '../../../services/VoiceService';
import { useCurrency } from '../../../contexts/CurrencyContext';
import ReceiptScanner from './ReceiptScanner';
import { haptic } from '../../../lib/haptic';
import { predictCategory } from '../../../utils/merchantMapper';
import { useCategories } from '../../../hooks/useCategories';
import { useStore } from '../../../store';

interface MagicInputProps {
  onAdd: (transaction: Transaction) => void;
  externalInput?: string;
  onInputChange?: (val: string) => void;
  transactions?: Transaction[];
  onFocus?: () => void;
  autoFocus?: boolean;
}

export default function MagicInput({ onAdd, externalInput, onInputChange, transactions, onFocus, autoFocus }: MagicInputProps) {
  const { activeCurrency } = useCurrency();
  const { suggestedCategories, mergedIcons } = useCategories();
  const [localInput, setLocalInput] = useState('');
  const input = externalInput !== undefined ? externalInput : localInput;
  const setInput = onInputChange || setLocalInput;
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<Partial<Transaction> | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | undefined>();
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = async () => {
    if (!input.trim()) {
      setScanStatus('⚠️ Please enter an expense description');
      setTimeout(() => setScanStatus(undefined), 2000);
      return;
    }
    setIsProcessing(true);
    const result = await processNaturalLanguageExpense(input, activeCurrency);
    
    if (!result) {
      // Fallback: create a minimal transaction from the raw text
      const amount = parseFloat(input.replace(/[^0-9.]/g, '')) || 0;
      const fallbackResult = {
        merchant: input.trim(),
        category: 'Shopping' as any,
        amount,
        type: 'debit' as const,
        confidence: 0.3,
      };
      setPrediction(fallbackResult);
      setScanStatus('⚠️ Could not fully parse — please review and edit below');
      setIsProcessing(false);
      return;
    }
    
    // Intelligent Default: If merchant matches history, suggest previous category
    if (result && result.merchant) {
      if (transactions) {
        const match = transactions.find(t => t.merchant.toLowerCase() === result.merchant?.toLowerCase());
        if (match) {
          result.category = match.category;
        } else {
          // If no history match, use smart merchant mapper
          result.category = predictCategory(result.merchant);
        }
      } else {
        result.category = predictCategory(result.merchant);
      }
    }

    setPrediction(result);
    setIsProcessing(false);
  };

  const handleConfirm = () => {
    if (prediction) {
      if (!prediction.amount || prediction.amount <= 0) {
        setScanStatus('⚠️ Amount must be greater than 0');
        setTimeout(() => setScanStatus(undefined), 2000);
        return;
      }
      onAdd({
        ...prediction as Transaction,
        id: `magic-${Date.now()}`,
        date: prediction.date || new Date().toISOString().split('T')[0],
        type: prediction.type || 'debit'
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
      reader.onload = async (event) => {
        const base64Url = event.target?.result as string;
        setScanStatus('🔍 Extracting text locally...');
        try {
          const compressed = await compressImage(base64Url, 800, 0.75);
          const rawText = await recognizeReceipt(`data:${compressed.mimeType};base64,${compressed.base64}`);
          const res = parseOfflineReceipt(rawText);
          setPrediction(res);
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
    // @ts-ignore
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
      const today = new Date().toISOString().split('T')[0];
      
      try {
        const res = await parseVoiceWithGemini(transcript, today);
        setPrediction({
          ...res,
          confidence: 0.9,
        });
      } catch (err) {
        console.error('Gemini voice parsing failed, falling back to local:', err);
        const res = parseVoiceLocally(transcript, today);
        setPrediction(res);
      }
      
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
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--teal)] to-blue-500 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-[var(--surface-card)] border border-[var(--border)] rounded-[30px] p-2 flex items-center gap-2 shadow-xl">
          <div className="pl-4 text-[var(--teal)]">
            <Wand2 size={20} />
          </div>
          <input 
            id="magic-input-field"
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
            onFocus={onFocus}
            placeholder="I spent 500 on dinner at Starbucks..."
            autoFocus={autoFocus}
            className="flex-1 bg-transparent border-none py-4 px-2 text-[var(--text-primary)] font-medium outline-none placeholder:text-[var(--text-muted)] placeholder:opacity-50"
          />
          <button 
            onClick={handleProcess}
            disabled={isProcessing || !input.trim()}
            className="p-3 bg-[var(--teal)] text-white border-none rounded-2xl cursor-pointer shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center min-w-[48px]"
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
                {isScanning ? <Loader2 size={14} className="animate-spin text-[var(--teal)]" /> : null}
                <span className="text-[length:var(--fs-overline)] font-bold font-inter text-[var(--text-primary)]">{scanStatus}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2 px-2 mt-3">
          {suggestedCategories.map((catName) => {
            const icon = mergedIcons[catName] || '🏷️';
            // Generate a sample prompt based on category
            let prompt = `Spent 500 on ${catName}`;
            if (catName === 'Food') prompt = 'Dinner at Starbucks for 450';
            if (catName === 'Transport') prompt = 'Uber ride for 300';
            if (catName === 'Education') prompt = 'Bought books for 1200';
            if (catName === 'Business') prompt = 'Cloud subscription for 2500';
            
            return (
              <button
                key={catName}
                onClick={() => { setInput(prompt); handleProcess(); }}
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
        onExtracted={(data) => {
          onAdd({
            id: `magic-${Date.now()}`,
            amount: data.amount,
            merchant: data.merchant,
            category: 'Uncategorized',
            date: data.date,
            type: 'debit',
            status: 'completed',
            tags: ['ocr']
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
            className="absolute top-full left-0 right-0 mt-4 z-50 bg-[var(--surface-card)] border border-[var(--teal)]/30 rounded-3xl p-6 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--teal)] to-blue-500" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[length:var(--fs-overline)] font-bold uppercase text-[var(--teal)] tracking-widest">Local AI Prediction</span>
              <button onClick={() => setPrediction(null)} className="p-1 text-[var(--text-muted)] hover:text-red-500 bg-transparent border-none cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex-1">
                <h4 className="text-2xl font-black text-[var(--text-primary)]">{prediction.merchant || 'Unknown Merchant'}</h4>
                <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-wider">{prediction.category || 'Expense'}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[var(--teal)]">
                  {prediction.type === 'debit' ? '-' : '+'}{activeCurrency}{prediction.amount || 0}
                </p>
                <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-wider">{prediction.type || 'debit'}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={handleConfirm}
                className="flex-1 py-3 bg-[var(--teal)] text-white border-none rounded-xl font-bold cursor-pointer hover:bg-[#0d9488] transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} /> CONFIRM ADD
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
