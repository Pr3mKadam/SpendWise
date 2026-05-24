/**
 * useVoiceMic — orchestrates voice-mic UI state for MasterMic.
 *
 * Wraps useMasterVoice and adds:
 *  - Space-bar push-to-talk shortcut
 *  - History panel toggle with outside-click dismiss
 *  - First-use onboarding state
 *  - FAB click handler
 */

import { useEffect, useState, useCallback } from 'react';
import { useMasterVoice } from '@/hooks/useMasterVoice';
import { AppView } from '@/types';

interface UseVoiceMicOptions {
  navigate: (view: AppView) => void;
  onExport: () => void;
  toggleTheme: () => void;
  setSearchQuery?: (q: string) => void;
}

export function useVoiceMic(options: UseVoiceMicOptions) {
  const voice = useMasterVoice(options);

  const [showHistory, setShowHistory] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('spendwise_voice_onboarded') !== 'true';
  });

  // ── Space-bar shortcut ───────────────────────────────────────────────────
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body && voice.state === 'idle') {
        e.preventDefault();
        if (showOnboarding) {
          setShowOnboarding(false);
          localStorage.setItem('spendwise_voice_onboarded', 'true');
        }
        voice.start();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && voice.state === 'listening') voice.stop();
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [voice.state, voice.start, voice.stop, showOnboarding]);

  // ── Close history on outside click ───────────────────────────────────────
  useEffect(() => {
    if (!showHistory) return;
    const fn = () => setShowHistory(false);
    setTimeout(() => document.addEventListener('click', fn), 100);
    return () => document.removeEventListener('click', fn);
  }, [showHistory]);

  // ── FAB click handler ────────────────────────────────────────────────────
  const handleFabClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!voice.isSupported) return;
      if (voice.state === 'idle' || voice.state === 'error' || voice.state === 'success') {
        voice.start();
      } else if (voice.state === 'listening') {
        voice.stop();
      }
    },
    [voice.isSupported, voice.state, voice.start, voice.stop],
  );

  // ── Onboarding dismiss ──────────────────────────────────────────────────
  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem('spendwise_voice_onboarded', 'true');
  }, []);

  const toggleHistory = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowHistory(v => !v);
    },
    [],
  );

  return {
    // voice state
    ...voice,
    // UI state
    showHistory,
    showOnboarding,
    // handlers
    handleFabClick,
    dismissOnboarding,
    toggleHistory,
  };
}
