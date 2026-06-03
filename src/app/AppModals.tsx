import React from 'react';
import NotificationCenter from '@/components/layout/NotificationCenter';
import CustomCategoriesModal from '@/components/layout/CustomCategoriesModal';
import CommandPalette from '@/components/layout/CommandPalette';
import LevelUpModal from '@/features/gamification/components/LevelUpModal';
import PrivacyShield from '@/components/layout/PrivacyShield';
import { OfflineIndicator } from '@/components/layout/OfflineIndicator';
import { BudgetAlertToast } from '@/features/budget/components/BudgetAlertToast';
import { AppView, Transaction, Category } from '@/types';

interface AppModalsProps {
  store: any;
  appState: any;
  userId: string | null;
  currency: string;
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;
  showCategoriesModal: boolean;
  setShowCategoriesModal: (v: boolean) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (v: boolean) => void;
  handleViewChange: (v: AppView) => void;
}

export const AppModals: React.FC<AppModalsProps> = ({
  store,
  appState,
  userId,
  currency,
  showNotifications,
  setShowNotifications,
  showCategoriesModal,
  setShowCategoriesModal,
  showCommandPalette,
  setShowCommandPalette,
  handleViewChange,
}) => {
  const { notifState, categoryState, transactions, financeState } = appState;

  return (
    <>
      <PrivacyShield />

      <LevelUpModal
        isOpen={store.showLevelUp}
        onClose={store.dismissLevelUp}
        level={store.level}
        rank={store.rank}
      />

      <NotificationCenter
        notifications={notifState.notifications}
        unreadCount={notifState.unreadCount}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onMarkRead={notifState.markRead}
        onMarkAllRead={notifState.markAllRead}
        onSnooze={notifState.snoozeNotification}
        onNavigate={view => {
          handleViewChange(view);
          setShowNotifications(false);
        }}
        cloudMode={Boolean(userId)}
      />

      <CustomCategoriesModal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        customCategories={categoryState.customCategories}
        onAdd={newCat => {
          categoryState.addCustomCategory(newCat);
        }}
        onUpdate={categoryState.updateCustomCategory}
        onDelete={categoryState.deleteCustomCategory}
        transactions={transactions}
        onReassign={(oldCat, newCat) => {
          financeState.bulkReassignCategory(oldCat, newCat);
        }}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={handleViewChange}
        transactions={transactions}
        currency={currency}
      />

      <OfflineIndicator />
      <BudgetAlertToast currency={currency} />
    </>
  );
};
