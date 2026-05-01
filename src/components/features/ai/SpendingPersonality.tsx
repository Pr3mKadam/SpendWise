import { useState, useEffect } from 'react';
import { Sparkles, Brain, Zap, Target, Quote } from 'lucide-react';
import { getSpendingPersonality } from '../../../utils/insights/reporting';
import { Transaction } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SpendingPersonalityProps {
  transactions: Transaction[];
}

export default function SpendingPersonality({ transactions }: SpendingPersonalityProps) {
  const [personality, setPersonality] = useState<{
    archetype: string;
    description: string;
    traits: string[];
    advice: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (transactions.length < 5) return;
    setLoading(true);
    try {
      const data = await getSpendingPersonality(transactions);
      setPersonality(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactions.length >= 10 && !personality) {
      analyze();
    }
  }, [transactions.length]);

  if (transactions.length < 10) return null;

  return (
    <div className="card p-6 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Brain size={80} className="text-[var(--teal)]" />
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[var(--teal-dim)] flex items-center justify-center text-[var(--teal)]">
          <Sparkles size={16} />
        </div>
        <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">Spending Personality</h3>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="relative">
              <div className="w-12 h-12 border-4 border-[var(--teal-dim)] border-t-[var(--teal)] rounded-full animate-spin" />
              <Brain size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--teal)]" />
            </div>
            <p className="text-xs font-inter font-medium text-[var(--text-muted)] animate-pulse">
              Local AI is decoding your behavioral patterns...
            </p>
          </motion.div>
        ) : personality ? (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-[10px] font-bold text-[var(--teal)] uppercase tracking-widest mb-1">Your Archetype</p>
              <h4 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {personality.archetype}
              </h4>
              <div className="flex items-start gap-2 mt-2">
                <Quote size={12} className="text-[var(--teal)] opacity-50 shrink-0 mt-1" />
                <p className="text-sm italic text-[var(--text-secondary)] leading-relaxed">
                  {personality.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {personality.traits.map((trait, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1 rounded-full bg-[var(--surface-input)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider"
                >
                  {trait}
                </span>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--teal-dim)] to-transparent border border-[var(--teal)]/10">
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-[var(--teal)]" />
                <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Growth Tip</p>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {personality.advice}
              </p>
            </div>

            <button 
              onClick={analyze}
              className="w-full py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors flex items-center justify-center gap-2"
            >
              <Zap size={10} /> Refresh Analysis
            </button>
          </motion.div>
        ) : (
          <div className="py-8 text-center">
            <button 
              onClick={analyze}
              className="px-6 py-3 rounded-xl bg-[var(--teal)] text-white font-bold text-sm shadow-lg shadow-[var(--teal)]/20"
            >
              Analyze My Personality
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
