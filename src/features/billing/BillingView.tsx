import { useState } from 'react';
import { CreditCard, Sparkles, AlertTriangle } from 'lucide-react';
import { SubscriptionBillingModal } from '@/features/billing/components/SubscriptionBillingModal';

interface BillingViewProps {
  onPlanChange?: (plan: string) => void;
}

export function BillingView({ onPlanChange }: BillingViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const currentPlan = localStorage.getItem('spendwise_plan') || 'free';
  const subscriptionId = localStorage.getItem('spendwise_subscription_id');
  const periodEnd = localStorage.getItem('spendwise_subscription_period_end');
  const currentPeriodEnd = periodEnd
    ? new Date(Number(periodEnd)).toLocaleDateString()
    : null;

  const handleCancel = () => {
    localStorage.removeItem('spendwise_subscription_id');
    localStorage.removeItem('spendwise_subscription_period_end');
    localStorage.removeItem('spendwise_subscription_start');
    localStorage.setItem('spendwise_plan', 'free');
    setShowCancelConfirm(false);
    onPlanChange?.('free');
    window.dispatchEvent(new Event('storage'));
  };

  const planLabels: Record<string, string> = {
    free: 'Free',
    pro: 'Pro — ₹99/mo',
    family: 'Family — ₹149/mo',
  };

  return (
    <>
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-manrope font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              <span className="flex items-center gap-2">
                <CreditCard size={18} className="text-[var(--teal)]" />
                Subscription & Billing
              </span>
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Manage your plan and billing details
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-between p-4 rounded-2xl"
          style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-glow)' }}
        >
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-[var(--teal)]" />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--teal)' }}>
                {planLabels[currentPlan] || 'Free'}
              </p>
              {currentPeriodEnd && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Current period ends {currentPeriodEnd}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl border-none bg-[var(--teal)] text-white text-xs font-bold cursor-pointer transition-all hover:bg-[var(--teal-light)]"
          >
            {currentPlan === 'free' ? 'Upgrade' : 'Change Plan'}
          </button>
        </div>

        {subscriptionId && currentPlan !== 'free' && (
          <div>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex items-center gap-2 text-xs font-bold cursor-pointer transition-all hover:opacity-80"
              style={{ color: 'var(--red, #ef4444)' }}
            >
              <AlertTriangle size={14} />
              Cancel Subscription
            </button>
          </div>
        )}

        {subscriptionId && (
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            <p>Subscription ID: <span className="font-mono">{subscriptionId.slice(0, 20)}...</span></p>
          </div>
        )}
      </div>

      {showModal && (
        <SubscriptionBillingModal
          onClose={() => setShowModal(false)}
          onPlanChange={onPlanChange}
        />
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setShowCancelConfirm(false)} className="absolute inset-0 bg-black/45 backdrop-blur-[12px]" />
          <div
            className="relative z-10 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center"
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-red-500/10">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
            </div>
            <h3 className="font-manrope font-bold text-base mb-2">Cancel Subscription</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Downgrade to Free? You'll lose access to Pro features at the end of this billing period.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 rounded-xl border-none bg-[var(--surface-input)] text-sm font-bold cursor-pointer transition-all hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                Keep Plan
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl border-none bg-red-500 text-white text-sm font-bold cursor-pointer transition-all hover:bg-red-600"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
