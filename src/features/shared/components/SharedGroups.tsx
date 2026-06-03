import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { Ico } from '@/components/ui/Icons';
import { haptic } from '@/core/haptic';

const PURPOSE_EMOJI: Record<string, string> = {
  friends: '🎉',
  roommates: '🏠',
  family: '👨‍👩‍👧',
  other: '🤝',
};

const relTime = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export function InviteBanner({
  invites,
  onAccept,
  onDecline,
}: {
  invites: {
    memberId: string;
    groupId: string;
    groupName: string;
    groupPurpose: string;
    invitedAt: string;
  }[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
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
            <span className="text-3xl shrink-0 filter drop-shadow-sm select-none">
              {PURPOSE_EMOJI[inv.groupPurpose] ?? '🤝'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="m-0 font-bold text-[var(--text-primary)] text-sm">{inv.groupName}</p>
              <p className="m-0 mt-0.5 text-xs text-[var(--text-muted)] font-medium">
                Invited {relTime(inv.invitedAt)}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  haptic.medium();
                  onAccept(inv.memberId);
                }}
                className="flex justify-center items-center gap-1.5 px-4 h-10 bg-emerald-500 text-slate-900 border-none rounded-xl cursor-pointer font-bold text-xs transition-all active:scale-95 shadow-md shadow-emerald-500/20 hover:bg-emerald-400"
              >
                <Check size={14} strokeWidth={2.5} /> Accept
              </button>
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  onDecline(inv.memberId);
                }}
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

export function EmptyState({ onCreateGroup }: { onCreateGroup: () => void }) {
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
      <h2
        className="m-0 mb-2.5 text-xl font-extrabold text-[var(--text-primary)] tracking-tight"
        style={{ fontFamily: 'var(--font-manrope)' }}
      >
        No Shared Groups Yet
      </h2>
      <p className="m-0 mb-8 text-[var(--text-muted)] leading-relaxed text-xs font-medium">
        Create a shared wallet to track joint expenses, split bills and save towards group goals —
        all synced in real time with cohorts.
      </p>
      <button
        type="button"
        onClick={() => {
          haptic.medium();
          onCreateGroup();
        }}
        className="inline-flex justify-center items-center gap-2 px-6 h-11 bg-[var(--teal)] text-white border-none rounded-xl cursor-pointer font-bold text-sm transition-all active:scale-95 shadow-lg shadow-teal-500/25 hover:bg-[var(--teal-light)]"
      >
        <Plus size={16} strokeWidth={2.5} /> Create First Group
      </button>
    </motion.div>
  );
}

export function GroupSelector({
  groups,
  selectedId,
  onSelect,
  onCreate,
}: {
  groups: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const sel = groups.find(g => g.id === selectedId);
  return (
    <div className="relative flex-1 min-w-[200px]">
      <button
        type="button"
        onClick={() => {
          haptic.light();
          setOpen(v => !v);
        }}
        className="flex items-center gap-3 px-4 h-12 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl cursor-pointer w-full text-left hover:border-[var(--teal)] transition-all shadow-sm focus:outline-none"
      >
        <span className="text-xl leading-none select-none">
          {PURPOSE_EMOJI[sel?.purpose ?? 'friends'] ?? '🤝'}
        </span>
        <span className="flex-1 font-bold text-[var(--text-primary)] text-sm truncate">
          {sel?.name ?? 'Select Group'}
        </span>
        <ChevronDown
          className={`text-[var(--text-muted)] transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
          size={16}
        />
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
                    onClick={() => {
                      haptic.light();
                      onSelect(g.id);
                      setOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 h-11 w-full text-left border-none cursor-pointer transition-colors ${selectedId === g.id ? 'bg-[var(--teal)]/10 text-[var(--teal)] font-bold' : 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'}`}
                  >
                    <span className="text-lg select-none">{PURPOSE_EMOJI[g.purpose] ?? '🤝'}</span>
                    <span className="text-xs font-semibold">{g.name}</span>
                    {selectedId === g.id && (
                      <Check className="ml-auto text-[var(--teal)]" size={14} strokeWidth={2.5} />
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-[var(--border)] p-1 bg-[var(--surface-bg)]">
                <button
                  type="button"
                  onClick={() => {
                    haptic.medium();
                    onCreate();
                    setOpen(false);
                  }}
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
