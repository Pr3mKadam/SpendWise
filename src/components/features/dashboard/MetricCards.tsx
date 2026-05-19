import { useIsMobile } from '@/hooks/useMediaQuery';
import MetricCardsDesktop from '@/components/features/dashboard/MetricCardsDesktop';
import MetricCardsMobile from '@/components/features/dashboard/MetricCardsMobile';
import { MonthlyStats } from '@/types';

interface MetricCardsProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  projectionMeta: {
    daysLeftInMonth: number;
    dataQuality:     'low' | 'medium' | 'high';
    expectedChange:  number;
  };
  monthlyStats: MonthlyStats;
  currency?: string;
  healthScore?: number;
}

export default function MetricCards(props: MetricCardsProps) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MetricCardsMobile {...props} />;
  }
  
  return <MetricCardsDesktop {...props} />;
}

