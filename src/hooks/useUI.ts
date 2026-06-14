import { useMemo } from 'react';
import { useStore } from '@/store';

export function useUI() {
  const parentalState = useStore(state => state.parentalState);
  const privacyEnabled = useStore(state => state.privacyEnabled);
  const togglePrivacy = useStore(state => state.togglePrivacy);

  const isDemoMode = useMemo(() => {
    try {
      const saved = localStorage.getItem('spendwise_demo_active');
      return saved === 'true';
    } catch {
      // silently ignore — non-critical
      return false;
    }
  }, []);

  return {
    parentalState,
    privacyEnabled,
    togglePrivacy,
    isDemoMode,
  };
}
