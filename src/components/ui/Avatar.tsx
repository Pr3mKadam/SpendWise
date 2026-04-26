import React from 'react';

export function Avatar({ emoji, size = 36 }: { emoji: string; size?: number }) {
  return (
    <div 
      className="rounded-full bg-[var(--card-border)] flex items-center justify-center shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.44 }}
    >
      {emoji}
    </div>
  );
}

export function EmojiBtn({ e, active, onPick }: { e: string; active: boolean; onPick: (e: string) => void }) {
  return (
    <button 
      type="button" 
      onClick={() => onPick(e)} 
      className={`text-[22px] rounded-[10px] p-1.5 cursor-pointer transition-all leading-none ${
        active 
          ? 'bg-[var(--accent)]/10 border-2 border-[var(--accent)]' 
          : 'bg-[var(--bg)] border-2 border-[var(--card-border)] hover:border-[var(--accent)]/50'
      }`}
    >
      {e}
    </button>
  );
}
