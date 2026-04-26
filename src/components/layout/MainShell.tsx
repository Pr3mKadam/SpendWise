import { useState, useCallback, useEffect, type Dispatch, type SetStateAction } from 'react';
import { supabase } from '../../services/supabaseClient';
import { AppView, Transaction, Category } from '../../types';
import { useAuth } from '../../hooks/useAuth';

import Sidebar from '../Sidebar';
import Header from '../Header';
import BudgetManager from '../BudgetManager';
import AnalyticsView from '../AnalyticsView';
import HistoryView from '../HistoryView';
import AlertBanner from '../AlertBanner';
import NotificationCenter from '../NotificationCenter';
import RecurringView from '../RecurringView';
import GoalsView from '../GoalsView';
import SharedView from '../SharedView';
import ImportCSVModal from '../ImportCSVModal';
import CustomCategoriesModal from '../CustomCategoriesModal';
import BankSyncView from '../BankSyncView';
import ProfileView from '../ProfileView';
import PortfolioView from '../PortfolioView';
import SubscriptionManager from '../SubscriptionManager';
import { generatePDFReport } from '../../utils/exportPDF';
import { useParentalControl } from '../../contexts/ParentalControlContext';
import { ParentalPinGate, KidModeBanner } from '../ParentalControlGate';
import ParentalControlModal from '../ParentalControlModal';
import ParentDashboard from '../ParentDashboard';
import CommandPalette from '../CommandPalette';
import { DashboardView } from '../DashboardView';
import OnboardingModal, { SpendWiseConfig } from '../OnboardingModal';
import { insertTransactionRemote, resetUserCloudData } from '../../lib/supabaseData';

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

  const [showImportCSV, setShowImportCSV]         = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showParentalModal, setShowParentalModal]   = useState(false);
  const [showParentalGate, setShowParentalGate]     = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
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

  const parentalControl = useParentalControl();
  const { settings: pcSettings, isKidMode } = parentalControl;

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
    recoverOriginalCategory,
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
  const pendingTransactions = allTransactions.filter(t => t.status === 'pending_approval');

  const budgetState = useBudgets(transactions);
  const {
    budgets, updateLimit, resetLimits, totalBudgeted, totalSpentAgainstBudget, overBudgetCount,
    period, periodLabel, rolloverEnabled, updatePeriod, toggleRollover,
  } = budgetState;

  const alertState    = useAlerts(transactions, currentBalance, budgets, dailySpendRate, {
    currency,
    predictedEndOfMonth,
    daysLeftInMonth: projectionMeta.daysLeftInMonth,
  });
  const recurringData = useRecurring(transactions);
  const goalsState    = useGoals(userId);
  const notifState    = useNotifications(alertState.alerts, recurringData, goalsState.goals);
  const totalUnread   = notifState.unreadCount;
  const isOnboarded = config?.onboardingComplete === true;

  const { goals, addGoal } = goalsState;

  const handleOnboardingComplete = useCallback(
    (cfg: SpendWiseConfig) => {
      setConfig(cfg);
      if (userId) {
        import('../../lib/supabaseData').then(({ saveProfileFromConfig }) => {
          saveProfileFromConfig(userId, cfg).catch((err) => {
            console.error('Failed to save profile to cloud:', err);
          });
        });
      }
    },
    [userId, setConfig]
  );

  const onAdd = useCallback((tx: Transaction) => {
    addTransaction(tx);
    if (userId) {
      insertTransactionRemote(userId, tx).catch(err => console.error("Cloud insert failed:", err));
    }
  }, [addTransaction, userId]);

  const handleCategoryChange = useCallback(
    async (id: string, newCategory: string) => {
      updateTransactionCategory(id, newCategory as Category);

      if (userId) {
        const tx = transactions.find((t) => t.id === id);
        if (tx) {
          try {
            await insertTransactionRemote(userId, { ...tx, category: newCategory as Category });
          } catch (err) {
            console.error('Failed to sync category update to cloud:', err);
          }
        }
      }
    },
    [userId, transactions, updateTransactionCategory]
  );

  const handlePDFReport = useCallback(() => {
    const now = new Date();
    const month = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    generatePDFReport({
      transactions,
      monthlyStats,
      budgets,
      goals: goalsState.goals,
      currency,
      month,
    });
  }, [transactions, monthlyStats, budgets, goalsState.goals, currency]);

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
        <ParentalPinGate onContinueAsKid={() => parentalControl.updateSettings({ kidMode: true })} />
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

        <main className="flex-1 px-6 lg:px-8 py-6 lg:py-8 max-w-[1400px] w-full">
          {activeView === 'dashboard' && alertState.alerts.length > 0 && (
            <AlertBanner
              alerts={alertState.alerts}
              onDismiss={alertState.dismissAlert}
              onDismissAll={alertState.dismissAll}
            />
          )}

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
                budgets={budgets}
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

          {activeView === 'history' && (
            <div className="view-enter">
              <HistoryView
                transactions={transactions}
                onCategoryChange={handleCategoryChange}
                onDelete={financeState.deleteTransaction}
                onImportClick={() => setShowImportCSV(true)}
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
                  if (userId) {
                    try {
                      await resetUserCloudData(userId);
                    } catch (err) {
                      console.error('Failed to reset cloud data:', err);
                    }
                  }
                  resetData();
                  if (config) {
                    const nextConfig = { ...config, initialBalance: 0 };
                    setConfig(nextConfig);
                    localStorage.setItem('spendwise_config_v1', JSON.stringify(nextConfig));
                  }
                }}
                transactions={transactions}
                onOpenParentalSettings={() => setShowParentalModal(true)}
                onOpenParentDashboard={() => setShowParentDashboard(true)}
              />
            </div>
          )}

          {activeView === 'portfolio' && (
            <div className="view-enter">
              <PortfolioView currency={currency} />
            </div>
          )}

          {activeView === 'subscriptions' && (
            <div className="view-enter">
              <SubscriptionManager patterns={recurringData} currency={currency} />
            </div>
          )}

          <footer className="mt-12 pb-6 text-center">
            <p className="text-caption">
              SpendWise v3.0 · All data stored locally · No data leaves your device 🔒
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

      <ImportCSVModal
        isOpen={showImportCSV}
        onClose={() => setShowImportCSV(false)}
        onImport={(txs) => {
          txs.forEach(addTransaction);
        }}
      />

      <ParentalControlModal
        isOpen={showParentalModal}
        onClose={() => setShowParentalModal(false)}
        pendingTransactions={pendingTransactions}
        onApproveTx={async (txId) => {
          updateTransactionCategory(txId, allTransactions.find(t => t.id === txId)?.category ?? 'Other');
          if (userId) {
            const { approveTransaction } = await import('../../lib/supabaseData');
            await approveTransaction(userId, txId).catch(console.error);
          }
        }}
        onRejectTx={async (txId) => {
          _deleteTransaction(txId);
          if (userId) {
            const { rejectTransaction } = await import('../../lib/supabaseData');
            await rejectTransaction(userId, txId).catch(console.error);
          }
        }}
      />

      <ParentDashboard
        isOpen={showParentDashboard}
        onClose={() => setShowParentDashboard(false)}
        currency={currency}
      />

      <CustomCategoriesModal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        customCategories={customCategories}
        onAdd={(newCat) => {
          addCustomCategory(newCat);
          recoverOriginalCategory(newCat.name);
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
