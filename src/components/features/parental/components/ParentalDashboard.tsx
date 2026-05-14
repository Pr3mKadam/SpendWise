import React from 'react';
import { PendingApprovals } from './PendingApprovals';
import { ChoreVerification, DeviceLinkingCard } from './ParentalActivity';
import { ParentalSettingsCard } from './ParentalSettingsCard';
import { Transaction } from '../../../../types';

import { ParentalControlState } from '../../../../store';

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      <div className="lg:col-span-8 space-y-8">
        <PendingApprovals 
          pendingTransactions={pendingTransactions} 
          handleApprove={handleApprove} 
          handleReject={handleReject} 
        />
        
        <ParentalSettingsCard 
          settings={settings} 
          updateSettings={updateSettings} 
          lockSession={lockSession} 
          removePin={removePin} 
        />
      </div>

      <div className="lg:col-span-4 space-y-8">
        <ChoreVerification />
        <DeviceLinkingCard onLink={() => {}} />
        
        <div className="card p-6 border border-blue-500/10 bg-blue-500/5">
          <h4 className="text-sm font-bold text-blue-500 mb-2">Did you know?</h4>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Approving chores automatically credits the reward to your child's SpendWise account instantly.
          </p>
        </div>
      </div>
    </div>
  );
};
