import { useState, useCallback, useEffect, type Dispatch, type SetStateAction } from 'react';
import { AppView, Transaction, Category } from '../../types';
import { useAuth } from '../../hooks/useAuth';

import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import BudgetManager from '../features/budgets/BudgetManager';
import AnalyticsView from '../views/AnalyticsView';
import HistoryView from '../views/HistoryView';
import BudgetView from '../views/BudgetView';
import AlertBanner from '../common/AlertBanner';
import NotificationCenter from '../common/NotificationCenter';
import RecurringView from '../views/RecurringView';
import GoalsView from '../views/GoalsView';
import SharedView from '../views/SharedView';
import QuestCompletionOverlay from '../features/gamification/QuestCompletionOverlay';

import CustomCategoriesModal from '../common/CustomCategoriesModal';
import BankSyncView from '../views/BankSyncView';
import ProfileView from '../views/ProfileView';
import PortfolioView from '../views/PortfolioView';
import SubscriptionManager from '../features/subscriptions/SubscriptionManager';
import AdvisorView from '../views/AdvisorView';
import ReportsView from '../views/ReportsView';
import { generatePDFReport } from '../../utils/exportPDF';
import { useStore } from '../../store';
import { ParentalPinGate, KidModeBanner } from '../features/parental/ParentalControlGate';
import ParentalView from '../views/ParentalView';
import CommandPalette from '../common/CommandPalette';
import { DashboardView } from '../views/DashboardView';
import OnboardingModal, { SpendWiseConfig } from '../features/onboarding/OnboardingModal';

import { useFinanceState } from '../../hooks/useFinanceState';
import { useBudgets } from '../../hooks/useBudgets';
import { useAlerts } from '../../hooks/useAlerts';
import { useRecurring } from '../../hooks/useRecurring';
import { useNotifications } from '../../hooks/useNotifications';
import { useGoals } from '../../hooks/useGoals';
import { useCategories } from '../../hooks/useCategories';

interface MainShellProps {
  config:     SpendWiseConfig | null;
  setConfig:  Dispatch<SetStateAction<SpendWiseConfig | null>>;
  userId:     string | null;
}

export function MainShell({ config, setConfig, userId }: MainShellProps) {
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
    budgets, budgetStats, setBudget, totalBudgeted
  } = budgetState;

  const updateLimit = setBudget;
  const resetLimits = () => {};
  const totalSpentAgainstBudget = budgetStats.reduce((a, b) => a + b.spent, 0);
  const overBudgetCount = budgetStats.filter(b => b.status === 'danger').length;
  const period: any = 'monthly';
  const periodLabel = 'This Month';
  const rolloverEnabled = false;
  const updatePeriod = () => {};
  const toggleRollover = () => {};

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
          className="flex-1 px-6 lg:px-8 py-6 lg:py-8 max-w-[1400px] w-full"
        >
          {activeView === 'dashboard' && alertState.alerts.length > 0 && (
            <AlertBanner
              alerts={alertState.alerts}
              onDismiss={alertState.dismissAlert}
              onDismissAll={alertState.dismissAll}
            />
          )}

          {/* ... existing views ... */}
          {activeView === 'dashboard' && (
            <DashboardView
              financeState={financeState}
              onCategoryChange={handleCategoryChange}
              onAdd={onAdd}
              currency={currency}
            />
          )}

          {activeView === 'budget' && (
            <div className="view-enter">
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
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="view-enter space-y-6">
              <AnalyticsView
                monthlyHistory={monthlyHistory}
                monthlyStats={monthlyStats}
                categorySpending={categorySpending}
                totalSpent={totalSpent}
                currency={currency}
                transactions={transactions}
              />
              <RecurringView patterns={recurringData} currency={currency} />
            </div>
          )}

          {activeView === 'goals' && (
            <div className="view-enter">
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
            </div>
          )}

          {activeView === 'shared' && (
            <SharedView currency={currency} userId={userId} />
          )}

          {activeView === 'budget' && (
            <div className="view-enter">
              <BudgetView currency={currency} />
            </div>
          )}

          {activeView === 'history' && (
            <div className="view-enter">
              <HistoryView
                transactions={transactions}
                onCategoryChange={handleCategoryChange}
                onDelete={financeState.deleteTransaction}
                onImportClick={() => setActiveView('sync')}
                onPDFReport={handlePDFReport}
                currency={currency}
              />
            </div>
          )}

          {activeView === 'sync' && (
            <div className="view-enter">
              <BankSyncView
                onAutoAddTransactions={(txs) => {
                  txs.forEach(onAdd);
                }}
                recentTransactions={transactions.filter(t =>
                  t.tags?.includes('razorpay') || t.tags?.includes('upi') || t.tags?.includes('upi-sync')
                )}
                currency={currency}
              />
            </div>
          )}

          {activeView === 'profile' && (
            <div className="view-enter">
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
            </div>
          )}

          {activeView === 'parental' && (
            <div className="view-enter">
              <ParentalView />
            </div>
          )}

          {activeView === 'portfolio' && (
            <div className="view-enter">
              <PortfolioView currency={currency} financeState={financeState} />
            </div>
          )}

          {activeView === 'subscriptions' && (
            <div className="view-enter">
              <SubscriptionManager patterns={recurringData} currency={currency} />
            </div>
          )}

          {activeView === 'advisor' && (
            <div className="view-enter">
              <AdvisorView transactions={transactions} />
            </div>
          )}

          {activeView === 'reports' && (
            <div className="view-enter">
              <ReportsView />
            </div>
          )}

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
