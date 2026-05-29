import { memo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import { haptic } from '@/core/haptic';

export interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  iconBg: string;
  trend?: 'up' | 'down' | 'neutral';
  hideBalances?: boolean;
}

export const StatCard = memo(function StatCard({ label, value, icon: Icon, iconColor, iconBg, trend, hideBalances }: StatCardProps) {
  return (
    <div
      onClick={() => haptic.light()}
      className="h-full cursor-pointer transition-transform duration-200 hover:-translate-y-1 active:scale-95"
    >
      <Card className="flex flex-col justify-between h-full group" style={{ padding: '10px 12px' }}>
        <div className="flex items-start justify-between mb-1.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ background: iconBg }}>
            <Icon size={14} className={`sm:w-[16px] sm:h-[16px] ${iconColor}`} />
          </div>
          <div className={`flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8px] sm:text-[length:var(--fs-overline)] font-bold ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 
            trend === 'down' ? 'bg-red-500/10 text-red-500' : 
            'bg-slate-500/10 text-slate-500'
          }`}>
            {trend === 'up' && <TrendingUp size={8} />}
            {trend === 'down' && <TrendingDown size={8} />}
            <span className="hidden sm:inline">{trend === 'up' ? 'Up' : trend === 'down' ? 'Down' : 'Stable'}</span>
          </div>
        </div>
        <div className="min-w-0 overflow-hidden">
          <p className={`stat-value-text text-[15px] sm:text-[18px] md:text-xl font-bold truncate tabular-nums transition-all ${hideBalances ? 'blur-md select-none' : ''}`} style={{ color: 'var(--text-primary)', letterSpacing: hideBalances ? '4px' : '-0.03em', fontFamily: 'var(--font-manrope)' }}>
            {hideBalances ? (label === 'Balance' || label === 'Net Worth' ? '••••••' : '•••') : value}
          </p>
          <p className="text-[length:var(--fs-overline)] sm:text-[length:var(--fs-overline)] font-bold truncate uppercase tracking-widest text-[var(--text-muted)] mt-0.5">{label}</p>
        </div>
      </Card>
    </div>
  );
});

export default StatCard;

