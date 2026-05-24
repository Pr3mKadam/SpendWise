import { motion } from 'framer-motion';
import { Users, Sparkles, Wallet, Target } from 'lucide-react';
import { haptic } from '@/lib/haptic';

const PURPOSE_EMOJI: Record<string, string> = { friends: '🎉', roommates: '🏠', family: '👨‍👩‍👧', other: '🤝' };

interface SharedOverviewProps {
  groupName: string;
  purposeConfig: { bg: string; border: string; text: string };
  purpose: string;
  tab: string;
  setTab: (tab: any) => void;
  currency: string;
  walletBalance: number;
  membersCount: number;
  goalsCount: number;
}

export function SharedOverview({
  groupName, purposeConfig, purpose, tab, setTab,
  currency, walletBalance, membersCount, goalsCount
}: SharedOverviewProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-headline">
            <Users size={22} style={{ color: 'var(--teal)' }} />
            {groupName}
          </h2>
          <p className="text-caption mt-1 max-w-lg">
            Manage your group's shared finances, cohorts, and goals in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs"
              style={{
                background: purposeConfig.bg,
                borderColor: purposeConfig.border,
                color: purposeConfig.text
              }}
            >
              <Sparkles size={14} />
              {purpose || 'friends'} group {PURPOSE_EMOJI[purpose || 'friends']}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <motion.div 
          whileHover={{ y: -2 }} 
          onClick={() => { haptic.light(); setTab('wallet'); }}
          className={`card px-4 py-4 cursor-pointer transition-all ${tab === 'wallet' ? 'border-[var(--teal)] shadow-[0_0_0_1px_var(--teal)]' : ''}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: 'var(--emerald)' }}><Wallet size={16} /></span>
            <span className="font-inter text-[length:var(--fs-overline)] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Pot Balance</span>
          </div>
          <p className="font-manrope font-bold text-xl text-[var(--text-primary)]">
            {currency}{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }} 
          onClick={() => { haptic.light(); setTab('members'); }}
          className={`card px-4 py-4 cursor-pointer transition-all ${tab === 'members' ? 'border-[var(--teal)] shadow-[0_0_0_1px_var(--teal)]' : ''}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: 'var(--teal)' }}><Users size={16} /></span>
            <span className="font-inter text-[length:var(--fs-overline)] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Connected Cohorts</span>
          </div>
          <p className="font-manrope font-bold text-xl text-[var(--text-primary)] flex items-baseline gap-1.5">
            {membersCount}
            <span className="text-[11px] text-[var(--text-muted)] font-medium">members</span>
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }} 
          onClick={() => { haptic.light(); setTab('goals'); }}
          className={`card px-4 py-4 cursor-pointer transition-all ${tab === 'goals' ? 'border-[var(--teal)] shadow-[0_0_0_1px_var(--teal)]' : ''}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: 'var(--amber)' }}><Target size={16} /></span>
            <span className="font-inter text-[length:var(--fs-overline)] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Active Targets</span>
          </div>
          <p className="font-manrope font-bold text-xl text-[var(--text-primary)] flex items-baseline gap-1.5">
            {goalsCount}
            <span className="text-[11px] text-[var(--text-muted)] font-medium">shared goals</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
