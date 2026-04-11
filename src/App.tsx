import { useState, useCallback } from 'react';
import OnboardingModal, { loadConfig, SpendWiseConfig } from './components/OnboardingModal';

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

      {/* Top Metrics */}
      <MetricCards
        currentBalance={currentBalance}
        predictedEndOfMonth={predictedEndOfMonth}
        topCategory={topCategory}
        monthlyStats={monthlyStats}
        currency={currency}
      />

      {/* Main grid: charts left, transactions right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">

        {/* Left Column — Charts & Tools */}
        <div className="space-y-6">
          <BalanceChart data={balanceTrend} currency={currency} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpendingDonut data={categorySpending} totalSpent={totalSpent} currency={currency} />
            <div className="flex flex-col gap-6">
              <MagicInput onAddTransaction={onAdd} />
              <AICoach
                topCategory={topCategory}
                totalSpent={totalSpent}
                categorySpending={categorySpending}
              />
            </div>
          </div>
        </div>

        {/* Right Column — Transactions */}
        <div className="space-y-6">
          <TransactionList transactions={transactions} onDelete={onDelete} currency={currency} />
        </div>
      </div>
    </div>
  );
}

// ── App Root ────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeView, setActiveView]         = useState<AppView>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  // ── Onboarding gate ─────────────────────────────────────────────────────────
  const [config, setConfig] = useState<SpendWiseConfig | null>(() => loadConfig());
  const isOnboarded = config?.onboardingComplete === true;

  const handleOnboardingComplete = useCallback((cfg: SpendWiseConfig) => {
    setConfig(cfg);
  }, []);

  // ── Core Finance State ──────────────────────────────────────────────────────
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
  } = financeState;

  // ── Budgets ─────────────────────────────────────────────────────────────────
  const budgetState = useBudgets(categorySpending);
  const { budgets, updateLimit, resetLimits, totalBudgeted, totalSpentAgainstBudget, overBudgetCount } = budgetState;

  // ── Phase 3 Hooks — all wired ──────────────────────────────────────────────
  const alertState      = useAlerts(transactions, currentBalance, budgets, dailySpendRate);
  const recurringData   = useRecurring(transactions);
  const goalsState      = useGoals();
  const notifState      = useNotifications(alertState.alerts, recurringData, goalsState.goals);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const currency = config?.currency ?? '$';

  const handleViewChange = useCallback((v: AppView) => {
    setActiveView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-[#090e17] text-slate-50 font-sans relative overflow-x-hidden">

      {/* ── Onboarding Modal — blocks the app until complete ── */}
      {!isOnboarded && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* ── Background glow ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/[0.06] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/[0.04] blur-[120px] rounded-full" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Header — wired with notifications */}
        <Header
          onReset={resetData}
          unreadCount={notifState.unreadCount}
          onToggleNotifications={toggleNotifications}
        />

        {/* Desktop nav tabs */}
        <div className="pt-4 sm:pt-5">
          <NavTabs
            activeView={activeView}
            onViewChange={handleViewChange}
            overBudgetCount={overBudgetCount}
          />
        </div>

        {/* Main Content */}
        <main className="mx-auto max-w-[1440px] w-full px-4 pb-6 sm:px-6 lg:pb-8">

          {/* Alert Banner — shown on dashboard */}
          {activeView === 'dashboard' && alertState.alerts.length > 0 && (
            <AlertBanner
              alerts={alertState.alerts}
              onDismiss={alertState.dismissAlert}
              onDismissAll={alertState.dismissAll}
            />
          )}

          {/* ── Dashboard ── */}
          {activeView === 'dashboard' && (
            <DashboardView
              financeState={financeState}
              onDelete={deleteTransaction}
              onAdd={addTransaction}
              currency={currency}
            />
          )}

          {/* ── Budget ── */}
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

          {/* ── Analytics ── */}
          {activeView === 'analytics' && (
            <div className="view-enter space-y-6">
              <AnalyticsView
                monthlyHistory={monthlyHistory}
                monthlyStats={monthlyStats}
                categorySpending={categorySpending}
                totalSpent={totalSpent}
              />
              {/* Recurring charges section */}
              <RecurringView patterns={recurringData} />
            </div>
          )}

          {/* ── Goals ── */}
          {activeView === 'goals' && (
            <div className="view-enter">
              <GoalsView
                goals={goalsState.goals}
                stats={goalsState.stats}
                onAdd={(data) => {
                  goalsState.addGoal({
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
              />
            </div>
          )}

          {/* ── History ── */}
          {activeView === 'history' && (
            <div className="view-enter">
              <HistoryView
                transactions={transactions}
                onDelete={deleteTransaction}
              />
            </div>
          )}

          {/* Footer */}
          <footer className="mt-10 border-t border-slate-800/30 pb-6 pt-6 text-center">
            <p className="text-[10px] text-slate-700">
              Built with ⚡ for the 24-hour hackathon ·{' '}
              <span className="font-semibold text-slate-600">SpendWise AI v3.0</span>{' '}
              · All data stored locally · No data leaves your device 🔒
            </p>
          </footer>
        </main>

        {/* Mobile bottom nav spacer */}
        <div className="mobile-nav-spacer" />
      </div>

      {/* ── Notification Center Overlay ── */}
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
      />
    </div>
  );
}
