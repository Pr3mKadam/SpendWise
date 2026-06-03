import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';

interface DashboardHeaderProps {
  config: SpendWiseConfig | null;
  isMobile: boolean;
  streak: number;
}

export function DashboardHeader({ config, isMobile, streak }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
      <div>
        <h1
          className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]"
          style={{ fontFamily: 'var(--font-manrope)', letterSpacing: '-0.04em' }}
        >
          Hey, {config?.name || 'there'}!
        </h1>
        {!isMobile && (
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
            {config?.userRole === 'student' && 'Keep building those healthy spending habits! 🎓'}
            {config?.userRole === 'business' && 'Optimize your cash flow today. 🏢'}
            {config?.userRole === 'professional' && 'Your financial control center is ready. 💼'}
            {!config?.userRole && 'Welcome back to your financial control center.'}
          </p>
        )}
      </div>

      {streak > 0 && (
        <div className="inline-flex items-center self-start sm:self-auto gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-full">
          <span className="text-[length:var(--fs-overline)] font-bold text-orange-500 uppercase tracking-widest">
            🔥 {streak} DAY STREAK
          </span>
        </div>
      )}
    </div>
  );
}
