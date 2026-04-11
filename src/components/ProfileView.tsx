import { useState, useCallback, useEffect } from 'react';
import { User, Globe, Download, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SpendWiseConfig } from './OnboardingModal';
import { exportTransactionsToCSV } from '../utils/exportCSV';
import { Transaction } from '../types';
import TwoFactorModal from './TwoFactorModal';
import { supabase } from '../services/supabaseClient';

interface ProfileViewProps {
  config: SpendWiseConfig | null;
  onUpdateConfig: (cfg: SpendWiseConfig) => void;
  onResetData: () => void;
  transactions: Transaction[];
}

const STORAGE_KEY = 'spendwise_config_v1';

const COMMON_CURRENCIES = [
  { code: '$',  name: 'US Dollar (USD)',       flag: '🇺🇸' },
  { code: '€',  name: 'Euro (EUR)',            flag: '🇪🇺' },
  { code: '£',  name: 'British Pound (GBP)',   flag: '🇬🇧' },
  { code: '₹',  name: 'Indian Rupee (INR)',    flag: '🇮🇳' },
  { code: '¥',  name: 'Japanese Yen (JPY)',    flag: '🇯🇵' },
  { code: 'A$', name: 'Australian Dollar (AUD)', flag: '🇦🇺' },
  { code: 'C$', name: 'Canadian Dollar (CAD)', flag: '🇨🇦' },
  { code: 'AED', name: 'UAE Dirham (AED)',     flag: '🇦🇪' },
];

export default function ProfileView({ config, onUpdateConfig, onResetData, transactions }: ProfileViewProps) {
  const [name, setName] = useState(config?.name ?? 'User');
  const [currency, setCurrency] = useState(config?.currency ?? '$');
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const [mfaEnrolled, setMfaEnrolled] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);

  const fetchMfaStatus = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (!error && data?.totp && data.totp.length > 0) {
        const hasVerified = data.totp.some(f => f.status === 'verified');
        setMfaEnrolled(hasVerified);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void fetchMfaStatus();
  }, [fetchMfaStatus]);

  const handleSave = useCallback(() => {
    if (!config) return;
    const updated: SpendWiseConfig = { ...config, name, currency };
    onUpdateConfig(updated);
    // Persist directly to the same key that loadConfig() reads.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 3000);
  }, [config, name, currency, onUpdateConfig]);

  const handleUnenrollMfa = async () => {
    if (!supabase || !window.confirm('Are you sure you want to disable Two-Factor Authentication?')) return;
    setUnenrolling(true);
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const verifiedFactor = data?.totp?.find(f => f.status === 'verified');
      if (verifiedFactor) {
        await supabase.auth.mfa.unenroll({ factorId: verifiedFactor.id });
        setMfaEnrolled(false);
      }
    } catch {
      alert('Failed to disable 2FA.');
    } finally {
      setUnenrolling(false);
    }
  };

  const handleExportCSV = () => exportTransactionsToCSV(transactions);

  return (
    <div className="animate-fade-in-up max-w-[800px] mx-auto space-y-8">

      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2 text-headline">
          <User size={22} style={{ color: 'var(--teal)' }} />
          Profile & Settings
        </h2>
        <p className="text-caption mt-1">Manage your personal details, localization, and data exports.</p>
      </div>

      {/* Profile Form */}
      <div className="card">
        <div className="px-6 py-5" style={{ borderBottom: '1.5px solid var(--border)' }}>
          <h3 className="font-manrope font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Personal Information
          </h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Display Name */}
          <div className="max-w-md">
            <label className="block font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full font-inter text-sm px-4 py-3 rounded-xl focus:outline-none transition-colors"
              style={{ background: 'var(--surface-input)', color: 'var(--text-primary)', border: '2px solid transparent' }}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'transparent'}
            />
          </div>

          {/* Currency Selector */}
          <div className="max-w-md">
            <label className="flex items-center gap-1.5 font-inter text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              <Globe size={13} /> Currency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_CURRENCIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background: currency === c.code ? 'var(--teal-dim)' : 'var(--surface-input)',
                    border: `2px solid ${currency === c.code ? 'var(--teal)' : 'transparent'}`,
                    cursor: 'pointer'
                  }}
                >
                  <span className="text-xl shrink-0">{c.flag}</span>
                  <div className="min-w-0">
                    <p className="font-inter font-bold text-sm" style={{ color: currency === c.code ? 'var(--teal)' : 'var(--text-primary)' }}>
                      {c.code}
                    </p>
                    <p className="font-inter text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{c.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl font-inter font-bold text-sm text-white transition-all hover:opacity-90"
              style={{ background: 'var(--teal)', boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)', border: 'none', cursor: 'pointer' }}
            >
              Save Changes
            </button>

            {showSavedMsg && (
              <span className="flex items-center gap-1.5 font-inter text-sm font-semibold animate-fade-in" style={{ color: 'var(--teal)' }}>
                <CheckCircle2 size={16} /> Changes saved!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Security Settings */}
      {supabase && (
        <div className="card">
          <div className="px-6 py-5" style={{ borderBottom: '1.5px solid var(--border)' }}>
            <h3 className="font-manrope font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Security
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-5 rounded-xl border border-[var(--border)] bg-[var(--surface-input)]">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[var(--teal-dim)]">
                  <ShieldCheck size={18} className="text-[var(--teal)]" />
                </div>
                <div>
                  <h4 className="font-inter font-bold text-[15px] mb-1" style={{ color: 'var(--text-primary)' }}>
                    Two-Factor Authentication
                  </h4>
                  <p className="font-inter text-xs" style={{ color: 'var(--text-muted)' }}>
                    Protect your account with an additional layer of security using an authenticator app.
                  </p>
                </div>
              </div>
              <div>
                {mfaEnrolled ? (
                  <button
                    onClick={handleUnenrollMfa}
                    disabled={unenrolling}
                    className="px-4 py-2 font-inter font-semibold text-xs rounded-lg transition-colors border border-[rgba(239,68,68,0.5)] text-red-500 hover:bg-[rgba(239,68,68,0.1)] disabled:opacity-50"
                  >
                    {unenrolling ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowTwoFactorModal(true)}
                    className="px-4 py-2 font-inter font-semibold text-xs rounded-lg transition-colors bg-[var(--teal)] text-white hover:opacity-90"
                  >
                    Enable 2FA
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Management */}
      <div className="card">
        <div className="px-6 py-5" style={{ borderBottom: '1.5px solid var(--border)' }}>
          <h3 className="font-manrope font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Data Management
          </h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export CSV */}
          <div
            className="flex flex-col p-5 rounded-xl"
            style={{ border: '1.5px solid var(--border)', background: 'var(--surface-input)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-4 shrink-0"
              style={{ background: 'var(--teal-dim)' }}
            >
              <Download size={18} style={{ color: 'var(--teal)' }} />
            </div>
            <h4 className="font-inter font-bold text-[15px] mb-1" style={{ color: 'var(--text-primary)' }}>Export to CSV</h4>
            <p className="font-inter text-xs mb-4 flex-1" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Download all {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} as a spreadsheet.
              Works with Excel, Google Sheets, and any other tool.
            </p>
            <button
              onClick={handleExportCSV}
              disabled={transactions.length === 0}
              className="self-start px-4 py-2 rounded-lg font-inter font-semibold text-xs transition-colors disabled:opacity-40"
              style={{ background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1.5px solid var(--border)', cursor: 'pointer' }}
            >
              Download .CSV
            </button>
          </div>

          {/* Danger Zone */}
          <div
            className="flex flex-col p-5 rounded-xl"
            style={{ border: '1.5px solid rgba(239,68,68,0.25)', background: 'var(--surface-input)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-4 shrink-0"
              style={{ background: 'rgba(239,68,68,0.1)' }}
            >
              <Trash2 size={18} style={{ color: 'var(--red)' }} />
            </div>
            <h4 className="font-inter font-bold text-[15px] mb-1" style={{ color: 'var(--red)' }}>Danger Zone</h4>
            <p className="font-inter text-xs mb-4 flex-1" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Permanently delete all transactions, budgets, goals, and custom categories. This cannot be undone.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Are you absolutely sure? ALL data will be permanently deleted.')) {
                  onResetData();
                }
              }}
              className="self-start px-4 py-2 rounded-lg font-inter font-bold text-xs transition-colors"
              style={{ color: 'var(--red)', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer' }}
            >
              Reset All Data
            </button>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="card px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-inter font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>SpendWise</p>
          <p className="font-inter text-[11px]" style={{ color: 'var(--text-muted)' }}>v3.1 · {transactions.length} transactions · All data stored locally</p>
        </div>
        <span className="text-2xl">🔒</span>
      </div>

      {showTwoFactorModal && (
        <TwoFactorModal
          onClose={() => setShowTwoFactorModal(false)}
          onSuccess={() => {
            setShowTwoFactorModal(false);
            setMfaEnrolled(true);
            alert('Two-Factor Authentication is now enabled!');
          }}
        />
      )}
    </div>
  );
}
