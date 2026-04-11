import { useState, useCallback } from 'react';
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
            <SpendingDonut data={categorySpending} totalSpent={totalSpent} currency={currency} />
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
  const [activeView, setActiveView]         = useState<AppView>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  // ── Onboarding gate ─────────────────────────────────────────
  const [config, setConfig] = useState<SpendWiseConfig | null>(() => loadConfig());
  const isOnboarded = config?.onboardingComplete === true;

  const handleOnboardingComplete = useCallback((cfg: SpendWiseConfig) => {
    setConfig(cfg);
  }, []);

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

  const handleViewChange = useCallback((v: AppView) => {
    setActiveView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Onboarding Modal ── */}
      {!isOnboarded && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
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
                currency={currency}
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
                currency={currency}
              />
              <RecurringView patterns={recurringData} currency={currency} />
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
                currency={currency}
              />
            </div>
          )}

          {/* ── History ── */}
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
              SpendWise AI v3.0 · All data stored locally · No data leaves your device 🔒
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
      />
    </div>
  );
}
