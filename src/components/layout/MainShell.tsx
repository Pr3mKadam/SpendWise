import { useState, useCallback, useEffect, lazy, Suspense, type Dispatch, type SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, Transaction, Category } from '../../types';
import { useAuth } from '../../hooks/useAuth';

import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import AlertBanner from '../common/AlertBanner';
import { AppModals } from './AppModals';
import { ViewRenderer } from './ViewRenderer';
import { useAppState } from '../../hooks/useAppState';
import { useAutomations } from '../../hooks/useAutomations';
import { useStore } from '../../store';
import { STORAGE_KEYS } from '../../constants';
import OnboardingModal, { SpendWiseConfig } from '../features/onboarding/OnboardingModal';
import { ParentalPinGate, KidModeBanner } from '../features/parental/ParentalControlGate';
import Soundscape from '../features/audio/Soundscape';

interface MainShellProps {
  config:     SpendWiseConfig | null;
  setConfig:  (config: SpendWiseConfig) => void;
  userId:     string | null;
}

export function MainShell({ config, setConfig, userId }: MainShellProps) {
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
  const [activeView, setActiveView]               = useState<AppView>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(v => !v);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
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
    const { generatePDFReport } = await import('../../utils/exportPDF');
    const now = new Date();
    const month = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    generatePDFReport({
      transactions,
      monthlyStats: financeState.monthlyStats,
      budgets: appState.budgetState.budgetStats as any,
      goals: appState.goalsState.goals,
      currency,
      month,
    });
  }, [transactions, financeState.monthlyStats, appState.budgetState.budgetStats, appState.goalsState.goals, currency]);

  const handleViewChange = useCallback((v: AppView) => {
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

      <Soundscape />

      <div className="flex flex-1 min-h-0">

      {!isOnboarded && (
        <OnboardingModal 
          onComplete={handleOnboardingComplete} 
          preferredName={user?.user_metadata?.first_name}
          preferredPhone={user?.user_metadata?.phone}
        />
      )}

      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        overBudgetCount={appState.budgetState.overBudgetCount}
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
          isPrivacyEnabled={store.privacyEnabled}
          onTogglePrivacy={store.togglePrivacy}
        />

        <main 
          id="main-content" 
          role="main" 
          className="flex-1 px-2 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 overflow-x-hidden"
        >
          {activeView === 'dashboard' && appState.alertState.alerts.length > 0 && (
            <AlertBanner
              alerts={appState.alertState.alerts}
              onDismiss={appState.alertState.dismissAlert}
              onDismissAll={appState.alertState.dismissAll}
            />
          )}

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
          />

          <footer className="mt-12 pb-6 text-center" role="contentinfo">
            <p className="text-caption">
              SpendWise v4.0 · All data stored locally · No data leaves your device 🔒
            </p>
          </footer>
        </main>

        <div className="mobile-nav-spacer md:hidden" />
      </div>

      </div>

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
    </div>
  );
}
