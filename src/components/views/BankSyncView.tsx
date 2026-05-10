import { useState, useEffect } from 'react';
import {
  Brain, CheckCircle2
} from 'lucide-react';
import { Transaction, UPIAccount, UPIProvider, Category } from '../../types';
import { UPI_PROVIDERS, generateMockUPITransactions } from '../../utils/parsers/upi';
import { initiateRazorpayPayment, parseUPIPayment, rememberMerchant } from '../../utils/razorpaySync';
import { useStore } from '../../store';

import SyncDashboard from '../features/sync/SyncDashboard';
import SelectSource from '../features/sync/SelectSource';
import UPILink from '../features/sync/UPILink';
import RazorpayLink from '../features/sync/RazorpayLink';
import PayForm from '../features/sync/PayForm';


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
  const [accounts, setAccounts] = useState<UPIAccount[]>([]);
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);
  const [merchantMemoryCount, setMerchantMemoryCount] = useState(0);

  const saveLocal = true;
  const payUpiId = '';
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



  const handlePay = (amount: number, description: string) => {
    const keyId = razorpayKeys?.keyId;
    if (!keyId) { setView('rzp-link'); return; }

    initiateRazorpayPayment({
      keyId,
      amount: amount,
      description: description || 'UPI Payment',
      prefillContact: payUpiId.trim() || undefined,
      onSuccess: async (result) => {
        setView('pay-parsing');
        const parsed = await parseUPIPayment(description || result.description, payUpiId.trim());
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

  const handleRazorpayConnect = (keyId: string, secret: string) => {
    if (saveLocal) {
      setRazorpayKeys({ keyId, keySecret: secret });
    }
    setAccounts((p: UPIAccount[]) => {
      const filtered = p.filter(a => a.provider !== 'razorpay' as any);
      return [{
        id: 'rzp-auth',
        provider: 'razorpay',
        upiId: keyId.substring(0, 14) + '…',
        linkedAt: new Date().toISOString(),
        lastSynced: new Date().toISOString(),
        status: 'active',
      }, ...filtered];
    });
    setView('dashboard');
  };

  return (
    <div className="view-container">
      {view === 'dashboard' && (
        <SyncDashboard
          totalUPISpend={totalUPISpend}
          aiParsedCount={aiParsedCount}
          merchantMemoryCount={merchantMemoryCount}
          accounts={accounts}
          recentTransactions={recentTransactions}
          syncingAccountId={syncingAccountId}
          onSyncAccount={handleSyncAccount}
          onSetView={setView}
          currency={currency}
          onAutoAddTransactions={onAutoAddTransactions}
        />
      )}
      {view === 'select-source' && <SelectSource onSetView={setView} />}
      {view === 'upi-link' && <UPILink onSetView={setView} onUPILinkSuccess={handleUPILinkSuccess} />}
      {view === 'rzp-link' && <RazorpayLink onSetView={setView} onConnect={handleRazorpayConnect} />}
      {view === 'pay-form' && <PayForm onSetView={setView} onPay={handlePay} currency={currency} />}
      
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
