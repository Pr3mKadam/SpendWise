import { useState, useEffect, useCallback } from 'react';
import { AppView } from '@/types';
import { haptic } from '@/lib/haptic';

interface UseAppNavigationProps {
  initialView: AppView;
  showQuickAdd: boolean;
  setShowQuickAdd: (show: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;
  showCategoriesModal: boolean;
  setShowCategoriesModal: (show: boolean) => void;
}

export function useAppNavigation({
  initialView,
  showQuickAdd,
  setShowQuickAdd,
  showNotifications,
  setShowNotifications,
  showCommandPalette,
  setShowCommandPalette,
  showCategoriesModal,
  setShowCategoriesModal,
}: UseAppNavigationProps) {
  const [activeView, setActiveView] = useState<AppView>(initialView);

  // Sync URL with active view and maintain proper history state object
  useEffect(() => {
    const path = activeView === 'dashboard' ? '/' : `/${activeView}`;
    if (window.location.pathname !== path) {
      window.history.pushState({ view: activeView }, '', path);
    } else if (!window.history.state) {
      window.history.replaceState({ view: activeView }, '', path);
    }
  }, [activeView]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // If we popped and had a modal open, close it
      setShowQuickAdd(false);
      setShowNotifications(false);
      setShowCommandPalette(false);
      setShowCategoriesModal(false);
      
      // Update activeView based on state
      if (e.state && e.state.view) {
        setActiveView(e.state.view);
      } else {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view') as AppView;
        setActiveView(view || 'dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setShowCategoriesModal, setShowCommandPalette, setShowNotifications, setShowQuickAdd]);

  useEffect(() => {
    // Handle PWA shortcuts or deep links
    const handleUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      
      if (params.get('action') === 'new' || params.get('open-add') === 'true') {
        haptic.medium();
        setShowQuickAdd(true);
      }
      
      const viewParam = params.get('view') as AppView;
      if (viewParam) {
        haptic.light();
        setActiveView(viewParam);
      }

      if (params.get('action') || params.get('view') || params.get('open-add')) {
        // Clean up URL without refreshing
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    handleUrlParams();
    
    // Also listen for visibility changes (when resuming from background)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleUrlParams();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [setShowQuickAdd]);

  // Edge Swipe Detection (Android Style Navigation)
  useEffect(() => {
    let touchStartX = 0;
    let touchStartTime = 0;
    const swipeThreshold = 50;
    const edgeThreshold = 30; // 30px from edge

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const duration = Date.now() - touchStartTime;
      const distance = touchEndX - touchStartX;

      if (duration < 300) { // Fast swipe
        // Swipe from Left Edge -> Right (Back)
        if (touchStartX < edgeThreshold && distance > swipeThreshold) {
          haptic.light();
          window.history.back();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeView]);

  // Sync state with browser history for back-button support
  useEffect(() => {
    if (showQuickAdd || showNotifications || showCommandPalette || showCategoriesModal) {
      // Only push if we haven't already (simple check)
      if (window.history.state?.modal === undefined) {
        window.history.pushState({ modal: true }, '');
      }
    }
  }, [showQuickAdd, showNotifications, showCommandPalette, showCategoriesModal]);

  const handleViewChange = useCallback((v: AppView) => {
    haptic.light();
    setActiveView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { activeView, setActiveView, handleViewChange };
}
