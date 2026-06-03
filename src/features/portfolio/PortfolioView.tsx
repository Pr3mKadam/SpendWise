import { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { usePortfolio } from '@/features/portfolio/hooks/usePortfolio';
import FutureWealthSimulator from '@/features/portfolio/components/FutureWealthSimulator';
import DebtPlanner from '@/features/portfolio/components/DebtPlanner';
import AddModal from '@/features/portfolio/components/AddModal';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { useIsMobile } from '@/hooks/useMediaQuery';
import PortfolioViewMobile from '@/features/portfolio/PortfolioViewMobile';
import { PortfolioHeader } from '@/features/portfolio/components/PortfolioHeader';
import { PortfolioSummaryBanner } from '@/features/portfolio/components/PortfolioSummaryBanner';
import { PortfolioInsights } from '@/features/portfolio/components/PortfolioInsights';
import { PortfolioLists } from '@/features/portfolio/components/PortfolioLists';

// ─── Main ─────────────────────────────────────────────────────────────────────

interface PortfolioViewProps {
  currency?: string;
  financeState: any;
  config: SpendWiseConfig | null;
}

export default function PortfolioView({
  currency = '₹',
  financeState,
  config,
}: PortfolioViewProps) {
  const isMobile = useIsMobile();
  const {
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
    netWorth,
    allocationByType,
    addAsset,
    deleteAsset,
    addLiability,
    deleteLiability,
  } = usePortfolio();

  const [modal, setModal] = useState<'asset' | 'liability' | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'simulation' | 'debt'>('overview');
  const positive = netWorth >= 0;

  // Calculate Wealth Health Score (simplified)
  const healthScore = Math.min(
    100,
    Math.max(
      0,
      (positive ? 50 : 20) +
        (totalAssets > 0 ? Math.min(40, (netWorth / Math.max(totalAssets, 1)) * 40) : 0) +
        ((financeState?.transactions?.length ?? 0) > 10 ? 10 : 0)
    )
  );

  // Use monthlyStats from financeState for more accurate "Monthly" numbers
  const monthlyIncome = financeState?.monthlyStats?.totalIncome ?? 0;
  const monthlyExpenses = financeState?.monthlyStats?.totalExpenses ?? 0;
  const savingsRate = financeState?.monthlyStats?.savingsRate ?? 0;

  if (isMobile) {
    return (
      <>
        {modal && (
          <AddModal
            mode={modal}
            currency={currency}
            onAdd={modal === 'asset' ? addAsset : addLiability}
            onClose={() => setModal(null)}
            config={config}
          />
        )}
        <PortfolioViewMobile
          netWorth={netWorth}
          totalAssets={totalAssets}
          totalLiabilities={totalLiabilities}
          currency={currency}
          assets={assets}
          liabilities={liabilities}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAddAsset={() => setModal('asset')}
          onAddLiability={() => setModal('liability')}
          onDeleteAsset={deleteAsset}
          onDeleteLiability={deleteLiability}
          allocationByType={allocationByType}
          financeState={financeState}
          config={config}
          healthScore={healthScore}
          savingsRate={savingsRate}
        />
      </>
    );
  }

  return (
    <>
      {modal && (
        <AddModal
          mode={modal}
          currency={currency}
          onAdd={modal === 'asset' ? addAsset : addLiability}
          onClose={() => setModal(null)}
          config={config}
        />
      )}

      <div className="animate-fade-in-up space-y-6 pb-20">
        <PortfolioHeader
          config={config}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAddAsset={() => setModal('asset')}
          onAddLiability={() => setModal('liability')}
        />

        {activeTab === 'overview' ? (
          <>
            <PortfolioSummaryBanner
              netWorth={netWorth}
              totalAssets={totalAssets}
              totalLiabilities={totalLiabilities}
              currency={currency}
              config={config}
            />

            <PortfolioInsights
              financeState={financeState}
              currency={currency}
              healthScore={healthScore}
              savingsRate={savingsRate}
              config={config}
              allocationByType={allocationByType}
              totalAssets={totalAssets}
              netWorth={netWorth}
            />

            <PortfolioLists
              assets={assets}
              liabilities={liabilities}
              totalLiabilities={totalLiabilities}
              currency={currency}
              deleteAsset={deleteAsset}
              deleteLiability={deleteLiability}
              setModal={setModal}
            />
          </>
        ) : activeTab === 'simulation' ? (
          <div className="animate-fade-in">
            <FutureWealthSimulator
              currentBalance={netWorth}
              monthlySavings={Math.max(0, monthlyIncome - monthlyExpenses)}
              currency={currency}
            />
          </div>
        ) : (
          <div className="animate-fade-in">
            <DebtPlanner
              liabilities={liabilities}
              currency={currency}
              userRole={config?.userRole}
            />
          </div>
        )}

        <div className="card px-6 py-4 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--teal-dim)' }}
          >
            <BarChart2 size={18} style={{ color: 'var(--teal)' }} />
          </div>
          <p
            className="font-inter text-[13px]"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
          >
            <strong style={{ color: 'var(--text-primary)' }}>Wealth Efficiency: </strong>
            {totalAssets > 0
              ? `${((totalLiabilities / totalAssets) * 100).toFixed(1)}% Debt Ratio`
              : 'N/A'}{' '}
            ·{' '}
            {totalAssets === 0
              ? 'Add assets to begin portfolio tracking.'
              : positive
                ? `Your portfolio is highly resilient with a safety margin of ${(
                    totalAssets / Math.max(totalLiabilities, 1)
                  ).toFixed(1)}x.`
                : 'Focus on aggressive debt repayment to flip your net worth positive.'}
          </p>
        </div>
      </div>
    </>
  );
}
