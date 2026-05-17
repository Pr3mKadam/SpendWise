import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiggyBank, Sparkles, X, ChevronRight } from 'lucide-react';
import { Transaction } from '../../../types';
import { useStore } from '../../../store';

interface RoundUpVaultProps {
  transactions: Transaction[];
  currency: string;
}

export function RoundUpVault({ transactions, currency }: RoundUpVaultProps) {
  const vault = useStore(s => s.roundUpVault);
  const setVault = useStore(s => s.setRoundUpVault);
  const [showHistory, setShowHistory] = useState(false);
  const [lastAdded, setLastAdded] = useState<number | null>(null);
  const addXP = useStore(s => s.addXP);

  const roundUps = useMemo(() => {
    return transactions
      .filter(t => t.type === 'debit' && t.amount > 0)
      .map(t => {
        const rounded = Math.ceil(t.amount / 10) * 10;
        const spare = rounded - t.amount;
        return { ...t, spare: Math.round(spare * 100) / 100, rounded };
      })
      .filter(t => t.spare > 0 && t.spare < 10);
  }, [transactions]);

  const pendingTotal = useMemo(() =>
    roundUps.reduce((a, t) => a + t.spare, 0), [roundUps]);

  const handleSweep = () => {
    if (pendingTotal <= 0) return;
    const newHistory = roundUps.slice(0, 5).map(r => ({
      date: r.date,
      amount: r.spare,
      merchant: r.merchant,
    }));
    const updated = {
      total: Math.round((vault.total + pendingTotal) * 100) / 100,
      count: vault.count + roundUps.length,
      history: [...newHistory, ...vault.history].slice(0, 20),
    };
    setVault(updated);
    setLastAdded(pendingTotal);
    addXP(15);
    setTimeout(() => setLastAdded(null), 3000);
  };

  const handleReset = () => {
    const empty = { total: 0, count: 0, history: [] };
    setVault(empty);
  };

  return (
    <div className="card p-4 sm:p-5 overflow-hidden relative">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[var(--teal-dim)] opacity-30 pointer-events-none" />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--teal-dim)] flex items-center justify-center shrink-0">
            <PiggyBank size={18} className="text-[var(--teal)]" />
          </div>
          <div>
            <h3 className="font-manrope font-bold text-sm text-[var(--text-primary)]">Round-Up Vault</h3>
            <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] font-inter mt-0.5">Spare change from {vault.count} transactions</p>
          </div>
        </div>
        <button onClick={handleReset} className="p-1 text-[var(--text-dim)] hover:text-red-400 bg-transparent border-none cursor-pointer">
          <X size={14} />
        </button>
      </div>

      {/* Vault total */}
      <div className="text-center py-4">
        <motion.p
          key={vault.total}
          initial={{ scale: 1.2, color: '#14b8a6' }}
          animate={{ scale: 1, color: 'var(--text-primary)' }}
          className="font-manrope font-black text-4xl tabular-nums"
          style={{ letterSpacing: '-0.04em' }}
        >
          {currency}{vault.total.toFixed(2)}
        </motion.p>
        <p className="text-[length:var(--fs-caption)] text-[var(--text-muted)] font-inter mt-1">saved in vault</p>
      </div>

      {/* Pending sweep */}
      <div className="bg-[var(--surface-input)] border border-[var(--border)] rounded-xl p-3 mb-4 flex items-center justify-between">
        <div>
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-wider">Pending Round-Ups</p>
          <p className="font-manrope font-bold text-base tabular-nums text-[var(--teal)]">
            +{currency}{pendingTotal.toFixed(2)}
          </p>
          <p className="text-[length:var(--fs-overline)] text-[var(--text-dim)] font-inter">{roundUps.length} transactions</p>
        </div>
        <button
          onClick={handleSweep}
          disabled={pendingTotal <= 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--teal)] text-white rounded-xl font-bold text-xs border-none cursor-pointer hover:bg-[#0d9488] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles size={12} /> Sweep +15 XP
        </button>
      </div>

      <AnimatePresence>
        {lastAdded && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-xs font-bold text-[var(--teal)] mb-3"
          >
            ✨ Added {currency}{lastAdded.toFixed(2)} to vault! +15 XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* History toggle */}
      {vault.history.length > 0 && (
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between text-[length:var(--fs-caption)] font-bold text-[var(--text-muted)] hover:text-[var(--teal)] bg-transparent border-none cursor-pointer transition-colors py-2"
        >
          <span>Recent sweeps</span>
          <ChevronRight size={14} className={`transition-transform ${showHistory ? 'rotate-90' : ''}`} />
        </button>
      )}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-2">
              {vault.history.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center justify-between text-[length:var(--fs-caption)]">
                  <span className="text-[var(--text-muted)] font-inter truncate max-w-[60%]">{h.merchant}</span>
                  <span className="text-[var(--teal)] font-bold">+{currency}{h.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
