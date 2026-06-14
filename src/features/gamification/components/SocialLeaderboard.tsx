import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, TrendingUp, Share2, Globe, Users, Gift } from 'lucide-react';
import { useStore } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import {
  syncLeaderboardStats,
  fetchLeaderboard,
  fetchFriendsLeaderboard,
  simpleHash,
} from '@/core/gamification/syncLeaderboard';
import toast from 'react-hot-toast';

import type { LeaderboardEntry } from '@/core/gamification/syncLeaderboard';

type SortKey = 'xp' | 'level' | 'streak' | 'savingsRate';

const LS_OPTIN_KEY = 'spendwise_leaderboard_optin';
const LS_REFERRALS_KEY = 'spendwise_referrals';
const LS_REFERRAL_BONUS_KEY = 'spendwise_referral_bonus';

export function SocialLeaderboard() {
  const { user } = useAuth();

  const [sortKey, setSortKey] = React.useState<SortKey>('xp');
  const [activeTab, setActiveTab] = React.useState<'global' | 'friends'>('global');
  const [optInStatus, setOptInStatus] = React.useState<'accepted' | 'declined' | null>(() => {
    const saved = localStorage.getItem(LS_OPTIN_KEY);
    if (saved === 'accepted' || saved === 'declined') return saved;
    return null;
  });
  const [leaderboardData, setLeaderboardData] = React.useState<LeaderboardEntry[]>([]);
  const [friendsData, setFriendsData] = React.useState<LeaderboardEntry[]>([]);
  const [referrals, setReferrals] = React.useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_REFERRALS_KEY) || '[]');
    } catch {
      // silently ignore — non-critical
      return [];
    }
  });
  const [referralBonusEarned, setReferralBonusEarned] = React.useState(
    () => !!localStorage.getItem(LS_REFERRAL_BONUS_KEY)
  );
  const [inviteLink, setInviteLink] = React.useState('');
  const [userHash, setUserHash] = React.useState('');
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const syncRef = useRef(false);

  const userLevel = useStore(s => s.level);
  const userXP = useStore(s => s.totalXP);
  const userStreak = useStore(s => s.streak);
  const transactions = useStore(s => s.transactions);

  const savingsRate = useMemo(() => {
    if (!transactions || transactions.length === 0) return 0;
    const income = transactions
      .filter((t: { type: string }) => t.type === 'credit')
      .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t: { type: string }) => t.type === 'debit')
      .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
    if (income === 0) return 0;
    return Math.round(((income - expenses) / income) * 100);
  }, [transactions]);

  const userId = user?.id ?? '';

  const you = useMemo(
    () => ({
      name: 'You',
      avatar: '😊',
      level: userLevel,
      xp: userXP,
      streak: userStreak,
      savingsRate,
      badge: '✨',
    }),
    [userLevel, userXP, userStreak, savingsRate]
  );

  // Compute hash + check URL referral on mount
  useEffect(() => {
    if (!userId) return;

    simpleHash(userId).then(hash => {
      setUserHash(hash);
      setInviteLink(`https://spendwise.app/join?ref=${hash}`);
    });

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (!ref) return;

    simpleHash(userId).then(myHash => {
      if (ref === myHash) return;
      const existing: string[] = JSON.parse(localStorage.getItem(LS_REFERRALS_KEY) || '[]');
      if (existing.includes(ref)) return;
      existing.push(ref);
      localStorage.setItem(LS_REFERRALS_KEY, JSON.stringify(existing));
      setReferrals(existing);
      toast.success('Welcome! You joined via a referral link!', {
        icon: '🎉',
      });
      if (!localStorage.getItem(LS_REFERRAL_BONUS_KEY)) {
        useStore.getState().addXP(100);
        localStorage.setItem(LS_REFERRAL_BONUS_KEY, 'true');
        setReferralBonusEarned(true);
        toast.success('+100 XP referral bonus!', { icon: '🎁' });
      }
    });
  }, [userId]);

  // Sync and fetch leaderboard when opted in
  useEffect(() => {
    if (optInStatus !== 'accepted' || !userId || syncRef.current) return;
    syncRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        await syncLeaderboardStats(userId, {
          level: userLevel,
          xp: userXP,
          streak: userStreak,
          savingsRate,
        });
        if (cancelled) return;
        const [global, friends] = await Promise.all([
          fetchLeaderboard('tier2'),
          referrals.length > 0 ? fetchFriendsLeaderboard(referrals) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setLeaderboardData(global);
        setFriendsData(friends);
        setDataLoaded(true);
      } catch {
        // silently ignore — non-critical
        if (!cancelled) setDataLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // referrals array identity changes, use length instead
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optInStatus, userId, userLevel, userXP, userStreak, savingsRate, referrals.length]);

  const handleAcceptOptIn = useCallback(() => {
    localStorage.setItem(LS_OPTIN_KEY, 'accepted');
    setOptInStatus('accepted');
  }, []);

  const handleDeclineOptIn = useCallback(() => {
    localStorage.setItem(LS_OPTIN_KEY, 'declined');
    setOptInStatus('declined');
  }, []);

  const handleShareInvite = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Invite link copied to clipboard!', { icon: '🔗' });
      useStore.getState().addXP(10);
    } catch {
      // silently ignore — non-critical
      toast.error('Could not copy link');
    }
  }, [inviteLink]);

  const currentData = activeTab === 'global' ? leaderboardData : friendsData;

  const allEntries = useMemo(() => {
    const entries: Array<{
      name: string;
      avatar: string;
      level: number;
      xp: number;
      streak: number;
      savingsRate: number;
      badge: string;
    }> = [you];

    for (const entry of currentData) {
      if (entry.user_hash === userHash) continue;
      entries.push({
        name: entry.display_name || `Player ${entry.user_hash.slice(0, 6)}`,
        avatar: '👤',
        level: entry.level,
        xp: entry.xp,
        streak: entry.streak,
        savingsRate: entry.savings_rate,
        badge: '',
      });
    }

    return entries.sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number));
  }, [currentData, sortKey, you, userHash]);

  const youRank = allEntries.findIndex(e => e.name === 'You') + 1;

  const tabs: { key: SortKey; label: string; icon: React.ElementType }[] = [
    { key: 'xp', label: 'XP', icon: Zap },
    { key: 'level', label: 'Level', icon: Star },
    { key: 'streak', label: 'Streak', icon: TrendingUp },
    { key: 'savingsRate', label: 'Savings', icon: Trophy },
  ];

  // Opt-in prompt
  if (optInStatus === null) {
    return (
      <div className="card p-4 sm:p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Trophy size={18} className="text-amber-500" />
          </div>
          <div>
            <h3 className="font-manrope font-bold text-sm text-[var(--text-primary)]">
              Social Leaderboard
            </h3>
            <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] font-inter mt-0.5">
              Compete with your city and earn bragging rights
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-amber-500/5 to-teal-500/5 border border-amber-500/20 p-5 text-center">
          <span className="text-3xl block mb-3">🏆</span>
          <h4 className="font-manrope font-bold text-sm text-[var(--text-primary)] mb-2">
            Join the leaderboard?
          </h4>
          <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] font-inter mb-4 max-w-xs mx-auto">
            Your data is anonymised — no one sees your real identity, only your stats.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleAcceptOptIn}
              className="px-5 py-2 rounded-xl bg-teal text-white text-xs font-bold border-none cursor-pointer transition-opacity hover:opacity-90"
            >
              Accept
            </button>
            <button
              onClick={handleDeclineOptIn}
              className="px-5 py-2 rounded-xl bg-[var(--surface-input)] text-[var(--text-muted)] text-xs font-bold border border-[var(--border)] cursor-pointer transition-opacity hover:opacity-90"
            >
              Decline
            </button>
          </div>
        </div>

        <p className="text-[length:var(--fs-overline)] text-[var(--text-dim)] text-center mt-4 font-inter">
          🔒 Your stats are hashed and never linked to your email or identity
        </p>
      </div>
    );
  }

  return (
    <div className="card p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Trophy size={18} className="text-amber-500" />
          </div>
          <div>
            <h3 className="font-manrope font-bold text-sm text-[var(--text-primary)]">
              Social Leaderboard
            </h3>
            <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] font-inter mt-0.5">
              {optInStatus === 'accepted'
                ? `You're ranked #${youRank} of ${allEntries.length}`
                : 'Leaderboard is off'}
            </p>
          </div>
        </div>
        {optInStatus === 'accepted' && (
          <span className="text-[length:var(--fs-overline)] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
            #{youRank}
          </span>
        )}
      </div>

      {/* Referral bonus badge */}
      {referralBonusEarned && (
        <div className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Gift size={14} className="text-emerald-500 shrink-0" />
          <span className="text-[length:var(--fs-overline)] font-bold text-emerald-500 font-inter">
            +100 XP referral bonus earned!
          </span>
        </div>
      )}

      {/* Tab bar: Global / Friends + Share */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1 bg-[var(--surface-input)] p-1 rounded-xl border border-[var(--border)] flex-1">
          <button
            onClick={() => setActiveTab('global')}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[length:var(--fs-overline)] font-bold transition-all border-none cursor-pointer"
            style={{
              background: activeTab === 'global' ? 'var(--teal)' : 'transparent',
              color: activeTab === 'global' ? '#fff' : 'var(--text-muted)',
            }}
          >
            <Globe size={12} />
            Global
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[length:var(--fs-overline)] font-bold transition-all border-none cursor-pointer"
            style={{
              background: activeTab === 'friends' ? 'var(--teal)' : 'transparent',
              color: activeTab === 'friends' ? '#fff' : 'var(--text-muted)',
            }}
          >
            <Users size={12} />
            Friends
          </button>
        </div>
        {inviteLink && (
          <button
            onClick={handleShareInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] text-[length:var(--fs-overline)] font-bold text-[var(--text-muted)] cursor-pointer transition-all hover:bg-[var(--surface-card)] border-none"
            title="Share Invite Link"
          >
            <Share2 size={12} />
            Invite
          </button>
        )}
      </div>

      {/* Sort tabs */}
      <div className="flex gap-1.5 mb-4 bg-[var(--surface-input)] p-1 rounded-xl border border-[var(--border)]">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setSortKey(t.key)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[length:var(--fs-overline)] font-bold transition-all border-none cursor-pointer"
            style={{
              background: sortKey === t.key ? 'var(--teal)' : 'transparent',
              color: sortKey === t.key ? '#fff' : 'var(--text-muted)',
            }}
          >
            <t.icon size={10} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {optInStatus === 'accepted' && !dataLoaded && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Leaderboard rows */}
      {dataLoaded && (
        <div className="space-y-2">
          {allEntries.length === 1 && (
            <p className="text-center text-[length:var(--fs-overline)] text-[var(--text-dim)] py-6 font-inter">
              {activeTab === 'friends'
                ? 'No friends on the leaderboard yet. Share your invite link!'
                : 'Be the first on the leaderboard!'}
            </p>
          )}
          {allEntries.map((entry, i) => {
            const isYou = entry.name === 'You';
            const rank = i + 1;
            return (
              <motion.div
                key={isYou ? 'you' : `${entry.name}-${rank}`}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isYou ? 'bg-[var(--teal-dim)] border border-[var(--teal)]/30' : 'bg-[var(--surface-input)] border border-[var(--border)]'}`}
              >
                {/* Rank */}
                <div className="w-6 shrink-0 text-center">
                  {rank <= 3 ? (
                    <span style={{ fontSize: 16 }}>{['🥇', '🥈', '🥉'][rank - 1]}</span>
                  ) : (
                    <span className="text-xs font-bold text-[var(--text-muted)]">#{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg ${isYou ? 'bg-[var(--teal)]/20' : 'bg-[var(--surface-card)]'}`}
                >
                  {entry.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p
                      className={`text-xs font-bold truncate ${isYou ? 'text-[var(--teal)]' : 'text-[var(--text-primary)]'}`}
                    >
                      {entry.name}
                    </p>
                    {isYou && (
                      <span className="text-[8px] font-bold bg-[var(--teal)] text-white px-1.5 py-0.5 rounded-full">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] font-inter">
                    Lvl {entry.level} · {entry.streak}d streak
                  </p>
                </div>

                {/* Sort value */}
                <div className="text-right shrink-0">
                  <p
                    className="font-manrope font-bold text-sm tabular-nums"
                    style={{
                      color: isYou ? 'var(--teal)' : 'var(--text-primary)',
                    }}
                  >
                    {sortKey === 'xp'
                      ? `${entry.xp.toLocaleString()} XP`
                      : sortKey === 'level'
                        ? `L${entry.level}`
                        : sortKey === 'streak'
                          ? `${entry.streak}d`
                          : `${entry.savingsRate}%`}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {dataLoaded && (
        <div className="mt-4 flex flex-col items-center gap-2">
          {inviteLink && (
            <button
              onClick={handleShareInvite}
              className="flex items-center gap-2 text-[length:var(--fs-overline)] font-bold text-teal bg-teal/10 px-3 py-2 rounded-xl border-none cursor-pointer transition-all hover:bg-teal/20"
            >
              <Share2 size={12} />
              Share Invite Link
            </button>
          )}
          <p className="text-[length:var(--fs-overline)] text-[var(--text-dim)] text-center font-inter">
            🔒 Your data is anonymised — no one sees your real identity
          </p>
        </div>
      )}
    </div>
  );
}
