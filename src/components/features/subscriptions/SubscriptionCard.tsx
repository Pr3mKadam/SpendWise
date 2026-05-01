import React from 'react';
import { Ico } from '../../common/ui/Icons';
import { useFinanceState } from '../../../hooks/useFinanceState';

export function SubscriptionCard() {
  const { subscriptions } = useFinanceState();

  if (subscriptions.length === 0) return null;

  return (
    <div className="card p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-headline flex items-center gap-2">
          <Ico.Alert size={18} className="text-[var(--teal)]" />
          Recurring Bills
        </h3>
        <span className="text-label text-[var(--teal)] bg-[var(--teal-dim)] px-2 py-0.5 rounded">
          {subscriptions.length} Detected
        </span>
      </div>

      <div className="space-y-3">
        {subscriptions.map((sub, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-[var(--surface-input)] rounded-xl border border-transparent hover:border-[var(--teal)] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--teal-dim)] flex items-center justify-center text-[var(--teal)]">
                <Ico.Mail size={18} />
              </div>
              <div>
                <div className="font-bold text-[var(--text-primary)]">{sub.description}</div>
                <div className="text-caption">Last paid: {new Date(sub.lastDate).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-[var(--text-primary)]">₹{sub.amount.toLocaleString()}</div>
              <div className="text-label text-[var(--teal)]">{sub.frequency}</div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-caption mt-4 text-center">
        These look like regular monthly payments.
      </p>
    </div>
  );
}
