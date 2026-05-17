import React, { useMemo, useState } from 'react';
import { AlertTriangle, TrendingUp, Mail, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '../../../types';

interface PriceHikeDetectorProps {
  transactions: Transaction[];
  currency: string;
}

interface HikeAlert {
  merchant: string;
  oldAmount: number;
  newAmount: number;
  changePct: number;
  lastDate: string;
}

function CancellationEmail({ merchant, onClose }: { merchant: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const subject = `Cancel My Subscription - ${merchant}`;
  const body = `Dear ${merchant} Support Team,\n\nI am writing to request the immediate cancellation of my subscription/service.\n\nAccount holder: [Your Name]\nAccount email: [Your Email]\n\nPlease confirm the cancellation and ensure no further charges are processed.\n\nBest regards,\n[Your Name]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="card w-full max-w-md p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-manrope font-bold text-base text-[var(--text-primary)]">Cancel {merchant}</h3>
          <button onClick={onClose} className="p-1 hover:text-red-500 text-[var(--text-muted)] bg-transparent border-none cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-3 font-inter">Email template ready to send:</p>
        <div className="bg-[var(--surface-input)] border border-[var(--border)] rounded-xl p-4 text-xs font-inter text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
          <strong className="text-[var(--text-primary)]">Subject:</strong> {subject}{'\n\n'}{body}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleCopy} className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-[var(--border)] text-[var(--text-primary)] bg-[var(--surface-input)] hover:border-[var(--teal)] hover:text-[var(--teal)] transition-all cursor-pointer">
            {copied ? '✅ Copied!' : 'Copy Template'}
          </button>
          <button
            onClick={() => window.open(`mailto:support@${merchant.toLowerCase().replace(/\s+/g,'')}.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-[var(--teal)] text-white border-none cursor-pointer hover:bg-[#0d9488] transition-colors flex items-center justify-center gap-2"
          >
            <Mail size={14} /> Open Mail
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function PriceHikeDetector({ transactions, currency }: PriceHikeDetectorProps) {
  const [expanded, setExpanded] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const hikeAlerts = useMemo((): HikeAlert[] => {
    const merchantMap: Record<string, { amounts: number[]; lastDate: string }> = {};
    transactions.filter(t => t.type === 'debit').sort((a, b) => a.date.localeCompare(b.date)).forEach(t => {
      if (!merchantMap[t.merchant]) merchantMap[t.merchant] = { amounts: [], lastDate: t.date };
      merchantMap[t.merchant].amounts.push(t.amount);
      merchantMap[t.merchant].lastDate = t.date;
    });
    return Object.entries(merchantMap).reduce<HikeAlert[]>((acc, [merchant, data]) => {
      if (data.amounts.length < 2) return acc;
      const oldAvg = data.amounts.slice(0,-1).reduce((a,b)=>a+b,0) / (data.amounts.length-1);
      const newAmt = data.amounts[data.amounts.length-1];
      const pct = ((newAmt - oldAvg) / oldAvg) * 100;
      if (pct > 10) acc.push({ merchant, oldAmount: Math.round(oldAvg*100)/100, newAmount: newAmt, changePct: Math.round(pct), lastDate: data.lastDate });
      return acc;
    }, []).sort((a,b) => b.changePct - a.changePct);
  }, [transactions]);

  if (hikeAlerts.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
        <span className="text-lg">✅</span>
        <div>
          <p className="text-sm font-bold text-emerald-400">No Price Hikes Detected</p>
          <p className="text-[length:var(--fs-caption)] text-emerald-400/70 font-inter">Your recurring charges appear stable</p>
        </div>
      </div>
    );
  }

  const visible = expanded ? hikeAlerts : hikeAlerts.slice(0, 2);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={16} className="text-amber-500" />
          <h4 className="font-manrope font-bold text-sm text-[var(--text-primary)]">Price Hike Alerts</h4>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[length:var(--fs-overline)] font-bold">{hikeAlerts.length} detected</span>
        </div>
        <AnimatePresence>
          {visible.map(alert => (
            <motion.div key={alert.merchant} layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <TrendingUp size={16} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">{alert.merchant}</p>
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[length:var(--fs-overline)] font-bold">+{alert.changePct}%</span>
                </div>
                <p className="text-[length:var(--fs-caption)] text-[var(--text-muted)] font-inter">Was {currency}{alert.oldAmount} → Now {currency}{alert.newAmount}</p>
              </div>
              <button onClick={() => setCancelTarget(alert.merchant)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-[length:var(--fs-overline)] font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border-none cursor-pointer transition-colors">
                Cancel
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {hikeAlerts.length > 2 && (
          <button onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 text-[length:var(--fs-caption)] font-bold text-[var(--text-muted)] hover:text-[var(--teal)] py-2 bg-transparent border-none cursor-pointer transition-colors">
            {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            {expanded ? 'Show less' : `View ${hikeAlerts.length-2} more alerts`}
          </button>
        )}
      </div>
      <AnimatePresence>
        {cancelTarget && <CancellationEmail merchant={cancelTarget} onClose={() => setCancelTarget(null)} />}
      </AnimatePresence>
    </>
  );
}
