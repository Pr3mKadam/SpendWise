import { useState, useCallback, useEffect, lazy, Suspense, type Dispatch, type SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, Transaction, Category } from '../../types';
import { useAuth } from '../../hooks/useAuth';

import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import AlertBanner from '../common/AlertBanner';
import NotificationCenter from '../common/NotificationCenter';
import QuestCompletionOverlay from '../features/gamification/QuestCompletionOverlay';
import CustomCategoriesModal from '../common/CustomCategoriesModal';
import CommandPalette from '../common/CommandPalette';
import { DashboardView } from '../views/DashboardView';
import OnboardingModal, { SpendWiseConfig } from '../features/onboarding/OnboardingModal';

// Lazy loaded views
const AnalyticsView = lazy(() => import('../views/AnalyticsView'));
const HistoryView = lazy(() => import('../views/HistoryView'));
const RecurringView = lazy(() => import('../views/RecurringView'));
const GoalsView = lazy(() => import('../views/GoalsView'));
const SharedView = lazy(() => import('../views/SharedView'));
const BankSyncView = lazy(() => import('../views/BankSyncView'));
const ProfileView = lazy(() => import('../views/ProfileView'));
const PortfolioView = lazy(() => import('../views/PortfolioView'));
const AdvisorView = lazy(() => import('../views/AdvisorView'));
const ReportsView = lazy(() => import('../views/ReportsView'));
const ParentalView = lazy(() => import('../views/ParentalView'));
const BudgetManager = lazy(() => import('../features/budgets/BudgetManager'));
const SubscriptionManager = lazy(() => import('../features/subscriptions/SubscriptionManager'));
import { generatePDFReport } from '../../utils/exportPDF';
import { useStore } from '../../store';
import { ParentalPinGate, KidModeBanner } from '../features/parental/ParentalControlGate';

import { useFinanceState } from '../../hooks/useFinanceState';
import { useBudgets } from '../../hooks/useBudgets';
import { useAlerts } from '../../hooks/useAlerts';
import { useRecurring } from '../../hooks/useRecurring';
import { useNotifications } from '../../hooks/useNotifications';
import { useGoals } from '../../hooks/useGoals';
import { useCategories } from '../../hooks/useCategories';
import { useAutomations } from '../../hooks/useAutomations';

interface MainShellProps {
  config:     SpendWiseConfig | null;
  setConfig:  Dispatch<SetStateAction<SpendWiseConfig | null>>;
  userId:     string | null;
}

export function MainShell({ config, setConfig, userId }: MainShellProps) {
  useAutomations();
  const { user } = useAuth();
  const { customCategories, addCustomCategory, updateCustomCategory, deleteCustomCategory } = useCategories();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('spendwise_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('spendwise_theme', theme);
  }, [theme]);

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

  const currency = config?.currency ?? '$';

  const financeState = useFinanceState(config?.initialBalance ?? 5200);
  const {
    transactions: allTransactions,
    addTransaction,
    deleteTransaction: _deleteTransaction,
    updateTransactionCategory,
    bulkReassignCategory,
    resetData,
    categorySpending,
    totalSpent,
    currentBalance,
    dailySpendRate,
    monthlyStats,
    monthlyHistory,
    predictedEndOfMonth,
    projectionMeta,
  } = financeState;

  // Exclude pending-approval transactions from balance & budget calculations
  const transactions = allTransactions.filter(t => t.status !== 'pending_approval');

  const budgetState = useBudgets();
  const {
    budgets, budgetStats, setBudget, totalBudgeted, budgetSettings, updateBudgetSettings
  } = budgetState;

  const updateLimit = setBudget;
  const resetLimits = () => {}; // Could add reset logic if needed
  const totalSpentAgainstBudget = budgetStats.reduce((a, b) => a + b.spent, 0);
  const overBudgetCount = budgetStats.filter(b => b.status === 'danger').length;
  const period = budgetSettings.period;
  const periodLabel = period === 'weekly' ? 'This Week' : period === 'biweekly' ? 'Last 14 Days' : 'This Month';
  const rolloverEnabled = budgetSettings.rolloverEnabled;
  const updatePeriod = (p: any) => updateBudgetSettings({ period: p });
  const toggleRollover = () => updateBudgetSettings({ rolloverEnabled: !budgetSettings.rolloverEnabled });

  const alertState    = useAlerts(transactions, currentBalance, budgetStats, dailySpendRate, {
    currency,
    predictedEndOfMonth,
    daysLeftInMonth: projectionMeta.daysLeftInMonth,
  });
  const recurringData = useRecurring(transactions);
  const goalsState    = useGoals();
  const notifState    = useNotifications(alertState.alerts, recurringData, goalsState.goals);
  const totalUnread   = notifState.unreadCount;
  const isOnboarded = config?.onboardingComplete === true;

  const { goals, addGoal } = goalsState;

  const handleOnboardingComplete = useCallback(
    (cfg: SpendWiseConfig) => {
      setConfig(cfg);
    },
    [setConfig]
  );

  const onAdd = useCallback((tx: Transaction) => {
    addTransaction(tx);
  }, [addTransaction]);

  const handleCategoryChange = useCallback(
    async (id: string, newCategory: string) => {
      updateTransactionCategory(id, newCategory as Category);
    },
    [updateTransactionCategory]
  );

  const handlePDFReport = useCallback(() => {
    const now = new Date();
    const month = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    generatePDFReport({
      transactions,
      monthlyStats,
      budgets: budgetStats as any,
      goals: goalsState.goals,
      currency,
      month,
    });
  }, [transactions, monthlyStats, budgetStats, goalsState.goals, currency]);

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
        overBudgetCount={overBudgetCount}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeView={activeView}
          unreadCount={totalUnread}
          onToggleNotifications={toggleNotifications}
          onNavigate={handleViewChange}
          currency={currency}
          currentBalance={currentBalance}
          theme={theme}
          onToggleTheme={toggleTheme}
          config={config}
          onOpenSearch={() => setShowCommandPalette(true)}
        />

        <main 
          id="main-content" 
          role="main" 
          className="flex-1 px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 overflow-x-hidden"
        >
          {activeView === 'dashboard' && alertState.alerts.length > 0 && (
            <AlertBanner
              alerts={alertState.alerts}
              onDismiss={alertState.dismissAlert}
              onDismissAll={alertState.dismissAll}
            />
          )}

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[400px] text-[var(--text-muted)] animate-pulse">
              <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading View...</p>
            </div>
          }>
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <DashboardView
                  financeState={financeState}
                  onAdd={onAdd}
                  currency={currency}
                  onNavigate={handleViewChange}
                />
              </motion.div>
            )}

            {activeView === 'budget' && (
              <motion.div
                key="budget"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <BudgetManager
                  budgets={budgetStats as any}
                  totalBudgeted={totalBudgeted}
                  totalSpentAgainstBudget={totalSpentAgainstBudget}
                  overBudgetCount={overBudgetCount}
                  period={period}
                  periodLabel={periodLabel}
                  rolloverEnabled={rolloverEnabled}
                  onUpdateLimit={updateLimit}
                  onResetLimits={resetLimits}
                  onChangePeriod={updatePeriod}
                  onToggleRollover={toggleRollover}
                  onManageCategories={() => setShowCategoriesModal(true)}
                  currency={currency}
                />
              </motion.div>
            )}

            {activeView === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full space-y-6"
              >
                <AnalyticsView
                  monthlyHistory={monthlyHistory}
                  monthlyStats={monthlyStats}
                  categorySpending={categorySpending}
                  totalSpent={totalSpent}
                  currency={currency}
                  transactions={transactions}
                />
                <RecurringView patterns={recurringData} currency={currency} />
              </motion.div>
            )}

            {activeView === 'goals' && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <GoalsView
                  goals={goals}
                  stats={goalsState.stats}
                  onAdd={(data) => {
                    addGoal({
                      name:                data.name,
                      emoji:               data.emoji,
                      targetAmount:        Number(data.targetAmount),
                      savedAmount:         Number(data.savedAmount) || 0,
                      targetDate:          data.targetDate,
                      monthlyContribution: Number(data.monthlyContribution),
                      color:               data.color,
                    });
                  }}
                  onUpdate={goalsState.updateGoal}
                  onDelete={goalsState.deleteGoal}
                  onContribute={goalsState.addContribution}
                  currency={currency}
                />
              </motion.div>
            )}

            {activeView === 'shared' && (
              <motion.div
                key="shared"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <SharedView currency={currency} userId={userId} />
              </motion.div>
            )}

            {activeView === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <HistoryView
                  transactions={transactions}
                  onCategoryChange={handleCategoryChange}
                  onDelete={financeState.deleteTransaction}
                  onImportClick={() => setActiveView('sync')}
                  onPDFReport={handlePDFReport}
                  currency={currency}
                />
              </motion.div>
            )}

            {activeView === 'sync' && (
              <motion.div
                key="sync"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <BankSyncView
                  onAutoAddTransactions={(txs) => {
                    financeState.addTransactions(txs);
                  }}
                  recentTransactions={transactions.filter(t =>
                    t.tags?.includes('razorpay') || t.tags?.includes('upi') || t.tags?.includes('upi-sync')
                  )}
                  currency={currency}
                />
              </motion.div>
            )}

            {activeView === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <ProfileView
                  config={config}
                  onUpdateConfig={setConfig}
                  onResetData={async () => {
                    await resetData();
                    if (config) {
                      const nextConfig = { ...config, initialBalance: 0 };
                      setConfig(nextConfig);
                      localStorage.setItem('spendwise_config_v1', JSON.stringify(nextConfig));
                    }
                  }}
                  transactions={transactions}
                  onNavigate={handleViewChange}
                />
              </motion.div>
            )}

            {activeView === 'parental' && (
              <motion.div
                key="parental"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <ParentalView />
              </motion.div>
            )}

            {activeView === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <PortfolioView currency={currency} financeState={financeState} />
              </motion.div>
            )}

            {activeView === 'subscriptions' && (
              <motion.div
                key="subscriptions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <SubscriptionManager patterns={recurringData} currency={currency} />
              </motion.div>
            )}

            {activeView === 'advisor' && (
              <motion.div
                key="advisor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <AdvisorView financeState={financeState} />
              </motion.div>
            )}

            {activeView === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <ReportsView transactions={transactions} currency={currency} monthlyStats={monthlyStats} />
              </motion.div>
            )}
          </AnimatePresence>
          </Suspense>

          <footer className="mt-12 pb-6 text-center" role="contentinfo">
            <p className="text-caption">
              SpendWise v4.0 · All data stored locally · No data leaves your device 🔒
            </p>
          </footer>
        </main>

        <div className="mobile-nav-spacer md:hidden" />
      </div>

      </div>

      <NotificationCenter
        notifications={notifState.notifications}
        unreadCount={notifState.unreadCount}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onMarkRead={notifState.markRead}
        onMarkAllRead={notifState.markAllRead}
        onNavigate={(view) => {
          handleViewChange(view);
          setShowNotifications(false);
        }}
        cloudMode={Boolean(userId)}
      />

      <CustomCategoriesModal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        customCategories={customCategories}
        onAdd={(newCat) => {
          addCustomCategory(newCat);
        }}
        onUpdate={updateCustomCategory}
        onDelete={deleteCustomCategory}
        transactions={transactions}
        onReassign={(oldCat, newCat) => {
          bulkReassignCategory(oldCat, newCat);
        }}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={handleViewChange}
        transactions={transactions}
        currency={currency}
      />
    </div>
  );
}
