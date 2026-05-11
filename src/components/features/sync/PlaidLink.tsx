import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Building2, ShieldCheck, Loader2, Search, Lock, CreditCard, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PlaidLinkProps {
  onSetView: (view: any) => void;
  onPlaidLinkSuccess: (bankName: string, id: string) => void;
}

const BANKS = [
  { id: 'hdfc',   name: 'HDFC Bank',           color: '#004C8F', accounts: 2, balance: '₹1,24,500' },
  { id: 'icici',  name: 'ICICI Bank',           color: '#F05A28', accounts: 1, balance: '₹67,200'  },
  { id: 'sbi',    name: 'State Bank of India',  color: '#00539B', accounts: 3, balance: '₹2,10,000' },
  { id: 'axis',   name: 'Axis Bank',            color: '#97144D', accounts: 1, balance: '₹88,900'  },
  { id: 'kotak',  name: 'Kotak Mahindra',       color: '#ED1C24', accounts: 2, balance: '₹1,05,400' },
  { id: 'pnb',    name: 'Punjab National Bank', color: '#1B4E9B', accounts: 1, balance: '₹45,600'  },
  { id: 'chase',  name: 'Chase Bank',           color: '#117ACA', accounts: 2, balance: '₹3,20,000' },
  { id: 'boa',    name: 'Bank of America',      color: '#E31837', accounts: 1, balance: '₹2,80,000' },
];

// Simulated OAuth steps
const OAUTH_STEPS = [
  { label: 'Establishing secure connection…', duration: 700 },
  { label: 'Validating institution token…',   duration: 600 },
  { label: 'Fetching account metadata…',       duration: 900 },
  { label: 'Importing transaction history…',  duration: 1100 },
  { label: 'Categorising transactions with AI…', duration: 800 },
  { label: 'Finalising sync…',                duration: 500 },
];

export default function PlaidLink({ onSetView, onPlaidLinkSuccess }: PlaidLinkProps) {
  const [step, setStep] = useState<'intro' | 'select' | 'credentials' | 'oauth' | 'import' | 'success'>('intro');
  const [selectedBank, setSelectedBank] = useState<typeof BANKS[0] | null>(null);
  const [query, setQuery] = useState('');
  const [oauthStep, setOauthStep] = useState(0);
  const [importPct, setImportPct] = useState(0);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const filtered = BANKS.filter(b =>
    !query || b.name.toLowerCase().includes(query.toLowerCase())
  );

  // OAuth step progression
  useEffect(() => {
    if (step !== 'oauth') return;
    let idx = 0;
    const advance = () => {
      if (idx >= OAUTH_STEPS.length) {
        setStep('import');
        return;
      }
      setOauthStep(idx);
      idx++;
      setTimeout(advance, OAUTH_STEPS[idx - 1]?.duration ?? 800);
    };
    const t = setTimeout(advance, 400);
    return () => clearTimeout(t);
  }, [step]);

  // Import progress bar
  useEffect(() => {
    if (step !== 'import') return;
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 12 + 3;
      if (pct >= 100) { pct = 100; clearInterval(iv); setTimeout(() => setStep('success'), 500); }
      setImportPct(Math.round(pct));
    }, 80);
    return () => clearInterval(iv);
  }, [step]);

  // Auto-advance success
  useEffect(() => {
    if (step === 'success' && selectedBank) {
      const t = setTimeout(() => onPlaidLinkSuccess(selectedBank.name, `plaid-${selectedBank.id}-${Date.now()}`), 2500);
      return () => clearTimeout(t);
    }
  }, [step, selectedBank]);

  return (
    <div className="max-w-md mx-auto py-6 px-4">
      <AnimatePresence mode="wait">

        {/* ── INTRO ── */}
        {step === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <button onClick={() => onSetView('select-source')}
              className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--teal)] mb-8 bg-transparent border-none font-semibold cursor-pointer text-sm transition-colors">
              <ArrowLeft size={16} /> Back
            </button>

            {/* Logo */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mb-5 shadow-xl shadow-black/20">
                <Landmark size={30} className="text-white" />
              </div>
              <h2 className="font-manrope font-black text-2xl text-[var(--text-primary)] mb-2">Connect Your Bank</h2>
              <p className="text-sm text-[var(--text-muted)] font-inter max-w-xs leading-relaxed">
                SpendWise uses <strong>Plaid</strong> to securely link your accounts. We never store your credentials.
              </p>
            </div>

            {/* Security features */}
            <div className="space-y-3 mb-8">
              {[
                { icon: ShieldCheck, color: '#10b981', title: 'Bank-grade Security', desc: '256-bit AES encryption, read-only access' },
                { icon: Lock,        color: '#6366f1', title: 'Zero Credential Storage', desc: 'Login tokens never leave your device' },
                { icon: CreditCard,  color: '#f59e0b', title: 'Auto-categorisation', desc: 'AI tags every imported transaction' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--surface-input)] border border-[var(--border)]">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: f.color + '15' }}>
                    <f.icon size={16} style={{ color: f.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{f.title}</p>
                    <p className="text-[11px] text-[var(--text-muted)] font-inter">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6">
              <p className="text-[11px] text-amber-400 font-inter text-center">
                ⚠️ Demo mode — using simulated Plaid OAuth. Real integration requires a Plaid account + backend server.
              </p>
            </div>

            <button onClick={() => setStep('select')}
              className="w-full py-3.5 rounded-xl bg-black text-white font-bold text-sm border-none cursor-pointer hover:bg-gray-900 transition-colors shadow-lg">
              Select Institution →
            </button>
          </motion.div>
        )}

        {/* ── SELECT BANK ── */}
        {step === 'select' && (
          <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={() => setStep('intro')}
              className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--teal)] mb-5 bg-transparent border-none font-semibold cursor-pointer text-sm transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
            <h2 className="font-manrope font-bold text-xl text-[var(--text-primary)] mb-4">Select your bank</h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search institutions…"
                className="w-full pl-9 pr-4 py-2.5 bg-[var(--surface-input)] border border-[var(--border)] rounded-xl text-sm font-inter text-[var(--text-primary)] outline-none focus:border-[var(--teal)] transition-colors"
              />
            </div>

            <div className="grid gap-2.5 max-h-80 overflow-y-auto pr-1">
              {filtered.map(bank => (
                <button key={bank.id}
                  onClick={() => { setSelectedBank(bank); setStep('credentials'); }}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--teal)] bg-[var(--surface-card)] transition-all cursor-pointer text-left w-full group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: bank.color + '18', color: bank.color }}>
                    <Building2 size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[var(--text-primary)]">{bank.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-inter">{bank.accounts} account{bank.accounts > 1 ? 's' : ''} available</p>
                  </div>
                  <span className="text-[11px] font-bold text-[var(--text-muted)] group-hover:text-[var(--teal)] transition-colors">{bank.balance}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── CREDENTIALS (simulated) ── */}
        {step === 'credentials' && selectedBank && (
          <motion.div key="creds" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <button onClick={() => setStep('select')}
              className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--teal)] mb-6 bg-transparent border-none font-semibold cursor-pointer text-sm transition-colors">
              <ArrowLeft size={16} /> Back
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: selectedBank.color + '18' }}>
                <Building2 size={22} style={{ color: selectedBank.color }} />
              </div>
              <div>
                <h2 className="font-manrope font-bold text-lg text-[var(--text-primary)]">{selectedBank.name}</h2>
                <p className="text-[11px] text-[var(--text-muted)] font-inter">Simulated sign-in · Demo only</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <input value={credentials.username} onChange={e => setCredentials(p => ({ ...p, username: e.target.value }))}
                placeholder="Online Banking Username"
                className="w-full px-4 py-3 bg-[var(--surface-input)] border border-[var(--border)] rounded-xl text-sm font-inter text-[var(--text-primary)] outline-none focus:border-[var(--teal)] transition-colors"
              />
              <input type="password" value={credentials.password} onChange={e => setCredentials(p => ({ ...p, password: e.target.value }))}
                placeholder="Password"
                className="w-full px-4 py-3 bg-[var(--surface-input)] border border-[var(--border)] rounded-xl text-sm font-inter text-[var(--text-primary)] outline-none focus:border-[var(--teal)] transition-colors"
              />
            </div>

            <div className="bg-[var(--surface-input)] border border-[var(--border)] rounded-xl p-3 mb-5 flex items-start gap-2">
              <Lock size={13} className="text-[var(--teal)] mt-0.5 shrink-0" />
              <p className="text-[10px] text-[var(--text-muted)] font-inter leading-relaxed">
                Your credentials are sent directly to {selectedBank.name} via Plaid's secure encrypted channel. SpendWise never receives or stores them.
              </p>
            </div>

            <button onClick={() => setStep('oauth')}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white border-none cursor-pointer transition-colors shadow-md"
              style={{ background: selectedBank.color }}>
              Connect Securely →
            </button>
          </motion.div>
        )}

        {/* ── OAUTH PROGRESS ── */}
        {step === 'oauth' && selectedBank && (
          <motion.div key="oauth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
              style={{ background: selectedBank.color }}>
              <Building2 size={28} className="text-white" />
            </div>
            <h2 className="font-manrope font-bold text-xl text-[var(--text-primary)] mb-2">Connecting…</h2>

            <div className="space-y-2 my-8 text-left max-w-xs mx-auto">
              {OAUTH_STEPS.map((s, i) => (
                <div key={i} className={`flex items-center gap-2.5 text-sm transition-all ${i === oauthStep ? 'text-[var(--teal)]' : i < oauthStep ? 'text-[var(--text-muted)]' : 'text-[var(--text-dim)]'}`}>
                  {i < oauthStep
                    ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    : i === oauthStep
                      ? <Loader2 size={14} className="animate-spin shrink-0" />
                      : <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--border)] shrink-0" />}
                  <span className="font-inter text-[12px]">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── IMPORT PROGRESS ── */}
        {step === 'import' && selectedBank && (
          <motion.div key="import" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: selectedBank.color }}>
              <Building2 size={28} className="text-white" />
            </div>
            <h2 className="font-manrope font-bold text-xl text-[var(--text-primary)] mb-1">Importing Transactions</h2>
            <p className="text-sm text-[var(--text-muted)] font-inter mb-8">Fetching up to 90 days of history…</p>

            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-2">
                <span>Progress</span><span>{importPct}%</span>
              </div>
              <div className="h-2.5 bg-[var(--surface-input)] rounded-full overflow-hidden border border-[var(--border)]">
                <motion.div className="h-full rounded-full"
                  style={{ width: `${importPct}%`, background: selectedBank.color }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p className="text-[10px] text-[var(--text-dim)] font-inter mt-3">
                AI categorisation running in parallel…
              </p>
            </div>
          </motion.div>
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && selectedBank && (
          <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>
            <h2 className="font-manrope font-black text-2xl text-[var(--text-primary)] mb-2">Account Linked!</h2>
            <p className="text-sm text-[var(--text-muted)] font-inter mb-6">
              {selectedBank.name} connected successfully.<br />90 days of transactions imported.
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {[
                { label: 'Accounts', value: selectedBank.accounts },
                { label: 'Transactions', value: '~47' },
                { label: 'Balance', value: selectedBank.balance },
              ].map(s => (
                <div key={s.label} className="bg-[var(--surface-input)] border border-[var(--border)] rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{s.label}</p>
                  <p className="font-manrope font-black text-sm mt-1 text-[var(--text-primary)]">{s.value}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-inter mt-6 animate-pulse">Redirecting to dashboard…</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
