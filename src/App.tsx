import { useState, useCallback, useEffect } from 'react';
import OnboardingModal, {
  loadConfig,
  persistLocalSpendWiseConfig,
  SpendWiseConfig,
} from './components/OnboardingModal';
import AuthScreen from './components/AuthScreen';
import { useAuth } from './contexts/AuthContext';
import { INITIAL_TRANSACTIONS_NET } from './data/mockData';
import {
  fetchProfile,
  profileRowToConfig,
  saveProfileFromConfig,
} from './lib/supabaseData';

// ── Components ──────────────────────────────────────────────────────────────────
import Header          from './components/Header';
import NavTabs         from './components/NavTabs';
import MetricCards     from './components/MetricCards';
import BalanceChart    from './components/BalanceChart';
import SpendingDonut   from './components/SpendingDonut';
import TransactionList from './components/TransactionList';
import MagicInput      from './components/MagicInput';
import AICoach         from './components/AICoach';
import BudgetManager   from './components/BudgetManager';
import AnalyticsView   from './components/AnalyticsView';
import HistoryView     from './components/HistoryView';
import AlertBanner     from './components/AlertBanner';
import NotificationCenter from './components/NotificationCenter';
import RecurringView   from './components/RecurringView';
import GoalsView       from './components/GoalsView';

// ── Hooks ───────────────────────────────────────────────────────────────────────
import { useFinanceState }  from './hooks/useFinanceState';
import { useBudgets }       from './hooks/useBudgets';
import { useAlerts }        from './hooks/useAlerts';
import { useRecurring }     from './hooks/useRecurring';
import { useNotifications } from './hooks/useNotifications';
import { useGoals }         from './hooks/useGoals';

// ── Types ───────────────────────────────────────────────────────────────────────
import { AppView } from './types';

// ── Dashboard Sub-View ──────────────────────────────────────────────────────────

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
    <div className="view-enter space-y-6">

      <MetricCards
        currentBalance={currentBalance}
        predictedEndOfMonth={predictedEndOfMonth}
        topCategory={topCategory}
        monthlyStats={monthlyStats}
        currency={currency}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">

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
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <TransactionList transactions={transactions} onDelete={onDelete} currency={currency} />
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#090e17] flex items-center justify-center text-slate-500 text-sm">
      Loading…
    </div>
  );
}

// ── Authenticated / local shell ─────────────────────────────────────────────────

interface MainShellProps {
  config: SpendWiseConfig | null;
  setConfig: (c: SpendWiseConfig | null) => void;
  userId: string | null;
  isCloud: boolean;
  onSignOut: () => void;
}

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

  const budgetState = useBudgets(categorySpending, userId, dataRefreshKey);
  const {
    budgets,
    budgetsHydrated,
    updateLimit,
    resetLimits,
    totalBudgeted,
    totalSpentAgainstBudget,
    overBudgetCount,
  } = budgetState;

  const goalsState = useGoals(userId, dataRefreshKey);
  const { goals, goalsHydrated, addGoal, updateGoal, deleteGoal, addContribution } = goalsState;

  const alertState    = useAlerts(transactions, currentBalance, budgets, dailySpendRate);
  const recurringData = useRecurring(transactions);
  const notifState    = useNotifications(alertState.alerts, recurringData, goals);

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

  return (
    <div className="min-h-screen bg-[#090e17] text-slate-50 font-sans relative overflow-x-hidden">

      {!isOnboarded && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          transactionLedgerNet={transactionLedgerNet}
          cloudMode={Boolean(userId)}
        />
      )}

      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/[0.06] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/[0.04] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          onReset={resetData}
          unreadCount={notifState.unreadCount}
          onToggleNotifications={() => setShowNotifications(prev => !prev)}
          onSignOut={isCloud ? onSignOut : undefined}
          userEmail={isCloud ? userEmail : undefined}
        />

        <div className="pt-4 sm:pt-5">
          <NavTabs
            activeView={activeView}
            onViewChange={handleViewChange}
            overBudgetCount={overBudgetCount}
          />
        </div>

        <main className="mx-auto max-w-[1440px] w-full px-4 pb-6 sm:px-6 lg:pb-8 relative">
          {!dataReady && userId && (
            <div className="absolute inset-0 z-[90] flex items-start justify-center pt-24 bg-[#090e17]/70 backdrop-blur-sm">
              <p className="text-sm text-slate-400">Syncing your data…</p>
            </div>
          )}

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
              />
              <RecurringView patterns={recurringData} />
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
                onUpdate={updateGoal}
                onDelete={deleteGoal}
                onContribute={addContribution}
              />
            </div>
          )}

          {activeView === 'history' && (
            <div className="view-enter">
              <HistoryView
                transactions={transactions}
                onDelete={deleteTransaction}
              />
            </div>
          )}

          <footer className="mt-10 border-t border-slate-800/30 pb-6 pt-6 text-center">
            <p className="text-[10px] text-slate-700">
              Built with ⚡ for the 24-hour hackathon ·{' '}
              <span className="font-semibold text-slate-600">SpendWise v3.0</span>
              {' · '}
              {userId ? (
                <>Signed in — data synced to your account</>
              ) : (
                <>Stored on this device · Add Supabase env vars for cloud backup</>
              )}
            </p>
          </footer>
        </main>

        <div className="mobile-nav-spacer" />
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
