import { User, DownloadCloud, CheckCircle2 } from 'lucide-react';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { exportCSV } from '@/utils/export';
import { Transaction } from '@/types';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useCurrency, CurrencyCode } from '@/contexts/CurrencyContext';
import IOSInstallModal from '@/shell/IOSInstallModal';

import ProfileForm from '@/features/profile/components/ProfileForm';
import { CurrencySelector } from '@/features/profile/components/CurrencySelector';
import { DataManagement } from '@/features/profile/components/DataManagement';
import SecureExportModal from '@/features/profile/components/SecureExportModal';
import RestoreModal from '@/features/profile/components/RestoreModal';
import ResetConfirmModal from '@/features/profile/components/ResetConfirmModal';
import { AccessibilitySection } from '@/features/profile/components/AccessibilitySection';
import { NotificationsSection } from '@/features/profile/components/NotificationsSection';
import { useProfileView } from '@/features/profile/components/useProfileView';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { FamilySafetySection } from '@/features/profile/components/FamilySafetySection';

interface ProfileViewProps {
  config:         SpendWiseConfig | null;
  onUpdateConfig: (cfg: SpendWiseConfig) => void;
  onResetData:    () => void;
  transactions:   Transaction[];
  onNavigate?:    (view: any) => void;
  addNotification?: (notif: any) => void;
}

import { useIsMobile } from '@/hooks/useMediaQuery';
import ProfileViewMobile from '@/features/profile/ProfileViewMobile';

export default function ProfileView({
  config, onUpdateConfig, onResetData, transactions, onNavigate, addNotification,
}: ProfileViewProps) {
  const isMobile = useIsMobile();
  const { isInstallable, isAppInstalled, triggerInstall, isIOS, showIOSPrompt, closeIOSPrompt } = usePWAInstall();
  const { activeCurrency, baseCurrency } = useCurrency();

  const {
    name, setName, phone, setPhone, occupation, setOccupation,
    location, setLocation, monthlyGoal, setMonthlyGoal, currency,
    showSavedMsg, showResetConfirm, setShowResetConfirm,
    showSecureExportModal, setShowSecureExportModal,
    showRestoreModal, setShowRestoreModal,
    isExporting, isRestoring,
    avatar, avatarInputRef, handleAvatarChange,
    fontSize, FONT_SIZES, FONT_LABELS, handleFontSize,
    darkMode, handleDarkMode, highContrast, toggleHighContrast,
    hapticsEnabled, toggleHaptics, shakeEnabled, toggleShake,
    notifPermission, requestNotifPermission, testNotification,
    handleSave, handleSecureExport, handleRestore,
    handleRawDBExport, handleRawDBImport,
    handleImportTransactions, handleCurrencySelect,
  } = useProfileView(config, onUpdateConfig, addNotification);

  const profileFields = [
    { label: 'Display Name',                           value: name,        onChange: setName,        placeholder: 'Your name' },
    { label: 'Mobile Number',                          value: phone,       onChange: setPhone,       placeholder: '+1 234 567 8900', type: 'tel' },
    { label: 'Occupation',                             value: occupation,  onChange: setOccupation,  placeholder: 'e.g. Designer, Analyst' },
    { label: 'Location',                               value: location,    onChange: setLocation,    placeholder: 'e.g. San Francisco, CA' },
    { label: `Monthly Income Goal (${currency})`,      value: monthlyGoal, onChange: setMonthlyGoal, placeholder: 'e.g. 5000', type: 'number' },
  ];

  if (isMobile) {
    return (
      <>
        <ProfileViewMobile 
          name={name}
          avatar={avatar}
          occupation={occupation}
          location={location}
          monthlyGoal={monthlyGoal}
          currency={currency}
          config={config}
          onAvatarClick={() => avatarInputRef.current?.click()}
          onNavigate={(view) => onNavigate?.(view)}
          isAppInstalled={isAppInstalled}
          isInstallable={isInstallable}
          isIOS={isIOS}
          triggerInstall={triggerInstall}
          transactionsCount={transactions.length}
          profileForm={
            <ProfileForm fields={profileFields} currency={currency} onSave={handleSave} showSavedMsg={showSavedMsg} />
          }
          currencySelector={
            <CurrencySelector
              activeCurrency={activeCurrency}
              baseCurrency={baseCurrency}
              onSelect={(code) => handleCurrencySelect(code as CurrencyCode)}
            />
          }
          dataManagement={
            <DataManagement
              transactions={transactions}
              onExportCSV={() => exportCSV(transactions)}
              onOpenResetConfirm={() => setShowResetConfirm(true)}
              onOpenSecureExport={() => setShowSecureExportModal(true)}
              onOpenRestore={() => setShowRestoreModal(true)}
              onRawDBExport={handleRawDBExport}
              onRawDBImport={handleRawDBImport}
              onImportTransactions={handleImportTransactions}
            />
          }
          accessibility={
            <AccessibilitySection
              darkMode={darkMode} onDarkMode={handleDarkMode}
              highContrast={highContrast} onHighContrast={toggleHighContrast}
              hapticsEnabled={hapticsEnabled} onHaptics={toggleHaptics}
              shakeEnabled={shakeEnabled} onShake={toggleShake}
              fontSize={fontSize} FONT_SIZES={FONT_SIZES} FONT_LABELS={FONT_LABELS} onFontSize={handleFontSize}
            />
          }
          notifications={
            <NotificationsSection
              notifPermission={notifPermission}
              onRequestPermission={requestNotifPermission}
              onTestNotification={testNotification}
            />
          }
        />
        <input ref={avatarInputRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
        {showSecureExportModal && <SecureExportModal onClose={() => setShowSecureExportModal(false)} onExport={handleSecureExport} isExporting={isExporting} />}
        {showRestoreModal      && <RestoreModal      onClose={() => setShowRestoreModal(false)}      onRestore={handleRestore}    isRestoring={isRestoring} />}
        {showResetConfirm      && <ResetConfirmModal onClose={() => setShowResetConfirm(false)}       onConfirm={onResetData} />}
        {showIOSPrompt         && <IOSInstallModal   onClose={closeIOSPrompt} />}
      </>
    );
  }

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
      <ProfileHeader
        avatar={avatar}
        name={name}
        occupation={occupation}
        location={location}
        config={config}
        avatarInputRef={avatarInputRef}
        onAvatarChange={handleAvatarChange}
      />

      {/* Profile Form */}
      <ProfileForm fields={profileFields} currency={currency} onSave={handleSave} showSavedMsg={showSavedMsg} />

      {/* Currency Selector */}
      <div className="card p-6">
        <CurrencySelector
          activeCurrency={activeCurrency}
          baseCurrency={baseCurrency}
          onSelect={(code) => handleCurrencySelect(code as CurrencyCode)}
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
        onImportTransactions={handleImportTransactions}
      />

      {/* Accessibility */}
      <AccessibilitySection
        darkMode={darkMode} onDarkMode={handleDarkMode}
        highContrast={highContrast} onHighContrast={toggleHighContrast}
        hapticsEnabled={hapticsEnabled} onHaptics={toggleHaptics}
        shakeEnabled={shakeEnabled} onShake={toggleShake}
        fontSize={fontSize} FONT_SIZES={FONT_SIZES} FONT_LABELS={FONT_LABELS} onFontSize={handleFontSize}
      />

      {/* Family & Safety */}
      <FamilySafetySection onNavigate={onNavigate} />

      {/* Notifications */}
      <NotificationsSection
        notifPermission={notifPermission}
        onRequestPermission={requestNotifPermission}
        onTestNotification={testNotification}
      />

      {/* App Footer */}
      <div className="card px-6 py-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-inter font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>SpendWise</p>
          <p className="font-inter text-[length:var(--fs-caption)]" style={{ color: 'var(--text-muted)' }}>
            SpendWise PWA · {transactions.length} transactions
          </p>
        </div>
        <div className="flex items-center gap-4">
          {!isAppInstalled && (isInstallable || isIOS) && (
            <button onClick={triggerInstall}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--teal)] text-white text-xs font-bold transition-all hover:scale-105">
              <DownloadCloud size={14} /> Install App
            </button>
          )}
          {isAppInstalled && (
            <span className="text-xs font-semibold text-[var(--teal)] flex items-center gap-1">
              <CheckCircle2 size={14} /> App Installed
            </span>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSecureExportModal && <SecureExportModal onClose={() => setShowSecureExportModal(false)} onExport={handleSecureExport} isExporting={isExporting} />}
      {showRestoreModal      && <RestoreModal      onClose={() => setShowRestoreModal(false)}      onRestore={handleRestore}    isRestoring={isRestoring} />}
      {showResetConfirm      && <ResetConfirmModal onClose={() => setShowResetConfirm(false)}       onConfirm={onResetData} />}
      {showIOSPrompt         && <IOSInstallModal   onClose={closeIOSPrompt} />}
    </div>
  );
}
