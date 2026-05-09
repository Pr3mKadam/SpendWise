import { useState, useEffect } from 'react';
import {
  Landmark, Link2, DownloadCloud, UploadCloud, SmartphoneNfc,
  Activity, RefreshCw, Zap, CreditCard, History, Sparkles,
  ShieldCheck, CheckCircle2, TrendingDown, Hash, Clock, ChevronDown,
  X, Brain, MoreVertical, ArrowLeft, Key, ChevronRight, Loader2
} from 'lucide-react';
import { Transaction, UPIAccount, UPIProvider, Category } from '../../types';
import CSVImporter from '../features/sync/CSVImporter';
import { UPI_PROVIDERS, generateMockUPITransactions } from '../../utils/parsers/upi';
import { RazorpayAuth, initiateRazorpayPayment, parseUPIPayment, rememberMerchant } from '../../utils/razorpaySync';
import { useStore } from '../../store';

interface BankSyncViewProps {
  onAutoAddTransactions: (txs: Transaction[]) => void;
  recentTransactions?: Transaction[];
  currency?: string;
}

type SyncView = 'dashboard' | 'select-source' | 'upi-link' | 'rzp-link' | 'pay-form' | 'pay-parsing' | 'pay-success' | 'pay-correction';
type WizardStep = 'upi-select' | 'upi-credentials' | 'upi-connecting' | 'upi-success';

const CATEGORIES: Category[] = [
  'Food', 'Transport', 'Shopping', 'Subscriptions',
  'Entertainment', 'Utilities', 'Health', 'Income', 'Transfer',
];

export default function BankSyncView({
  onAutoAddTransactions,
  recentTransactions = [],
  currency = '₹',
}: BankSyncViewProps) {
  const { razorpayKeys, setRazorpayKeys } = useStore();
  const [view, setView] = useState<SyncView>('dashboard');
  const [wizardStep, setWizardStep] = useState<WizardStep>('upi-select');
  const [accounts, setAccounts] = useState<UPIAccount[]>([]);
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);
  const [merchantMemoryCount, setMerchantMemoryCount] = useState(0);

  // Connection/Payment States
  const [selectedProvider, setSelectedProvider] = useState<typeof UPI_PROVIDERS[0] | null>(null);
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');
  const [rzpKeyId, setRzpKeyId] = useState('');
  const [rzpSecret, setRzpSecret] = useState('');
  const [saveLocal, setSaveLocal] = useState(true);

  // Payment states
  const [payAmount, setPayAmount] = useState('');
  const [payDesc, setPayDesc] = useState('');
  const [payUpiId, setPayUpiId] = useState('');
  const [lastTx, setLastTx] = useState<Transaction | null>(null);
  const [corrCategory, setCorrCat] = useState<Category>('Transfer');

  // Load Razorpay account from store or migration on mount
  useEffect(() => {
    const localKey = localStorage.getItem('spendwise_rzp_key');
    const localSecret = localStorage.getItem('spendwise_rzp_secret');
    
    if (localKey && localSecret) {
      setRazorpayKeys({ keyId: localKey, keySecret: localSecret });
      localStorage.removeItem('spendwise_rzp_key');
      localStorage.removeItem('spendwise_rzp_secret');
    }

    const key = razorpayKeys?.keyId || localKey;
    if (key) {
      setAccounts((p: UPIAccount[]) => {
        if (p.some(a => a.provider === 'razorpay' as any)) return p;
        return [...p, {
          id: 'rzp-auth',
          provider: 'razorpay',
          upiId: key.substring(0, 14) + '…',
          linkedAt: new Date().toISOString(),
          lastSynced: new Date().toISOString(),
          status: 'active',
        }];
      });
    }
    // Count merchant memory entries
    try {
      const mem = JSON.parse(localStorage.getItem('spendwise_merchant_memory') || '{}');
      setMerchantMemoryCount(Object.keys(mem).length);
    } catch { /* ignore */ }
  }, [razorpayKeys, setRazorpayKeys]);

  const handleUPILinkSuccess = (provider: typeof UPI_PROVIDERS[0], id: string) => {
    const newAccount: UPIAccount = {
      id: `acc-${Date.now()}`,
      provider: provider.id as UPIProvider,
      upiId: id,
      linkedAt: new Date().toISOString(),
      lastSynced: new Date().toISOString(),
      status: 'active',
    };
    setAccounts(prev => [newAccount, ...prev]);
    handleMockSync(newAccount);
    setView('dashboard');
  };

  const handleRazorpayConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rzpKeyId.trim() || !rzpSecret.trim()) return;
    if (saveLocal) {
      setRazorpayKeys({ keyId: rzpKeyId.trim(), keySecret: rzpSecret.trim() });
    }
    setAccounts((p: UPIAccount[]) => {
      const filtered = p.filter(a => a.provider !== 'razorpay' as any);
      return [{
        id: 'rzp-auth',
        provider: 'razorpay',
        upiId: rzpKeyId.substring(0, 14) + '…',
        linkedAt: new Date().toISOString(),
        lastSynced: new Date().toISOString(),
        status: 'active',
      }, ...filtered];
    });
    setView('dashboard');
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const keyId = razorpayKeys?.keyId;
    if (!keyId) { setView('rzp-link'); return; }

    const rupees = parseFloat(payAmount);
    if (!rupees || rupees <= 0) return;

    initiateRazorpayPayment({
      keyId,
      amount: rupees,
      description: payDesc.trim() || 'UPI Payment',
      prefillContact: payUpiId.trim() || undefined,
      onSuccess: async (result) => {
        setView('pay-parsing');
        const parsed = await parseUPIPayment(payDesc.trim() || result.description, payUpiId.trim());
        const tx: Transaction = {
          id: `rzp_pay_${result.razorpay_payment_id}`,
          date: new Date().toISOString(),
          amount: result.amount,
          type: 'debit',
          category: parsed.category,
          merchant: parsed.merchant,
          description: `Razorpay UPI · ${result.razorpay_payment_id}`,
          isNew: true,
          confidence: parsed.confidence,
          aiParsed: parsed.aiParsed,
          tags: ['upi', 'razorpay'],
        };
        setLastTx(tx);
        setCorrCat(parsed.category);
        onAutoAddTransactions([tx]);
        setView('pay-success');
      },
      onFailure: () => setView('pay-form'),
    });
  };

  const applyCorrection = () => {
    if (!lastTx) return;
    rememberMerchant(payUpiId.trim(), lastTx.merchant, corrCategory);
    onAutoAddTransactions([{ ...lastTx, category: corrCategory }]);
    setView('dashboard');
  };

  /** Mock sync for non-Razorpay providers */
  const handleMockSync = async (acc: UPIAccount) => {
    setSyncingAccountId(acc.id);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const providerDef = UPI_PROVIDERS.find((p: any) => p.id === acc.provider) || UPI_PROVIDERS[0];
      const mockTxs = generateMockUPITransactions(providerDef.name, 10);
      onAutoAddTransactions(mockTxs);
      setAccounts(p => p.map(a => a.id === acc.id ? { ...a, lastSynced: new Date().toISOString() } : a));
    } catch (err: any) {
      console.error(err);
    } finally {
      setSyncingAccountId(null);
    }
  };

  const handleSyncAccount = (acc: UPIAccount) => {
    if ((acc.provider as string) === 'razorpay') return;
    handleMockSync(acc);
  };

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

  const totalUPISpend = recentTransactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const aiParsedCount = recentTransactions.filter(t => t.aiParsed).length;
  const isRzpLinked = accounts.some(a => (a.provider as string) === 'razorpay');

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-headline">
            <Landmark size={22} style={{ color: 'var(--teal)' }} />
            Bank Sync & Ingestion
          </h2>
          <p className="text-caption mt-1 max-w-lg">
            Connect bank sources or make instant UPI payments with local AI categorisation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setView('pay-form')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--teal)] text-white font-manrope font-bold text-sm border-none shadow-lg shadow-teal-500/20 hover:opacity-90 transition-all active:scale-[0.98]"
          >
            <Zap size={16} />
            Make UPI Payment
          </button>
          <button 
            onClick={() => setView('select-source')}
            className="flex items-center justify-center p-3 rounded-xl bg-[var(--surface-input)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)] transition-all"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <TrendingDown size={16} />, label: 'Total UPI Spend', value: `${currency}${totalUPISpend.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, color: 'var(--red)' },
          { icon: <Hash size={16} />, label: 'Payments Made', value: String(recentTransactions.length), color: 'var(--teal)' },
          { icon: <Sparkles size={16} />, label: 'Local Parsing', value: String(aiParsedCount), color: '#a78bfa' },
          { icon: <Brain size={16} />, label: 'Merchants Learned', value: String(merchantMemoryCount), color: '#f59e0b' },
        ].map(stat => (
          <div key={stat.label} className="card px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: stat.color }}>{stat.icon}</span>
              <span className="font-inter text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">{stat.label}</span>
            </div>
            <p className="font-manrope font-bold text-xl text-[var(--text-primary)]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Connected Sources */}
          <div className="card px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 font-manrope font-bold text-lg text-[var(--text-primary)]">
                <SmartphoneNfc size={18} className="text-[var(--teal)]" />
                Connected Sources
              </h3>
              <button
                onClick={() => setView('select-source')}
                className="font-inter text-xs font-bold text-[var(--teal)] px-3 py-1.5 rounded-lg bg-[var(--teal-dim)] border-none cursor-pointer"
              >
                + Add Source
              </button>
            </div>

            {accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-input)]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[var(--teal-dim)]">
                  <Link2 size={20} className="text-[var(--teal)]" />
                </div>
                <h4 className="font-inter font-semibold text-[15px] mb-1 text-[var(--text-primary)]">No sources linked</h4>
                <p className="font-inter text-sm mb-5 max-w-sm mx-auto text-[var(--text-muted)]">
                  Link your UPI apps or Razorpay test key to auto-categorise spending.
                </p>
                <button
                  onClick={() => setView('select-source')}
                  className="font-inter text-xs font-bold text-teal-600 px-4 py-2 rounded-lg bg-[var(--teal-dim)] border-none cursor-pointer"
                >
                  Connect Source
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {accounts.map(acc => {
                  const isRzp = (acc.provider as string) === 'razorpay';
                  const providerDef = isRzp
                    ? { name: 'Razorpay', icon: <Zap size={18} />, color: '#3395FF' }
                    : UPI_PROVIDERS.find((p: any) => p.id === acc.provider) || UPI_PROVIDERS[0];

                  return (
                    <div key={acc.id} className="rounded-xl p-5 relative overflow-hidden border border-[var(--border)] bg-[var(--surface-card)]">
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
                        <span className="font-inter text-[10px] uppercase tracking-wider font-bold text-[var(--green)]">Active</span>
                      </div>
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0" style={{ background: providerDef.color }}>
                          {providerDef.icon}
                        </div>
                        <div>
                          <p className="font-inter font-semibold text-[14px] text-[var(--text-primary)]">{providerDef.name}</p>
                          <p className="font-inter text-[11px] font-medium text-[var(--text-muted)]">{acc.upiId}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-dashed border-[var(--border)]">
                        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                          <Activity size={12} />
                          <span className="font-inter text-[10px]">{formatDate(acc.lastSynced)}</span>
                        </div>
                        {!isRzp && (
                          <button onClick={() => handleSyncAccount(acc)} disabled={syncingAccountId === acc.id} className="flex items-center gap-1.5 text-[var(--teal)] border-none bg-transparent cursor-pointer font-bold text-[11px]">
                            <RefreshCw size={13} className={syncingAccountId === acc.id ? 'animate-spin' : ''} />
                            Sync
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div className="card px-6 py-6">
            <h3 className="flex items-center gap-2 font-manrope font-bold text-lg text-[var(--text-primary)] mb-4">
              <History size={18} className="text-[var(--teal)]" />
              Recent Ingested Payments
            </h3>
            {recentTransactions.length === 0 ? (
              <p className="text-center py-10 text-[var(--text-muted)] text-sm">No recent synced payments</p>
            ) : (
              <div className="space-y-1">
                {recentTransactions.slice(0, 8).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-[var(--surface-input)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--teal-dim)] shrink-0">
                        <CreditCard size={14} className="text-[var(--teal)]" />
                      </div>
                      <div>
                        <p className="font-inter font-semibold text-[13px] text-[var(--text-primary)]">{tx.merchant}</p>
                        <p className="font-inter text-[10px] text-[var(--text-muted)] flex items-center gap-1.5">
                          <Clock size={9} /> {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-inter font-bold text-[13px] text-[var(--red)]">−{currency}{tx.amount.toFixed(0)}</p>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--surface-input)] text-[var(--text-muted)]">{tx.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card px-6 py-6 border-none text-white shadow-xl" style={{ background: 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)' }}>
            <Sparkles size={20} className="mb-4 text-white/80" />
            <h3 className="font-manrope font-bold text-base mb-2">Heuristic Auto-Detection</h3>
            <p className="font-inter text-xs text-teal-50 leading-relaxed">
              Our local engine analyzes payment descriptions to automatically categorize spend without ever sending data to a server.
            </p>
          </div>
          <CSVImporter onImport={onAutoAddTransactions} />
        </div>
      </div>
    </div>
  );

  const renderSelectSource = () => (
    <div className="max-w-2xl mx-auto py-8 animate-scale-in">
      <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors border-none bg-transparent cursor-pointer font-semibold">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>
      <h2 className="text-headline mb-2">Connect a Source</h2>
      <p className="text-caption mb-8">Choose how you'd like to bring in your transaction data.</p>
      
      <div className="grid gap-4">
        {[
          { id: 'upi-link', icon: <Landmark size={24} />, label: 'Link UPI App', sub: 'GPay, PhonePe, Paytm, etc.', color: 'var(--teal)', bg: 'var(--teal-dim)' },
          { id: 'rzp-link', icon: <Zap size={24} />, label: 'Connect Razorpay', sub: 'Sync your Razorpay developer keys', color: '#3395FF', bg: 'rgba(51,149,255,0.1)' },
          { id: 'csv', label: 'CSV Import', sub: 'Already integrated in sidebar', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', disabled: true }
        ].map(opt => (
          <button 
            key={opt.id}
            onClick={() => !opt.disabled && setView(opt.id as any)}
            className={`w-full flex items-center gap-5 p-6 rounded-2xl border ${opt.disabled ? 'opacity-50 cursor-default border-[var(--border)]' : 'border-[var(--border)] hover:border-[var(--teal)] hover:shadow-lg hover:shadow-teal-500/5 cursor-pointer bg-[var(--surface-card)]'} transition-all text-left`}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: opt.bg, color: opt.color }}>
              {opt.icon || <UploadCloud size={24} />}
            </div>
            <div className="flex-1">
              <p className="font-manrope font-bold text-lg text-[var(--text-primary)]">{opt.label}</p>
              <p className="font-inter text-sm text-[var(--text-muted)] mt-1">{opt.sub}</p>
            </div>
            {!opt.disabled && <ChevronRight size={20} className="text-[var(--text-muted)]" />}
          </button>
        ))}
      </div>
    </div>
  );

  const renderUPILink = () => (
    <div className="max-w-md mx-auto py-8 animate-scale-in">
      <button onClick={() => setView('select-source')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 border-none bg-transparent cursor-pointer font-semibold">
        <ArrowLeft size={18} /> Back
      </button>
      
      {wizardStep === 'upi-select' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-manrope font-bold text-[var(--text-primary)] mb-6">Select App</h2>
          {UPI_PROVIDERS.map((p: any) => (
            <button key={p.id} onClick={() => { setSelectedProvider(p); setWizardStep('upi-credentials'); }} className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-[var(--teal)] transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: p.color }}>{p.icon}</div>
              <span className="font-inter font-bold text-[var(--text-primary)]">{p.name}</span>
              <ChevronRight size={18} className="ml-auto text-[var(--text-muted)]" />
            </button>
          ))}
        </div>
      )}

      {wizardStep === 'upi-credentials' && selectedProvider && (
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-white text-3xl shadow-lg" style={{ background: selectedProvider.color }}>{selectedProvider.icon}</div>
          <h3 className="text-xl font-manrope font-bold mb-2">Connect {selectedProvider.name}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-8">Enter your UPI ID to sync your history.</p>
          <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="name@upi" className="w-full p-4 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] focus:border-[var(--teal)] outline-none font-inter text-center text-lg mb-4" />
          {upiError && <p className="text-red-500 text-xs mb-4">{upiError}</p>}
          <button onClick={() => { setWizardStep('upi-connecting'); setTimeout(() => setWizardStep('upi-success'), 2000); setTimeout(() => handleUPILinkSuccess(selectedProvider, upiId), 3500); }} className="w-full py-4 rounded-xl bg-[var(--teal)] text-white font-bold border-none cursor-pointer">Verify & Link</button>
        </div>
      )}

      {wizardStep === 'upi-connecting' && (
        <div className="text-center py-12">
          <Loader2 size={48} className="animate-spin text-[var(--teal)] mx-auto mb-4" />
          <p className="font-manrope font-bold text-lg">Connecting to {selectedProvider?.name}...</p>
        </div>
      )}

      {wizardStep === 'upi-success' && (
        <div className="text-center py-12 animate-bounce-in">
          <CheckCircle2 size={64} className="text-[var(--teal)] mx-auto mb-4" />
          <p className="font-manrope font-bold text-xl">Success! Syncing History...</p>
        </div>
      )}
    </div>
  );

  const renderRazorpayLink = () => (
    <div className="max-w-md mx-auto py-8 animate-scale-in">
      <button onClick={() => setView('select-source')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 border-none bg-transparent cursor-pointer font-semibold">
        <ArrowLeft size={18} /> Back
      </button>
      <div className="card p-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6"><Zap size={32} className="text-[#3395FF]" /></div>
        <h2 className="text-2xl font-manrope font-bold mb-2">Razorpay Credentials</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">Use your test keys for simulation.</p>
        <form onSubmit={handleRazorpayConnect} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Key ID</label>
            <input type="text" value={rzpKeyId} onChange={e => setRzpKeyId(e.target.value)} placeholder="rzp_test_..." className="w-full p-4 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] outline-none text-sm font-inter" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Key Secret</label>
            <input type="password" value={rzpSecret} onChange={e => setRzpSecret(e.target.value)} placeholder="••••••••••••" className="w-full p-4 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] outline-none text-sm font-inter" />
          </div>
          <button type="submit" disabled={!rzpKeyId || !rzpSecret} className="w-full py-4 rounded-xl bg-[var(--teal)] text-white font-bold border-none cursor-pointer disabled:opacity-50 mt-4 shadow-lg shadow-teal-500/10">Save & Connect</button>
        </form>
      </div>
    </div>
  );

  const renderPayForm = () => (
    <div className="max-w-md mx-auto py-8 animate-scale-in">
      <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 border-none bg-transparent cursor-pointer font-semibold">
        <ArrowLeft size={18} /> Cancel
      </button>
      <div className="card p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-manrope font-bold">UPI Payment</h2>
          <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-widest">Test Mode</div>
        </div>
        <form onSubmit={handlePay} className="space-y-5">
          <div className="relative p-6 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)] text-center">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Amount to Pay</span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-manrope font-bold text-[var(--text-muted)]">{currency}</span>
              <input type="number" step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="bg-transparent border-none text-5xl font-manrope font-extrabold text-[var(--text-primary)] w-full max-w-[200px] outline-none text-center" placeholder="0" autoFocus />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Description / Merchant</label>
            <input type="text" value={payDesc} onChange={e => setPayDesc(e.target.value)} placeholder="What's this for?" className="w-full p-4 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] outline-none text-sm font-inter" />
          </div>
          <button type="submit" className="w-full py-4 rounded-xl bg-[var(--teal)] text-white font-bold border-none cursor-pointer shadow-xl shadow-teal-500/20 active:scale-[0.98] transition-all">Proceed to Payment</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="view-container">
      {view === 'dashboard' && renderDashboard()}
      {view === 'select-source' && renderSelectSource()}
      {view === 'upi-link' && renderUPILink()}
      {view === 'rzp-link' && renderRazorpayLink()}
      {view === 'pay-form' && renderPayForm()}
      {view === 'pay-parsing' && (
        <div className="flex flex-col items-center justify-center py-32 animate-pulse">
          <Brain size={48} className="text-[var(--teal)] mb-4" />
          <p className="font-manrope font-bold text-xl">Local AI is parsing payment...</p>
        </div>
      )}
      {view === 'pay-success' && lastTx && (
        <div className="max-w-md mx-auto py-12 text-center animate-bounce-in">
          <CheckCircle2 size={64} className="text-[var(--green)] mx-auto mb-6" />
          <h2 className="text-3xl font-manrope font-extrabold mb-2">Payment Sent!</h2>
          <p className="text-lg text-[var(--text-muted)] mb-8">₹{lastTx.amount.toFixed(0)} to {lastTx.merchant}</p>
          <div className="card p-6 mb-8 text-left">
            <div className="flex justify-between mb-4">
              <span className="text-sm text-[var(--text-muted)]">Detected Category</span>
              <span className="text-sm font-bold text-[var(--teal)]">{lastTx.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--text-muted)]">Engine Confidence</span>
              <span className="text-sm font-bold flex items-center gap-1"><Sparkles size={14} className="text-purple-500" /> High</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setView('pay-correction')} className="flex-1 py-4 rounded-xl bg-[var(--surface-input)] text-[var(--text-primary)] font-bold border border-[var(--border)] cursor-pointer">Fix Category</button>
            <button onClick={() => setView('dashboard')} className="flex-1 py-4 rounded-xl bg-[var(--teal)] text-white font-bold border-none cursor-pointer">Dashboard</button>
          </div>
        </div>
      )}
      {view === 'pay-correction' && lastTx && (
        <div className="max-w-md mx-auto py-12 animate-scale-in">
          <h2 className="text-2xl font-manrope font-bold mb-6">Correct Category</h2>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCorrCat(cat)} className={`p-4 rounded-xl border font-inter font-bold text-sm transition-all cursor-pointer ${corrCategory === cat ? 'bg-[var(--teal)] text-white border-transparent' : 'bg-[var(--surface-card)] text-[var(--text-muted)] border-[var(--border)]'}`}>{cat}</button>
            ))}
          </div>
          <button onClick={applyCorrection} className="w-full py-4 rounded-xl bg-[var(--teal)] text-white font-bold border-none cursor-pointer shadow-lg shadow-teal-500/20">Save Correction</button>
        </div>
      )}
    </div>
  );
}
