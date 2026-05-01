import React, { useState } from 'react';
import { Wand2, Sparkles, Loader2, Check, X, Mic } from 'lucide-react';
import { processNaturalLanguageExpense } from '../../../utils/aiAnalyzer';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '../../../types';
import { playSuccess } from '../../../utils/soundscape';

interface MagicInputProps {
  onAdd: (transaction: Transaction) => void;
}

export default function MagicInput({ onAdd }: MagicInputProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<Partial<Transaction> | null>(null);

  const handleProcess = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    const result = await processNaturalLanguageExpense(input);
    setPrediction(result);
    setIsProcessing(false);
  };

  const handleConfirm = () => {
    if (prediction) {
      onAdd({
        ...prediction as Transaction,
        id: `magic-${Date.now()}`,
        date: prediction.date || new Date().toISOString().split('T')[0],
        type: prediction.type || 'debit'
      });
      playSuccess();
      setPrediction(null);
      setInput('');
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--teal)] to-blue-500 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-[var(--surface-card)] border border-[var(--border)] rounded-[30px] p-2 flex items-center gap-2 shadow-xl">
          <div className="pl-4 text-[var(--teal)]">
            <Wand2 size={20} />
          </div>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
            placeholder="I spent 500 on dinner at Starbucks..."
            className="flex-1 bg-transparent border-none py-4 px-2 text-[var(--text-primary)] font-medium outline-none placeholder:text-[var(--text-muted)] placeholder:opacity-50"
          />
          <button 
            onClick={handleProcess}
            disabled={isProcessing || !input.trim()}
            className="p-3 bg-[var(--teal)] text-white border-none rounded-2xl cursor-pointer shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
          >
            {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
          </button>
        </div>
      </div>

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
              <span className="text-[10px] font-black uppercase text-[var(--teal)] tracking-widest">AI Prediction</span>
              <button onClick={() => setPrediction(null)} className="p-1 text-[var(--text-muted)] hover:text-red-500 bg-transparent border-none cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex-1">
                <h4 className="text-2xl font-black text-[var(--text-primary)]">{prediction.merchant}</h4>
                <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-wider">{prediction.category}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[var(--teal)]">₹{prediction.amount}</p>
                <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-wider">{prediction.type}</p>
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
      
      <p className="text-center mt-3 text-[10px] font-bold text-[var(--text-muted)] opacity-50 uppercase tracking-widest flex items-center justify-center gap-2">
        <Mic size={10} /> Tip: Describe your expense naturally like "Spent 40 on coffee"
      </p>
    </div>
  );
}
