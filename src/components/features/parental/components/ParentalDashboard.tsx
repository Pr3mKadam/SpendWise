import React from 'react';
import { PendingApprovals } from '@/components/features/parental/components/PendingApprovals';
import { ChoreVerification, DeviceLinkingCard } from '@/components/features/parental/components/ParentalActivity';
import { ParentalSettingsCard } from '@/components/features/parental/components/ParentalSettingsCard';
import { Transaction } from '@/types';
import { LinkingQRModal } from '@/components/features/parental/components/LinkingQRModal';
import { Shield } from 'lucide-react';

import { ParentalControlState } from '@/store';

interface ParentalDashboardProps {
  pendingTransactions: Transaction[];
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  settings: ParentalControlState;
  updateSettings: (updates: Partial<ParentalControlState>) => void;
  lockSession: () => void;
  removePin: () => void;
}

export const ParentalDashboard: React.FC<ParentalDashboardProps> = ({
  pendingTransactions,
  handleApprove,
  handleReject,
  settings,
  updateSettings,
  lockSession,
  removePin
}) => {
  const [showQR, setShowQR] = React.useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      <div className="lg:col-span-8 space-y-8">
        <PendingApprovals 
          pendingTransactions={pendingTransactions} 
          handleApprove={handleApprove} 
          handleReject={handleReject} 
        />
        
        {settings.parentId ? (
          <div className="card p-6 border border-[var(--teal)]/20 bg-[var(--teal)]/5 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--teal)]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[var(--teal)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-manrope">📱 Linked to Parent Account</h3>
                <p className="text-[var(--text-muted)] text-xs">Parent ID: {settings.parentId}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Your spending limits and chores are being managed securely by your parent. High value transactions will automatically request parental approval.
            </p>
            <div className="pt-4 border-t border-[var(--border)]">
              <button
                onClick={removePin}
                className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all cursor-pointer"
              >
                Unlink Device
              </button>
            </div>
          </div>
        ) : (
          <ParentalSettingsCard 
            settings={settings} 
            updateSettings={updateSettings} 
            lockSession={lockSession} 
            removePin={removePin} 
          />
        )}
      </div>

      <div className="lg:col-span-4 space-y-8">
        <ChoreVerification />
        {!settings.parentId && <DeviceLinkingCard onLink={() => setShowQR(true)} />}
        
        <div className="card p-6 border border-blue-500/10 bg-blue-500/5">
          <h4 className="text-sm font-bold text-blue-500 mb-2">Did you know?</h4>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Approving chores automatically credits the reward to your child's SpendWise account instantly.
          </p>
        </div>
      </div>

      <LinkingQRModal show={showQR} onClose={() => setShowQR(false)} />
    </div>
  );
};
