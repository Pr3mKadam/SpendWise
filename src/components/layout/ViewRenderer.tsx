import React, { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, Transaction, Category } from '../../types';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { ErrorBoundary } from '../common/ErrorBoundary';
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
const GamificationView = lazy(() => import('../views/GamificationView'));
const DashboardView = lazy(() => import('../views/DashboardView').then(m => ({ default: m.DashboardView })));

import { SpendWiseConfig } from '../features/onboarding/OnboardingModal';
import { SpendWiseStore, ParentalControlState } from '../../store';
import { AppState } from '../../types/state';

interface ViewRendererProps {
  activeView: AppView;
  appState: AppState;
  store: SpendWiseStore;
  pcSettings: ParentalControlState;
  onNavigate: (view: AppView) => void;
  onAdd: (tx: Transaction) => void;
  onPDFReport: () => void;
  config: SpendWiseConfig | null;
  setConfig: (config: SpendWiseConfig) => void;
  resetData: () => Promise<void>;
  userId: string | null;
  onManageCategories?: () => void;
  voiceSearchQuery?: string;
}

const VIEW_ORDER: AppView[] = [
  'dashboard',
  'budget',
  'analytics',
  'subscriptions',
  'history',
  'goals',
  'portfolio',
  'advisor',
  'education',
  'reports',
  'sync',
  'shared',
  'parental',
  'profile'
];

const ViewWrapper: React.FC<{ children: React.ReactNode, id: string, className?: string, activeView: AppView }> = ({ children, id, className = "w-full h-full", activeView }) => {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 40,
        opacity: { duration: 0.15 }
      }}
      className={className}
    >
      <ErrorBoundary>
        <Suspense fallback={<SkeletonLoader />}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </motion.div>
  );
};

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
  onManageCategories,
  voiceSearchQuery,
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
          <ViewWrapper id="dashboard" activeView={activeView}>
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
              config={config}
            />
          </ViewWrapper>
        )}

        {activeView === 'budget' && (
          <ViewWrapper id="budget" activeView={activeView}>
            <BudgetManager
              budgets={budgetState.budgetStats}
              totalBudgeted={budgetState.totalBudgeted}
              totalSpentAgainstBudget={budgetState.totalSpentAgainstBudget}
              overBudgetCount={budgetState.overBudgetCount}
              period={budgetState.budgetSettings.period}
              periodLabel={budgetState.periodLabel}
              rolloverEnabled={budgetState.budgetSettings.rolloverEnabled}
              onUpdateLimit={budgetState.setBudget}
              onDeleteLimit={budgetState.removeBudget}
              onResetLimits={budgetState.resetLimits}
              onChangePeriod={budgetState.updatePeriod}
              onToggleRollover={budgetState.toggleRollover}
              onManageCategories={onManageCategories}
              currency={currency}
              transactions={transactions}
            />
          </ViewWrapper>
        )}

        {activeView === 'analytics' && (
          <ViewWrapper id="analytics" activeView={activeView} className="w-full h-full space-y-6">
            <AnalyticsView
              monthlyHistory={financeState.monthlyHistory}
              monthlyStats={financeState.monthlyStats}
              categorySpending={financeState.categorySpending}
              totalSpent={financeState.totalSpent}
              currency={currency}
              transactions={transactions}
              onNavigate={onNavigate}
              config={config}
            />
            <RecurringView patterns={recurringData} currency={currency} transactions={transactions} />
          </ViewWrapper>
        )}

        {activeView === 'goals' && (
          <ViewWrapper id="goals" activeView={activeView}>
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
          <ViewWrapper id="shared" activeView={activeView}>
            <SharedView currency={currency} userId={userId} />
          </ViewWrapper>
        )}

        {activeView === 'history' && (
          <ViewWrapper id="history" activeView={activeView}>
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
              initialSearchQuery={voiceSearchQuery}
            />
          </ViewWrapper>
        )}

        {activeView === 'sync' && (
          <ViewWrapper id="sync" activeView={activeView}>
            <BankSyncView
              onAutoAddTransactions={(txs) => {
                financeState.addTransactions(txs);
              }}
              recentTransactions={transactions.filter((t: Transaction) =>
                t.tags?.includes('razorpay') || t.tags?.includes('upi') || t.tags?.includes('upi-sync')
              )}
              currency={currency}
            />
          </ViewWrapper>
        )}

        {activeView === 'profile' && (
          <ViewWrapper id="profile" activeView={activeView}>
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
              addNotification={notifState.addNotification}
            />
          </ViewWrapper>
        )}

        {activeView === 'parental' && (
          <ViewWrapper id="parental" activeView={activeView}>
            <ParentalView />
          </ViewWrapper>
        )}

        {activeView === 'portfolio' && (
          <ViewWrapper id="portfolio" activeView={activeView}>
            <PortfolioView currency={currency} financeState={financeState} config={config} />
          </ViewWrapper>
        )}

        {activeView === 'subscriptions' && (
          <ViewWrapper id="subscriptions" activeView={activeView}>
            <SubscriptionManager patterns={recurringData} currency={currency} />
          </ViewWrapper>
        )}

        {activeView === 'advisor' && (
          <ViewWrapper id="advisor" activeView={activeView}>
            <AdvisorView onNavigate={onNavigate} />
          </ViewWrapper>
        )}

        {activeView === 'education' && (
          <ViewWrapper id="education" activeView={activeView}>
            <EducationView currency={currency} financeState={financeState} addNotification={notifState.addNotification} config={config} />
          </ViewWrapper>
        )}

        {activeView === 'reports' && (
          <ViewWrapper id="reports" activeView={activeView}>
            <ReportsView transactions={transactions} currency={currency} monthlyStats={financeState.monthlyStats} />
          </ViewWrapper>
        )}

        {(activeView === 'quests' || activeView === 'badges' || activeView === 'inventory' || activeView === 'shop') && (
          <ViewWrapper id={activeView} activeView={activeView}>
            <GamificationView
              transactions={transactions}
              goals={goalsState.goals}
              currency={currency}
              onNavigate={onNavigate}
            />
          </ViewWrapper>
        )}

        {/* Alias: transactions → HistoryView */}
        {activeView === 'transactions' && (
          <ViewWrapper id="transactions" activeView={activeView}>
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

        {/* Alias: settings → ProfileView */}
        {activeView === 'settings' && (
          <ViewWrapper id="settings" activeView={activeView}>
            <ProfileView
              config={config}
              onUpdateConfig={setConfig}
              onResetData={async () => { await resetData(); }}
              transactions={transactions}
              onNavigate={onNavigate}
              addNotification={notifState.addNotification}
            />
          </ViewWrapper>
        )}
      </AnimatePresence>
    </>
  );
};
