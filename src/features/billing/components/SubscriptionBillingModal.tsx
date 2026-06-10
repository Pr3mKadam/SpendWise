import { useState, useCallback } from 'react';
import { Check, X, Sparkles } from 'lucide-react';

interface SubscriptionPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

const PLANS: SubscriptionPlan[] = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Full-featured personal finance tracking',
    features: [
      'AI-powered spending insights',
      'Smart budget tracking',
      'Natural language input',
      '100% private — no servers',
      'UPI sync & reports',
    ],
  },
  {
    name: 'Pro',
    price: '₹99',
    period: '/month',
    description: 'Everything in Free, plus power features',
    highlighted: true,
    badge: 'Best Value',
    features: [
      'Unlimited goals & budgets',
      'AI Advisor',
      'Tax report generation',
      'Portfolio tracking',
      'Live stock prices',
      'Receipt OCR',
      'Advanced analytics',
    ],
  },
  {
    name: 'Family',
    price: '₹149',
    period: '/month',
    description: 'Everything in Pro, plus family management',
    features: [
      'Up to 5 family members',
      'Parental controls',
      'Allowance management',
      'Real-time spending alerts',
      'Spending reports per member',
    ],
  },
];

interface SubscriptionBillingModalProps {
  onClose: () => void;
  onPlanChange?: (plan: string) => void;
}

export function SubscriptionBillingModal({ onClose, onPlanChange }: SubscriptionBillingModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const currentPlan = localStorage.getItem('spendwise_plan') || 'free';

  const handleSubscribe = useCallback(async (planName: string) => {
    setLoading(planName);

    // Simulate Razorpay subscription checkout
    await new Promise(resolve => setTimeout(resolve, 1500));

    const now = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const planKey = planName.toLowerCase();
    const subscriptionId = `sub_${now}_${rand}`;

    localStorage.setItem('spendwise_plan', planKey);
    localStorage.setItem('spendwise_subscription_id', subscriptionId);
    localStorage.setItem('spendwise_subscription_start', String(now));
    localStorage.setItem('spendwise_subscription_period_end', String(now + 30 * 24 * 60 * 60 * 1000));

    setLoading(null);
    onPlanChange?.(planKey);
    window.dispatchEvent(new Event('storage'));
  }, [onPlanChange]);

  const existingSubscription = localStorage.getItem('spendwise_subscription_id');
  const billingHistory = existingSubscription
    ? [
        {
          id: localStorage.getItem('spendwise_subscription_id'),
          amount: currentPlan === 'pro' ? '₹99' : currentPlan === 'family' ? '₹149' : '₹0',
          date: new Date(Number(localStorage.getItem('spendwise_subscription_start'))).toLocaleDateString(),
          status: 'active',
        },
      ]
    : [];

  const periodEnd = localStorage.getItem('spendwise_subscription_period_end');
  const currentPeriodEnd = periodEnd
    ? new Date(Number(periodEnd)).toLocaleDateString()
    : null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/45 backdrop-blur-[12px]" />
      <div
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-manrope font-bold text-lg">Subscription & Billing</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Choose a plan that works for you
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 cursor-pointer transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--surface-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {currentPeriodEnd && (
          <div
            className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm"
            style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
          >
            <Sparkles size={18} />
            <span className="font-semibold">
              Current period ends on {currentPeriodEnd}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PLANS.map(plan => {
            const isActive = currentPlan === plan.name.toLowerCase();
            return (
              <div
                key={plan.name}
                className="relative rounded-2xl p-5 flex flex-col"
                style={{
                  background: plan.highlighted
                    ? 'linear-gradient(135deg, var(--teal-dim) 0%, #f0fdfa 100%)'
                    : '#ffffff',
                  border: plan.highlighted
                    ? '2px solid var(--teal)'
                    : '2px solid #edf2f7',
                  boxShadow: plan.highlighted
                    ? '0 8px 32px rgba(20,184,166,0.12)'
                    : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {plan.badge && (
                  <span
                    className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: 'var(--teal)', color: '#ffffff' }}
                  >
                    {plan.badge}
                  </span>
                )}

                <h4 className="font-manrope font-bold text-base mb-1">{plan.name}</h4>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  {plan.description}
                </p>

                <div className="mb-4">
                  <span
                    className="font-manrope font-extrabold text-2xl"
                    style={{ color: plan.highlighted ? 'var(--teal)' : 'var(--text-primary)' }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 shrink-0 text-[var(--teal)]" />
                      <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.name !== 'Free' && !isActive && (
                  <button
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={loading !== null}
                    className="w-full h-11 rounded-xl border-none text-sm font-bold cursor-pointer transition-all disabled:opacity-50"
                    style={{
                      background: 'var(--teal)',
                      color: '#ffffff',
                    }}
                  >
                    {loading === plan.name ? 'Processing...' : 'Subscribe'}
                  </button>
                )}

                {plan.name === 'Free' && isActive && (
                  <div
                    className="w-full h-11 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
                  >
                    <Check size={16} className="mr-2" /> Current Plan
                  </div>
                )}

                {isActive && plan.name !== 'Free' && (
                  <div
                    className="w-full h-11 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
                  >
                    <Check size={16} className="mr-2" /> Active
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {billingHistory.length > 0 && (
          <div>
            <h4 className="font-manrope font-bold text-sm mb-3">Billing History</h4>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--surface-input)' }}>
                    <th className="text-left p-3 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Transaction ID</th>
                    <th className="text-left p-3 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Amount</th>
                    <th className="text-left p-3 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Date</th>
                    <th className="text-left p-3 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((entry, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="p-3 text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
                        {entry.id?.slice(0, 16)}...
                      </td>
                      <td className="p-3 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {entry.amount}
                      </td>
                      <td className="p-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {entry.date}
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-bold text-[var(--teal)]">{entry.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
