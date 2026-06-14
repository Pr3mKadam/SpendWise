// Centralized config type — imported across features, app, and shared layers
// Moved from features/onboarding/components/OnboardingModal to resolve FSD violation

export type UserRole = 'student' | 'professional' | 'business';
export type CurrencySymbol = '$' | '£' | '€' | '₹';
export type FamilyOption = 'myself' | 'family';
export type FamilyGoal = 'allowance' | 'limits' | 'learning';

export interface SpendWiseConfig {
  initialBalance: number;
  currency: string;
  name?: string;
  balanceAnchorNet?: number;
  onboardingComplete: boolean;
  createdAt: string;
  phone?: string;
  occupation?: string;
  monthlyGoal?: number;
  location?: string;
  userRole: UserRole;
  isFamily?: boolean;
  childCount?: number;
  childAges?: string;
  familyGoals?: FamilyGoal[];
}
