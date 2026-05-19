import React from 'react';
import { 
  User, ShieldCheck, DownloadCloud, CheckCircle2, Camera, 
  ChevronRight, Globe, Bell, Smartphone, Database, Lock, 
  Smartphone as PhoneIcon, MapPin, Briefcase, CreditCard
} from 'lucide-react';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { haptic } from '@/lib/haptic';

interface ProfileViewMobileProps {
  name: string;
  avatar: string | null;
  occupation: string;
  location: string;
  monthlyGoal: string;
  currency: string;
  config: SpendWiseConfig | null;
  onAvatarClick: () => void;
  onNavigate: (view: string) => void;
  isAppInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  triggerInstall: () => void;
  // Sections (Passed as pre-rendered components for simplicity/state management)
  profileForm: React.ReactNode;
  currencySelector: React.ReactNode;
  dataManagement: React.ReactNode;
  accessibility: React.ReactNode;
  notifications: React.ReactNode;
  transactionsCount: number;
}

export default function ProfileViewMobile({
  name,
  avatar,
  occupation,
  location,
  monthlyGoal,
  currency,
  config,
  onAvatarClick,
  onNavigate,
  isAppInstalled,
  isInstallable,
  isIOS,
  triggerInstall,
  profileForm,
  currencySelector,
  dataManagement,
  accessibility,
  notifications,
  transactionsCount
}: ProfileViewMobileProps) {
  return (
    <div className="view-enter space-y-6 pb-20">
      {/* 1. Profile Hero */}
      <div className="flex flex-col items-center py-4">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--teal-dim)] border-4 border-[var(--surface-card)] shadow-xl flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-[var(--teal)]" />
            )}
          </div>
          <button 
            onClick={() => { haptic.medium(); onAvatarClick(); }}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--teal)] text-white border-2 border-[var(--surface-card)] flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <Camera size={14} />
          </button>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">{name || 'Your Name'}</h2>
        <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1">
          {occupation || 'SpendWise Member'} · {location || 'Global'}
        </p>
        <div className="mt-4 px-4 py-1.5 rounded-full bg-[var(--teal-dim)] text-[var(--teal)] text-[length:var(--fs-overline)] font-bold uppercase tracking-widest border border-[var(--teal-glow)]">
          {config?.userRole || 'User'} Mode
        </div>
      </div>

      {/* 2. Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 px-1">
        <div className="bg-[var(--surface-card)] p-4 rounded-3xl border border-[var(--border)] shadow-sm">
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase mb-1">Target</p>
          <p className="text-sm font-bold text-[var(--text-primary)]">{currency}{monthlyGoal || '0'}</p>
        </div>
        <div className="bg-[var(--surface-card)] p-4 rounded-3xl border border-[var(--border)] shadow-sm">
          <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase mb-1">Logged</p>
          <p className="text-sm font-bold text-[var(--teal)]">{transactionsCount} Tx</p>
        </div>
      </div>

      {/* 3. Settings Sections */}
      <div className="space-y-4">
        {/* Personal Details */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1 text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            <User size={12} /> Personal Details
          </div>
          <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-2 shadow-sm">
            {profileForm}
          </div>
        </section>

        {/* Preferences & Localization */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1 text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            <Globe size={12} /> Localization
          </div>
          <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-5 shadow-sm">
            {currencySelector}
          </div>
        </section>

        {/* Accessibility & Experience */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1 text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            <Smartphone size={12} /> App Experience
          </div>
          <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-2 shadow-sm">
            {accessibility}
          </div>
        </section>

        {/* Family & Controls */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1 text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            <ShieldCheck size={12} /> Security & Family
          </div>
          <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-4 shadow-sm">
            <button 
              onClick={() => { haptic.light(); onNavigate('parental'); }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-input)] active:bg-[var(--surface-card)] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Lock size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[var(--text-primary)]">Parental Controls</p>
                  <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)]">PIN Lock & Spend Limits</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--text-muted)]" />
            </button>
          </div>
        </section>

        {/* Data Management */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1 text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            <Database size={12} /> Data & Backup
          </div>
          <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-2 shadow-sm">
            {dataManagement}
          </div>
        </section>

        {/* Notifications */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1 text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            <Bell size={12} /> Notifications
          </div>
          <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-2 shadow-sm">
            {notifications}
          </div>
        </section>
      </div>

      {/* 4. App Info & Install */}
      <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] p-5 text-center shadow-sm">
        <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase mb-2">SpendWise PWA</p>
        <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] leading-relaxed mb-6">
          Your data is encrypted and stored locally on this device.<br/>We never upload your transactions to any server.
        </p>
        
        {!isAppInstalled && (isInstallable || isIOS) && (
          <button 
            onClick={() => { haptic.heavy(); triggerInstall(); }}
            className="w-full h-14 bg-[var(--teal)] text-white rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
          >
            <DownloadCloud size={20} />
            Install App
          </button>
        )}
        
        {isAppInstalled && (
          <div className="flex items-center justify-center gap-2 text-[var(--teal)]">
            <CheckCircle2 size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">System Integrated</span>
          </div>
        )}
      </div>

      <div className="text-center pb-10">
        <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em]">
          Designed for Excellence
        </p>
      </div>
    </div>
  );
}
