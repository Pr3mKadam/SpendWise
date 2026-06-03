import React from 'react';
import { ClipboardList, Star, Shield, Lock, Smartphone, MoreHorizontal } from 'lucide-react';

export const ChoreVerification: React.FC = () => {
  return (
    <div className="card p-6 shadow-lg border border-[var(--border-color)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--teal)]/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-[var(--teal)]" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] font-manrope">
            Chore Verification
          </h3>
        </div>
        <button className="p-2 hover:bg-[var(--background-secondary)] rounded-lg transition-colors text-[var(--text-muted)]">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {[
          { id: 1, title: 'Clean the Bedroom', reward: 5, status: 'pending', date: 'Today' },
          { id: 2, title: 'Walk the Dog', reward: 2, status: 'pending', date: 'Today' },
        ].map(chore => (
          <div
            key={chore.id}
            className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] group hover:border-[var(--teal)]/20 transition-all"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1 font-medium">{chore.date}</p>
                <h4 className="font-bold text-[var(--text-primary)]">{chore.title}</h4>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                +${chore.reward}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl bg-[var(--teal)]/10 text-[var(--teal)] text-xs font-bold hover:bg-[var(--teal)] hover:text-white transition-all shadow-sm">
                Verify Done
              </button>
              <button className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] text-xs font-bold hover:bg-[var(--background-primary)] transition-all">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface DeviceLinkingCardProps {
  onLink: () => void;
}

export const DeviceLinkingCard: React.FC<DeviceLinkingCardProps> = ({ onLink }) => {
  return (
    <div className="card p-6 shadow-lg border border-[var(--border-color)] bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-primary)]">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--teal)] flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-[var(--text-primary)] mb-1">Link Child Device</h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Install SpendWise on your child's phone and scan the QR code to link accounts.
          </p>
          <button
            onClick={onLink}
            className="mt-4 text-xs font-bold text-[var(--teal)] hover:underline flex items-center gap-1"
          >
            Show Linking QR <Star className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
