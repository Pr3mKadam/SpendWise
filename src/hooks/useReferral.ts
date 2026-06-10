export function useReferral() {
  const referrals = JSON.parse(localStorage.getItem('spendwise_referrals') || '[]');
  const bonusMonths = referrals.length;
  const shareLink = `https://spendwise.app/join?ref=${localStorage.getItem('spendwise_user_hash') || ''}`;

  const shareInvite = async () => {
    await navigator.clipboard.writeText(shareLink);
    localStorage.setItem(
      'spendwise_referral_bonus',
      String(Number(localStorage.getItem('spendwise_referral_bonus') || '0') + 10)
    );
  };

  return { referrals, bonusMonths, shareLink, shareInvite, referralCount: referrals.length };
}
