import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../../common/Card';

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
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="flex flex-col justify-between h-full group" style={{ padding: '10px 12px' }}>
        <div className="flex items-start justify-between mb-1.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ background: iconBg }}>
            <Icon size={14} className={`sm:w-[16px] sm:h-[16px] ${iconColor}`} />
          </div>
          <div className={`flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold ${
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
          <p className={`stat-value-text text-[15px] sm:text-[18px] md:text-xl font-black truncate tabular-nums transition-all ${hideBalances ? 'blur-md select-none' : ''}`} style={{ color: '#0f1117', letterSpacing: '-0.03em', fontFamily: 'var(--font-manrope)' }}>
            {value}
          </p>
          <p className="text-[9px] sm:text-[10px] font-bold truncate uppercase tracking-widest text-[#9197a6] mt-0.5">{label}</p>
        </div>
      </Card>
    </motion.div>
  );
});

export default StatCard;
