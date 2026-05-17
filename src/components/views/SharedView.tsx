import React, { useState, useMemo, useCallback, Component, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useSharedWallets } from '../../hooks/useSharedWallets';
import { useAuth } from '../../hooks/useAuth';
import { SharedGoal } from '../../hooks/useSharedWallets';

import { Ico } from '../common/ui/Icons';
import { Btn } from '../common/ui/Button';
import { Err } from '../common/ui/Alert';
import { CreateGroupModal, InviteModal, WalletModal, ExpenseModal, GoalModal, ContribModal, GroupQRModal } from '../features/shared/SharedModals';
import { WalletTab, ExpensesTab, GoalsTab, MembersTab, ActivityTab } from '../features/shared/SharedTabs';
import { Activity } from 'lucide-react';

const PURPOSE_EMOJI: Record<string, string> = { friends: '🎉', roommates: '🏠', family: '👨‍👩‍👧', other: '🤝' };

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
    <div className="mb-5">
      <div className="text-[0.7rem] font-extrabold text-amber-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
        <span className="w-[7px] h-[7px] rounded-full bg-amber-500 inline-block" />
        {invites.length} Pending Invite{invites.length !== 1 ? 's' : ''}
      </div>
      {invites.map(inv => (
        <div key={inv.memberId} className="bg-amber-500/5 border border-amber-500/25 rounded-[14px] p-3.5 px-4 flex items-center gap-3 mb-2">
          <span className="text-[28px]">{PURPOSE_EMOJI[inv.groupPurpose] ?? '🤝'}</span>
          <div className="flex-1 min-w-0">
            <p className="m-0 font-bold text-[var(--text)] text-[0.9rem]">{inv.groupName}</p>
            <p className="m-0 mt-0.5 text-[0.72rem] text-[var(--text-secondary)]">Invited {relTime(inv.invitedAt)}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => onAccept(inv.memberId)} className="flex items-center gap-1.5 px-3.5 py-[7px] bg-emerald-500 text-white border-none rounded-lg cursor-pointer font-bold text-[0.78rem]">
              <Ico.Check /> Accept
            </button>
            <button type="button" onClick={() => onDecline(inv.memberId)} className="flex items-center gap-1.5 px-2.5 py-[7px] bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg cursor-pointer font-bold text-[0.78rem]">
              <Ico.X /> Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreateGroup }: { onCreateGroup: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="text-[80px] mb-6 leading-none">🤝</div>
      <h2 className="m-0 mb-3 text-[1.6rem] font-extrabold text-[var(--text)] tracking-tight">No Shared Groups Yet</h2>
      <p className="m-0 mb-10 text-[var(--text-secondary)] max-w-[380px] leading-relaxed text-[0.95rem]">
        Create a shared wallet to track joint expenses, split bills and save towards group goals — all synced in real time.
      </p>
      <button type="button" onClick={onCreateGroup} className="flex items-center gap-2 px-8 py-3.5 bg-[var(--teal)] text-white border-none rounded-[14px] cursor-pointer font-extrabold text-[1rem] tracking-tight">
        <Ico.Plus /> Create First Group
      </button>
    </div>
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
        onClick={() => setOpen(v => !v)} 
        className="flex items-center gap-2.5 px-4 py-3 bg-[var(--card)] border-[1.5px] border-[var(--card-border)] rounded-xl cursor-pointer w-full text-left hover:border-[var(--teal)] transition-colors shadow-sm"
      >
        <span className="text-[20px] leading-none">{PURPOSE_EMOJI[sel?.purpose ?? 'friends'] ?? '🤝'}</span>
        <span className="flex-1 font-bold text-[var(--text)] text-[0.9rem] truncate">{sel?.name ?? 'Select Group'}</span>
        <Ico.Chevron />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-[80]" />
          <div className="absolute top-full left-0 right-0 mt-2 z-[81] bg-[var(--card)] border-[1.5px] border-[var(--card-border)] rounded-xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-[240px] overflow-y-auto">
              {groups.map(g => (
                <button 
                  key={g.id} 
                  type="button" 
                  onClick={() => { onSelect(g.id); setOpen(false); }} 
                  className={`flex items-center gap-3 px-4 py-3 w-full text-left border-none cursor-pointer transition-colors ${selectedId === g.id ? 'bg-[var(--teal)]/10 text-[var(--teal)] font-bold' : 'bg-transparent text-[var(--text)] hover:bg-[var(--bg)]'}`}
                >
                  <span className="text-[18px]">{PURPOSE_EMOJI[g.purpose] ?? '🤝'}</span>
                  <span className="text-[0.875rem]">{g.name}</span>
                  {selectedId === g.id && <Ico.Check className="ml-auto" size={14} />}
                </button>
              ))}
            </div>
            <div className="border-t border-[var(--card-border)] p-1">
              <button 
                type="button" 
                onClick={() => { onCreate(); setOpen(false); }} 
                className="flex items-center gap-2 px-3 py-2.5 w-full bg-transparent border-none rounded-lg cursor-pointer text-[var(--teal)] font-bold text-[0.8rem] hover:bg-[var(--teal)]/5 transition-colors"
              >
                <Ico.Plus size={14} /> New Group
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type Tab = 'wallet' | 'expenses' | 'goals' | 'members' | 'activity';
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'wallet',   label: 'Wallet',   icon: <Ico.Wallet /> },
  { id: 'expenses', label: 'Expenses', icon: <Ico.Split /> },
  { id: 'goals',    label: 'Goals',    icon: <Ico.Target /> },
  { id: 'members',  label: 'Members',  icon: <Ico.Users /> },
  { id: 'activity', label: 'Activity', icon: <Activity size={18} /> },
];

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
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="text-[60px] mb-4 leading-none">⚠️</div>
          <h2 className="m-0 mb-2 text-[var(--text)] font-extrabold tracking-tight">Something went wrong</h2>
          <p className="text-[var(--text-secondary)] max-w-[400px] mb-6 leading-relaxed">
            The Shared Wallets view encountered an error. This is usually caused by a database connection issue.
          </p>
          <p className="font-mono text-[0.75rem] text-red-500 bg-red-500/10 p-2 px-4 rounded-lg max-w-[500px]">
            {this.state.error.message}
          </p>
          <Btn v="primary" onClick={() => this.setState({ error: null })} className="mt-6">Try Again</Btn>
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

  return (
    <SharedErrorBoundary>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <InviteBanner invites={sw.pendingInvites} onAccept={sw.acceptInvite} onDecline={sw.declineInvite} />

        {!sw.loading && sw.groups.length === 0 && sw.pendingInvites.length === 0 ? (
          <EmptyState onCreateGroup={() => setCreate(true)} />
        ) : (
          <>
            {/* Header Row */}
            <div className="flex items-center gap-2.5 mb-5 flex-wrap">
              <GroupSelector groups={sw.groups} selectedId={sw.selectedGroupId} onSelect={sw.setSelectedGroupId} onCreate={() => setCreate(true)} />
              
              {/* P2P Sync Status */}
              <div className="flex items-center gap-3 bg-[var(--card)] border-[1.5px] border-[var(--card-border)] rounded-xl px-4 py-2 text-[0.85rem] shadow-sm ml-auto">
                <div className="flex items-center gap-2">
                  <span className={`relative flex h-2.5 w-2.5`}>
                    {sw.syncState === 'connecting' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${sw.syncState === 'connected' ? 'bg-emerald-500' : sw.syncState === 'connecting' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                  </span>
                  <span className="font-bold text-[var(--text)]">P2P Sync</span>
                  <span className="text-[var(--text-secondary)]">
                    {sw.syncState === 'connected' ? `(${sw.connectedPeers} peers)` : sw.syncState}
                  </span>
                </div>
                <div className="h-4 w-[1px] bg-[var(--card-border)]" />
                <span className="font-mono text-[0.7rem] text-[var(--text-secondary)] opacity-80" title="Your Peer ID">
                  ID: {sw.localPeerId}
                </span>
                <button 
                  onClick={() => {
                    const id = prompt('Enter Peer ID to connect:');
                    if (id) sw.connectToPeer(id);
                  }}
                  className="ml-2 px-3 py-1.5 bg-[var(--teal)]/10 text-[var(--teal)] hover:bg-[var(--teal)]/20 rounded-lg font-bold cursor-pointer transition-colors border-none text-[0.8rem]"
                >
                  Connect
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 mb-5 flex-wrap">
              {sw.selectedGroupId && (
                <button 
                  onClick={() => setQR(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-[var(--teal)]/10 text-[var(--teal)] border-none rounded-xl cursor-pointer font-bold text-[0.85rem] hover:bg-[var(--teal)]/20 transition-all shadow-sm"
                >
                  <Ico.Share size={16} /> Share QR
                </button>
              )}
              <button 
                onClick={() => {
                  const code = prompt('Enter the Join Code (Base64 string from QR):');
                  if (code) sw.importGroup(code);
                }}
                className="flex items-center gap-2 px-4 py-3 bg-[var(--card)] border-[1.5px] border-[var(--card-border)] rounded-xl cursor-pointer text-[var(--text)] font-bold text-[0.85rem] hover:border-[var(--teal)] transition-all shadow-sm"
              >
                <Ico.Scan size={16} /> Join Group
              </button>
              {sw.selectedGroupId && addLabel && (
                <Btn v="primary" onClick={handleAdd}>{addLabel}</Btn>
              )}
            </div>

            {sw.error && <Err msg={sw.error} />}

            {sw.loading && (
              <div className="text-center py-16 text-[var(--text-secondary)]">
                <div className="text-[2rem] inline-block mb-3 text-[var(--teal)]"><Ico.Spin /></div>
                <p className="m-0 text-[0.9rem]">Loading group…</p>
              </div>
            )}

            {!sw.loading && sw.selectedGroupId && (
              <>
                {/* Tab Bar */}
                <div className="flex gap-1 bg-[var(--bg)] rounded-xl p-1 mb-4">
                  {TABS.map(t => (
                    <button 
                      key={t.id} 
                      type="button" 
                      onClick={() => setTab(t.id)} 
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-[9px] border-none cursor-pointer font-semibold text-[0.8rem] transition-all font-inherit ${tab === t.id ? 'bg-[var(--card)] text-[var(--teal)] shadow-sm' : 'bg-transparent text-[var(--text-secondary)]'}`}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="bg-[var(--card)] rounded-2xl p-6 shadow-sm border border-[var(--card-border)]">
                  {tab === 'wallet'   && <WalletTab entries={sw.walletEntries} balance={sw.walletBalance} members={sw.members} onDelete={sw.deleteWalletEntry} currency={currency} />}
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
      </div>
    </SharedErrorBoundary>
  );
}
