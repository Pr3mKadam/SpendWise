import { Shield, TrendingUp, Target, Zap } from 'lucide-react';

const FEATURES = [
  { icon: TrendingUp, text: 'AI-powered spending insights' },
  { icon: Target, text: 'Smart budget tracking' },
  { icon: Zap, text: 'Natural language input' },
  { icon: Shield, text: '100% private — no servers' },
];

export function OnboardingSidebar() {
  return (
    <div
      className="flex-shrink-0 flex flex-col justify-between p-6 md:p-10 w-full md:max-w-[280px] md:min-h-[400px]"
      style={{
        background: 'var(--sidebar-bg)',
      }}
    >
      <div>
        <div className="mb-4 md:mb-8">
          <span
            style={{
              fontFamily: 'var(--font-manrope)',
              fontWeight: 800,
              fontSize: '20px',
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}
          >
            SpendWise
          </span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '22px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.3,
            marginBottom: '8px',
          }}
        >
          Your smart
          <br />
          finance copilot
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.6,
          }}
        >
          Personalize your suite in 3 steps.
          <br />
          Securely stored on device.
        </p>
      </div>

      <div className="mt-8 space-y-3 hidden md:block">
        {FEATURES.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
              style={{ background: 'var(--teal-dim)' }}
            >
              <Icon size={13} style={{ color: 'var(--teal)' }} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              {text}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 md:mt-8 flex items-center gap-2">
        <Shield size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
        <span
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          All data stored locally on your device
        </span>
      </div>
    </div>
  );
}
