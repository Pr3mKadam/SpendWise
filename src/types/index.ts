export * from './finance';
export * from './portfolio';
export * from './shared';
export * from './ui';
export * from './gamification';
export * from './sync';

export interface CustomCategoryDef {
  id: string;
  name: string;
  color: string;
  icon: string;
  monthlyLimit?: number;
}
