import { useState, useEffect } from 'react';
import { Landmark, Link2, DownloadCloud, UploadCloud, SmartphoneNfc, ShieldCheck, Activity, RefreshCw, Zap } from 'lucide-react';
import { Transaction, UPIAccount } from '../types';
import UPILinkModal from './UPILinkModal';
import ImportCSVModal from './ImportCSVModal';
import RazorpayLinkModal from './RazorpayLinkModal';
import { UPI_PROVIDERS, generateMockUPITransactions } from '../utils/upiParser';
import { fetchRazorpayTransactions, RazorpayAuth } from '../utils/razorpaySync';

interface BankSyncViewProps {
  onAutoAddTransactions: (txs: Transaction[]) => void;
  currency?: string;
}

export default function BankSyncView({ onAutoAddTransactions, currency: _currency = '₹' }: BankSyncViewProps) {
  const [accounts, setAccounts] = useState<UPIAccount[]>([
    // Mock existing connected accounts for demo purposes
    {
      id: 'mock-1',
      provider: 'phonepe',
      upiId: 'user@ybl',
      linkedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      lastSynced: new Date(Date.now() - 3600000).toISOString(),
      status: 'active'
    },
    {
      id: 'mock-2',
      provider: 'gpay',
      upiId: 'user@okhdfcbank',
      linkedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      lastSynced: new Date(Date.now() - 14400000).toISOString(),
      status: 'active'
    }
  ]);
  
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);

  // Load Razorpay keys on mount if saved
  useEffect(() => {
    const key = localStorage.getItem('spendwise_rzp_key');
    if (key) {
      setAccounts(p => {
        if (p.some(a => a.provider === 'razorpay' as any)) return p;
        return [...p, {
          id: 'rzp-auth',
          provider: 'razorpay' as any,
          upiId: key.substring(0, 12) + '...',
          linkedAt: new Date().toISOString(),
          lastSynced: new Date().toISOString(),
          status: 'active'
        }];
      });
    }
  }, []);

  const handleUPILinkSuccess = (data: { provider: typeof UPI_PROVIDERS[0], upiId: string }) => {
    setIsLinkModalOpen(false);
    const newAccount: UPIAccount = {
      id: `acc-${Date.now()}`,
      provider: data.provider.id as any,
      upiId: data.upiId,
      linkedAt: new Date().toISOString(),
      lastSynced: new Date().toISOString(),
      status: 'active'
    };
    setAccounts(prev => [newAccount, ...prev]);
    // Optionally trigger an immediate sync
    handleSyncAccount(newAccount);
  };

  const handleRazorpayConnect = (auth: RazorpayAuth) => {
    setIsRazorpayModalOpen(false);
    setAccounts(p => {
      const filtered = p.filter(a => a.provider !== 'razorpay' as any);
      return [{
        id: 'rzp-auth',
        provider: 'razorpay' as any,
        upiId: auth.keyId.substring(0, 12) + '...',
        linkedAt: new Date().toISOString(),
        lastSynced: new Date().toISOString(),
        status: 'active'
      }, ...filtered];
    });
    // Trigger immediate sync
    handleSyncAccount({ provider: 'razorpay' as any, id: 'rzp-auth' } as UPIAccount);
  };

  const handleSyncAccount = async (acc: UPIAccount) => {
    setSyncingAccountId(acc.id);
    try {
      if (acc.provider === 'razorpay' as any) {
        // Real Razorpay Sync
        const keyId = localStorage.getItem('spendwise_rzp_key');
        const keySecret = localStorage.getItem('spendwise_rzp_secret');
        if (!keyId || !keySecret) {
           alert("Missing Razorpay Keys. Please reconnect.");
           setIsRazorpayModalOpen(true);
           setSyncingAccountId(null);
           return;
        }
        
        const txs = await fetchRazorpayTransactions({ keyId, keySecret });
        if (txs.length > 0) {
          onAutoAddTransactions(txs);
          alert(`Successfully synced ${txs.length} transactions from Razorpay!`);
        } else {
          alert('No recent captured transactions found in Razorpay out of the last 50.');
        }

      } else {
        // Mock Sync
        await new Promise(r => setTimeout(r, 1200)); // fake delay
        const providerDef = UPI_PROVIDERS.find(p => p.id === acc.provider) || UPI_PROVIDERS[0];
        const mockTxs = generateMockUPITransactions(providerDef.name, 10);
        onAutoAddTransactions(mockTxs);
      }

      // Update sync timestamp
      setAccounts(p => p.map(a => a.id === acc.id ? { ...a, lastSynced: new Date().toISOString() } : a));

    } catch (err: any) {
      console.error(err);
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncingAccountId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-headline">
            <Landmark size={22} style={{ color: 'var(--teal)' }} />
            Bank & UPI Sync
          </h2>
          <p className="text-caption mt-1 max-w-2xl">
            Securely connect your UPI apps to automatically import transactions, or upload a statement for offline parsing.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => setIsRazorpayModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none cursor-pointer"
          >
            <Zap size={16} /> Link Razorpay Data
          </button>
          <button
            onClick={() => setIsCSVModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors bg-[var(--surface-card)] text-[var(--text-secondary)] border-none shadow-[var(--shadow-card)] cursor-pointer"
          >
            <UploadCloud size={16} /> Upload Statement
          </button>
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all text-white bg-[var(--teal)] hover:opacity-90 shadow-lg shadow-teal-500/30 border-none cursor-pointer"
          >
            <Link2 size={16} /> Link Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card px-6 py-6">
            <h3 className="flex items-center gap-2 font-manrope font-bold text-lg mb-4 text-[var(--text-primary)]">
              <SmartphoneNfc size={18} className="text-[var(--teal)]" />
              Connected Accounts
            </h3>

            {accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-input)]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[var(--teal-dim)]">
                  <Link2 size={20} className="text-[var(--teal)]" />
                </div>
                <h4 className="font-inter font-semibold text-[15px] mb-1 text-[var(--text-primary)]">No accounts linked</h4>
                <p className="font-inter text-sm mb-5 max-w-sm mx-auto text-[var(--text-muted)]">
                  Link your preferred UPI app to automatically sync your spending history.
                </p>
                <button onClick={() => setIsLinkModalOpen(true)} className="font-inter text-xs font-bold text-teal-600 px-4 py-2 rounded-lg bg-[var(--teal-dim)] border-none cursor-pointer">
                  Connect an Account
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {accounts.map(acc => {
                  // Fallback for Razorpay visual
                  const isRzp = acc.provider === 'razorpay' as any;
                  const providerDef = isRzp 
                    ? { name: 'Razorpay API', icon: <Zap size={18} />, color: '#3395FF' } 
                    : UPI_PROVIDERS.find(p => p.id === acc.provider) || UPI_PROVIDERS[0];
                    
                  return (
                    <div key={acc.id} className="rounded-xl p-5 relative overflow-hidden group transition-all border border-[var(--border)] bg-[var(--surface-card)]">
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)]"></div>
                        <span className="font-inter text-[10px] uppercase tracking-wider font-bold text-[var(--green)]">Active</span>
                      </div>

                      <div className="flex items-start gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0`} style={{ background: providerDef.color }}>
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
                          <span className="font-inter text-[10px] text-[var(--text-muted)]">Synced: {formatDate(acc.lastSynced)}</span>
                        </div>
                        
                        <button 
                          onClick={() => handleSyncAccount(acc)}
                          disabled={syncingAccountId === acc.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-[var(--surface-input)] text-[var(--teal)] transition-colors border-none bg-transparent cursor-pointer disabled:opacity-50"
                        >
                           <RefreshCw size={13} className={syncingAccountId === acc.id ? 'animate-spin' : ''} />
                           <span className="font-inter text-[11px] font-bold">Sync Now</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card px-6 py-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-red-500/10">
              <ShieldCheck size={18} className="text-[var(--red)]" />
            </div>
            <div>
              <h4 className="font-inter font-bold text-[14px] mb-1 text-[var(--text-primary)]">Bank-Grade Security</h4>
              <p className="font-inter text-xs leading-5 text-[var(--text-muted)]">
                SpendWise uses industry-standard 256-bit encryption. We only request read-only access to transaction histories. We can never move money or access your login credentials.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card px-6 py-6 border-none text-white" style={{ background: 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-white/20">
              <DownloadCloud size={24} color="white" />
            </div>
            <h3 className="font-manrope font-bold text-lg mb-2">Statement Parsing</h3>
            <p className="font-inter text-sm mb-6 text-teal-50 leading-relaxed">
              Don't want to link an account? You can download your transaction history CSV from your bank or UPI app and upload it directly.
            </p>
            
            <button
              onClick={() => setIsCSVModalOpen(true)}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-inter font-bold text-sm bg-white text-teal-700 transition-transform hover:scale-[1.02] border-none cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            >
              <UploadCloud size={16} /> Upload CSV
            </button>
          </div>

          <div className="card px-5 py-5">
            <h4 className="font-inter font-semibold text-[13px] uppercase tracking-wider mb-4 text-[var(--text-muted)]">How to get your statement</h4>
            
            <ul className="space-y-4">
              {[
                { name: 'Google Pay', step: 'Profile > Settings > Privacy & Security > Download data' },
                { name: 'PhonePe', step: 'History > Download Statement (Top Right)' },
                { name: 'HDFC Bank', step: 'Accounts > Enquire > Account Statement > Download CSV' },
              ].map(guide => (
                <li key={guide.name} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-[var(--teal)]"></div>
                  <div>
                    <span className="font-inter font-bold text-[13px] text-[var(--text-primary)]">{guide.name}</span>
                    <p className="font-inter text-[11px] mt-0.5 text-[var(--text-muted)]">{guide.step}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <UPILinkModal 
        isOpen={isLinkModalOpen} 
        onClose={() => setIsLinkModalOpen(false)} 
        onSuccess={handleUPILinkSuccess} 
      />

      <ImportCSVModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        onImport={(txs) => {
          onAutoAddTransactions(txs);
        }}
      />

      <RazorpayLinkModal 
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        onSuccess={handleRazorpayConnect}
      />
    </div>
  );
}
