import { useState, useCallback, useEffect } from 'react';
import OnboardingModal, { loadConfig, SpendWiseConfig } from './components/OnboardingModal';

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

// ── Hooks ────────────────────────────────────────────────────────
import { useFinanceState }  from './hooks/useFinanceState';
import { useBudgets }       from './hooks/useBudgets';
import { useAlerts }        from './hooks/useAlerts';
import { useRecurring }     from './hooks/useRecurring';
import { useNotifications } from './hooks/useNotifications';
import { useGoals }         from './hooks/useGoals';
import { useAuth }          from './hooks/useAuth';
import AuthView             from './components/AuthView';
// ── Types ────────────────────────────────────────────────────────
import { AppView } from './types';

// ── Dashboard Sub-View ──────────────────────────────────────────

function DashboardView({
  financeState,
  onDelete,
  onAdd,
  currency,
}: {
  financeState: ReturnType<typeof useFinanceState>;
  onDelete: (id: string) => void;
  onAdd: Parameters<typeof MagicInput>[0]['onAddTransaction'];
  currency: string;
}) {
  const {
    transactions,
    currentBalance,
    predictedEndOfMonth,
    topCategory,
    categorySpending,
    totalSpent,
    balanceTrend,
    monthlyStats,
  } = financeState;

  return (
    <div className="view-enter">

      {/* Top Metrics Row */}
      <MetricCards
        currentBalance={currentBalance}
        predictedEndOfMonth={predictedEndOfMonth}
        topCategory={topCategory}
        monthlyStats={monthlyStats}
        currency={currency}
      />

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">

        {/* Left Column */}
        <div className="space-y-6">
          <BalanceChart data={balanceTrend} currency={currency} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpendingDonut data={categorySpending} totalSpent={totalSpent} />
            <div className="flex flex-col gap-6">
              <MagicInput onAddTransaction={onAdd} currency={currency} />
              <AICoach
                topCategory={topCategory}
                totalSpent={totalSpent}
                categorySpending={categorySpending}
                currency={currency}
              />
            </div>
          </div>
        </div>

        {/* Right Column — Transactions */}
        <TransactionList transactions={transactions} onDelete={onDelete} currency={currency} />
      </div>
    </div>
  );
}

// ── App Root ────────────────────────────────────────────────────

export default function App() {
  const { session, loading } = useAuth();
  const [activeView, setActiveView]               = useState<AppView>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  // ── Theme ───────────────────────────────────────────────────
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

  // ── Onboarding gate ─────────────────────────────────────────
  const [config, setConfig] = useState<SpendWiseConfig | null>(() => loadConfig());
  const isOnboarded = config?.onboardingComplete === true;

function MainShell({ config, setConfig, userId, isCloud, onSignOut }: MainShellProps) {
  const initialBal = config?.initialBalance ?? 5200;
  const anchor       = config?.balanceAnchorNet ?? INITIAL_TRANSACTIONS_NET;

  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  const financeState = useFinanceState(initialBal, {
    userId,
    balanceAnchorNet: anchor,
    onResetConfig:    () => {
      setConfig(null);
      setDataRefreshKey(k => k + 1);
    },
  });

  // ── Core Finance State ──────────────────────────────────────
  const financeState = useFinanceState(config?.initialBalance ?? 5200);
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    resetData,
    categorySpending,
    totalSpent,
    currentBalance,
    dailySpendRate,
    monthlyStats,
    monthlyHistory,
    remoteHydrated,
  } = financeState;

  // ── Budgets ─────────────────────────────────────────────────
  const budgetState = useBudgets(categorySpending);
  const { budgets, updateLimit, resetLimits, totalBudgeted, totalSpentAgainstBudget, overBudgetCount } = budgetState;

  // ── Phase 3 Hooks ───────────────────────────────────────────
  const alertState      = useAlerts(transactions, currentBalance, budgets, dailySpendRate);
  const recurringData   = useRecurring(transactions);
  const goalsState      = useGoals();
  const notifState      = useNotifications(alertState.alerts, recurringData, goalsState.goals);

  const currency = config?.currency ?? '$';
  const isOnboarded = config?.onboardingComplete === true;

  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  const transactionLedgerNet = transactions.reduce(
    (acc, tx) => (tx.type === 'credit' ? acc + tx.amount : acc - tx.amount),
    0
  );

  const handleOnboardingComplete = useCallback(
    async (cfg: SpendWiseConfig) => {
      if (userId) await saveProfileFromConfig(userId, cfg);
      else persistLocalSpendWiseConfig(cfg);
      setConfig(cfg);
    },
    [userId, setConfig]
  );

  const handleViewChange = useCallback((v: AppView) => {
    setActiveView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const dataReady =
    !userId || (remoteHydrated && budgetsHydrated && goalsHydrated);

  const { user } = useAuth();
  const userEmail = user?.email ?? null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-[var(--accent)] animate-pulse font-medium text-lg">Loading SpendWise...</div>
      </div>
    );
  }

  if (!session) {
    return <AuthView />;
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Onboarding Modal ── */}
      {!isOnboarded && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          transactionLedgerNet={transactionLedgerNet}
          cloudMode={Boolean(userId)}
        />
      )}

      {/* ── Sidebar ── */}
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        overBudgetCount={overBudgetCount}
        onReset={resetData}
      />

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[240px]">

        {/* Top Header Bar */}
        <Header
          activeView={activeView}
          unreadCount={notifState.unreadCount}
          onToggleNotifications={toggleNotifications}
          currency={currency}
          currentBalance={currentBalance}
          theme={theme}
          onToggleTheme={toggleTheme}
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
              onDelete={deleteTransaction}
              onAdd={addTransaction}
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
                onUpdateLimit={updateLimit}
                onResetLimits={resetLimits}
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

          {activeView === 'history' && (
            <div className="view-enter">
              <HistoryView
                transactions={transactions}
                onDelete={deleteTransaction}
                currency={currency}
              />
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
    </div>
  );
}

function AppAuthenticated() {
  const { user, isCloud, signOut } = useAuth();
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
        setConfig(
          row
            ? profileRowToConfig(row)
            : {
                initialBalance:     5200,
                balanceAnchorNet:   0,
                currency:           '$',
                onboardingComplete: false,
                createdAt:          new Date().toISOString(),
              }
        );
      })
      .catch(() => {
        if (cancelled) return;
        setConfig({
          initialBalance:     5200,
          balanceAnchorNet:   0,
          currency:           '$',
          onboardingComplete: false,
          createdAt:          new Date().toISOString(),
        });
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
    <MainShell
      config={config}
      setConfig={setConfig}
      userId={userId}
      isCloud={isCloud}
      onSignOut={signOut}
    />
  );
}

// ── App Root ────────────────────────────────────────────────────────────────────

export default function App() {
  const { authReady, isCloud, user } = useAuth();

  if (isCloud && !authReady) return <LoadingScreen />;
  if (isCloud && !user) return <AuthScreen />;

  return <AppAuthenticated />;
}
