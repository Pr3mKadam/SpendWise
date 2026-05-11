import React, { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, Transaction, Category } from '../../types';
import { SkeletonLoader } from '../common/SkeletonLoader';
import AlertBanner from '../common/AlertBanner';

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
const EducationView = lazy(() => import('../views/EducationView'));
import { DashboardView } from '../views/DashboardView';

interface ViewRendererProps {
  activeView: AppView;
  appState: any;
  store: any;
  pcSettings: any;
  onNavigate: (view: AppView) => void;
  onAdd: (tx: Transaction) => void;
  onPDFReport: () => void;
  config: any;
  setConfig: (c: any) => void;
  resetData: () => Promise<void>;
  userId: string | null;
}

const ViewWrapper: React.FC<{ children: React.ReactNode, id: string, className?: string }> = ({ children, id, className = "w-full h-full" }) => (
  <motion.div
    key={id}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className={className}
  >
    <Suspense fallback={<SkeletonLoader />}>
      {children}
    </Suspense>
  </motion.div>
);

export const ViewRenderer: React.FC<ViewRendererProps> = ({
  activeView,
  appState,
  store,
  pcSettings,
  onNavigate,
  onAdd,
  onPDFReport,
  config,
  setConfig,
  resetData,
  userId,
}) => {
  const { 
    financeState, 
    budgetState, 
    goalsState, 
    alertState, 
    recurringData, 
    transactions, 
    currency,
    notifState,
  } = appState;

  return (
    <>
      {activeView === 'dashboard' && alertState.alerts.length > 0 && (
        <AlertBanner
          alerts={alertState.alerts}
          onDismiss={alertState.dismissAlert}
          onDismissAll={alertState.dismissAll}
        />
      )}

      <AnimatePresence mode="wait">
        {activeView === 'dashboard' && (
          <ViewWrapper id="dashboard">
            <DashboardView
              financeState={financeState}
              onAdd={onAdd}
              onOpenAdd={() => {
                const el = document.getElementById('magic-input-textarea');
                if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
              }}
              currency={currency}
              onNavigate={onNavigate}
              hideBalances={pcSettings.hideBalances}
              onTogglePrivacy={store.togglePrivacy}
            />
          </ViewWrapper>
        )}

        {activeView === 'budget' && (
          <ViewWrapper id="budget">
            <BudgetManager
              budgets={budgetState.budgetStats as any}
              totalBudgeted={budgetState.totalBudgeted}
              totalSpentAgainstBudget={budgetState.totalSpentAgainstBudget}
              overBudgetCount={budgetState.overBudgetCount}
              period={budgetState.budgetSettings.period}
              periodLabel={budgetState.periodLabel}
              rolloverEnabled={budgetState.budgetSettings.rolloverEnabled}
              onUpdateLimit={budgetState.setBudget}
              onResetLimits={budgetState.resetLimits}
              onChangePeriod={budgetState.updatePeriod}
              onToggleRollover={budgetState.toggleRollover}
              onManageCategories={() => { /* Handled in MainShell now via event or prop? Wait, MainShell needs to handle this. Let's pass a prop for it, or use a custom event. Actually, we should probably pass setShowCategoriesModal to ViewRenderer. Wait, we can use document dispatchEvent for this or add a prop. For now, let's just pass a prop. */ }}
              currency={currency}
              transactions={transactions}
            />
          </ViewWrapper>
        )}

        {activeView === 'analytics' && (
          <ViewWrapper id="analytics" className="w-full h-full space-y-6">
            <AnalyticsView
              monthlyHistory={financeState.monthlyHistory}
              monthlyStats={financeState.monthlyStats}
              categorySpending={financeState.categorySpending}
              totalSpent={financeState.totalSpent}
              currency={currency}
              transactions={transactions}
              onNavigate={(view) => {
                onNavigate(view as any);
              }}
            />
            <RecurringView patterns={recurringData} currency={currency} transactions={transactions} />
          </ViewWrapper>
        )}

        {activeView === 'goals' && (
          <ViewWrapper id="goals">
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
              transactions={transactions}
            />
          </ViewWrapper>
        )}

        {activeView === 'shared' && (
          <ViewWrapper id="shared">
            <SharedView currency={currency} userId={userId} />
          </ViewWrapper>
        )}

        {activeView === 'history' && (
          <ViewWrapper id="history">
            <HistoryView
              transactions={transactions}
              onCategoryChange={async (id: string, newCategory: string) => {
                financeState.updateTransactionCategory(id, newCategory as Category);
              }}
              onDelete={financeState.deleteTransaction}
              onBulkDelete={financeState.bulkDeleteTransactions}
              onBulkCategoryChange={financeState.bulkUpdateTransactionsCategory}
              onImportClick={() => onNavigate('sync')}
              onPDFReport={onPDFReport}
              currency={currency}
            />
          </ViewWrapper>
        )}

        {activeView === 'sync' && (
          <ViewWrapper id="sync">
            <BankSyncView
              onAutoAddTransactions={(txs) => {
                financeState.addTransactions(txs);
              }}
              recentTransactions={transactions.filter((t: any) =>
                t.tags?.includes('razorpay') || t.tags?.includes('upi') || t.tags?.includes('upi-sync')
              )}
              currency={currency}
            />
          </ViewWrapper>
        )}

        {activeView === 'profile' && (
          <ViewWrapper id="profile">
            <ProfileView
              config={config}
              onUpdateConfig={setConfig}
              onResetData={async () => {
                await resetData();
                if (config) {
                  const nextConfig = { ...config, initialBalance: 0 };
                  setConfig(nextConfig);
                  // Handled by App.tsx through setConfig, but let's make sure it's saved
                  // The parent handles saving in App.tsx
                }
              }}
              transactions={transactions}
              onNavigate={onNavigate}
            />
          </ViewWrapper>
        )}

        {activeView === 'parental' && (
          <ViewWrapper id="parental">
            <ParentalView />
          </ViewWrapper>
        )}

        {activeView === 'portfolio' && (
          <ViewWrapper id="portfolio">
            <PortfolioView currency={currency} financeState={financeState} />
          </ViewWrapper>
        )}

        {activeView === 'subscriptions' && (
          <ViewWrapper id="subscriptions">
            <SubscriptionManager patterns={recurringData} currency={currency} />
          </ViewWrapper>
        )}

        {activeView === 'advisor' && (
          <ViewWrapper id="advisor">
            <AdvisorView onNavigate={onNavigate} />
          </ViewWrapper>
        )}

        {activeView === 'education' && (
          <ViewWrapper id="education">
            <EducationView currency={currency} financeState={financeState} addNotification={notifState.addNotification} />
          </ViewWrapper>
        )}

        {activeView === 'reports' && (
          <ViewWrapper id="reports">
            <ReportsView transactions={transactions} currency={currency} monthlyStats={financeState.monthlyStats} />
          </ViewWrapper>
        )}
      </AnimatePresence>
    </>
  );
};
