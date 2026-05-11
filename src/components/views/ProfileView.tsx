import { useState, useCallback, useRef, useEffect } from 'react';
import { User, ShieldCheck, DownloadCloud, CheckCircle2, Sun, Moon, Type, Camera } from 'lucide-react';
import { SpendWiseConfig } from '../features/onboarding/OnboardingModal';
import { exportCSV } from '../../utils/export';
import { Transaction } from '../../types';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { encryptData, decryptData } from '../../utils/encryption';
import { useStore } from '../../store';
import { downloadDatabaseBackup, importDatabase } from '../../db/backup';
import { useCurrency, CurrencyCode } from '../../contexts/CurrencyContext';

import ProfileForm from '../features/profile/ProfileForm';
import { CurrencySelector } from '../features/profile/CurrencySelector';
import { DataManagement } from '../features/profile/DataManagement';
import SecureExportModal from '../features/profile/SecureExportModal';
import RestoreModal from '../features/profile/RestoreModal';
import ResetConfirmModal from '../features/profile/ResetConfirmModal';


interface ProfileViewProps {
  config: SpendWiseConfig | null;
  onUpdateConfig: (cfg: SpendWiseConfig) => void;
  onResetData: () => void;
  transactions: Transaction[];
  onNavigate?: (view: any) => void;
}

export default function ProfileView({
  config,
  onUpdateConfig,
  onResetData,
  transactions,
  onNavigate,
}: ProfileViewProps) {
  const store = useStore();
  const { isInstallable, isAppInstalled, triggerInstall } = usePWAInstall();
  const [name, setName] = useState(config?.name ?? 'User');
  const [phone, setPhone] = useState(config?.phone ?? '');
  const [occupation, setOccupation] = useState(config?.occupation ?? '');
  const [location, setLocation] = useState(config?.location ?? '');
  const [monthlyGoal, setMonthlyGoal] = useState(
    config?.monthlyGoal !== undefined ? String(config.monthlyGoal) : ''
  );
  const [currency, setCurrency] = useState(config?.currency ?? '$');
  const { activeCurrency, setActiveCurrency, baseCurrency } = useCurrency();
  const [showSavedMsg, setShowSavedMsg] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSecureExportModal, setShowSecureExportModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [highContrast, setHighContrast] = useState(() =>
    document.documentElement.classList.contains('high-contrast')
  );

  const toggleHighContrast = (checked: boolean) => {
    setHighContrast(checked);
    if (checked) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('spendwise_high_contrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('spendwise_high_contrast', 'false');
    }
  };
  const [isRestoring, setIsRestoring] = useState(false);

  // Avatar
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(() => localStorage.getItem('spendwise_avatar'));

  // Font size (Small / Medium / Large / XL)
  const FONT_SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl'] as const;
  type FontSizeKey = typeof FONT_SIZES[number];
  const FONT_LABELS: Record<FontSizeKey, string> = { 'text-sm': 'Small', 'text-base': 'Medium', 'text-lg': 'Large', 'text-xl': 'XL' };
  const [fontSize, setFontSize] = useState<FontSizeKey>(() => (localStorage.getItem('spendwise_font_size') as FontSizeKey) ?? 'text-base');

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  // Apply font size on mount
  useEffect(() => {
    FONT_SIZES.forEach(s => document.documentElement.classList.remove(s));
    document.documentElement.classList.add(fontSize);
  }, [fontSize]);

  const handleFontSize = (size: FontSizeKey) => {
    FONT_SIZES.forEach(s => document.documentElement.classList.remove(s));
    document.documentElement.classList.add(size);
    localStorage.setItem('spendwise_font_size', size);
    setFontSize(size);
  };

  const handleDarkMode = (on: boolean) => {
    document.documentElement.setAttribute('data-theme', on ? 'dark' : 'light');
    localStorage.setItem('spendwise_dark_mode', on ? 'dark' : 'light');
    setDarkMode(on);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setAvatar(b64);
      localStorage.setItem('spendwise_avatar', b64);
    };
    reader.readAsDataURL(file);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!config) return;
    onUpdateConfig({
      ...config,
      name,
      currency,
      phone: phone.trim() || undefined,
      occupation: occupation.trim() || undefined,
      location: location.trim() || undefined,
      monthlyGoal: monthlyGoal ? parseFloat(monthlyGoal) : undefined,
    });
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 3000);
  }, [config, name, currency, phone, occupation, location, monthlyGoal, onUpdateConfig]);

  const handleSecureExport = async (password: string) => {
    setIsExporting(true);
    try {
      const dataToExport = {
        transactions: store.transactions,
        budgets: store.budgets,
        quests: store.quests,
        parentalState: store.parentalState,
        assets: store.assets,
        liabilities: store.liabilities,
        subscriptions: store.subscriptions,
        exportDate: new Date().toISOString(),
      };
      const encrypted = await encryptData(JSON.stringify(dataToExport), password);
      const blob = new Blob([encrypted], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `spendwise_secure_backup_${new Date().toISOString().split('T')[0]}.swb`;
      link.click();
      URL.revokeObjectURL(url);
      setShowSecureExportModal(false);
    } catch {
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestore = async (file: File, password: string) => {
    setIsRestoring(true);
    try {
      const encryptedContent = await file.text();
      const decryptedJson = await decryptData(encryptedContent, password);
      const data = JSON.parse(decryptedJson);
      store.restoreBackup(data);
      setShowRestoreModal(false);
      alert('Backup restored successfully!');
    } catch {
      alert('Restore failed. Invalid password or corrupted file.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRawDBExport = async () => {
    try { await downloadDatabaseBackup(); } catch { alert('Failed to download raw database backup.'); }
  };

  const handleRawDBImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (confirm('Warning: This will overwrite your current database. Proceed?')) {
      try { await importDatabase(file); } catch { alert('Failed to import database.'); }
    }
  };

  // ── Profile form fields config ────────────────────────────────────────────
  const profileFields = [
    { label: 'Display Name', value: name, onChange: setName, placeholder: 'Your name' },
    { label: 'Mobile Number', value: phone, onChange: setPhone, placeholder: '+1 234 567 8900', type: 'tel' },
    { label: 'Occupation', value: occupation, onChange: setOccupation, placeholder: 'e.g. Designer, Analyst' },
    { label: 'Location', value: location, onChange: setLocation, placeholder: 'e.g. San Francisco, CA' },
    { label: `Monthly Income Goal (${currency})`, value: monthlyGoal, onChange: setMonthlyGoal, placeholder: 'e.g. 5000', type: 'number' },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in-up max-w-[800px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2 text-headline">
          <User size={22} style={{ color: 'var(--teal)' }} />
          Profile &amp; Settings
        </h2>
        <p className="text-caption mt-1">Manage your personal details, localization, and data exports.</p>
      </div>

      {/* Avatar Upload */}
      <div className="card px-6 py-5 flex items-center gap-5">
        <div className="relative shrink-0">
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
            style={{ background: 'var(--teal-dim)', border: '3px solid var(--teal)' }}
          >
            {avatar
              ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              : <User size={36} style={{ color: 'var(--teal)' }} />
            }
          </div>
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white cursor-pointer"
            style={{ background: 'var(--teal)', color: '#fff' }}
            title="Change photo"
          >
            <Camera size={13} />
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-manrope)', fontSize: '18px' }}>
            {name || 'Your Name'}
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-0.5" style={{ fontFamily: 'var(--font-inter)' }}>
            {occupation || 'SpendWise Member'}{location ? ` · ${location}` : ''}
          </p>
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="mt-2 text-xs font-semibold cursor-pointer border-none bg-transparent"
            style={{ color: 'var(--teal)', fontFamily: 'var(--font-inter)' }}
          >
            Change photo →
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <ProfileForm
        fields={profileFields}
        currency={currency}
        onSave={handleSave}
        showSavedMsg={showSavedMsg}
      />

      {/* Currency Selector (as a standalone card) */}
      <div className="card p-6">
        <CurrencySelector
          activeCurrency={activeCurrency}
          baseCurrency={baseCurrency}
          onSelect={(code) => {
            setActiveCurrency(code as CurrencyCode);
            setCurrency(code);
          }}
        />
      </div>

      {/* Data Management */}
      <DataManagement
        transactions={transactions}
        onExportCSV={() => exportCSV(transactions)}
        onOpenResetConfirm={() => setShowResetConfirm(true)}
        onOpenSecureExport={() => setShowSecureExportModal(true)}
        onOpenRestore={() => setShowRestoreModal(true)}
        onRawDBExport={handleRawDBExport}
        onRawDBImport={handleRawDBImport}
      />

      {/* Accessibility & Preferences */}
      <div className="card border border-[var(--teal)]/20 shadow-sm shadow-[var(--teal)]/5">
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">Accessibility</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Customize your viewing experience.</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--teal-dim)] flex items-center justify-center text-[var(--teal)]">
            <User size={20} />
          </div>
        </div>
        <div className="p-6 space-y-4">

          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-input)]">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={18} style={{ color: '#8b5cf6' }} /> : <Sun size={18} style={{ color: '#f59e0b' }} />}
              <div>
                <h4 className="font-inter font-bold text-sm text-[var(--text-primary)]">Dark Mode</h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Switch between light and dark themes.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={darkMode}
                onChange={e => handleDarkMode(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b5cf6]"></div>
            </label>
          </div>

          {/* Font Size */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-input)]">
            <div className="flex items-center gap-2 mb-3">
              <Type size={16} style={{ color: 'var(--teal)' }} />
              <h4 className="font-inter font-bold text-sm text-[var(--text-primary)]">Font Size</h4>
            </div>
            <div className="flex gap-2 flex-wrap">
              {FONT_SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => handleFontSize(s)}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{
                    background: fontSize === s ? 'var(--teal)' : 'var(--surface-card)',
                    color: fontSize === s ? '#fff' : 'var(--text-muted)',
                    border: fontSize === s ? 'none' : '1px solid var(--border)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {FONT_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-input)]">
            <div>
              <h4 className="font-inter font-bold text-sm text-[var(--text-primary)]">High Contrast Mode</h4>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-[200px] md:max-w-full">Increase visual contrast across the app for better readability.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={highContrast}
                onChange={(e) => toggleHighContrast(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--teal)]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Family & Safety */}
      <div className="card border border-[var(--teal)]/20 shadow-sm shadow-[var(--teal)]/5">
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">Family &amp; Safety (Optional)</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Manage controls or link family accounts.</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--teal-dim)] flex items-center justify-center text-[var(--teal)]">
            <ShieldCheck size={20} />
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[
            { title: 'Parental Controls', desc: 'Lock device with a PIN and set limits for shared devices.', icon: '🛡️' },
            { title: 'Review & Approvals', desc: 'Monitor and manage pending transactions and limits.', icon: '👤' },
          ].map(item => (
            <button
              key={item.title}
              onClick={() => onNavigate?.('parental')}
              className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-input)] hover:bg-[var(--surface-card)] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 text-xl">
                {item.icon}
              </div>
              <div>
                <h4 className="font-inter font-bold text-sm text-[var(--text-primary)]">{item.title}</h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-[200px]">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* App Info & PWA Install */}
      <div className="card px-6 py-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-inter font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>SpendWise</p>
          <p className="font-inter text-[11px]" style={{ color: 'var(--text-muted)' }}>
            v4.0 (PWA) · {transactions.length} transactions · All data stored locally
          </p>
        </div>
        <div className="flex items-center gap-4">
          {!isAppInstalled && isInstallable && (
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

      {/* Modals */}
      {showSecureExportModal && (
        <SecureExportModal
          onClose={() => setShowSecureExportModal(false)}
          onExport={handleSecureExport}
          isExporting={isExporting}
        />
      )}
      {showRestoreModal && (
        <RestoreModal
          onClose={() => setShowRestoreModal(false)}
          onRestore={handleRestore}
          isRestoring={isRestoring}
        />
      )}
      {showResetConfirm && (
        <ResetConfirmModal
          onClose={() => setShowResetConfirm(false)}
          onConfirm={onResetData}
        />
      )}
    </div>
  );
}
