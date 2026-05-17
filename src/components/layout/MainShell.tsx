import { useState, useCallback, useEffect, lazy, Suspense, type Dispatch, type SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, Transaction, Category } from '../../types';
import { useAuth } from '../../hooks/useAuth';

import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import type { SpendWiseConfig } from '../features/onboarding/OnboardingModal';
import { ViewRenderer } from './ViewRenderer';
import { useAppState } from '../../hooks/useAppState';
import { useAutomations } from '../../hooks/useAutomations';
import { useStore } from '../../store';
import { STORAGE_KEYS } from '../../constants';
import ServiceWorkerToast from '../common/ServiceWorkerToast';
import { haptic } from '../../lib/haptic';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const AppModals = lazy(() => import('./AppModals').then(m => ({ default: m.AppModals })));
const OnboardingModal = lazy(() => import('../features/onboarding/OnboardingModal'));
const ParentalPinGate = lazy(() => import('../features/parental/ParentalControlGate').then(m => ({ default: m.ParentalPinGate })));
const KidModeBanner = lazy(() => import('../features/parental/ParentalControlGate').then(m => ({ default: m.KidModeBanner })));
const QuickAddModal = lazy(() => import('../common/QuickAddModal').then(m => ({ default: m.QuickAddModal })));
const BiometricLock = lazy(() => import('../features/auth/BiometricLock').then(m => ({ default: m.BiometricLock })));
const FeedbackModal = lazy(() => import('../common/FeedbackModal').then(m => ({ default: m.FeedbackModal })));
import { Shield, Sparkles } from 'lucide-react';

interface MainShellProps {
  config:     SpendWiseConfig | null;
  setConfig:  (config: SpendWiseConfig) => void;
  userId:     string | null;
  initialView?: AppView;
}

export function MainShell({ config, setConfig, userId, initialView = 'dashboard' }: MainShellProps) {
  useAutomations();
  const { user } = useAuth();


  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    const isHighContrast = localStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST) === 'true';
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showParentalGate, setShowParentalGate]     = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeView, setActiveView]               = useState<AppView>(initialView);
  const [voiceSearchQuery, setVoiceSearchQuery]     = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLocked, setIsLocked] = useState(() => {
    // Check if biometric lock is enabled in settings
    return localStorage.getItem('spendwise_biometric_enabled') === 'true';
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Sync URL with active view
  useEffect(() => {
    const path = activeView === 'dashboard' ? '/' : `/${activeView}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [activeView]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(v => !v);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    
    const handleQuickAddEvent = () => {
      window.history.pushState({ modal: 'quick-add' }, '');
      setShowQuickAdd(true);
    };
    window.addEventListener('open-quick-add', handleQuickAddEvent);

    const handlePopState = (e: PopStateEvent) => {
      // If we popped and had a modal open, close it
      setShowQuickAdd(false);
      setShowNotifications(false);
      setShowCommandPalette(false);
      setShowCategoriesModal(false);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('open-quick-add', handleQuickAddEvent);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const store = useStore();
  const pcSettings = store.parentalState;
  const isKidMode = pcSettings.isTeenMode;

  const toggleNotifications = useCallback(() => {
    setShowNotifications(v => !v);
  }, []);

  const appState = useAppState(config);
  const { currency, transactions, financeState, notifState } = appState;
  const totalUnread = notifState.unreadCount;
  const isOnboarded = config?.onboardingComplete === true;

  const handleOnboardingComplete = useCallback(
    (cfg: SpendWiseConfig) => {
      setConfig(cfg);
    },
    [setConfig]
  );

  // Shake Detection for Feedback & AI Assistant
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastUpdate = 0;
    const threshold = 18; // Slightly higher threshold for fewer false positives

    const handleMotion = (e: DeviceMotionEvent) => {
      const curTime = Date.now();
      if ((curTime - lastUpdate) > 100) {
        const acc = e.accelerationIncludingGravity;
        if (!acc) return;

        const { x, y, z } = acc;
        if (x === null || y === null || z === null) return;

        const deltaX = Math.abs(x - lastX);
        const deltaY = Math.abs(y - lastY);
        const deltaZ = Math.abs(z - lastZ);

        if ((deltaX > threshold && deltaY > threshold) || (deltaX > threshold && deltaZ > threshold) || (deltaY > threshold && deltaZ > threshold)) {
          // Check if shake is enabled in settings
          const shakeEnabled = localStorage.getItem('spendwise_shake_enabled') !== 'false';
          if (!shakeEnabled) return;

          // Shake detected!
          haptic.heavy();
          
          // Show feedback modal instead of just switching view
          setShowFeedback(true);
          
          notifState.addNotification({
            title: 'Shake to Feedback 📱',
            message: 'Got something to say? We value your feedback!',
            type: 'insight',
            icon: '📱',
            severity: 'info'
          });
        }

        lastX = x; lastY = y; lastZ = z;
        lastUpdate = curTime;
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [notifState]);

  const onAdd = useCallback((tx: Transaction) => {
    // Safety check: ensure tx is a valid transaction object, not a browser event
    if (tx && typeof tx === 'object' && 'amount' in tx && typeof tx.amount === 'number') {
      financeState.addTransaction(tx);
    } else {
      console.warn('MainShell: Attempted to add invalid transaction object:', tx);
    }
  }, [financeState.addTransaction]);

  const handleCategoryChange = useCallback(
    async (id: string, newCategory: string) => {
      financeState.updateTransactionCategory(id, newCategory as Category);
    },
    [financeState.updateTransactionCategory]
  );

  const handlePDFReport = useCallback(async () => {
    const { generatePDFReport } = await import('../../lib/exportPDF');
    const now = new Date();
    const month = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    generatePDFReport({
      transactions,
      monthlyStats: financeState.monthlyStats,
      budgets: appState.budgetState.budgetStats,
      goals: appState.goalsState.goals,
      currency,
      month,
    });
  }, [transactions, financeState.monthlyStats, appState.budgetState.budgetStats, appState.goalsState.goals, currency]);

  useEffect(() => {
    // Handle PWA shortcuts or deep links
    const handleUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      
      if (params.get('action') === 'new' || params.get('open-add') === 'true') {
        haptic.medium();
        setShowQuickAdd(true);
      }
      
      const viewParam = params.get('view') as AppView;
      if (viewParam && VIEW_COLORS[viewParam]) {
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
  }, []);

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
          // Logic for "Back" - for now go to dashboard or previous
          if (activeView !== 'dashboard') {
            setActiveView('dashboard');
          }
        }
        // Swipe from Right Edge -> Left (Forward/Contextual)
        else if (touchStartX > (window.innerWidth - edgeThreshold) && distance < -swipeThreshold) {
          haptic.light();
          // Logic for "Forward" - contextual action? 
          // Maybe open AI Advisor or Notifications
          setShowNotifications(true);
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

  const VIEW_COLORS: Record<AppView, string> = {
    dashboard:     '#0f172a', // Dark Blue
    analytics:     '#f4f6fb', // Light Blue
    budget:        '#ffffff', 
    history:       '#ffffff',
    goals:         '#ffffff',
    portfolio:     '#0f172a',
    sync:          '#ffffff',
    profile:       '#ffffff',
    parental:      '#ffffff',
    shared:        '#ffffff',
    subscriptions: '#ffffff',
    advisor:       '#0f172a',
    education:     '#ffffff',
    reports:       '#ffffff',
    transactions:  '#ffffff',
    settings:      '#ffffff',
    quests:        '#ffffff',
    inventory:     '#ffffff',
    shop:          '#ffffff',
    badges:        '#ffffff',
  };

  useEffect(() => {
    const color = theme === 'dark' ? '#0f172a' : VIEW_COLORS[activeView] || '#ffffff';
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      (meta as HTMLMetaElement).name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', color);
  }, [activeView, theme]);

  const [isVerifying, setIsVerifying] = useState(false);

  const handleTogglePrivacy = useCallback(async () => {
    // If privacy is active and we want to disable it, simulate biometric check
    if (store.privacyEnabled) {
      setIsVerifying(true);
      haptic.medium();
      
      // Simulate "Authenticating..."
      setTimeout(() => {
        setIsVerifying(false);
        store.togglePrivacy();
        haptic.success();
      }, 1200);
    } else {
      store.togglePrivacy();
      haptic.light();
    }
  }, [store.privacyEnabled, store.togglePrivacy]);

  const handleViewChange = useCallback((v: AppView) => {
    haptic.light();
    setActiveView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isKidMode) {
      if (activeView === 'sync' || (activeView === 'analytics' && pcSettings.hideAnalytics)) {
        setActiveView('dashboard');
      }
    }
  }, [isKidMode, activeView, pcSettings.hideAnalytics]);

  return (
    <div className="flex min-h-screen flex-col" style={{ background: 'var(--bg)' }}>
      {/* WCAG: Skip to Content Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1000] focus:px-6 focus:py-3 focus:bg-[var(--teal)] focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-bold focus:outline-none focus:ring-4 focus:ring-[var(--teal-glow)]"
      >
        Skip to main content
      </a>

      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
            className="fixed top-0 left-0 right-0 z-[200] bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest py-1.5 text-center shadow-lg"
          >
            Offline Mode · Using Cached Data
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLocked && (
          <Suspense fallback={null}>
            <BiometricLock 
              onUnlocked={() => {
                setIsLocked(false);
                haptic.success();
              }} 
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVerifying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0f172a]/95 backdrop-blur-md"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 rounded-full border-2 border-[var(--teal)] flex items-center justify-center mx-auto mb-4"
              >
                <Shield size={32} className="text-[var(--teal)]" />
              </motion.div>
              <h2 className="text-white font-manrope font-bold text-lg">Authenticating</h2>
              <p className="text-white/50 text-xs font-inter mt-1">Verifying identity for access...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        {pcSettings.enabled && !pcSettings.sessionUnlocked && !isKidMode && (
          <ParentalPinGate onContinueAsKid={() => store.updateParentalSettings({ isTeenMode: true })} />
        )}

        {isKidMode && (
          <KidModeBanner onParentLogin={() => setShowParentalGate(true)} />
        )}

        {showParentalGate && (
          <ParentalPinGate
            onContinueAsKid={() => setShowParentalGate(false)}
            onUnlocked={() => setShowParentalGate(false)}
          />
        )}
      </Suspense>

      <ServiceWorkerToast />

      <div className="flex flex-1 min-h-0">

      {!isOnboarded ? (
        <Suspense fallback={null}>
          <OnboardingModal 
            onComplete={handleOnboardingComplete} 
            preferredName={user?.user_metadata?.first_name}
            preferredPhone={user?.user_metadata?.phone}
          />
        </Suspense>
      ) : (
        <>
          <Sidebar
            activeView={activeView}
            onViewChange={handleViewChange}
            overBudgetCount={appState.budgetState.overBudgetCount}
            showInstall={!!deferredPrompt}
            onInstall={handleInstallClick}
            config={config}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <Header
              activeView={activeView}
              unreadCount={totalUnread}
              onToggleNotifications={toggleNotifications}
              onNavigate={handleViewChange}
              currency={currency}
              currentBalance={financeState.currentBalance}
              theme={theme}
              onToggleTheme={toggleTheme}
              config={config}
              onOpenSearch={() => setShowCommandPalette(true)}
              isPrivacyEnabled={pcSettings.hideBalances}
              onTogglePrivacy={handleTogglePrivacy}
              onExport={handlePDFReport}
              setSearchQuery={setVoiceSearchQuery}
            />

            <main 
              id="main-content" 
              role="main" 
              className="flex-1 px-2 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 overflow-x-hidden"
            >
              <ViewRenderer
                activeView={activeView}
                appState={appState}
                store={store}
                pcSettings={pcSettings}
                onNavigate={handleViewChange}
                onAdd={onAdd}
                onPDFReport={handlePDFReport}
                config={config}
                setConfig={setConfig}
                resetData={async () => { financeState.resetData(); }}
                userId={userId}
                onManageCategories={() => setShowCategoriesModal(true)}
                voiceSearchQuery={voiceSearchQuery}
              />

              <footer className="mt-12 pb-6 text-center" role="contentinfo">
                <p className="text-caption">
                  SpendWise v4.0 · All data stored locally · No data leaves your device 🔒
                </p>
              </footer>
            </main>

            <div className="mobile-nav-spacer md:hidden" />
          </div>
        </>
      )}

      {/* Floating Action Button (Mobile Only - Android Style) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          haptic.medium();
          setShowQuickAdd(true);
        }}
        className="fixed bottom-20 right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-[var(--teal)] to-[#0d9488] text-white shadow-lg shadow-teal-500/40 flex items-center justify-center md:hidden"
        aria-label="Add Transaction"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </motion.button>

      </div>

      <Suspense fallback={null}>
        <AppModals
          store={store}
          appState={appState}
          userId={userId}
          currency={currency}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          showCategoriesModal={showCategoriesModal}
          setShowCategoriesModal={setShowCategoriesModal}
          showCommandPalette={showCommandPalette}
          setShowCommandPalette={setShowCommandPalette}
          handleViewChange={handleViewChange}
        />

        <QuickAddModal
          isOpen={showQuickAdd}
          onClose={() => setShowQuickAdd(false)}
          onAdd={onAdd}
          transactions={transactions}
        />

        <FeedbackModal
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          onSubmit={(data) => {
            console.log('Feedback submitted:', data);
            // Here you would normally send to your backend
          }}
        />
      </Suspense>
    </div>
  );
}
