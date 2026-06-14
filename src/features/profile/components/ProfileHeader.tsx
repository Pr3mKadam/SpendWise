import React, { RefObject } from 'react';
import { User, Camera } from 'lucide-react';
import { SpendWiseConfig } from '@/types/config';

interface ProfileHeaderProps {
  avatar: string | null;
  name: string;
  occupation: string;
  location: string;
  config: SpendWiseConfig | null;
  avatarInputRef: RefObject<HTMLInputElement | null>;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({
  avatar,
  name,
  occupation,
  location,
  config,
  avatarInputRef,
  onAvatarChange,
}: ProfileHeaderProps) {
  return (
    <div className="card px-6 py-5 flex items-center gap-5">
      <div className="relative shrink-0">
        <div
          className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: 'var(--teal-dim)', border: '3px solid var(--teal)' }}
        >
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={36} style={{ color: 'var(--teal)' }} />
          )}
        </div>
        <button
          onClick={() => avatarInputRef.current?.click()}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white cursor-pointer"
          style={{ background: 'var(--teal)', color: '#fff' }}
          title="Change photo"
        >
          <Camera size={13} />
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onAvatarChange}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-bold text-[var(--text-primary)]"
          style={{ fontFamily: 'var(--font-manrope)', fontSize: '18px' }}
        >
          {name || 'Your Name'}
        </p>
        <p
          className="text-sm text-[var(--text-muted)] mt-0.5"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {occupation || 'SpendWise Member'}
          {location ? ` · ${location}` : ''}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[length:var(--fs-overline)] font-bold uppercase tracking-wider">
            {config?.userRole || 'User'} Persona
          </span>
        </div>
        <button
          onClick={() => avatarInputRef.current?.click()}
          className="mt-2 text-xs font-semibold cursor-pointer border-none bg-transparent"
          style={{ color: 'var(--teal)', fontFamily: 'var(--font-inter)' }}
        >
          Change photo →
        </button>
      </div>
    </div>
  );
}
