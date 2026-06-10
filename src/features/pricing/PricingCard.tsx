import { Check, Sparkles } from 'lucide-react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
  badge?: string;
}

const PLANS: PricingPlan[] = [
  {
    name: 'Individual',
    price: 'Free',
    period: 'forever',
    description: 'Full-featured personal finance tracking',
    features: [
      { text: 'AI-powered spending insights', included: true },
      { text: 'Smart budget tracking', included: true },
      { text: 'Natural language input', included: true },
      { text: '100% private — no servers', included: true },
      { text: 'UPI sync & reports', included: true },
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
      { text: 'Unlimited goals & budgets', included: true },
      { text: 'AI Advisor', included: true },
      { text: 'Tax report generation', included: true },
      { text: 'Portfolio tracking', included: true },
      { text: 'Live stock prices', included: true },
      { text: 'Receipt OCR', included: true },
      { text: 'Advanced analytics', included: true },
    ],
  },
  {
    name: 'Family',
    price: '₹149',
    period: '/month',
    description: 'Everything in Pro, plus family management',
    badge: 'Popular',
    features: [
      { text: 'Unlimited goals & budgets', included: true },
      { text: 'AI Advisor', included: true },
      { text: 'Tax report generation', included: true },
      { text: 'Portfolio tracking', included: true },
      { text: 'Live stock prices', included: true },
      { text: 'Receipt OCR', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Up to 5 family members', included: true },
      { text: 'Parental controls', included: true },
      { text: 'Allowance management', included: true },
      { text: 'Real-time spending alerts', included: true },
      { text: 'Spending reports for each member', included: true },
    ],
  },
];

interface PricingCardProps {
  currentPlan?: 'individual' | 'pro' | 'family';
  onUpgrade?: () => void;
  compact?: boolean;
}

export function PricingCard({ currentPlan = 'individual', onUpgrade, compact }: PricingCardProps) {
  if (compact) {
    const plan = currentPlan === 'family' ? PLANS[2] : currentPlan === 'pro' ? PLANS[1] : PLANS[0];
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">
              Your Plan
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {plan.name} · {plan.price}{plan.period !== 'forever' ? plan.period : ''}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--teal-dim)] flex items-center justify-center text-[var(--teal)]">
            <Sparkles size={20} />
          </div>
        </div>
        {currentPlan === 'individual' && onUpgrade && (
          <button
            onClick={onUpgrade}
            className="w-full py-3 rounded-xl border-none bg-[var(--teal)] text-white font-bold text-sm cursor-pointer transition-all hover:bg-[var(--teal-light)] hover:shadow-lg"
          >
            Upgrade to Pro — ₹99/mo
          </button>
        )}
        {currentPlan === 'family' && (
          <div className="flex items-center gap-2 text-[var(--teal)] text-xs font-bold">
            <Check size={14} />
            All features unlocked
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
      {PLANS.map(plan => {
        const planKey = plan.name === 'Pro' ? 'pro' : plan.name === 'Family' ? 'family' : 'individual';
        const isActive = currentPlan === planKey;
        return (
          <div
            key={plan.name}
            className="relative rounded-2xl p-6 flex flex-col"
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

            <div className="mb-5">
              <h3
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                {plan.name}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: '2px',
                }}
              >
                {plan.description}
              </p>
            </div>

            <div className="mb-6">
              <span
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '28px',
                  fontWeight: 800,
                  color: plan.highlighted ? 'var(--teal)' : 'var(--text-primary)',
                }}
              >
                {plan.price}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  marginLeft: '4px',
                }}
              >
                {plan.period}
              </span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map(f => (
                <li key={f.text} className="flex items-start gap-3">
                  <div
                    className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: f.included ? 'var(--teal-dim)' : '#f1f5f9',
                    }}
                  >
                    <Check
                      size={12}
                      style={{ color: f.included ? 'var(--teal)' : '#94a3b8' }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '13px',
                      color: f.included ? 'var(--text-primary)' : '#94a3b8',
                      lineHeight: 1.4,
                    }}
                  >
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            {plan.name !== 'Individual' && !isActive && onUpgrade && (
              <button
                onClick={onUpgrade}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#ffffff',
                  background: 'var(--teal)',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--teal-light)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px var(--teal-glow)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--teal)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                }}
              >
                Upgrade to {plan.name}
              </button>
            )}

            {isActive && (
              <div
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}
              >
                <Check size={16} />
                Current Plan
              </div>
            )}

            {plan.name === 'Individual' && !isActive && (
              <div
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                style={{ background: '#f8fafc', color: 'var(--text-muted)' }}
              >
                Downgrade
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
