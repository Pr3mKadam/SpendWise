import { useState, useCallback, useEffect, type Dispatch, type SetStateAction } from 'react';
import OnboardingModal, { loadConfig, SpendWiseConfig } from './components/OnboardingModal';
import { supabase } from './services/supabaseClient';
import { fetchProfile, profileRowToConfig, saveProfileFromConfig, insertTransactionRemote, resetUserCloudData } from './lib/supabaseData';
import { AppView, Transaction, Category } from './types';
import { useAuth } from './hooks/useAuth';
import AuthView from './components/AuthView';

// ── Components ──────────────────────────────────────────────────
import Sidebar          from './components/Sidebar';
import Header           from './components/Header';
import MetricCards      from './components/MetricCards';
import BalanceChart     from './components/BalanceChart';
import SpendingDonut    from './components/SpendingDonut';
import TransactionList  from './components/TransactionList';
import MagicInput       from './components/MagicInput';
import AICoach          from './components/AICoach';
import BudgetManager    from './components/BudgetManager';
import AnalyticsView    from './components/AnalyticsView';
import HistoryView      from './components/HistoryView';
import AlertBanner      from './components/AlertBanner';
import NotificationCenter from './components/NotificationCenter';
import RecurringView    from './components/RecurringView';
import GoalsView        from './components/GoalsView';
import SharedView       from './components/SharedView';
import ImportCSVModal   from './components/ImportCSVModal';
import CustomCategoriesModal from './components/CustomCategoriesModal';
import BankSyncView       from './components/BankSyncView';
import ProfileView        from './components/ProfileView';
import PortfolioView      from './components/PortfolioView';
import SubscriptionManager from './components/SubscriptionManager';
import { generatePDFReport } from './utils/exportPDF';
import { useParentalControl } from './contexts/ParentalControlContext';
import { ParentalPinGate, KidModeBanner } from './components/ParentalControlGate';
import ParentalControlModal from './components/ParentalControlModal';

// ── Hooks ────────────────────────────────────────────────────────
import { useFinanceState }  from './hooks/useFinanceState';
import { useBudgets }       from './hooks/useBudgets';
import { useAlerts }        from './hooks/useAlerts';
import { useRecurring }     from './hooks/useRecurring';
import { useNotifications } from './hooks/useNotifications';
import { useGoals }         from './hooks/useGoals';
import { useCategories }    from './hooks/useCategories';

// ── Dashboard Sub-View ──────────────────────────────────────────

function DashboardView({
  financeState,
  onCategoryChange,
  onAdd,
  currency,
}: {
  financeState: ReturnType<typeof useFinanceState>;
  onCategoryChange: (id: string, newCategory: string) => void;
  onAdd: Parameters<typeof MagicInput>[0]['onAddTransaction'];
  currency: string;
}) {
  const {
    transactions,
    currentBalance,
    predictedEndOfMonth,
    projectionMeta,
    topCategory,
    categorySpending,
    totalSpent,
    balanceTrend,
    monthlyStats,
    dailySpendRate,
  } = financeState;

  return (
    <div className="view-enter">

      {/* Top Metrics Row */}
      <MetricCards
        currentBalance={currentBalance}
        predictedEndOfMonth={predictedEndOfMonth}
        projectionMeta={projectionMeta}
        monthlyStats={monthlyStats}
        currency={currency}
      />

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">

        {/* Left Column */}
        <div className="space-y-6">
          <BalanceChart data={balanceTrend} currency={currency} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpendingDonut data={categorySpending} totalSpent={totalSpent} currency={currency} />
            <div className="flex flex-col gap-6">
              <MagicInput onAddTransaction={onAdd} currency={currency} />
              <AICoach
                topCategory={topCategory}
                totalSpent={totalSpent}
                categorySpending={categorySpending}
                currency={currency}
                currentBalance={currentBalance}
                predictedEndOfMonth={predictedEndOfMonth}
                dailySpendRate={dailySpendRate}
                monthlyStats={monthlyStats}
                projectionMeta={projectionMeta}
              />
            </div>
          </div>
        </div>

        {/* Right Column — Transactions */}
        <TransactionList transactions={transactions} onCategoryChange={onCategoryChange} currency={currency} />
      </div>
    </div>
  );
}

// ── Shell types & loading ─────────────────────────────────────

interface MainShellProps {
  config:     SpendWiseConfig | null;
  setConfig:  Dispatch<SetStateAction<SpendWiseConfig | null>>;
  userId:     string | null;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-[var(--accent)] animate-pulse font-medium text-lg">Loading SpendWise...</div>
    </div>
  );
}

function MainShell({ config, setConfig, userId }: MainShellProps) {
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
  const [activeView, setActiveView]               = useState<AppView>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  const parentalControl = useParentalControl();
  const { settings: pcSettings, isKidMode } = parentalControl;

  const toggleNotifications = useCallback(() => {
    setShowNotifications(v => !v);
  }, []);

  const currency = config?.currency ?? '$';

  const financeState = useFinanceState(config?.initialBalance ?? 5200);
  const {
    transactions,
    addTransaction,
    deleteTransaction: _deleteTransaction,
    updateTransactionCategory,
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
  const isOnboarded = config?.onboardingComplete === true;

  const { goals, addGoal } = goalsState;

  const handleOnboardingComplete = useCallback(
    (cfg: SpendWiseConfig) => {
      // Apply config immediately so the modal closes. OnboardingModal already
      // persisted to localStorage; cloud save must not block UI (network/RLS errors
      // or slow requests previously left users stuck on this step).
      setConfig(cfg);
      if (userId) {
        void saveProfileFromConfig(userId, cfg).catch((err) => {
          console.error('Failed to save profile to cloud:', err);
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

  // ── PDF Report ──────────────────────────────────────────────────
  const handleCategoryChange = useCallback(
    async (id: string, newCategory: string) => {
      // 1. Update local state
      updateTransactionCategory(id, newCategory as Category);

      // 2. Sync to cloud if user is logged in
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

      {/* ── Parental PIN Gate (slides over app on kid-mode session) ── */}
      {pcSettings.enabled && !pcSettings.sessionUnlocked && !isKidMode && (
        <ParentalPinGate onContinueAsKid={() => parentalControl.updateSettings({ kidMode: true })} />
      )}

      {/* ── Kid Mode Banner ── */}
      {isKidMode && (
        <KidModeBanner onParentLogin={() => setShowParentalGate(true)} />
      )}

      {/* ── Parent PIN unlock overlay (triggered from banner) ── */}
      {showParentalGate && (
        <ParentalPinGate onContinueAsKid={() => setShowParentalGate(false)} />
      )}

      <div className="flex flex-1 min-h-0">

      {/* ── Onboarding Modal ── */}
      {!isOnboarded && (
        <OnboardingModal 
          onComplete={handleOnboardingComplete} 
          preferredName={user?.user_metadata?.first_name}
          preferredPhone={user?.user_metadata?.phone}
        />
      )}

      {/* ── Sidebar ── */}
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        overBudgetCount={overBudgetCount}
        onOpenParentalSettings={() => setShowParentalModal(true)}
      />

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header Bar */}
        <Header
          activeView={activeView}
          unreadCount={notifState.unreadCount}
          onToggleNotifications={toggleNotifications}
          onNavigate={handleViewChange}
          currency={currency}
          currentBalance={currentBalance}
          theme={theme}
          onToggleTheme={toggleTheme}
          config={config}
        />

        {/* Page Content */}
        <main className="flex-1 px-6 lg:px-8 py-6 lg:py-8 max-w-[1400px] w-full">

          {/* Alert Banner */}
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
            <SharedView currency={currency} />
          )}

          {activeView === 'history' && (
            <div className="view-enter">
              <HistoryView
                transactions={transactions}
                onCategoryChange={handleCategoryChange}
                onImportClick={() => setShowImportCSV(true)}
                onPDFReport={handlePDFReport}
                currency={currency}
              />
            </div>
          )}

          {/* ── Bank Sync ── */}
          {activeView === 'sync' && (
            <div className="view-enter">
              <BankSyncView
                onAutoAddTransactions={(txs) => {
                  txs.forEach(onAdd);
                }}
                currency={currency}
              />
            </div>
          )}

          {/* ── Profile ── */}
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
              />
            </div>
          )}

          {/* ── Portfolio (Net Worth) ── */}
          {activeView === 'portfolio' && (
            <div className="view-enter">
              <PortfolioView currency={currency} />
            </div>
          )}

          {/* ── Subscription Manager ── */}
          {activeView === 'subscriptions' && (
            <div className="view-enter">
              <SubscriptionManager patterns={recurringData} currency={currency} />
            </div>
          )}

          {/* Footer */}
          <footer className="mt-12 pb-6 text-center">
            <p className="text-caption">
              SpendWise v3.0 · All data stored locally · No data leaves your device 🔒
            </p>
          </footer>

        </main>

        {/* Mobile bottom nav spacer */}
        <div className="mobile-nav-spacer md:hidden" />
      </div>

      </div>{/* end flex-1 inner row */}

      {/* ── Notification Center ── */}
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

      {/* ── Import CSV Modal ── */}
      <ImportCSVModal
        isOpen={showImportCSV}
        onClose={() => setShowImportCSV(false)}
        onImport={(txs) => {
          txs.forEach(addTransaction);
        }}
      />

      {/* ── Parental Control Modal ── */}
      <ParentalControlModal
        isOpen={showParentalModal}
        onClose={() => setShowParentalModal(false)}
      />

      {/* ── Custom Categories Modal ── */}
      <CustomCategoriesModal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        customCategories={customCategories}
        onAdd={addCustomCategory}
        onUpdate={updateCustomCategory}
        onDelete={deleteCustomCategory}
        transactions={transactions}
        onReassign={(oldCat, newCat) => {
          transactions.forEach((tx) => {
            if (tx.category === oldCat) {
              handleCategoryChange(tx.id, newCat);
            }
          });
        }}
      />
    </div>
  );
}

function AppAuthenticated() {
  const { user } = useAuth();
  const isCloud = Boolean(supabase);
  const userId = isCloud && user ? user.id : null;

  const [config, setConfig] = useState<SpendWiseConfig | null>(() => (userId ? null : loadConfig()));
  const [profileLoading, setProfileLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setConfig(loadConfig());
      setProfileLoading(false);
      return;
    }

    let cancelled = false;
    setProfileLoading(true);
    fetchProfile(userId)
      .then(row => {
        if (cancelled) return;
        const local: Partial<SpendWiseConfig> = loadConfig() || {};
        
        // Auto-fill missing data directly from Supabase Auth metadata!
        if (!local.name && user?.user_metadata?.first_name) {
          local.name = user.user_metadata.first_name;
        }
        if (!local.phone && user?.user_metadata?.phone) {
          local.phone = user.user_metadata.phone;
        }

        const mergedConfig = row 
          ? { ...local, ...profileRowToConfig(row) } as SpendWiseConfig
          : {
              initialBalance:     5200,
              balanceAnchorNet:   0,
              currency:           '$',
              onboardingComplete: false,
              createdAt:          new Date().toISOString(),
              ...local
            } as SpendWiseConfig;

        setConfig(mergedConfig);
      })
      .catch(() => {
        if (cancelled) return;
        const local: Partial<SpendWiseConfig> = loadConfig() || {};
        if (!local.name && user?.user_metadata?.first_name) local.name = user.user_metadata.first_name;
        if (!local.phone && user?.user_metadata?.phone) local.phone = user.user_metadata.phone;

        setConfig({
          initialBalance:     5200,
          balanceAnchorNet:   0,
          currency:           '$',
          onboardingComplete: false,
          createdAt:          new Date().toISOString(),
          ...local
        } as SpendWiseConfig);
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (profileLoading) return <LoadingScreen />;

  return (
    <MainShell config={config} setConfig={setConfig} userId={userId} />
  );
}

export default function App() {
  const { session, authReady, mfaRequired } = useAuth();
  const isCloud = Boolean(supabase);

  if (!authReady) return <LoadingScreen />;
  if (isCloud && (!session || mfaRequired)) return <AuthView mfaRequired={mfaRequired} />;

  return <AppAuthenticated />;
}
