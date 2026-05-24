import React from 'react';
import { SharedGroupMember } from '@/features/shared/hooks/useSharedWallets';
import { Avatar } from '@/ui/Avatar';
import { StatusPill } from '@/ui/StatusPill';
import { Ico } from '@/ui/Icons';
import { Plus } from 'lucide-react';

export function MembersTab({ members, uid, isOwner, onRemove, onInvite }: { members: SharedGroupMember[]; uid: string | null; isOwner: boolean; onRemove: (id: string) => void; onInvite: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="m-0 text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Group Cohorts</h3>
        {isOwner && (
          <button
            type="button"
            onClick={onInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--teal)] text-white border-none rounded-xl cursor-pointer font-bold text-xs hover:bg-[#0d9488] transition-all shadow-md shadow-teal-500/10 active:scale-95"
          >
            <Plus size={12} /> Invite Member
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-3.5 p-3.5 bg-[var(--bg)] rounded-2xl border border-[var(--border)] transition-all hover:border-[var(--teal)]/20">
            <Avatar emoji={m.emoji} size={38} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-bold text-sm text-[var(--text-primary)]">{m.display_name}</span>
                {m.role === 'owner' && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 uppercase tracking-widest border border-amber-500/20">Owner</span>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusPill s={m.status} />
                {m.invited_email && <span className="text-xs text-[var(--text-muted)] font-medium">{m.invited_email}</span>}
              </div>
            </div>
            {isOwner && m.user_id !== uid && m.role !== 'owner' && (
              <button
                type="button"
                onClick={() => onRemove(m.id)}
                className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-2 flex hover:text-red-500 transition-all rounded-lg hover:bg-red-500/5"
              >
                <Ico.Trash size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
