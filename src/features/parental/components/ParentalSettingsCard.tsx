import React from 'react';
import { Shield, Lock, Bell, AlertTriangle, Trash2 } from 'lucide-react';

import { ParentalControlState } from '@/store';

interface ParentalSettingsCardProps {
  settings: ParentalControlState;
  updateSettings: (updates: Partial<ParentalControlState>) => void;
  lockSession: () => void;
  removePin: () => void;
}

export const ParentalSettingsCard: React.FC<ParentalSettingsCardProps> = ({
  settings,
  updateSettings,
  lockSession,
  removePin,
}) => {
  return (
    <div className="card shadow-xl border border-[var(--border-color)] overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-[var(--background-secondary)] to-[var(--background-primary)] border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-manrope">
                Security & Limits
              </h3>
              <p className="text-[var(--text-muted)] text-xs">Configure control strictness</p>
            </div>
          </div>
          <button
            onClick={lockSession}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-bold hover:bg-amber-500/20 transition-all"
          >
            <Lock className="w-4 h-4" /> Lock Session
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]">
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--teal)]" /> Notification Strategy
            </h4>
            <div className="space-y-3">
              {[
                { key: 'notifyOnAllSpending', label: 'All Spending' },
                { key: 'notifyOnLowBalance', label: 'Low Balance' },
              ].map(item => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--background-primary)] transition-colors cursor-pointer"
                >
                  <span className="text-sm text-[var(--text-muted)] font-medium">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(settings[item.key as keyof ParentalControlState])}
                    onChange={e => updateSettings({ [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--teal)] focus:ring-[var(--teal)]"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]">
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Restrictions
            </h4>
            <div className="space-y-3">
              {[
                { key: 'blockAdultContent', label: 'Block Adult Merchants' },
                { key: 'restrictLateNightSpending', label: 'Curfew Mode' },
              ].map(item => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--background-primary)] transition-colors cursor-pointer"
                >
                  <span className="text-sm text-[var(--text-muted)] font-medium">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(settings[item.key as keyof ParentalControlState])}
                    onChange={e => updateSettings({ [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--teal)] focus:ring-[var(--teal)]"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border-color)]">
          <button
            onClick={removePin}
            className="w-full py-3.5 rounded-xl border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/5 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Reset Parental Controls
          </button>
        </div>
      </div>
    </div>
  );
};
