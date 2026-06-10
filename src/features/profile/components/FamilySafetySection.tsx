import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface FamilySafetySectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNavigate?: (view: any) => void;
}

export function FamilySafetySection({ onNavigate }: FamilySafetySectionProps) {
  return (
    <div className="card border border-[var(--teal)]/20 shadow-sm shadow-[var(--teal)]/5">
      <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">
            Family &amp; Safety (Optional)
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage controls or link family accounts.
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[var(--teal-dim)] flex items-center justify-center text-[var(--teal)]">
          <ShieldCheck size={20} />
        </div>
      </div>
      <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[
          {
            title: 'Parental Controls',
            desc: 'Lock device with a PIN and set limits for shared devices.',
            icon: '🛡️',
          },
          {
            title: 'Review & Approvals',
            desc: 'Monitor and manage pending transactions and limits.',
            icon: '👤',
          },
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
              <h4 className="font-inter font-bold text-sm text-[var(--text-primary)]">
                {item.title}
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-[200px]">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
