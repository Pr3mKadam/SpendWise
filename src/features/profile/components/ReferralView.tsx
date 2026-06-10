import { Users, Gift, Share2, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useReferral } from '@/hooks/useReferral';

export function ReferralView() {
  const { referrals, bonusMonths, shareLink, shareInvite, referralCount } = useReferral();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    await shareInvite();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const anonymiseEmail = (email: string) => {
    const [name, domain] = email.split('@');
    if (!domain) return email;
    return `${name.slice(0, 2)}****@${domain}`;
  };

  return (
    <div className="card p-6 space-y-5">
      <div>
        <h3
          className="font-manrope font-bold text-base flex items-center gap-2"
          style={{ color: 'var(--text-primary)' }}
        >
          <Users size={18} className="text-[var(--teal)]" />
          Refer Friends
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Invite friends to SpendWise and earn rewards
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--teal-dim)' }}>
          <p className="text-2xl font-extrabold text-[var(--teal)]">{referralCount}</p>
          <p className="text-xs font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>
            Friends Referred
          </p>
        </div>
        <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--teal-dim)' }}>
          <p className="text-2xl font-extrabold text-[var(--teal)]">{bonusMonths}</p>
          <p className="text-xs font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>
            Free Months Earned
          </p>
        </div>
      </div>

      <button
        onClick={handleShare}
        className="w-full h-12 rounded-xl border-none bg-[var(--teal)] text-white text-sm font-bold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-[var(--teal-light)] active:scale-[0.98]"
      >
        {copied ? (
          <>
            <CheckCircle size={18} />
            Copied!
          </>
        ) : (
          <>
            <Share2 size={18} />
            Share Invite Link
          </>
        )}
      </button>

      {referrals.length > 0 && (
        <div>
          <p
            className="text-xs font-bold mb-3 flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}
          >
            <Gift size={12} />
            Referred Friends
          </p>
          <div className="space-y-2">
            {referrals.map((ref: { email?: string }, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'var(--surface-input)' }}
              >
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {ref.email ? anonymiseEmail(ref.email) : `Friend #${i + 1}`}
                </span>
                <span className="text-xs font-bold text-[var(--teal)]">+1 month</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="flex items-start gap-2 p-3 rounded-xl"
        style={{ background: 'var(--surface-input)' }}
      >
        <Copy size={14} className="mt-0.5 shrink-0 text-[var(--teal)]" />
        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            Your referral link
          </p>
          <p className="text-xs mt-0.5 font-mono break-all" style={{ color: 'var(--text-muted)' }}>
            {shareLink}
          </p>
        </div>
      </div>
    </div>
  );
}
