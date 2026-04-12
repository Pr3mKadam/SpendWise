import { useState, useCallback, useEffect } from 'react';
import { User, Globe, Download, Trash2, CheckCircle2, ShieldCheck, DownloadCloud } from 'lucide-react';
import { SpendWiseConfig } from './OnboardingModal';
import { exportTransactionsToCSV } from '../utils/exportCSV';
import { Transaction } from '../types';
import TwoFactorModal from './TwoFactorModal';
import { supabase } from '../services/supabaseClient';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ProfileViewProps {
  config: SpendWiseConfig | null;
  onUpdateConfig: (cfg: SpendWiseConfig) => void;
  onResetData: () => void;
  transactions: Transaction[];
  onOpenParentalSettings?: () => void;
  onOpenParentDashboard?: () => void;
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

export default function ProfileView({ 
  config, 
  onUpdateConfig, 
  onResetData, 
  transactions,
  onOpenParentalSettings,
  onOpenParentDashboard
}: ProfileViewProps) {
  const { isInstallable, isAppInstalled, triggerInstall } = usePWAInstall();
  const [name, setName] = useState(config?.name ?? 'User');
  const [phone, setPhone] = useState(config?.phone ?? '');
  const [occupation, setOccupation] = useState(config?.occupation ?? '');
  const [location, setLocation] = useState(config?.location ?? '');
  const [monthlyGoal, setMonthlyGoal] = useState(config?.monthlyGoal !== undefined ? String(config.monthlyGoal) : '');
  
  const [currency, setCurrency] = useState(config?.currency ?? '$');
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const [mfaEnrolled, setMfaEnrolled] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
    const updated: SpendWiseConfig = { 
      ...config, 
      name, 
      currency,
      phone: phone.trim() || undefined,
      occupation: occupation.trim() || undefined,
      location: location.trim() || undefined,
      monthlyGoal: monthlyGoal ? parseFloat(monthlyGoal) : undefined
    };
    onUpdateConfig(updated);
    // Persist directly to the same key that loadConfig() reads.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 3000);
  }, [config, name, currency, phone, occupation, location, monthlyGoal, onUpdateConfig]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            {/* Display Name */}
            <div>
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

            {/* Mobile / Phone */}
            <div>
              <label className="block font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full font-inter text-sm px-4 py-3 rounded-xl focus:outline-none transition-colors"
                style={{ background: 'var(--surface-input)', color: 'var(--text-primary)', border: '2px solid transparent' }}
                onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>
            
            {/* Occupation */}
            <div>
              <label className="block font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Occupation
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Designer, Analyst"
                className="w-full font-inter text-sm px-4 py-3 rounded-xl focus:outline-none transition-colors"
                style={{ background: 'var(--surface-input)', color: 'var(--text-primary)', border: '2px solid transparent' }}
                onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full font-inter text-sm px-4 py-3 rounded-xl focus:outline-none transition-colors"
                style={{ background: 'var(--surface-input)', color: 'var(--text-primary)', border: '2px solid transparent' }}
                onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>
            
            {/* Monthly Goal */}
            <div>
              <label className="block font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Monthly Income Goal ({currency})
              </label>
              <input
                type="number"
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full font-inter text-sm px-4 py-3 rounded-xl focus:outline-none transition-colors"
                style={{ background: 'var(--surface-input)', color: 'var(--text-primary)', border: '2px solid transparent' }}
                onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>
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
              onClick={() => setShowResetConfirm(true)}
              className="self-start px-4 py-2 rounded-lg font-inter font-bold text-xs transition-colors"
              style={{ color: 'var(--red)', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer' }}
            >
              Reset All Data
            </button>
          </div>
        </div>
      </div>
      {/* Family & Safety (Just in case) */}
      <div className="card border border-[var(--teal)]/20 shadow-sm shadow-[var(--teal)]/5">
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">
              Family & Safety (Optional)
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Manage controls or link family accounts.</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--teal-dim)] flex items-center justify-center text-[var(--teal)]">
            <ShieldCheck size={20} />
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={onOpenParentalSettings}
              className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-input)] hover:bg-[var(--surface-card)] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} className="text-amber-500" />
              </div>
              <div>
                <h4 className="font-inter font-bold text-sm text-[var(--text-primary)]">Parental Controls</h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-[200px]">Lock device with a PIN and set limits for shared devices.</p>
              </div>
            </button>
            <button
              onClick={onOpenParentDashboard}
              className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-input)] hover:bg-[var(--surface-card)] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <User size={18} className="text-purple-400" />
              </div>
              <div>
                <h4 className="font-inter font-bold text-sm text-[var(--text-primary)]">Parent Dashboard</h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-[200px]">Monitor and manage a linked child's account remotely.</p>
              </div>
            </button>
        </div>
      </div>

      {/* App Info & PWA Install */}
      <div className="card px-6 py-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-inter font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>SpendWise</p>
          <p className="font-inter text-[11px]" style={{ color: 'var(--text-muted)' }}>v4.0 (PWA) · {transactions.length} transactions · All data stored locally</p>
        </div>
        
        <div className="flex items-center gap-4">
          {(!isAppInstalled && isInstallable) && (
            <button
              onClick={triggerInstall}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--teal)] text-white text-xs font-bold transition-all hover:scale-105"
            >
              <DownloadCloud size={14} /> Install App
            </button>
          )}
          {isAppInstalled && (
            <span className="text-xs font-semibold text-[var(--teal)] flex items-center gap-1">
              <CheckCircle2 size={14} /> App Installed
            </span>
          )}
          <span className="text-2xl">🔒</span>
        </div>
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

      {/* Custom Confirm Reset Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--surface-card)] rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in border border-red-500/20">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500 w-6 h-6" />
            </div>
            <h3 className="font-manrope font-bold text-xl text-center text-[var(--text-primary)] mb-2">Delete all data?</h3>
            <p className="font-inter text-sm text-[var(--text-secondary)] text-center mb-8">
              This action cannot be undone. All your transactions, budgets, goals, and history will be permanently wiped.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-input)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetData();
                }}
                className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
              >
                Yes, delete it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
