import { useStore } from '@/store';

const PROFILES = [
  { id: 'personal', label: 'Personal', icon: '👤' },
  { id: 'business', label: 'Business', icon: '💼' },
];

export function useProfileSwitcher() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileId = useStore(s => (s as any).profileId) || 'personal';

  const switchProfile = (id: string) => {
    localStorage.setItem('spendwise_active_profile', id);
    window.location.reload();
  };

  return { currentProfile: profileId, profiles: PROFILES, switchProfile };
}
