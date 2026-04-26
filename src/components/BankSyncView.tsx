import { useState, useEffect } from 'react';
import {
  Landmark, Link2, DownloadCloud, UploadCloud, SmartphoneNfc,
  Activity, RefreshCw, Zap, CreditCard, History, Sparkles,
  ShieldCheck, CheckCircle2, TrendingDown, Hash, Clock, ChevronDown,
  X, Brain
} from 'lucide-react';
import { Transaction, UPIAccount, UPIProvider } from '../types';
import UPILinkModal from './UPILinkModal';
import ImportCSVModal from './ImportCSVModal';
import RazorpayLinkModal from './RazorpayLinkModal';
import UPISyncPaymentModal from './UPISyncPaymentModal';
import { UPI_PROVIDERS, generateMockUPITransactions } from '../utils/upiParser';

interface BankSyncViewProps {
  onAutoAddTransactions: (txs: Transaction[]) => void;
  recentTransactions?: Transaction[];
  currency?: string;
}

export default function BankSyncView({
  onAutoAddTransactions,
  recentTransactions = [],
  currency: _currency = '₹',
}: BankSyncViewProps) {
  const [accounts, setAccounts] = useState<UPIAccount[]>([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [merchantMemoryCount, setMerchantMemoryCount] = useState(0);

  // Load Razorpay account from localStorage on mount
  useEffect(() => {
    const key = localStorage.getItem('spendwise_rzp_key');
    if (key) {
      setAccounts(p => {
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
  }, []);

  const handleUPILinkSuccess = (data: { provider: typeof UPI_PROVIDERS[0]; upiId: string }) => {
    setIsLinkModalOpen(false);
    const newAccount: UPIAccount = {
      id: `acc-${Date.now()}`,
      provider: data.provider.id as UPIProvider,
      upiId: data.upiId,
      linkedAt: new Date().toISOString(),
      lastSynced: new Date().toISOString(),
      status: 'active',
    };
    setAccounts(prev => [newAccount, ...prev]);
    handleMockSync(newAccount);
  };

  const handleRazorpayConnect = (auth: { keyId: string; keySecret: string }) => {
    setIsRazorpayModalOpen(false);
    setAccounts(p => {
      const filtered = p.filter(a => a.provider !== 'razorpay' as any);
      return [{
        id: 'rzp-auth',
        provider: 'razorpay',
        upiId: auth.keyId.substring(0, 14) + '…',
        linkedAt: new Date().toISOString(),
        lastSynced: new Date().toISOString(),
        status: 'active',
      }, ...filtered];
    });
  };

  /** Mock sync for non-Razorpay providers */
  const handleMockSync = async (acc: UPIAccount) => {
    setSyncingAccountId(acc.id);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const providerDef = UPI_PROVIDERS.find(p => p.id === acc.provider) || UPI_PROVIDERS[0];
      const mockTxs = generateMockUPITransactions(providerDef.name, 10);
      onAutoAddTransactions(mockTxs);
      setAccounts(p => p.map(a => a.id === acc.id ? { ...a, lastSynced: new Date().toISOString() } : a));
    } catch (err: any) {
      console.error(err);
    } finally {
      setSyncingAccountId(null);
    }
  };

  /** For Razorpay accounts: payments are captured via checkout — no API polling needed */
  const handleSyncAccount = (acc: UPIAccount) => {
    if ((acc.provider as string) === 'razorpay') {
      // Razorpay's REST API is server-side only (CORS blocked in browser).
      // Payments are auto-captured via the checkout handler — nothing to do here.
      return;
    }
    handleMockSync(acc);
  };

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

  // Stats derived from recent UPI transactions
  const totalUPISpend = recentTransactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const aiParsedCount = recentTransactions.filter(t => t.aiParsed).length;
  // const lastPayment = recentTransactions[0];

  const isRzpLinked = accounts.some(a => (a.provider as string) === 'razorpay');

  return (
    <div className="animate-fade-in-up space-y-6">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-headline">
            <Landmark size={22} style={{ color: 'var(--teal)' }} />
            Local Heuristic Engine
          </h2>
          <p className="text-caption mt-1 max-w-lg">
            Make UPI payments and watch them auto-categorise into your dashboard via offline parsing.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Primary Action */}
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all text-white bg-[var(--teal)] hover:opacity-90 shadow-lg shadow-teal-500/30 border-none cursor-pointer"
          >
            <CreditCard size={16} /> Make UPI Payment
          </button>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(v => !v)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all text-[var(--text-secondary)] bg-[var(--surface-card)] hover:bg-[var(--surface-input)] shadow-[var(--shadow-card)] border-none cursor-pointer"
            >
              More <ChevronDown size={14} className={`transition-transform ${showMoreMenu ? 'rotate-180' : ''}`} />
            </button>
            {showMoreMenu && (
              <div
                className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl bg-[var(--surface-card)] border border-[var(--border)] shadow-xl overflow-hidden"
                onMouseLeave={() => setShowMoreMenu(false)}
              >
                <button onClick={() => { setIsRazorpayModalOpen(true); setShowMoreMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-input)] transition-colors border-none bg-transparent cursor-pointer text-left font-inter">
                  <Zap size={15} className="text-blue-500" /> Link Razorpay Key
                </button>
                <button onClick={() => { setIsCSVModalOpen(true); setShowMoreMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-input)] transition-colors border-none bg-transparent cursor-pointer text-left font-inter">
                  <UploadCloud size={15} className="text-[var(--text-muted)]" /> Upload CSV Statement
                </button>
                <button onClick={() => { setIsLinkModalOpen(true); setShowMoreMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-input)] transition-colors border-none bg-transparent cursor-pointer text-left font-inter">
                  <Link2 size={15} className="text-[var(--text-muted)]" /> Link UPI Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: <TrendingDown size={16} />,
            label: 'Total UPI Spend',
            value: `₹${totalUPISpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            color: 'var(--red)',
          },
          {
            icon: <Hash size={16} />,
            label: 'Payments Made',
            value: String(recentTransactions.length),
            color: 'var(--teal)',
          },
          {
            icon: <Sparkles size={16} />,
            label: 'Local Parsing',
            value: String(aiParsedCount),
            color: '#a78bfa',
          },
          {
            icon: <Brain size={16} />,
            label: 'Merchants Learned',
            value: String(merchantMemoryCount),
            color: '#f59e0b',
          },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* ── Connected Accounts ───────────────────────────────── */}
          <div className="card px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 font-manrope font-bold text-lg text-[var(--text-primary)]">
                <SmartphoneNfc size={18} className="text-[var(--teal)]" />
                Connected Sources
              </h3>
              {!isRzpLinked && (
                <button
                  onClick={() => setIsRazorpayModalOpen(true)}
                  className="font-inter text-xs font-bold text-[var(--teal)] px-3 py-1.5 rounded-lg bg-[var(--teal-dim)] border-none cursor-pointer"
                >
                  + Add Razorpay
                </button>
              )}
            </div>

            {accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-input)]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[var(--teal-dim)]">
                  <Link2 size={20} className="text-[var(--teal)]" />
                </div>
                <h4 className="font-inter font-semibold text-[15px] mb-1 text-[var(--text-primary)]">No sources linked</h4>
                <p className="font-inter text-sm mb-5 max-w-sm mx-auto text-[var(--text-muted)]">
                  Link your Razorpay test key to use the UPI payment checkout and auto-categorise spending.
                </p>
                <button
                  onClick={() => setIsRazorpayModalOpen(true)}
                  className="font-inter text-xs font-bold text-teal-600 px-4 py-2 rounded-lg bg-[var(--teal-dim)] border-none cursor-pointer"
                >
                  Link Razorpay Key
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {accounts.map(acc => {
                  const isRzp = (acc.provider as string) === 'razorpay';
                  const providerDef = isRzp
                    ? { name: 'Razorpay', icon: <Zap size={18} />, color: '#3395FF' }
                    : UPI_PROVIDERS.find(p => p.id === acc.provider) || UPI_PROVIDERS[0];

                  return (
                    <div key={acc.id} className="rounded-xl p-5 relative overflow-hidden border border-[var(--border)] bg-[var(--surface-card)]">
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
                        <span className="font-inter text-[10px] uppercase tracking-wider font-bold text-[var(--green)]">Active</span>
                      </div>

                      <div className="flex items-start gap-3 mb-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                          style={{ background: providerDef.color }}
                        >
                          {providerDef.icon}
                        </div>
                        <div>
                          <p className="font-inter font-semibold text-[14px] text-[var(--text-primary)]">{providerDef.name}</p>
                          <p className="font-inter text-[11px] font-medium text-[var(--text-muted)]">{acc.upiId}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-dashed border-[var(--border)]">
                        <div className="flex items-center gap-1.5">
                          <Activity size={12} className="text-[var(--text-muted)]" />
                          <span className="font-inter text-[10px] text-[var(--text-muted)]">
                            {formatDate(acc.lastSynced)}
                          </span>
                        </div>

                        {isRzp ? (
                          /* Razorpay: payments captured via checkout — no polling */
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10">
                            <CheckCircle2 size={11} className="text-green-500" />
                            <span className="font-inter text-[10px] font-bold text-green-600">Auto-detected</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSyncAccount(acc)}
                            disabled={syncingAccountId === acc.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-[var(--surface-input)] text-[var(--teal)] transition-colors border-none bg-transparent cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw size={13} className={syncingAccountId === acc.id ? 'animate-spin' : ''} />
                            <span className="font-inter text-[11px] font-bold">Sync Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Recent UPI Payments (always shown) ──────────────── */}
          <div className="card px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 font-manrope font-bold text-lg text-[var(--text-primary)]">
                <History size={18} className="text-[var(--teal)]" />
                Recent UPI Payments
              </h3>
              {recentTransactions.length > 0 && (
                <span className="font-inter text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] bg-[var(--surface-input)] px-2 py-1 rounded-full">
                  {recentTransactions.length} total
                </span>
              )}
            </div>

            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-[var(--teal-dim)]">
                  <CreditCard size={22} className="text-[var(--teal)]" />
                </div>
                <p className="font-inter font-semibold text-[14px] mb-1 text-[var(--text-primary)]">No payments yet</p>
                <p className="font-inter text-sm text-[var(--text-muted)] mb-4 max-w-xs">
                  Make a test UPI payment and it'll appear here — auto-categorised locally.
                </p>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="font-inter text-xs font-bold text-white px-4 py-2 rounded-lg bg-[var(--teal)] border-none cursor-pointer"
                >
                  Make First Payment
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {recentTransactions.slice(0, 10).map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-[var(--surface-input)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--teal-dim)] shrink-0">
                        <CreditCard size={14} className="text-[var(--teal)]" />
                      </div>
                      <div>
                        <p className="font-inter font-semibold text-[13px] text-[var(--text-primary)]">{tx.merchant}</p>
                        <p className="font-inter text-[10px] text-[var(--text-muted)] flex items-center gap-1.5">
                          <Clock size={9} />
                          {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {tx.aiParsed && (
                            <span className="inline-flex items-center gap-0.5 text-[var(--teal)] font-semibold">
                              <Sparkles size={8} /> Local
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-inter font-bold text-[13px] ${tx.type === 'debit' ? 'text-[var(--red)]' : 'text-[var(--green)]'}`}>
                        {tx.type === 'debit' ? '−' : '+'}₹{tx.amount.toFixed(2)}
                      </p>
                      <span className="inline-block font-inter text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--surface-input)] text-[var(--text-muted)]">
                        {tx.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* How it works */}
          <div className="card px-6 py-6 border-none text-white" style={{ background: 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-white/20">
              <Sparkles size={20} color="white" />
            </div>
            <h3 className="font-manrope font-bold text-base mb-2">How Auto-Detection Works</h3>
            <ol className="space-y-2.5 font-inter text-sm text-teal-50">
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/20 shrink-0 flex items-center justify-center text-[10px] font-bold">1</span>
                Click <strong className="text-white">Make UPI Payment</strong>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/20 shrink-0 flex items-center justify-center text-[10px] font-bold">2</span>
                Enter amount + description (e.g. "Zomato lunch")
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/20 shrink-0 flex items-center justify-center text-[10px] font-bold">3</span>
                Local parsing auto-assigns category
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/20 shrink-0 flex items-center justify-center text-[10px] font-bold">4</span>
                Dashboard updates instantly ✓
              </li>
            </ol>
          </div>

          {/* Test Mode Tip */}
          <div className="card px-5 py-5 border border-blue-500/20 bg-blue-500/5">
            <div className="flex items-start gap-3">
              <Zap size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-inter font-bold text-sm text-blue-600 mb-1">Test Mode Active</p>
                <p className="font-inter text-xs text-[var(--text-muted)] leading-5">
                  Use UPI ID{' '}
                  <code className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded font-mono text-[11px]">success@razorpay</code>{' '}
                  in the Razorpay checkout to simulate a successful payment.
                </p>
              </div>
            </div>
          </div>

          {/* Merchant Memory */}
          <div className="card px-5 py-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-amber-500" />
              <p className="font-inter font-bold text-sm text-[var(--text-primary)]">Merchant Memory</p>
            </div>
            <p className="font-inter text-xs text-[var(--text-muted)] leading-5 mb-3">
              SpendWise remembers merchant → category mappings so repeat payments are categorised instantly.
            </p>
            <div className="flex items-center justify-between">
              <span className="font-inter text-[10px] text-[var(--text-muted)]">Learned merchants</span>
              <span className="font-manrope font-bold text-lg text-[var(--text-primary)]">{merchantMemoryCount}</span>
            </div>
            {merchantMemoryCount > 0 && (
              <button
                onClick={() => {
                  localStorage.removeItem('spendwise_merchant_memory');
                  setMerchantMemoryCount(0);
                }}
                className="mt-3 w-full flex items-center justify-center gap-1.5 text-[10px] font-inter font-semibold text-[var(--text-muted)] hover:text-[var(--red)] transition-colors border-none bg-transparent cursor-pointer py-1"
              >
                <X size={10} /> Clear memory
              </button>
            )}
          </div>

          {/* Security */}
          <div className="card px-5 py-5 flex items-start gap-3">
            <ShieldCheck size={18} className="text-[var(--teal)] shrink-0 mt-0.5" />
            <div>
              <p className="font-inter font-bold text-[13px] text-[var(--text-primary)] mb-1">Secure by Design</p>
              <p className="font-inter text-xs leading-5 text-[var(--text-muted)]">
                API keys are stored only in your browser's <code className="text-[11px] bg-[var(--surface-input)] px-1 rounded">localStorage</code>. No data leaves your device.
              </p>
            </div>
          </div>

          {/* CSV Upload */}
          <div className="card px-5 py-5">
            <div className="flex items-center gap-2 mb-2">
              <DownloadCloud size={16} className="text-[var(--text-muted)]" />
              <p className="font-inter font-bold text-sm text-[var(--text-primary)]">Import Statement</p>
            </div>
            <p className="font-inter text-xs text-[var(--text-muted)] mb-3 leading-5">
              Upload a CSV export from HDFC, SBI, or any UPI app.
            </p>
            <button
              onClick={() => setIsCSVModalOpen(true)}
              className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-inter font-bold text-sm bg-[var(--surface-input)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--teal)] hover:text-[var(--teal)] transition-colors border-solid cursor-pointer"
            >
              <UploadCloud size={14} /> Upload CSV
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <UPILinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSuccess={handleUPILinkSuccess}
      />

      <ImportCSVModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        onImport={txs => onAutoAddTransactions(txs)}
      />

      <RazorpayLinkModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        onSuccess={handleRazorpayConnect}
      />

      <UPISyncPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentComplete={tx => {
          onAutoAddTransactions([tx]);
          setIsPaymentModalOpen(false);
          // Refresh memory count
          try {
            const mem = JSON.parse(localStorage.getItem('spendwise_merchant_memory') || '{}');
            setMerchantMemoryCount(Object.keys(mem).length);
          } catch { /* ignore */ }
        }}
      />
    </div>
  );
}
