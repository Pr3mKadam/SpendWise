/**
 * Utility for native-like haptic feedback on Android/iOS
 * Only works if the device supports the Vibration API
 */
const isEnabled = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('spendwise_haptics_enabled') !== 'false';
};

export const haptic = {
  /**
   * Light impact (e.g. navigation, selection change)
   */
  light: () => {
    if (isEnabled() && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium impact (e.g. opening a modal, button toggle)
   */
  medium: () => {
    if (isEnabled() && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  /**
   * Heavy impact (e.g. shake detection)
   */
  heavy: () => {
    if (isEnabled() && 'vibrate' in navigator) {
      navigator.vibrate([30, 30, 30]);
    }
  },

  /**
   * Success feedback (e.g. transaction added)
   */
  success: () => {
    if (isEnabled() && 'vibrate' in navigator) {
      // Short double pulse
      navigator.vibrate([15, 30, 15]);
    }
  },

  /**
   * Warning/Error feedback
   */
  error: () => {
    if (isEnabled() && 'vibrate' in navigator) {
      // Longer pulse
      navigator.vibrate(100);
    }
  }
};
