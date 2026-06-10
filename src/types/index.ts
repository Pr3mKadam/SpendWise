export * from './finance';
export * from '@/features/portfolio/types';
export * from '@/features/shared/types';
export * from '@/components/ui/types';
export * from '@/features/gamification/types';
export * from '@/features/sync/types';

export interface CustomCategoryDef {
  id: string;
  name: string;
  color: string;
  icon: string;
  monthlyLimit?: number;
}
