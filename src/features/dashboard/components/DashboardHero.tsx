import React from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import DashboardHeroDesktop from '@/features/dashboard/components/DashboardHeroDesktop';
import DashboardHeroMobile from '@/features/dashboard/components/DashboardHeroMobile';
import { MonthlyStats, BalanceDataPoint } from '@/types';

interface DashboardHeroProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  monthlyStats: MonthlyStats;
  balanceTrend: BalanceDataPoint[];
  healthScore: number;
  currency?: string;
  hideBalances?: boolean;
  onTogglePrivacy?: () => void;
}

export default function DashboardHero(props: DashboardHeroProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DashboardHeroMobile {...props} />;
  }

  return <DashboardHeroDesktop {...props} />;
}

