import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, Transaction, Category } from '@/types';
import { useAuth } from '@/hooks/useAuth';

import Sidebar from '@/shell/Sidebar';
import Header from '@/shell/Header';
import type { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { ViewRenderer } from '@/app/ViewRenderer';
import { useAppState } from '@/hooks/useAppState';
import { useAutomations } from '@/features/recurring/hooks/useAutomations';
import { useStore } from '@/store';
import ServiceWorkerToast from '@/shell/ServiceWorkerToast';
import { haptic } from '@/lib/haptic';
import { useUPIReturn } from '@/hooks/useUPIReturn';
import { Shield } from 'lucide-react';

import { useAppEnvironment } from '@/app/hooks/useAppEnvironment';
import { usePWAInstall } from '@/app/hooks/usePWAInstall';
import { useAppTheme } from '@/app/hooks/useAppTheme';
import { useAppNavigation } from '@/app/hooks/useAppNavigation';
import { useShakeFeedback } from '@/app/hooks/useShakeFeedback';

const AppModals = lazy(() => import('@/app/AppModals').then(m => ({ default: m.AppModals })));
const OnboardingModal = lazy(() => import('@/features/onboarding/components/OnboardingModal'));
const ParentalPinGate = lazy(() => import('@/features/parental/components/ParentalControlGate').then(m => ({ default: m.ParentalPinGate })));
const KidModeBanner = lazy(() => import('@/features/parental/components/ParentalControlGate').then(m => ({ default: m.KidModeBanner })));
const QuickAddModal = lazy(() => import('@/shell/QuickAddModal').then(m => ({ default: m.QuickAddModal })));
const FeedbackModal = lazy(() => import('@/shell/FeedbackModal').then(m => ({ default: m.FeedbackModal })));

interface MainShellProps {
  config:     SpendWiseConfig | null;
  setConfig:  (config: SpendWiseConfig) => void;
  userId:     string | null;
  initialView?: AppView;
}

export function MainShell({ config, setConfig, userId, initialView = 'dashboard' }: MainShellProps) {
  useAutomations();
  const { user } = useAuth();
  const store = useStore();
  const addTransactions = store.addTransactions;

  // ── Global UPI Return Detection ─────────────────────────────────────────
  useUPIReturn({ onTransactionAdded: addTransactions });

  const appState = useAppState(config);
  const { currency, transactions, financeState, notifState } = appState;
  
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showParentalGate, setShowParentalGate]     = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [voiceSearchQuery, setVoiceSearchQuery]     = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const { isOffline, keyboardOffset } = useAppEnvironment();
  const { deferredPrompt, handleInstallClick } = usePWAInstall();
  const { activeView, setActiveView, handleViewChange } = useAppNavigation({
    initialView,
    showQuickAdd, setShowQuickAdd,
    showNotifications, setShowNotifications,
    showCommandPalette, setShowCommandPalette,
    showCategoriesModal, setShowCategoriesModal,
  });
  const { theme, toggleTheme } = useAppTheme(activeView);
  
  useShakeFeedback(setShowFeedback, notifState.addNotification);

  const pcSettings = store.parentalState;
  const isKidMode = pcSettings.isTeenMode;
  const totalUnread = notifState.unreadCount;
  const isOnboarded = config?.onboardingComplete === true;

  const handleOnboardingComplete = useCallback(
    (cfg: SpendWiseConfig) => {
      setConfig(cfg);
    },
    [setConfig]
  );

  const onAdd = useCallback((tx: Transaction) => {
    // Safety check: ensure tx is a valid transaction object, not a browser event
    if (tx && typeof tx === 'object' && 'amount' in tx && typeof tx.amount === 'number') {
      financeState.addTransaction(tx);
    } else {
      console.warn('MainShell: Attempted to add invalid transaction object:', tx);
    }
  }, [financeState.addTransaction]);

  const handlePDFReport = useCallback(async () => {
    const { generatePDFReport } = await import('@/lib/exportPDF');
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

  useEffect(() => {
    if (isKidMode) {
      if (activeView === 'sync' || (activeView === 'analytics' && pcSettings.hideAnalytics)) {
        setActiveView('dashboard');
      }
    }
  }, [isKidMode, activeView, pcSettings.hideAnalytics, setActiveView]);
  
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

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('open-quick-add', handleQuickAddEvent);
    };
  }, []);

  // Handle incoming share target at startup:
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');

    if (action === 'share-receipt') {
      window.dispatchEvent(new CustomEvent('open-quick-add'));
      const url = new URL(window.location.href);
      url.searchParams.delete('action');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

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
            className="fixed top-0 left-0 right-0 z-[200] bg-amber-500 text-white text-[length:var(--fs-overline)] font-bold uppercase tracking-widest py-1.5 text-center shadow-lg"
          >
            Offline Mode · Using Cached Data
          </motion.div>
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
            onOpenQuickAdd={() => setShowQuickAdd(true)}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <Header
              activeView={activeView}
              unreadCount={totalUnread}
              onToggleNotifications={() => setShowNotifications(v => !v)}
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

              <footer className="mt-8 pb-6 text-center" role="contentinfo">
                <p className="text-caption">
                  SpendWise · All data stored locally · No data leaves your device 🔒
                </p>
              </footer>
            </main>

            <div className="mobile-nav-spacer md:hidden" />
          </div>
        </>
      )}

      {/* Floating Action Button handled by Sidebar */}

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
            if (import.meta.env.DEV) console.log('Feedback submitted:', data);
          }}
        />
      </Suspense>
    </div>
  );
}
