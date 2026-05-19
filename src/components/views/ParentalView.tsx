import React from 'react';
import { useParentalManager } from '@/components/features/parental/hooks/useParentalManager';
import { ParentalLockScreen } from '@/components/features/parental/components/ParentalLockScreen';
import { ParentalSetupFlow } from '@/components/features/parental/components/ParentalSetupFlow';
import { ParentalDashboard } from '@/components/features/parental/components/ParentalDashboard';
import { Shield } from 'lucide-react';

export const ParentalView: React.FC = () => {
  const {
    settings,
    setupStep,
    setSetupStep,
    newPin,
    setNewPin,
    pinError,
    unlockPin,
    setUnlockPin,
    unlockError,
    setUnlockError,
    isSetup,
    isLocked,
    pendingTransactions,
    handleUnlock,
    handleSetPin,
    handleApprove,
    handleReject,
    updateSettings,
    lockSession,
    removePin,
    completeSetup
  } = useParentalManager();

  return (
    <div className="view-container p-6 pb-24 md:pb-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[var(--teal)] flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] font-manrope tracking-tight">Parental Controls</h1>
          <p className="text-[var(--text-muted)] font-medium text-sm">Security, Limits & Chores</p>
        </div>
      </div>

      {!isSetup ? (
        <ParentalSetupFlow
          setupStep={setupStep}
          setSetupStep={setSetupStep}
          newPin={newPin}
          setNewPin={setNewPin}
          pinError={pinError}
          handleSetPin={handleSetPin}
          completeSetup={completeSetup}
          settings={settings}
          updateSettings={updateSettings}
        />
      ) : isLocked ? (
        <ParentalLockScreen
          unlockPin={unlockPin}
          setUnlockPin={setUnlockPin}
          unlockError={unlockError}
          setUnlockError={setUnlockError}
          handleUnlock={handleUnlock}
        />
      ) : (
        <ParentalDashboard
          pendingTransactions={pendingTransactions}
          handleApprove={handleApprove}
          handleReject={handleReject}
          settings={settings}
          updateSettings={updateSettings}
          lockSession={lockSession}
          removePin={removePin}
        />
      )}
    </div>
  );
};

export default ParentalView;
