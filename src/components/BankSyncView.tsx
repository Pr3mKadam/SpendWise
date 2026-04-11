import { useState } from 'react';
import { Landmark, Link2, DownloadCloud, UploadCloud, SmartphoneNfc, MoreHorizontal, ShieldCheck, ArrowUpRight, Activity } from 'lucide-react';
import { Transaction, UPIAccount } from '../types';
import UPILinkModal from './UPILinkModal';
import ImportCSVModal from './ImportCSVModal';
import { UPI_PROVIDERS, generateMockUPITransactions } from '../utils/upiParser';

interface BankSyncViewProps {
  onAutoAddTransactions: (txs: Transaction[]) => void;
  currency?: string;
}

export default function BankSyncView({ onAutoAddTransactions, currency = '₹' }: BankSyncViewProps) {
  const [accounts, setAccounts] = useState<UPIAccount[]>([
    // Mock existing connected account for demo purposes
    // {
    //   id: 'mock-1',
    //   provider: 'phonepe',
    //   upiId: 'user@ybl',
    //   linkedAt: new Date().toISOString(),
    //   lastSynced: new Date().toISOString(),
    //   status: 'active'
    // }
  ]);
  
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

  const handleUPILinkSuccess = (data: { provider: typeof UPI_PROVIDERS[0], upiId: string }) => {
    setIsLinkModalOpen(false);

    // Create the account
    const newAccount: UPIAccount = {
      id: `acc-${Date.now()}`,
      provider: data.provider.id as any,
      upiId: data.upiId,
      linkedAt: new Date().toISOString(),
      lastSynced: new Date().toISOString(),
      status: 'active'
    };
    
    setAccounts(prev => [newAccount, ...prev]);

    // Generate mock transactions
    const mockTxs = generateMockUPITransactions(data.provider.name, 15);
    onAutoAddTransactions(mockTxs);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      
      {/* Header */}
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
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCSVModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{ background: 'var(--surface-card)', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', boxShadow: 'var(--shadow-card)', border: 'none', cursor: 'pointer' }}
          >
            <UploadCloud size={16} /> Upload Statement
          </button>
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 text-white"
            style={{ background: 'var(--teal)', boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)', fontFamily: 'var(--font-inter)', border: 'none', cursor: 'pointer' }}
          >
            <Link2 size={16} /> Link Account
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Connected Accounts (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card px-6 py-6">
            <h3 className="flex items-center gap-2 font-manrope font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
              <SmartphoneNfc size={18} style={{ color: 'var(--teal)' }} />
              Connected Accounts
            </h3>

            {accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed" style={{ borderColor: 'var(--border)', background: 'var(--surface-input)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--teal-dim)' }}>
                  <Link2 size={20} style={{ color: 'var(--teal)' }} />
                </div>
                <h4 className="font-inter font-semibold text-[15px] mb-1" style={{ color: 'var(--text-primary)' }}>No accounts linked</h4>
                <p className="font-inter text-sm mb-5 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
                  Link your preferred UPI app to automatically sync your spending history.
                </p>
                <button
                  onClick={() => setIsLinkModalOpen(true)}
                  className="font-inter text-xs font-bold text-teal-600 px-4 py-2 rounded-lg"
                  style={{ background: 'var(--teal-dim)' }}
                >
                  Connect an Account
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {accounts.map(acc => {
                  const providerDef = UPI_PROVIDERS.find(p => p.id === acc.provider) || UPI_PROVIDERS[0];
                  return (
                    <div key={acc.id} className="rounded-xl p-5 relative overflow-hidden group transition-all" style={{ border: '1px solid var(--border)', background: 'var(--surface-card)' }}>
                      {/* Active indicator dot */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }}></div>
                        <span className="font-inter text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--green)' }}>Active</span>
                      </div>

                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0" style={{ background: providerDef.color }}>
                          {providerDef.icon}
                        </div>
                        <div>
                          <p className="font-inter font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>{providerDef.name}</p>
                          <p className="font-inter text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{acc.upiId}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px dashed var(--border)' }}>
                        <div className="flex items-center gap-1.5">
                          <Activity size={12} style={{ color: 'var(--text-muted)' }} />
                          <span className="font-inter text-[10px]" style={{ color: 'var(--text-muted)' }}>Synced: {formatDate(acc.lastSynced)}</span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card px-6 py-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <ShieldCheck size={18} style={{ color: 'var(--red)' }} />
            </div>
            <div>
              <h4 className="font-inter font-bold text-[14px] mb-1" style={{ color: 'var(--text-primary)' }}>Bank-Grade Security</h4>
              <p className="font-inter text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
                SpendWise uses industry-standard 256-bit encryption. We only request read-only access to transaction histories. We can never move money or access your login credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Upload Banner */}
        <div className="space-y-6">
          <div className="card px-6 py-6" style={{ background: 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)', color: 'white', border: 'none' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <DownloadCloud size={24} color="white" />
            </div>
            <h3 className="font-manrope font-bold text-lg mb-2">Statement Parsing</h3>
            <p className="font-inter text-sm mb-6 text-teal-50" style={{ lineHeight: 1.5 }}>
              Don't want to link an account? You can download your transaction history CSV from your bank or UPI app and upload it directly.
            </p>
            
            <button
              onClick={() => setIsCSVModalOpen(true)}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-inter font-bold text-sm bg-white text-teal-700 transition-transform hover:scale-[1.02]"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
              <UploadCloud size={16} /> Upload CSV
            </button>
          </div>

          {/* Quick Guide */}
          <div className="card px-5 py-5">
            <h4 className="font-inter font-semibold text-[13px] uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>How to get your statement</h4>
            
            <ul className="space-y-4">
              {[
                { name: 'Google Pay', step: 'Profile > Settings > Privacy & Security > Data & Personalization > Download your data' },
                { name: 'PhonePe', step: 'History > Download Statement (Top Right)' },
                { name: 'HDFC Bank', step: 'Accounts > Enquire > Account Statement > Select Date > Download CSV' },
              ].map(guide => (
                <li key={guide.name} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--teal)' }}></div>
                  <div>
                    <span className="font-inter font-bold text-[13px]" style={{ color: 'var(--text-primary)' }}>{guide.name}</span>
                    <p className="font-inter text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{guide.step}</p>
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

      {/* Reusuing the core ImportCSVModal for statement uploads */}
      <ImportCSVModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        onImport={(tx) => {
          // Send individual transaction directly to the auto adder
          onAutoAddTransactions([tx]);
        }}
      />
    </div>
  );
}
