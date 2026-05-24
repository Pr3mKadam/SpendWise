import React, { useState, useMemo, useCallback, Component, ReactNode } from 'react';
import { useSharedWallets } from '@/features/shared/hooks/useSharedWallets';
import { useAuth } from '@/hooks/useAuth';
import { SharedGoal } from '@/features/shared/hooks/useSharedWallets';

import { Ico } from '@/ui/Icons';
import { Btn } from '@/ui/Button';
import { Err } from '@/ui/Alert';
import { CreateGroupModal, InviteModal, WalletModal, ExpenseModal, GoalModal, ContribModal, GroupQRModal } from '@/features/shared/components/SharedModals';
import { WalletTab, ExpensesTab, GoalsTab, MembersTab, ActivityTab } from '@/features/shared/components/tabs';
import { SharedOverview } from '@/features/shared/components/SharedOverview';
import { InviteBanner, EmptyState, GroupSelector } from '@/features/shared/components/SharedGroups';
import { Activity, Share2, Scan, Plus, Users, Target, Wallet } from 'lucide-react';
import { haptic } from '@/lib/haptic';

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-wrap">
              <GroupSelector groups={sw.groups} selectedId={sw.selectedGroupId} onSelect={sw.setSelectedGroupId} onCreate={() => setCreate(true)} />
              
              <div className="flex items-center gap-3.5 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl px-4 py-2 text-xs shadow-sm flex-wrap">
                <div className="flex items-center gap-2" title="Group syncing happens automatically over encrypted P2P">
                  <span className="relative flex h-2.5 w-2.5">
                    {sw.syncState === 'connecting' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${sw.syncState === 'connected' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : sw.syncState === 'connecting' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                  </span>
                  <span className="font-bold text-[var(--text-primary)]">Live Sync</span>
                  <span className="text-[var(--text-muted)] font-medium">
                    {sw.syncState === 'connected' ? `${sw.connectedPeers} peers online` : sw.syncState}
                  </span>
                </div>
              </div>
            </div>

            {sw.selectedGroupId && !sw.loading && (
              <SharedOverview
                groupName={groupName}
                purposeConfig={purposeConfig}
                purpose={sw.selectedGroup?.purpose || 'friends'}
                tab={tab}
                setTab={setTab}
                currency={currency}
                walletBalance={sw.walletBalance}
                membersCount={sw.members.length}
                goalsCount={sw.goals.length}
              />
            )}

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

        <CreateGroupModal show={showCreate} onClose={() => setCreate(false)} onSubmit={async (n: string, p: string, e: string) => { await sw.createGroup(n, p, userName, e); }} userName={userName} />
        <InviteModal      show={showInvite}  onClose={() => setInvite(false)}  onSubmit={sw.inviteMember} groupName={groupName} groupId={sw.selectedGroupId || undefined} />
        <GroupQRModal     show={showQR}      onClose={() => setQR(false)}      groupData={sw.selectedGroupId ? (sw.exportGroup(sw.selectedGroupId) || '') : ''} groupName={groupName} />
        <WalletModal      show={showWallet}  onClose={() => setWallet(false)}  members={sw.members} onSubmit={sw.addWalletEntry} currency={currency} />
        <ExpenseModal     show={showExpense} onClose={() => setExpense(false)} members={sw.members} onSubmit={sw.addExpense}     currency={currency} />
        <GoalModal        show={showGoal}    onClose={() => setGoal(false)}    onSubmit={sw.addGoal} />
        <ContribModal     show={showContrib} onClose={() => setContrib(false)} goal={activeGoal} members={sw.members} onSubmit={sw.contributeToGoal} currency={currency} />
      </div>
    </SharedErrorBoundary>
  );
}
