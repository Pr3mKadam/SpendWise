import { lazy } from 'react';

const BudgetSetModal = lazy(() =>
  import('@/features/budget/components/BudgetSetModal').then(m => ({ default: m.BudgetSetModal }))
);
const GoalCreateModal = lazy(() =>
  import('@/features/goals/components/GoalCreateModal').then(m => ({ default: m.GoalCreateModal }))
);
const GroupCreateModal = lazy(() =>
  import('@/features/shared/components/GroupCreateModal').then(m => ({
    default: m.GroupCreateModal,
  }))
);
const ExportModal = lazy(() =>
  import('@/features/profile/components/ExportModal').then(m => ({ default: m.ExportModal }))
);

const GroupQRModal = lazy(() =>
  import('@/features/shared/components/sharedModals/GroupQRModal').then(m => ({
    default: m.GroupQRModal,
  }))
);
const InviteModal = lazy(() =>
  import('@/features/shared/components/sharedModals/InviteModal').then(m => ({
    default: m.InviteModal,
  }))
);
const WalletModal = lazy(() =>
  import('@/features/shared/components/sharedModals/WalletModal').then(m => ({
    default: m.WalletModal,
  }))
);
const ExpenseModal = lazy(() =>
  import('@/features/shared/components/sharedModals/ExpenseModal').then(m => ({
    default: m.ExpenseModal,
  }))
);
const ContribModal = lazy(() =>
  import('@/features/shared/components/sharedModals/ContribModal').then(m => ({
    default: m.ContribModal,
  }))
);

export {
  BudgetSetModal,
  GoalCreateModal,
  GroupCreateModal,
  ExportModal,
  GroupQRModal,
  InviteModal,
  WalletModal,
  ExpenseModal,
  ContribModal,
};
