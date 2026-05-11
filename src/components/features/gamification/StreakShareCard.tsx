/**
 * StreakShareCard.tsx
 * A shareable streak card — renders a canvas/div that can be screenshot-shared.
 * Uses navigator.share or clipboard fallback.
 */
import { useRef, useState } from 'react';
import { Share2, Camera, Flame, X } from 'lucide-react';

interface Props {
  streak: number;
  level: number;
  levelName: string;
  savingsRate: number;
  currency?: string;
}

export function StreakShareCard({ streak, level, levelName, savingsRate, currency = '₹' }: Props) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const text = `🔥 I'm on a ${streak}-day streak on SpendWise!\n\n📊 Level ${level} ${levelName} · ${savingsRate}% savings rate\n\nTrack your finances smarter with SpendWise 💰`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My SpendWise Streak 🔥', text });
      } else {
        await navigator.clipboard.writeText(text);
        alert('Streak card copied to clipboard!');
      }
    } catch { /* user cancelled */ }
  };

  const streakColor = streak >= 30 ? '#8b5cf6' : streak >= 7 ? '#f59e0b' : '#ef4444';
  const grade = streak >= 30 ? 'Diamond' : streak >= 14 ? 'Gold' : streak >= 7 ? 'Silver' : 'Bronze';
  const gradeEmoji = streak >= 30 ? '💎' : streak >= 14 ? '🥇' : streak >= 7 ? '🥈' : '🥉';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
        style={{ background: 'var(--teal-dim)', color: 'var(--teal)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
        title="Share your streak"
      >
        <Share2 size={13} />
        Share Streak
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="relative max-w-sm w-full">
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white border-none cursor-pointer bg-transparent"
            >
              <X size={22} />
            </button>

            {/* Card preview */}
            <div
              ref={cardRef}
              className="rounded-3xl p-8 text-center overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}
            >
              {/* Background glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px]"
                  style={{ background: `${streakColor}30` }} />
              </div>

              {/* Logo */}
              <div className="relative z-10">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-6">SpendWise</p>

                {/* Flame */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame size={32} style={{ color: streakColor }} className="drop-shadow-lg" />
                  <span className="text-7xl font-black tabular-nums" style={{ color: streakColor, fontFamily: 'var(--font-manrope)', lineHeight: 1 }}>
                    {streak}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white mb-1">Day Streak</p>
                <p className="text-white/60 text-sm mb-6">{gradeEmoji} {grade} Tier</p>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <p className="text-xl font-black text-white tabular-nums">{level}</p>
                    <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mt-0.5">Level</p>
                    <p className="text-xs text-white/70 font-medium">{levelName}</p>
                  </div>
                  <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <p className="text-xl font-black tabular-nums" style={{ color: '#14b8a6' }}>{savingsRate}%</p>
                    <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mt-0.5">Savings Rate</p>
                    <p className="text-xs text-white/70 font-medium">This month</p>
                  </div>
                </div>

                <p className="text-white/30 text-[10px] mt-6">Track smarter · spendwise.app</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white transition-all hover:scale-105"
                style={{ background: 'var(--teal)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
              >
                <Share2 size={16} /> Share Card
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-5 py-3 rounded-2xl font-bold transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
