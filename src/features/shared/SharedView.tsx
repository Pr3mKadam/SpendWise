import React, { useState, useMemo, useCallback, Component, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useSharedWallets } from '@/features/shared/hooks/useSharedWallets';
import { useAuth } from '@/hooks/useAuth';
import { SharedGoal } from '@/features/shared/hooks/useSharedWallets';
import { motion, AnimatePresence } from 'framer-motion';

import { Ico } from '@/ui/Icons';
import { Btn } from '@/ui/Button';
import { Err } from '@/ui/Alert';
import { CreateGroupModal, InviteModal, WalletModal, ExpenseModal, GoalModal, ContribModal, GroupQRModal, ConnectCohortModal } from '@/features/shared/components/SharedModals';
import { WalletTab, ExpensesTab, GoalsTab, MembersTab, ActivityTab } from '@/features/shared/components/SharedTabs';
import { Activity, Sparkles, Share2, Scan, Plus, UserMinus, Shield, Zap, Info, ChevronDown, Check, Users, Target, Wallet } from 'lucide-react';
import { haptic } from '@/lib/haptic';

const PURPOSE_EMOJI: Record<string, string> = { friends: '🎉', roommates: '🏠', family: '👨‍👩‍👧', other: '🤝' };
const PURPOSE_COLORS: Record<string, { gradient: string; text: string; bg: string; border: string }> = {
  friends: {
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    text: '#fbcfe8',
    bg: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.25)'
  },
  roommates: {
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    text: '#bfdbfe',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.25)'
  },
  family: {
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    text: '#a7f3d0',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.25)'
  },
  other: {
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    text: '#ddd6fe',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.25)'
  }
};

// Helpers
const relTime = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── Invite Banner ────────────────────────────────────────────────────────────

function InviteBanner({ invites, onAccept, onDecline }: {
  invites: { memberId: string; groupId: string; groupName: string; groupPurpose: string; invitedAt: string }[];
  onAccept: (id: string) => void; onDecline: (id: string) => void;
}) {
  if (!invites.length) return null;
  return (
    <div className="mb-6">
      <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse shadow-sm shadow-amber-500/50" />
        {invites.length} Pending Invite{invites.length !== 1 ? 's' : ''}
      </div>
      <AnimatePresence>
        {invites.map(inv => (
          <motion.div
            key={inv.memberId}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 mb-2 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <span className="text-3xl shrink-0 filter drop-shadow-sm select-none">{PURPOSE_EMOJI[inv.groupPurpose] ?? '🤝'}</span>
            <div className="flex-1 min-w-0">
              <p className="m-0 font-bold text-[var(--text-primary)] text-sm">{inv.groupName}</p>
              <p className="m-0 mt-0.5 text-xs text-[var(--text-muted)] font-medium">Invited {relTime(inv.invitedAt)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => { haptic.medium(); onAccept(inv.memberId); }}
                className="flex justify-center items-center gap-1.5 px-4 h-10 bg-emerald-500 text-slate-900 border-none rounded-xl cursor-pointer font-bold text-xs transition-all active:scale-95 shadow-md shadow-emerald-500/20 hover:bg-emerald-400"
              >
                <Check size={14} strokeWidth={2.5} /> Accept
              </button>
              <button
                type="button"
                onClick={() => { haptic.light(); onDecline(inv.memberId); }}
                className="flex justify-center items-center gap-1.5 px-3 h-10 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl cursor-pointer font-bold text-xs transition-all active:scale-95 hover:bg-red-500/20"
              >
                <Ico.X size={14} /> Decline
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreateGroup }: { onCreateGroup: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-[500px] mx-auto bg-[var(--surface-card)] rounded-[28px] border border-[var(--border)] shadow-sm relative overflow-hidden"
    >
      <div className="absolute top-0 inset-x-0 h-[4px] bg-gradient-to-r from-[var(--teal)] to-blue-500" />
      <div className="absolute inset-0 bg-radial-gradient(circle at top, var(--teal-dim) 0%, transparent 60%) opacity-30 pointer-events-none" />
      
      <div className="w-20 h-20 rounded-2xl bg-[var(--teal)]/10 flex items-center justify-center text-4xl mb-6 shadow-inner relative select-none">
        <span className="absolute inset-0 rounded-2xl bg-[var(--teal)]/10 blur-md pointer-events-none" />
        🤝
      </div>
      <h2 className="m-0 mb-2.5 text-xl font-extrabold text-[var(--text-primary)] tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
        No Shared Groups Yet
      </h2>
      <p className="m-0 mb-8 text-[var(--text-muted)] leading-relaxed text-xs font-medium">
        Create a shared wallet to track joint expenses, split bills and save towards group goals — all synced in real time with cohorts.
      </p>
      <button 
        type="button" 
        onClick={() => { haptic.medium(); onCreateGroup(); }} 
        className="inline-flex justify-center items-center gap-2 px-6 h-11 bg-[var(--teal)] text-white border-none rounded-xl cursor-pointer font-bold text-sm transition-all active:scale-95 shadow-lg shadow-teal-500/25 hover:bg-[var(--teal-light)]"
      >
        <Plus size={16} strokeWidth={2.5} /> Create First Group
      </button>
    </motion.div>
  );
}

// ─── Group Selector ───────────────────────────────────────────────────────────

function GroupSelector({ groups, selectedId, onSelect, onCreate }: { groups: any[]; selectedId: string | null; onSelect: (id: string) => void; onCreate: () => void }) {
  const [open, setOpen] = useState(false);
  const sel = groups.find(g => g.id === selectedId);
  return (
    <div className="relative flex-1 min-w-[200px]">
      <button 
        type="button" 
        onClick={() => { haptic.light(); setOpen(v => !v); }} 
        className="flex items-center gap-3 px-4 h-12 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl cursor-pointer w-full text-left hover:border-[var(--teal)] transition-all shadow-sm focus:outline-none"
      >
        <span className="text-xl leading-none select-none">{PURPOSE_EMOJI[sel?.purpose ?? 'friends'] ?? '🤝'}</span>
        <span className="flex-1 font-bold text-[var(--text-primary)] text-sm truncate">{sel?.name ?? 'Select Group'}</span>
        <ChevronDown className={`text-[var(--text-muted)] transition-transform duration-250 ${open ? 'rotate-180' : ''}`} size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} className="fixed inset-0 z-[80]" />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-full left-0 right-0 mt-2.5 z-[81] bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md"
            >
              <div className="max-h-[240px] overflow-y-auto">
                {groups.map(g => (
                  <button 
                    key={g.id} 
                    type="button" 
                    onClick={() => { haptic.light(); onSelect(g.id); setOpen(false); }} 
                    className={`flex items-center gap-3 px-4 h-11 w-full text-left border-none cursor-pointer transition-colors ${selectedId === g.id ? 'bg-[var(--teal)]/10 text-[var(--teal)] font-bold' : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'}`}
                  >
                    <span className="text-lg select-none">{PURPOSE_EMOJI[g.purpose] ?? '🤝'}</span>
                    <span className="text-xs font-semibold">{g.name}</span>
                    {selectedId === g.id && <Check className="ml-auto text-[var(--teal)]" size={14} strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
              <div className="border-t border-[var(--border)] p-1 bg-[var(--surface-bg)]">
                <button 
                  type="button" 
                  onClick={() => { haptic.medium(); onCreate(); setOpen(false); }} 
                  className="flex items-center gap-2 px-3 h-10 w-full bg-transparent border-none rounded-xl cursor-pointer text-[var(--teal)] font-bold text-xs hover:bg-[var(--teal)]/5 transition-colors"
                >
                  <Plus size={14} strokeWidth={2.5} /> New Group
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

type Tab = 'wallet' | 'expenses' | 'goals' | 'members' | 'activity';
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'wallet',   label: 'Pot Balance',   icon: <Wallet size={15} /> },
  { id: 'expenses', label: 'Split Bills',   icon: <ArrowRightLeftIcon size={15} /> },
  { id: 'goals',    label: 'Group Goals',   icon: <Target size={15} /> },
  { id: 'members',  label: 'Cohorts',       icon: <Users size={15} /> },
  { id: 'activity', label: 'Activity Logs',  icon: <Activity size={15} /> },
];

function ArrowRightLeftIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 3 4 4-4 4" />
      <path d="M20 7H4" />
      <path d="m8 21-4-4 4-4" />
      <path d="M4 17h16" />
    </svg>
  );
}

class SharedErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: any) { console.error('[SharedView] Render error:', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-[var(--surface-card)] rounded-[28px] border border-[var(--border)] max-w-[500px] mx-auto shadow-sm">
          <div className="text-4xl mb-4 leading-none select-none">⚠️</div>
          <h2 className="m-0 mb-2.5 text-lg font-extrabold text-[var(--text-primary)] tracking-tight">Something went wrong</h2>
          <p className="text-xs text-[var(--text-muted)] max-w-[360px] mb-6 leading-relaxed font-medium">
            The Shared Wallets view encountered an error. This is usually caused by a database connection issue.
          </p>
          <p className="font-mono text-[10px] text-red-500 bg-red-500/10 p-3 rounded-xl max-w-[420px] overflow-x-auto border border-red-500/15 w-full">
            {this.state.error.message}
          </p>
          <Btn v="primary" onClick={() => this.setState({ error: null })} className="mt-6 px-6">Try Again</Btn>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SharedView({ currency, userId: propUserId }: { currency: string; userId?: string | null }) {
  const { user } = useAuth();
  const userId   = propUserId ?? user?.id ?? null;
  const userEmail = user?.email ?? null;
  const sw       = useSharedWallets(userId, userEmail);
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'You';

  const [tab, setTab]               = useState<Tab>('wallet');
  const [showCreate, setCreate]     = useState(false);
  const [showInvite, setInvite]     = useState(false);
  const [showWallet, setWallet]     = useState(false);
  const [showExpense, setExpense]   = useState(false);
  const [showGoal, setGoal]         = useState(false);
  const [showContrib, setContrib]   = useState(false);
  const [showConnect, setConnect]   = useState(false);
  const [showQR, setQR]             = useState(false);
  const [activeGoal, setActiveGoal] = useState<SharedGoal | null>(null);

  const isOwner = useMemo(() => sw.selectedGroup?.created_by === userId, [sw.selectedGroup, userId]);
  const groupName = sw.selectedGroup?.name || 'Shared Wallet';

  const openContrib = useCallback((g: SharedGoal) => { setActiveGoal(g); setContrib(true); }, []);

  const handleAdd = useCallback(() => {
    if (tab === 'wallet')   { setWallet(true);  return; }
    if (tab === 'expenses') { setExpense(true); return; }
    if (tab === 'goals')    { setGoal(true);    return; }
    if (tab === 'members')  { setInvite(true);  return; }
  }, [tab]);

  const addLabel = tab === 'wallet' ? '+ Add Entry' : tab === 'expenses' ? '+ Add Expense' : tab === 'goals' ? '+ New Goal' : isOwner ? '+ Invite' : null;

  // Selected Group Purpose details
  const purposeConfig = useMemo(() => {
    const purpose = sw.selectedGroup?.purpose || 'friends';
    return PURPOSE_COLORS[purpose] || PURPOSE_COLORS.friends;
  }, [sw.selectedGroup]);

  return (
    <SharedErrorBoundary>
      <div className="animate-fade-in-up">
        <InviteBanner invites={sw.pendingInvites} onAccept={sw.acceptInvite} onDecline={sw.declineInvite} />

        {!sw.loading && sw.groups.length === 0 && sw.pendingInvites.length === 0 ? (
          <EmptyState onCreateGroup={() => setCreate(true)} />
        ) : (
          <>
            {/* Header Controls Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-wrap">
              <GroupSelector groups={sw.groups} selectedId={sw.selectedGroupId} onSelect={sw.setSelectedGroupId} onCreate={() => setCreate(true)} />
              
              {/* P2P Sync Status inside Glowing Bar */}
              <div className="flex items-center gap-3.5 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl px-4 py-2 text-xs shadow-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    {sw.syncState === 'connecting' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${sw.syncState === 'connected' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : sw.syncState === 'connecting' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                  </span>
                  <span className="font-bold text-[var(--text-primary)]">Realtime Core P2P</span>
                  <span className="text-[var(--text-muted)] font-medium">
                    {sw.syncState === 'connected' ? `(${sw.connectedPeers} cohorts)` : sw.syncState}
                  </span>
                </div>
                <div className="hidden sm:block h-3.5 w-[1px] bg-[var(--border)]" />
                <span className="hidden sm:inline font-mono text-[10px] text-[var(--text-muted)] opacity-85" title="Your Peer ID">
                  Peer ID: {sw.localPeerId?.slice(0, 8)}...
                </span>
                <button 
                  onClick={() => {
                    setConnect(true);
                  }}
                  className="px-3 h-8 bg-[var(--teal)]/10 text-[var(--teal)] hover:bg-[var(--teal)]/20 rounded-xl font-bold cursor-pointer transition-colors border-none text-[10px] flex justify-center items-center"
                >
                  Connect Cohort
                </button>
              </div>
            </div>

            {/* ─── Standardized Dashboard Hero ─── */}
            {sw.selectedGroupId && !sw.loading && (
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
                        {sw.selectedGroup?.purpose || 'friends'} group {PURPOSE_EMOJI[sw.selectedGroup?.purpose || 'friends']}
                      </div>
                  </div>
                </div>

                {/* Standard Stat Cards Grid */}
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
                      {currency}{sw.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
                      {sw.members.length}
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
                      {sw.goals.length}
                      <span className="text-[11px] text-[var(--text-muted)] font-medium">shared goals</span>
                    </p>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
              <div className="flex items-center gap-2.5 flex-wrap">
                {sw.selectedGroupId && (
                  <button 
                    onClick={() => { haptic.light(); setQR(true); }}
                    className="flex items-center justify-center gap-2 px-4 h-10 bg-[var(--teal)]/10 text-[var(--teal)] border-none rounded-xl cursor-pointer font-bold text-xs hover:bg-[var(--teal)]/20 transition-all shadow-sm active:scale-95"
                  >
                    <Share2 size={13} strokeWidth={2.5} /> Export Group QR
                  </button>
                )}
                <button 
                  onClick={() => {
                    haptic.light();
                    const code = prompt('Enter the Join Code (Base64 string from QR):');
                    if (code) sw.importGroup(code);
                  }}
                  className="flex items-center justify-center gap-2 px-4 h-10 bg-[var(--surface-card)] border border-[var(--border)] rounded-xl cursor-pointer text-[var(--text-primary)] font-bold text-xs hover:border-[var(--teal)] transition-all shadow-sm active:scale-95"
                >
                  <Scan size={13} strokeWidth={2.5} /> Join Group via QR
                </button>
              </div>

              {sw.selectedGroupId && addLabel && (
                <button 
                  type="button" 
                  onClick={() => { haptic.medium(); handleAdd(); }}
                  className="inline-flex justify-center items-center gap-1.5 px-5 h-10 bg-[var(--teal)] text-white border-none rounded-xl cursor-pointer font-bold text-xs transition-all active:scale-95 shadow-md shadow-teal-500/10 hover:bg-[var(--teal-light)] animate-pulse"
                >
                  <Plus size={14} strokeWidth={2.5} /> {addLabel}
                </button>
              )}
            </div>

            {sw.error && <Err msg={sw.error} />}

            {sw.loading && (
              <div className="text-center py-20 text-[var(--text-muted)] bg-[var(--surface-card)] rounded-[24px] border border-[var(--border)]">
                <div className="text-[2rem] inline-block mb-3 text-[var(--teal)] animate-spin"><Ico.Spin /></div>
                <p className="m-0 text-xs font-semibold">Loading group sync state…</p>
              </div>
            )}

            {!sw.loading && sw.selectedGroupId && (
              <>
                {/* Tab Navigation */}
                <div className="flex gap-1.5 bg-[var(--surface-input)] rounded-2xl p-1.5 mb-6 border border-[var(--border)] overflow-x-auto hide-scrollbar">
                  {TABS.map(t => {
                    const isActive = tab === t.id;
                    return (
                      <button 
                        key={t.id} 
                        type="button" 
                        onClick={() => { haptic.light(); setTab(t.id); }} 
                        className={`flex-grow sm:flex-1 flex items-center justify-center gap-2 min-h-[44px] px-3.5 rounded-xl border-none cursor-pointer font-bold text-xs transition-all font-inherit whitespace-nowrap ${isActive ? 'bg-[var(--surface-card)] text-[var(--teal)] shadow-sm border border-[var(--border)]' : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                      >
                        {t.icon} <span className="hidden sm:inline">{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Panel with Soft Glowing Border */}
                <div 
                  className="bg-[var(--surface-card)] rounded-[24px] p-6 shadow-sm border relative overflow-hidden transition-all duration-300"
                  style={{
                    borderColor: tab === 'wallet' ? 'rgba(16, 185, 129, 0.2)' : tab === 'expenses' ? 'rgba(45, 212, 191, 0.2)' : tab === 'goals' ? 'rgba(245, 158, 11, 0.2)' : tab === 'members' ? 'rgba(139, 92, 246, 0.2)' : 'var(--border)'
                  }}
                >
                  <div 
                    className="absolute top-0 inset-x-0 h-[3px] transition-all duration-300"
                    style={{
                      background: tab === 'wallet' ? 'linear-gradient(90deg, transparent, #10b981, transparent)' : tab === 'expenses' ? 'linear-gradient(90deg, transparent, #2dd4bf, transparent)' : tab === 'goals' ? 'linear-gradient(90deg, transparent, #f59e0b, transparent)' : tab === 'members' ? 'linear-gradient(90deg, transparent, #8b5cf6, transparent)' : 'linear-gradient(90deg, transparent, var(--border), transparent)'
                    }}
                  />
                  {tab === 'wallet'   && <WalletTab entries={sw.walletEntries} members={sw.members} onDelete={sw.deleteWalletEntry} currency={currency} />}
                  {tab === 'expenses' && <ExpensesTab expenses={sw.expenses} members={sw.members} splitBalances={sw.splitBalances} onDelete={sw.deleteExpense} currency={currency} />}
                  {tab === 'goals'    && <GoalsTab goals={sw.goals} onDelete={sw.deleteGoal} onContrib={openContrib} currency={currency} />}
                  {tab === 'members'  && <MembersTab members={sw.members} uid={userId} isOwner={isOwner} onRemove={sw.removeMember} onInvite={() => setInvite(true)} />}
                  {tab === 'activity' && <ActivityTab entries={sw.walletEntries} expenses={sw.expenses} goals={sw.goals} members={sw.members} currency={currency} />}
                </div>
              </>
            )}
          </>
        )}

        {/* Modals */}
        <CreateGroupModal show={showCreate} onClose={() => setCreate(false)} onSubmit={async (n: string, p: string, e: string) => { await sw.createGroup(n, p, userName, e); }} userName={userName} />
        <InviteModal      show={showInvite}  onClose={() => setInvite(false)}  onSubmit={sw.inviteMember} groupName={groupName} groupId={sw.selectedGroupId || undefined} />
        <GroupQRModal     show={showQR}      onClose={() => setQR(false)}      groupData={sw.selectedGroupId ? (sw.exportGroup(sw.selectedGroupId) || '') : ''} groupName={groupName} />
        <WalletModal      show={showWallet}  onClose={() => setWallet(false)}  members={sw.members} onSubmit={sw.addWalletEntry} currency={currency} />
        <ExpenseModal     show={showExpense} onClose={() => setExpense(false)} members={sw.members} onSubmit={sw.addExpense}     currency={currency} />
        <GoalModal        show={showGoal}    onClose={() => setGoal(false)}    onSubmit={sw.addGoal} />
        <ContribModal     show={showContrib} onClose={() => setContrib(false)} goal={activeGoal} members={sw.members} onSubmit={sw.contributeToGoal} currency={currency} />
        <ConnectCohortModal show={showConnect} onClose={() => setConnect(false)} localPeerId={sw.localPeerId || ''} onSubmit={sw.connectToPeer} />
      </div>
    </SharedErrorBoundary>
  );
}
