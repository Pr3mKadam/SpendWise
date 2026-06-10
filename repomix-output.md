This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where content has been compressed (code blocks are separated by ⋮---- delimiter).

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
- Pay special attention to the Repository Description. These contain important context and guidelines specific to this project.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/**/*.tsx, src/**/*.ts, src/index.css, public/locales/**/*.json, CODEBASE_MAP.md
- Files matching these patterns are excluded: **/*.test.ts, **/*.test.tsx, **/*.spec.ts, **/*.d.ts, src/vite-env.d.ts, node_modules/**, dist/**, .git/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

# User Provided Header
SpendWise Codebase - AI Context File
Tech: React 18 + TypeScript + Vite + Tailwind v4 + Zustand + Dexie + Supabase + i18next
Theme: CSS variables via :root.dark class. Date util: formatLocalYYYYMMDD from src/utils/date.ts
Hi-IN i18n: src/core/i18n.ts, translations in public/locales/{en,hi}/translation.json
Market data: src/utils/marketData.ts (Yahoo Finance + fallback quotes)
Allowance system: src/features/parental/store/parentalSlice.ts + AllowanceCard.tsx
Demo mode: gated behind VITE_DEMO_MODE env var, DemoBanner.tsx
Virtual scrolling: react-virtuoso in NotificationCenter, ChatMessageList
Routing: react-router-dom v7 BrowserRouter in main.tsx, <Routes> in ViewRenderer

# Directory Structure
```
public/locales/en/translation.json
public/locales/hi/translation.json
src/app/App.tsx
src/app/AppModals.tsx
src/app/hooks/useAppEnvironment.ts
src/app/hooks/useAppNavigation.ts
src/app/hooks/useAppTheme.ts
src/app/hooks/usePWAInstall.ts
src/app/hooks/useShakeFeedback.ts
src/app/hooks/useVoiceMic.ts
src/app/MainShell.tsx
src/app/ViewRenderer.tsx
src/components/layout/AlertBanner.tsx
src/components/layout/CommandPalette.tsx
src/components/layout/components/ConfirmDialog.tsx
src/components/layout/components/DesktopSidebar.tsx
src/components/layout/components/HistoryPanel.tsx
src/components/layout/components/IconNavItem.tsx
src/components/layout/components/MicTranscript.tsx
src/components/layout/components/MissingEntityPrompt.tsx
src/components/layout/components/MobileDrawer.tsx
src/components/layout/components/OnboardingTooltip.tsx
src/components/layout/components/ResultMessage.tsx
src/components/layout/components/WaveformVisualizer.tsx
src/components/layout/CustomCategoriesModal.tsx
src/components/layout/DemoBanner.tsx
src/components/layout/DesktopOnlyGuard.tsx
src/components/layout/FeedbackModal.tsx
src/components/layout/Header.tsx
src/components/layout/IOSInstallModal.tsx
src/components/layout/LanguageSwitcher.tsx
src/components/layout/MasterMic.tsx
src/components/layout/navigation.ts
src/components/layout/NavTabs.tsx
src/components/layout/NotificationCenter.tsx
src/components/layout/OfflineIndicator.tsx
src/components/layout/PrivacyShield.tsx
src/components/layout/PullToRefresh.tsx
src/components/layout/QuickAddModal.tsx
src/components/layout/ServiceWorkerToast.tsx
src/components/layout/Sidebar.tsx
src/components/ui/Alert.tsx
src/components/ui/Avatar.tsx
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/CategoryDropdown.tsx
src/components/ui/EmptyState.tsx
src/components/ui/ErrorBoundary.tsx
src/components/ui/Icons.tsx
src/components/ui/Input.tsx
src/components/ui/Modal.tsx
src/components/ui/PinInput.tsx
src/components/ui/Portal.tsx
src/components/ui/Select.tsx
src/components/ui/SkeletonLoader.tsx
src/components/ui/StatusPill.tsx
src/components/ui/Toggle.tsx
src/components/ui/types.ts
src/constants/index.ts
src/contexts/CurrencyContext.tsx
src/core/api/gemini.ts
src/core/api/OCRService.ts
src/core/api/supabase.ts
src/core/api/VoiceService.ts
src/core/crdt.ts
src/core/encryption.ts
src/core/exportPDF.ts
src/core/haptic.ts
src/core/i18n.ts
src/core/security.ts
src/core/setuAA.ts
src/core/store/securedSlice.ts
src/core/syncEngine.ts
src/core/voiceCommands/commandParser.ts
src/core/voiceCommands/commandRouter.ts
src/core/voiceCommands/fallbackPatterns.ts
src/core/voiceCommands/handlers/assetHandlers.ts
src/core/voiceCommands/handlers/budgetHandlers.ts
src/core/voiceCommands/handlers/index.ts
src/core/voiceCommands/handlers/navigationHandlers.ts
src/core/voiceCommands/handlers/queryHandlers.ts
src/core/voiceCommands/handlers/settingsHandlers.ts
src/core/voiceCommands/handlers/subscriptionHandlers.ts
src/core/voiceCommands/handlers/transactionHandlers.ts
src/core/voiceCommands/handlers/types.ts
src/core/voiceCommands/tts.ts
src/core/voiceCommands/types.ts
src/data/currencies.ts
src/data/lessons.ts
src/data/mockData.ts
src/data/portfolioConfig.ts
src/db/backup.ts
src/db/db.ts
src/db/migration.ts
src/features/advisor/AdvisorView.tsx
src/features/advisor/AdvisorViewMobile.tsx
src/features/advisor/components/ChatInput.tsx
src/features/advisor/components/ChatMessageList.tsx
src/features/advisor/types.ts
src/features/ai/components/AIInputTools.tsx
src/features/ai/components/MagicInput.tsx
src/features/ai/components/ReceiptScanner.tsx
src/features/ai/components/SpendingPersonality.tsx
src/features/ai/parsers/common.ts
src/features/ai/parsers/nlp.ts
src/features/ai/parsers/ocr.ts
src/features/ai/parsers/voice.ts
src/features/analytics/AnalyticsView.tsx
src/features/analytics/AnalyticsViewMobile.tsx
src/features/analytics/components/AnalyticsPrimitives.tsx
src/features/analytics/components/AnomalyDetector.tsx
src/features/analytics/components/BalanceChart.tsx
src/features/analytics/components/CashFlowWaterfall.tsx
src/features/analytics/components/CategoryAnalyzer.tsx
src/features/analytics/components/CategoryBreakdownList.tsx
src/features/analytics/components/HealthIndexCard.tsx
src/features/analytics/components/HealthScoreChart.tsx
src/features/analytics/components/IncomeExpensesChart.tsx
src/features/analytics/components/PeerComparison.tsx
src/features/analytics/components/PredictiveForecasting.tsx
src/features/analytics/components/SavingsTrendChart.tsx
src/features/analytics/components/SpendingDonut.tsx
src/features/analytics/components/SpendingForecast.tsx
src/features/analytics/components/SpendingHeatmap.tsx
src/features/analytics/components/TaxPredictor.tsx
src/features/analytics/components/TopMerchants.tsx
src/features/analytics/hooks/useHealthHistory.ts
src/features/analytics/insights/advisor.ts
src/features/analytics/insights/anomaly.ts
src/features/analytics/insights/forecast.ts
src/features/analytics/insights/healthScore.ts
src/features/auth/AuthView.tsx
src/features/auth/components/BiometricLock.tsx
src/features/budget/BudgetView.tsx
src/features/budget/BudgetViewMobile.tsx
src/features/budget/components/BudgetAlertToast.tsx
src/features/budget/components/BudgetCategoryCard.tsx
src/features/budget/components/BudgetCategoryCardMobile.tsx
src/features/budget/components/BudgetManager.tsx
src/features/budget/components/BudgetRow.tsx
src/features/budget/components/BudgetSummary.tsx
src/features/budget/components/BudgetSummaryBar.tsx
src/features/budget/components/BudgetSummaryMobile.tsx
src/features/budget/components/PeriodSelector.tsx
src/features/budget/components/RolloverToggle.tsx
src/features/budget/components/SmartBudgetSuggestions.tsx
src/features/budget/hooks/useAlerts.ts
src/features/budget/hooks/useBudgetManager.ts
src/features/budget/insights/budgetSuggestions.ts
src/features/dashboard/components/AIInsights.tsx
src/features/dashboard/components/ChartTooltip.tsx
src/features/dashboard/components/DailyStats.tsx
src/features/dashboard/components/DashboardHeader.tsx
src/features/dashboard/components/DashboardHero.tsx
src/features/dashboard/components/DashboardHeroDesktop.tsx
src/features/dashboard/components/DashboardHeroMobile.tsx
src/features/dashboard/components/FinanceChart.tsx
src/features/dashboard/components/GoalsSummary.tsx
src/features/dashboard/components/MetricCards.tsx
src/features/dashboard/components/MetricCardsDesktop.tsx
src/features/dashboard/components/MetricCardsMobile.tsx
src/features/dashboard/components/MobileBalanceHero.tsx
src/features/dashboard/components/MobileRecentTransactions.tsx
src/features/dashboard/components/PremiumCard.tsx
src/features/dashboard/components/ProactiveNudge.tsx
src/features/dashboard/components/QuickAddPanel.tsx
src/features/dashboard/components/RecentTransactions.tsx
src/features/dashboard/components/SafeToSpend.tsx
src/features/dashboard/components/SnapCardRow.tsx
src/features/dashboard/components/StatCard.tsx
src/features/dashboard/components/WeeklyDigestCard.tsx
src/features/dashboard/DashboardView.tsx
src/features/dashboard/DashboardViewMobile.tsx
src/features/dashboard/hooks/useDashboardData.ts
src/features/education/components/categoryConfig.tsx
src/features/education/components/EducationCards.tsx
src/features/education/components/LessonCard.tsx
src/features/education/components/LessonModal.tsx
src/features/education/EducationView.tsx
src/features/gamification/components/BadgeGallery.tsx
src/features/gamification/components/LevelProgress.tsx
src/features/gamification/components/LevelUpModal.tsx
src/features/gamification/components/QuestCompletionOverlay.tsx
src/features/gamification/components/QuestsPanel.tsx
src/features/gamification/components/RoundUpVault.tsx
src/features/gamification/components/SavingsChallenges.tsx
src/features/gamification/components/SocialLeaderboard.tsx
src/features/gamification/components/StreakShareCard.tsx
src/features/gamification/components/UserLevelCard.tsx
src/features/gamification/components/WealthCity.tsx
src/features/gamification/GamificationView.tsx
src/features/gamification/hooks/useGamification.ts
src/features/gamification/hooks/useQuestReset.ts
src/features/gamification/store/gamificationSlice.ts
src/features/gamification/types.ts
src/features/goals/components/constants.ts
src/features/goals/components/ContributeModal.tsx
src/features/goals/components/GoalCard.tsx
src/features/goals/components/GoalModal.tsx
src/features/goals/components/GoalsSummary.tsx
src/features/goals/components/ProgressRing.tsx
src/features/goals/components/utils.ts
src/features/goals/GoalsView.tsx
src/features/goals/GoalsViewMobile.tsx
src/features/goals/hooks/useGoals.ts
src/features/onboarding/components/OnboardingModal.tsx
src/features/onboarding/components/OnboardingSidebar.tsx
src/features/onboarding/components/OnboardingStep1.tsx
src/features/onboarding/components/OnboardingStep2.tsx
src/features/onboarding/components/OnboardingStep3.tsx
src/features/parental/components/AllowanceCard.tsx
src/features/parental/components/ChildQRScanner.tsx
src/features/parental/components/LinkingQRModal.tsx
src/features/parental/components/ParentalActivity.tsx
src/features/parental/components/ParentalControlGate.tsx
src/features/parental/components/ParentalDashboard.tsx
src/features/parental/components/ParentalLockScreen.tsx
src/features/parental/components/ParentalSettingsCard.tsx
src/features/parental/components/ParentalSetupFlow.tsx
src/features/parental/components/PendingApprovals.tsx
src/features/parental/hooks/useParentalManager.ts
src/features/parental/ParentalView.tsx
src/features/parental/store/parentalSlice.ts
src/features/portfolio/components/AddModal.tsx
src/features/portfolio/components/AllocationDonut.tsx
src/features/portfolio/components/DebtPlanner.tsx
src/features/portfolio/components/EntryCard.tsx
src/features/portfolio/components/FutureWealthSimulator.tsx
src/features/portfolio/components/MobilePortfolioHero.tsx
src/features/portfolio/components/NetWorthEvolution.tsx
src/features/portfolio/components/PortfolioHeader.tsx
src/features/portfolio/components/PortfolioInsights.tsx
src/features/portfolio/components/PortfolioLists.tsx
src/features/portfolio/components/PortfolioSummaryBanner.tsx
src/features/portfolio/components/WealthTree.tsx
src/features/portfolio/hooks/useMarketPrices.ts
src/features/portfolio/hooks/usePortfolio.ts
src/features/portfolio/PortfolioView.tsx
src/features/portfolio/PortfolioViewMobile.tsx
src/features/portfolio/store/portfolioSlice.ts
src/features/portfolio/types.ts
src/features/profile/components/AccessibilitySection.tsx
src/features/profile/components/CurrencySelector.tsx
src/features/profile/components/DataManagement.tsx
src/features/profile/components/FamilySafetySection.tsx
src/features/profile/components/NotificationsSection.tsx
src/features/profile/components/ProfileForm.tsx
src/features/profile/components/ProfileHeader.tsx
src/features/profile/components/ResetConfirmModal.tsx
src/features/profile/components/RestoreModal.tsx
src/features/profile/components/SecureExportModal.tsx
src/features/profile/components/useProfileView.ts
src/features/profile/ProfileView.tsx
src/features/profile/ProfileViewMobile.tsx
src/features/recurring/hooks/useAutomations.ts
src/features/recurring/hooks/useRecurring.ts
src/features/recurring/RecurringView.tsx
src/features/reports/insights/reporting.ts
src/features/reports/ReportsView.tsx
src/features/shared/components/SharedGroups.tsx
src/features/shared/components/SharedModals.tsx
src/features/shared/components/SharedOverview.tsx
src/features/shared/components/SharedTabs.tsx
src/features/shared/hooks/useSharedWallets.ts
src/features/shared/SharedView.tsx
src/features/shared/types.ts
src/features/subscriptions/components/AddSubscriptionModal.tsx
src/features/subscriptions/components/PriceHikeDetector.tsx
src/features/subscriptions/components/SubscriptionCalendar.tsx
src/features/subscriptions/components/SubscriptionManager.tsx
src/features/subscriptions/hooks/useSubscriptionManager.ts
src/features/subscriptions/hooks/useSubscriptions.ts
src/features/sync/BankSyncView.tsx
src/features/sync/components/CloudSync.tsx
src/features/sync/components/CSVImporter.tsx
src/features/sync/components/PayForm.tsx
src/features/sync/components/RazorpayLink.tsx
src/features/sync/components/SelectSource.tsx
src/features/sync/components/SyncDashboard.tsx
src/features/sync/components/UPILink.tsx
src/features/sync/parsers/csv.ts
src/features/sync/parsers/upi.ts
src/features/sync/types.ts
src/features/transactions/components/BulkActionHeader.tsx
src/features/transactions/components/DeleteConfirmModal.tsx
src/features/transactions/components/EditTransactionModal.tsx
src/features/transactions/components/HistoryToolbar.tsx
src/features/transactions/components/historyTypes.ts
src/features/transactions/components/SortBtn.tsx
src/features/transactions/components/TransactionFilters.tsx
src/features/transactions/components/TransactionList.tsx
src/features/transactions/components/TransactionRow.tsx
src/features/transactions/HistoryView.tsx
src/features/transactions/HistoryViewMobile.tsx
src/features/transactions/hooks/useTransactionHistory.ts
src/features/transactions/store/financeSlice.ts
src/hooks/useAppState.ts
src/hooks/useAuth.tsx
src/hooks/useBudgets.ts
src/hooks/useCategories.tsx
src/hooks/useCountUp.ts
src/hooks/useMasterVoice.ts
src/hooks/useMediaQuery.ts
src/hooks/useNotifications.ts
src/hooks/usePrefersReducedMotion.ts
src/hooks/usePWAInstall.ts
src/hooks/useTheme.ts
src/hooks/useTransactions.ts
src/hooks/useUPIReturn.tsx
src/index.css
src/main.tsx
src/store/index.ts
src/test-setup.ts
src/types/dom.ts
src/types/finance.ts
src/types/index.ts
src/types/state.ts
src/utils/avatar.ts
src/utils/cn.ts
src/utils/date.ts
src/utils/export.ts
src/utils/imageUtils.ts
src/utils/import.ts
src/utils/marketData.ts
src/utils/merchantMapper.ts
src/utils/pushNotification.ts
src/utils/razorpaySync.ts
src/utils/recurringDetection.ts
src/utils/setuConfig.ts
src/utils/share.ts
src/utils/upiPayment.ts
```

# Files

## File: public/locales/en/translation.json
```json
{
  "app": {
    "name": "SpendWise",
    "tagline": "Smart Financial Companion"
  },
  "nav": {
    "dashboard": "Dashboard",
    "transactions": "Transactions",
    "budget": "Budget",
    "analytics": "Analytics",
    "history": "History",
    "goals": "Goals",
    "profile": "Profile",
    "settings": "Settings",
    "advisor": "Advisor",
    "sync": "Bank Sync"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "loading": "Loading...",
    "search": "Search",
    "noData": "No data available",
    "currency": "₹"
  },
  "dashboard": {
    "balance": "Balance",
    "income": "Income",
    "expenses": "Expenses",
    "netWorth": "Net Worth",
    "healthScore": "Health Score",
    "recentTransactions": "Recent Transactions",
    "quickAdd": "Quick Add",
    "safeToSpend": "Safe to Spend"
  },
  "budget": {
    "title": "Budget",
    "overBudget": "Over Budget",
    "onTrack": "On Track",
    "remaining": "remaining",
    "setBudget": "Set Budget",
    "categoryLimit": "Category Limit"
  },
  "goals": {
    "title": "Goals",
    "createGoal": "Create Goal",
    "contribute": "Contribute",
    "achieved": "Achieved",
    "targetAmount": "Target Amount",
    "savedAmount": "Saved Amount",
    "daysLeft": "days left"
  },
  "parental": {
    "title": "Parental Controls",
    "kidMode": "Kid Mode",
    "allowance": "Allowance",
    "setPin": "Set PIN",
    "restrictedCategories": "Restricted Categories",
    "monthlyLimit": "Monthly Limit",
    "pendingApprovals": "Pending Approvals",
    "approve": "Approve",
    "deny": "Deny",
    "lockSession": "Lock Session"
  },
  "portfolio": {
    "title": "Portfolio",
    "totalAssets": "Total Assets",
    "totalLiabilities": "Total Liabilities",
    "netWorth": "Net Worth",
    "addAsset": "Add Asset",
    "addLiability": "Add Liability",
    "investments": "Investments",
    "marketPrice": "Market Price"
  },
  "advisor": {
    "title": "AI Advisor",
    "placeholder": "Ask me about your finances...",
    "analyzePersonality": "Analyze Personality",
    "clearChat": "Clear Chat",
    "localMode": "Local Advisor Mode Active"
  }
}
```

## File: public/locales/hi/translation.json
```json
{
  "app": {
    "name": "स्पेंडवाइज़",
    "tagline": "स्मार्ट वित्तीय साथी"
  },
  "nav": {
    "dashboard": "डैशबोर्ड",
    "transactions": "लेन-देन",
    "budget": "बजट",
    "analytics": "विश्लेषण",
    "history": "इतिहास",
    "goals": "लक्ष्य",
    "profile": "प्रोफ़ाइल",
    "settings": "सेटिंग्स",
    "advisor": "सलाहकार",
    "sync": "बैंक सिंक"
  },
  "common": {
    "save": "सहेजें",
    "cancel": "रद्द करें",
    "delete": "हटाएं",
    "edit": "संपादित करें",
    "add": "जोड़ें",
    "loading": "लोड हो रहा है...",
    "search": "खोजें",
    "noData": "कोई डेटा उपलब्ध नहीं",
    "currency": "₹"
  },
  "dashboard": {
    "balance": "शेष राशि",
    "income": "आय",
    "expenses": "व्यय",
    "netWorth": "कुल संपत्ति",
    "healthScore": "स्वास्थ्य स्कोर",
    "recentTransactions": "हाल के लेन-देन",
    "quickAdd": "त्वरित जोड़ें",
    "safeToSpend": "खर्च करने योग्य"
  },
  "budget": {
    "title": "बजट",
    "overBudget": "बजट से अधिक",
    "onTrack": "सही रास्ते पर",
    "remaining": "शेष",
    "setBudget": "बजट सेट करें",
    "categoryLimit": "श्रेणी सीमा"
  },
  "goals": {
    "title": "लक्ष्य",
    "createGoal": "लक्ष्य बनाएं",
    "contribute": "योगदान करें",
    "achieved": "प्राप्त हुआ",
    "targetAmount": "लक्ष्य राशि",
    "savedAmount": "बचत राशि",
    "daysLeft": "दिन शेष"
  },
  "parental": {
    "title": "अभिभावक नियंत्रण",
    "kidMode": "बाल मोड",
    "allowance": "भत्ता",
    "setPin": "पिन सेट करें",
    "restrictedCategories": "प्रतिबंधित श्रेणियाँ",
    "monthlyLimit": "मासिक सीमा",
    "pendingApprovals": "लंबित स्वीकृतियाँ",
    "approve": "स्वीकृत करें",
    "deny": "अस्वीकृत करें",
    "lockSession": "सत्र लॉक करें"
  },
  "portfolio": {
    "title": "पोर्टफोलियो",
    "totalAssets": "कुल संपत्तियाँ",
    "totalLiabilities": "कुल देनदारियाँ",
    "netWorth": "कुल संपत्ति",
    "addAsset": "संपत्ति जोड़ें",
    "addLiability": "देनदारी जोड़ें",
    "investments": "निवेश",
    "marketPrice": "बाज़ार मूल्य"
  },
  "advisor": {
    "title": "AI सलाहकार",
    "placeholder": "मुझसे अपने वित्त के बारे में पूछें...",
    "analyzePersonality": "व्यक्तित्व विश्लेषण",
    "clearChat": "चैट साफ़ करें",
    "localMode": "स्थानीय सलाहकार मोड सक्रिय"
  }
}
```

## File: src/components/layout/DemoBanner.tsx
```typescript
import { AlertTriangle } from 'lucide-react';
⋮----
export function DemoBanner()
```

## File: src/components/layout/LanguageSwitcher.tsx
```typescript
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
⋮----
export function LanguageSwitcher()
⋮----
const toggleLanguage = () =>
```

## File: src/core/i18n.ts
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
```

## File: src/features/dashboard/components/ProactiveNudge.tsx
```typescript
import { AppView } from '@/types';
import { ProactiveNudge as NudgeData } from '@/features/analytics/insights/advisor';
⋮----
interface Props {
  nudge: NudgeData | null;
  onNavigate: (view: AppView) => void;
  className?: string;
}
⋮----
export default function ProactiveNudge(
⋮----
onNavigate(
```

## File: src/features/parental/components/AllowanceCard.tsx
```typescript
import { useState } from 'react';
import { Coins, Calendar, Gift } from 'lucide-react';
import { useStore } from '@/store';
⋮----
const handleSave = () =>
⋮----
onClick=
```

## File: src/features/portfolio/hooks/useMarketPrices.ts
```typescript
import { useEffect, useState, useCallback, useRef } from 'react';
import { useStore } from '@/store';
import { getMarketQuote, MarketQuote } from '@/utils/marketData';
⋮----
function guessSymbol(name: string): string | null
⋮----
export function useMarketPrices()
```

## File: src/features/transactions/components/EditTransactionModal.tsx
```typescript
import React from 'react';
import { X, Save } from 'lucide-react';
import { Transaction, Category } from '@/types';
import Portal from '@/components/ui/Portal';
import { useCategories } from '@/hooks/useCategories';
⋮----
interface EditTransactionModalProps {
  tx: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void;
  currency: string;
}
⋮----
const handleSave = () =>
```

## File: src/test-setup.ts
```typescript

```

## File: src/utils/marketData.ts
```typescript
export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  lastUpdated: string;
}
⋮----
const CACHE_TTL = 60_000; // 1 minute
⋮----
async function fetchFromYahooFinance(symbol: string): Promise<MarketQuote | null>
⋮----
export async function getMarketQuote(symbol: string): Promise<MarketQuote>
⋮----
export async function getNiftyIndex(): Promise<MarketQuote>
⋮----
export async function getSensexIndex(): Promise<MarketQuote>
```

## File: src/utils/recurringDetection.ts
```typescript
import { Transaction, RecurringPattern } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
function addDays(date: string, days: number): string
⋮----
function daysBetween(a: string, b: string): number
⋮----
function normalise(name: string): string
⋮----
function detectFrequency(avgDays: number): RecurringPattern['frequency']
⋮----
export function detectRecurringPatterns(transactions: Transaction[]): RecurringPattern[]
```

## File: src/utils/setuConfig.ts
```typescript
export interface SetuConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
  webhookUrl?: string;
}
⋮----
export function getSetuConfig(): SetuConfig | null
⋮----
export function isSetuConfigured(): boolean
```

## File: src/app/hooks/usePWAInstall.ts
```typescript
import { useState, useEffect } from 'react';
⋮----
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
⋮----
prompt(): Promise<void>;
⋮----
export function usePWAInstall()
⋮----
const handleBeforeInstallPrompt = (e: Event) =>
⋮----
const handleInstallClick = async () =>
```

## File: src/components/layout/components/MicTranscript.tsx
```typescript
interface MicTranscriptProps {
  transcript: string;
}
⋮----
export function MicTranscript(
```

## File: src/components/layout/OfflineIndicator.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
⋮----
export function OfflineIndicator()
⋮----
const handleOnline = ()
const handleOffline = ()
```

## File: src/components/ui/Portal.tsx
```typescript
import { useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
⋮----
export default function Portal(
```

## File: src/core/voiceCommands/handlers/index.ts
```typescript

```

## File: src/core/voiceCommands/handlers/types.ts
```typescript
import { VoiceCommand, CommandResult } from '@/core/voiceCommands/types';
import { AppView } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export interface CommandContext {
  command: VoiceCommand;
  navigate: (view: AppView) => void;
  onExport: () => void;
  toggleTheme: () => void;
  setSearchQuery?: (q: string) => void;
}
⋮----
export type IntentHandler = (context: CommandContext) => Promise<CommandResult> | CommandResult;
⋮----
// Utility functions
export function formatCurrency(amount: number): string
⋮----
// ignore
⋮----
export function shortId(): string
⋮----
export function todayISO(): string
⋮----
export function yesterdayISO(): string
```

## File: src/features/advisor/types.ts
```typescript
export interface MessageData {
  action?: 'CREATE_BUDGET' | 'VIEW_ANALYTICS' | 'SET_GOAL';
  balance?: number;
  expenses?: number;
  topCategory?: string;
  savingsRate?: string;
}
⋮----
export interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: string;
  type?: 'text' | 'action_card' | 'briefing';
  data?: MessageData;
  streaming?: boolean;
}
```

## File: src/features/education/components/categoryConfig.tsx
```typescript
import { BookOpen, TrendingUp, Shield, Sparkles, Zap } from 'lucide-react';
```

## File: src/hooks/useCountUp.ts
```typescript
import { useEffect, useRef, useState } from 'react';
⋮----
/**
 * Animates a number from its previous value to the new target value.
 * Uses requestAnimationFrame for smooth, performant animation.
 *
 * @param target   The destination number to animate to
 * @param duration Animation duration in ms (default: 600)
 * @returns        The current animated display value
 */
export function useCountUp(target: number, duration = 600): number
⋮----
// Cancel any in-progress animation
⋮----
// No animation needed if value unchanged
⋮----
function step(timestamp: number)
⋮----
// Ease-out cubic: decelerates as it approaches target
```

## File: src/hooks/useMediaQuery.ts
```typescript
import { useState, useEffect } from 'react';
⋮----
export function useMediaQuery(query: string): boolean
⋮----
const listener = (e: MediaQueryListEvent)
⋮----
export function useIsMobile(): boolean
⋮----
// Common breakpoint for mobile devices
```

## File: src/hooks/usePrefersReducedMotion.ts
```typescript
import { useState, useEffect } from 'react';
⋮----
export function usePrefersReducedMotion()
⋮----
const listener = (event: MediaQueryListEvent) =>
```

## File: src/types/dom.ts
```typescript
/**
 * Centralized DOM and Global Type Definitions
 * Used to eliminate 'as any' casts for browser-specific APIs
 */
⋮----
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
⋮----
prompt(): Promise<void>;
⋮----
export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
⋮----
export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
⋮----
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: { color: string };
  handler: (response: { razorpay_payment_id?: string }) => void;
  modal: {
    ondismiss: () => void;
  };
}
⋮----
export interface RazorpayInstance {
  open(): void;
}
⋮----
open(): void;
⋮----
export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
  start(): void;
  stop(): void;
  abort(): void;
}
⋮----
start(): void;
stop(): void;
abort(): void;
⋮----
interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    MSStream?: unknown;
    Razorpay: {
      new (options: RazorpayOptions): RazorpayInstance;
    };
  }
⋮----
interface Navigator {
    share(data?: ShareData): Promise<void>;
  }
⋮----
share(data?: ShareData): Promise<void>;
```

## File: src/utils/cn.ts
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
⋮----
export function cn(...inputs: ClassValue[])
```

## File: src/utils/date.ts
```typescript
/**
 * date.ts — Timezone-safe local date utilities
 */
⋮----
/**
 * Formats a Date object as a local YYYY-MM-DD string,
 * avoiding the UTC date-shifting bug caused by .toISOString().
 */
export function formatLocalYYYYMMDD(d: Date): string
```

## File: src/utils/imageUtils.ts
```typescript
/**
 * imageUtils.ts
 * Client-side image compression before sending to Gemini API.
 * Reduces image size dramatically to avoid token limits and speed up requests.
 */
⋮----
/**
 * Compresses a base64-encoded image by resizing it to a max dimension
 * and reducing JPEG quality. Returns a new base64 string (WITHOUT the data: prefix).
 */
export async function compressImage(
  base64DataUrl: string,
  maxDimension = 800,
  quality = 0.75
): Promise<
⋮----
// Scale down to maxDimension if needed
```

## File: src/app/App.tsx
```typescript
import { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { useAuth } from '@/hooks/useAuth';
import { MainShell } from '@/app/MainShell';
import { AppView } from '@/types';
import { STORAGE_KEYS, FINANCE_DEFAULTS } from '@/constants';
import { useStore } from '@/store';
⋮----
// Apply Dark Mode
⋮----
// Apply Font Size
⋮----
// Apply High Contrast
⋮----
const setConfig = (newConfig: SpendWiseConfig) =>
```

## File: src/app/hooks/useAppEnvironment.ts
```typescript
import { useState, useEffect } from 'react';
⋮----
export function useAppEnvironment()
⋮----
const handleOnline = ()
const handleOffline = ()
⋮----
const handleViewportResize = () =>
```

## File: src/app/hooks/useAppTheme.ts
```typescript
import { useCallback, useEffect } from 'react';
import { useStore } from '@/store';
import { AppView } from '@/types';
⋮----
export function useAppTheme(activeView: AppView)
```

## File: src/app/hooks/useVoiceMic.ts
```typescript
/**
 * useVoiceMic — orchestrates voice-mic UI state for MasterMic.
 *
 * Wraps useMasterVoice and adds:
 *  - Space-bar push-to-talk shortcut
 *  - History panel toggle with outside-click dismiss
 *  - First-use onboarding state
 *  - FAB click handler
 */
⋮----
import { useEffect, useState, useCallback } from 'react';
import { useMasterVoice } from '@/hooks/useMasterVoice';
import { AppView } from '@/types';
import { STORAGE_KEYS } from '@/constants';
⋮----
interface UseVoiceMicOptions {
  navigate: (view: AppView) => void;
  onExport: () => void;
  toggleTheme: () => void;
  setSearchQuery?: (q: string) => void;
}
⋮----
export function useVoiceMic(options: UseVoiceMicOptions)
⋮----
// ── Space-bar shortcut ───────────────────────────────────────────────────
⋮----
const onDown = (e: KeyboardEvent) =>
const onUp = (e: KeyboardEvent) =>
⋮----
// ── Close history on outside click ───────────────────────────────────────
⋮----
const fn = ()
⋮----
// ── FAB click handler ────────────────────────────────────────────────────
⋮----
// ── Onboarding dismiss ──────────────────────────────────────────────────
⋮----
// voice state
⋮----
// UI state
⋮----
// handlers
```

## File: src/components/layout/AlertBanner.tsx
```typescript
import { useState } from 'react';
import { X, ChevronDown, ChevronUp, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { SpendingAlert, AlertSeverity } from '@/types';
⋮----
interface AlertBannerProps {
  alerts: SpendingAlert[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}
⋮----
function AlertRow(
⋮----
onClick=
⋮----
{/* Header row */}
```

## File: src/components/layout/CommandPalette.tsx
```typescript
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Compass,
  DollarSign,
  Activity,
  FileText,
  Target,
  Wallet,
  RefreshCw,
  User,
  PiggyBank,
  ArrowRight,
  X,
} from 'lucide-react';
import { AppView, Transaction } from '@/types';
import Portal from '@/components/ui/Portal';
⋮----
// Filter Views
⋮----
// Filter Transactions (max 5)
⋮----
const handleKeyDown = (e: KeyboardEvent) =>
⋮----
// If selected transaction, navigate to history (or we could open edit modal if we had one)
⋮----
onClose(); // In a future iteration, we can deep-link into a history filter.
```

## File: src/components/layout/components/ConfirmDialog.tsx
```typescript
import { AlertTriangle } from 'lucide-react';
⋮----
interface ConfirmDialogProps {
  summary: string;
  onConfirm: () => void;
  onCancel: () => void;
}
```

## File: src/components/layout/components/DesktopSidebar.tsx
```typescript
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Settings, LogOut, DownloadCloud } from 'lucide-react';
import { AppView } from '@/types';
import { haptic } from '@/core/haptic';
import { IconNavItem, Sep } from './IconNavItem';
⋮----
interface NavItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
}
⋮----
interface DesktopSidebarProps {
  activeView: AppView;
  navigate: (view: AppView) => void;
  coreItems: NavItem[];
  wealthItems: NavItem[];
  toolItems: NavItem[];
  overBudgetCount: number;
  showInstall?: boolean;
  onInstall?: () => void;
  signOut: () => void;
}
⋮----
onClick=
⋮----
haptic.medium();
onInstall?.();
⋮----
if (signOutRef.current)
const rect = signOutRef.current.getBoundingClientRect();
setSignOutTipTop(rect.top + rect.height / 2);
⋮----
haptic.light();
signOut();
```

## File: src/components/layout/components/HistoryPanel.tsx
```typescript
import { CheckCircle2, XCircle } from 'lucide-react';
import { HistoryEntry } from '@/hooks/useMasterVoice';
⋮----
// eslint-disable-next-line react-hooks/purity
⋮----
onClick=
```

## File: src/components/layout/components/IconNavItem.tsx
```typescript
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
⋮----
interface IconNavItemProps {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}
⋮----
const handleEnter = () =>
const handleLeave = () =>
```

## File: src/components/layout/components/MissingEntityPrompt.tsx
```typescript
interface MissingEntityPromptProps {
  prompt: string;
}
```

## File: src/components/layout/components/MobileDrawer.tsx
```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, DownloadCloud, Settings, LogOut } from 'lucide-react';
import { AppView } from '@/types';
import { haptic } from '@/core/haptic';
⋮----
interface DrawerItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
}
⋮----
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: AppView;
  navigate: (view: AppView) => void;
  mobileDrawerItems: DrawerItem[];
  overBudgetCount: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  showInstall?: boolean;
  onInstall?: () => void;
  signOut: () => void;
}
⋮----
haptic.medium();
onToggleTheme?.();
⋮----
onInstall?.();
onClose();
⋮----
haptic.light();
signOut();
```

## File: src/components/layout/components/OnboardingTooltip.tsx
```typescript
interface OnboardingTooltipProps {
  onDismiss: () => void;
}
```

## File: src/components/layout/components/ResultMessage.tsx
```typescript
interface ResultMessageProps {
  result: { success: boolean; message: string };
}
```

## File: src/components/layout/components/WaveformVisualizer.tsx
```typescript
interface WaveformVisualizerProps {
  barCount?: number;
}
```

## File: src/components/layout/CustomCategoriesModal.tsx
```typescript
import { useState } from 'react';
import { X, Plus, Trash2, Edit3, Tag as TagIcon } from 'lucide-react';
import { CustomCategoryDef, Transaction } from '@/types';
import { useCategories } from '@/hooks/useCategories';
⋮----
interface CustomCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  customCategories: CustomCategoryDef[];
  onAdd: (def: Omit<CustomCategoryDef, 'id'>) => void;
  onUpdate: (id: string, def: Partial<CustomCategoryDef>) => void;
  onDelete: (id: string) => void;
  transactions?: Transaction[];
  onReassign?: (oldCategoryName: string, newCategoryName: string) => void;
}
⋮----
const handleStartAdd = () =>
⋮----
const handleStartEdit = (cat: CustomCategoryDef) =>
⋮----
const handleSave = () =>
⋮----
const handleDeleteAttempt = (cat: CustomCategoryDef) =>
⋮----
const handleConfirmReassign = () =>
⋮----
{/* Header */}
⋮----
{/* Content */}
⋮----
// REASSIGNMENT VIEW
⋮----
onClick=
⋮----
// LIST VIEW
⋮----
// EDIT VIEW
```

## File: src/components/layout/DesktopOnlyGuard.tsx
```typescript
import React from 'react';
import { Monitor } from 'lucide-react';
import { AppView } from '@/types';
⋮----
interface DesktopOnlyGuardProps {
  viewLabel: string;
  onNavigate: (view: AppView) => void;
  children: React.ReactNode;
}
⋮----
/**
 * Wraps desktop-only views. On mobile screens it shows a friendly
 * "best on desktop" banner instead of the view. On desktop it renders
 * children as-is.
 */
⋮----
const handler = (e: MediaQueryListEvent)
⋮----
{/* Icon */}
⋮----
{/* Heading */}
⋮----
{/* Sub-text */}
⋮----
{/* CTA */}
```

## File: src/components/layout/FeedbackModal.tsx
```typescript
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Star, Bug, Zap } from 'lucide-react';
import { haptic } from '@/core/haptic';
⋮----
interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { type: string; message: string; rating: number }) => void;
}
⋮----
const handleSubmit = (e: React.FormEvent) =>
⋮----
// Simulate API call
```

## File: src/components/layout/Header.tsx
```typescript
import React from 'react';
import { Bell, ChevronRight, Moon, Sun, User, Search, Eye, EyeOff } from 'lucide-react';
import { AppView } from '@/types';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { MasterMic } from '@/components/layout/MasterMic';
⋮----
interface HeaderProps {
  activeView: AppView;
  unreadCount: number;
  onToggleNotifications: () => void;
  onNavigate: (view: AppView) => void;
  currency: string;
  currentBalance: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  config?: SpendWiseConfig | null;
  onOpenSearch?: () => void;
  isPrivacyEnabled?: boolean; // Kept for backwards compatibility if needed
  onTogglePrivacy?: () => void; // Kept for backwards compatibility if needed
  onExport?: () => void;
  setSearchQuery?: (q: string) => void;
}
⋮----
isPrivacyEnabled?: boolean; // Kept for backwards compatibility if needed
onTogglePrivacy?: () => void; // Kept for backwards compatibility if needed
⋮----
function getGreeting()
⋮----
{/* ─── MOBILE background: flat high-performance gradient (no separate compositing blur layers) ─── */}
⋮----
{/* ─── DESKTOP background: plain white/card ─── */}
⋮----
{/* ─── Content row ─── */}
⋮----
{/* Left — Greeting / Page Title */}
⋮----
onNavigate('dashboard');
⋮----
{/* Mobile: white bold text - Simplified for Dashboard to save space */}
⋮----
{/* Desktop: themed text */}
⋮----
{/* Mobile date */}
⋮----
{/* Desktop date */}
⋮----
{/* Theme toggle - Visible on all viewports */}
⋮----
{/* Privacy toggle - Visible on all devices */}
⋮----
{/* Global Search */}
⋮----
onOpenSearch?.();
⋮----
{/* Master Voice Mic */}
⋮----
{/* User Avatar */}
```

## File: src/components/layout/IOSInstallModal.tsx
```typescript
import { X, Share, PlusSquare, ArrowUp } from 'lucide-react';
⋮----
interface IOSInstallModalProps {
  onClose: () => void;
}
⋮----
{/* Close button */}
⋮----
{/* Glow effect */}
⋮----
{/* Title */}
⋮----
{/* Steps */}
⋮----
{/* Step 1 */}
⋮----
{/* Step 2 */}
⋮----
{/* Step 3 */}
⋮----
{/* Action Button */}
```

## File: src/components/layout/MasterMic.tsx
```typescript
/**
 * MasterMic — SpendWise Universal Voice Command FAB (Phase 2)
 *
 * Floating mic button with:
 *  - Animated waveform bars (listening)
 *  - Live transcript + intent badge
 *  - Confirmation dialog for large-amount commands
 *  - Missing-entity prompt display
 *  - Command history panel (last 10)
 *  - Result card with TTS readback (handled by hook)
 *  - ARIA live region for screen readers
 *  - Space-bar shortcut
 */
⋮----
import { useState } from 'react';
import {
  Mic,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
  History,
  ChevronRight,
  Send,
} from 'lucide-react';
import { MicState } from '@/hooks/useMasterVoice';
import { useVoiceMic } from '@/app/hooks/useVoiceMic';
⋮----
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { MicTranscript } from './components/MicTranscript';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ResultMessage } from './components/ResultMessage';
import { MissingEntityPrompt } from './components/MissingEntityPrompt';
import { HistoryPanel } from './components/HistoryPanel';
import { OnboardingTooltip } from './components/OnboardingTooltip';
⋮----
import { AppView } from '@/types';
⋮----
interface MasterMicProps {
  navigate: (view: AppView) => void;
  onExport: () => void;
  toggleTheme: () => void;
  setSearchQuery?: (q: string) => void;
  variant?: 'fab' | 'header';
}
⋮----
onChange=
⋮----
dismissTextFallback();
setTextInput('');
```

## File: src/components/layout/navigation.ts
```typescript
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  Target,
  PieChart,
  TrendingUp,
  RefreshCw,
  Users,
  SmartphoneNfc,
  Bot,
  GraduationCap,
  Trophy,
  Shield,
  FileText,
} from 'lucide-react';
import { AppView } from '@/types';
⋮----
/** Views shown in the mobile bottom tab bar (2 left + FAB + 2 right) */
⋮----
/** Views that are too data-heavy for mobile — only navigable from the desktop sidebar */
```

## File: src/components/layout/NavTabs.tsx
```typescript
import { AppView } from '@/types';
⋮----
interface NavTabsProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  overBudgetCount: number;
}
⋮----
// Mobile responsive hiding is maintained, desktop matches the new layout rules
⋮----
{/* Desktop Tabs */}
⋮----
{/* Mobile Bottom Nav */}
⋮----
{/* Active Indicator on Mobile */}
```

## File: src/components/layout/NotificationCenter.tsx
```typescript
import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { X, Bell, CheckCheck, ExternalLink, Sparkles, AlarmClock } from 'lucide-react';
import { AppNotification, AlertSeverity, AppView } from '@/types';
⋮----
interface NotificationCenterProps {
  notifications: AppNotification[];
  unreadCount: number;
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (view: AppView) => void;
  onSnooze?: (id: string, hours: number) => void;
  cloudMode?: boolean;
}
⋮----
function severityBorderColor(s: AlertSeverity): string
⋮----
function relativeTime(ts: number): string
⋮----
type FlatItem = { type: 'ai_summary' } | { type: 'header'; label: string; count: number } | { type: 'notif'; notif: AppNotification; hasSnooze: boolean };
⋮----
const handleClick = (e: React.MouseEvent) =>
⋮----
const fn = (e: MouseEvent) =>
⋮----
itemContent=
```

## File: src/components/layout/PrivacyShield.tsx
```typescript
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';
⋮----
interface PrivacyShieldProps {
  onUnlock?: () => void;
  isLocked?: boolean;
}
⋮----
// Check if user has already unlocked this tab session
⋮----
// If they already unlocked in this browser session, don't show the shield again on mount
⋮----
// eslint-disable-next-line react-hooks/purity
⋮----
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
⋮----
/* ignore */
⋮----
/* ignore */
⋮----
const MIN_HIDDEN_MS = 30_000; // Only lock if tab was hidden for >30 seconds
⋮----
const handleVisibilityChange = () =>
⋮----
// Only lock if the tab was actually away for >30 seconds (not just a route change)
⋮----
const handleActivity = ()
```

## File: src/components/layout/PullToRefresh.tsx
```typescript
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';
import { haptic } from '@/core/haptic';
⋮----
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}
⋮----
const handleTouchStart = (e: TouchEvent) =>
⋮----
const handleTouchMove = (e: TouchEvent) =>
⋮----
// Linear dampening
⋮----
// Haptic feedback when crossing threshold
⋮----
// Prevent scroll
⋮----
const handleTouchEnd = async () =>
⋮----
{/* Refresh Indicator */}
```

## File: src/components/layout/QuickAddModal.tsx
```typescript
import React from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import MagicInput from '@/features/ai/components/MagicInput';
import { Transaction } from '@/types';
import { haptic } from '@/core/haptic';
⋮----
interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: Transaction) => void;
  transactions: Transaction[];
}
⋮----
{/* Backdrop */}
⋮----
{/* Modal Container */}
⋮----
{/* Focus Trap Anchor (Top) */}
⋮----
// Focus the close button if tabbed backwards from modal start
⋮----
{/* Pull Bar (Android/iOS style) - Click & drag trigger */}
⋮----
{/* Header */}
⋮----
haptic.light();
onClose();
⋮----
{/* Body */}
⋮----
{/* Bottom keyboard spacer */}
⋮----
{/* Focus Trap Anchor (Bottom) */}
⋮----
// Focus the magic input if tabbed forward from modal end
```

## File: src/components/layout/ServiceWorkerToast.tsx
```typescript
import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/core/haptic';
⋮----
// eslint-disable-next-line react-hooks/set-state-in-effect
⋮----
const close = () =>
⋮----
onClick=
```

## File: src/components/layout/Sidebar.tsx
```typescript
import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { AppView } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { haptic } from '@/core/haptic';
import { useStore } from '@/store';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { ALL_NAV_ITEMS, MOBILE_BOTTOM_IDS, DESKTOP_ONLY_IDS } from './navigation';
import { DesktopSidebar } from './components/DesktopSidebar';
import { MobileDrawer } from './components/MobileDrawer';
⋮----
interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  overBudgetCount: number;
  showInstall?: boolean;
  onInstall?: () => void;
  config: SpendWiseConfig | null;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenQuickAdd?: () => void;
}
⋮----
export default function Sidebar({
  activeView,
  onViewChange,
  overBudgetCount,
  config,
  showInstall,
  onInstall,
  theme,
  onToggleTheme,
  onOpenQuickAdd,
}: SidebarProps)
⋮----
// Close drawer on view change
⋮----
// eslint-disable-next-line react-hooks/set-state-in-effect
⋮----
// Lock scroll when drawer open
⋮----
// Filter nav items based on user role and mode
⋮----
// Bottom tab items (exactly 4: dashboard, budget, history, sync)
⋮----
// Drawer items: not in bottom bar, and NOT desktop-only (those are hidden from mobile entirely)
⋮----
const navigate = (view: AppView) =>
⋮----
{/* Desktop spacer — keeps main content from sitting under sidebar */}
⋮----
{/* MOBILE — bottom nav */}
⋮----
{/* Flat layout: items distributed evenly across the screen */}
⋮----
{/* ── First 2 items (Overview, Budget) ── */}
⋮----
{/* ── CENTRE FAB (QuickAdd) ── */}
⋮----
haptic.medium();
onOpenQuickAdd?.();
⋮----
{/* ── Last 2 items (Transactions, Sync) ── */}
⋮----
{/* ── More ── */}
```

## File: src/components/ui/Card.tsx
```typescript
import React, { memo } from 'react';
import { motion } from 'framer-motion';
⋮----
interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glass?: boolean;
}
```

## File: src/components/ui/CategoryDropdown.tsx
```typescript
import { useState, useRef, useEffect } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Category } from '@/types';
⋮----
interface CategoryDropdownProps {
  value: string;
  onChange: (newCategory: string) => void;
  className?: string;
  placeholder?: string;
}
⋮----
export function CategoryDropdown({
  value,
  onChange,
  className = '',
  placeholder = 'Category...',
}: CategoryDropdownProps)
⋮----
function handleClickOutside(event: MouseEvent)
⋮----
// Also check if the click is outside the portal dropdown
⋮----
function handleScroll()
⋮----
width: 192, // w-48 = 12rem = 192px
⋮----
// Use absolute positioning with dynamic top or bottom relying on space
⋮----
onMouseOver=
onFocus=
```

## File: src/components/ui/EmptyState.tsx
```typescript
import React from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
⋮----
interface EmptyStateProps {
  // New flexible props:
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: { label: string; icon?: React.ReactNode; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  // Legacy props (keep for backward compat):
  onAction?: () => void;
  message?: string;
  subMessage?: string;
}
⋮----
// New flexible props:
⋮----
// Legacy props (keep for backward compat):
⋮----
subMessage, // legacy
⋮----
// Resolve props — new takes priority over legacy:
```

## File: src/components/ui/ErrorBoundary.tsx
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
⋮----
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
⋮----
interface State {
  hasError: boolean;
  error: Error | null;
}
⋮----
public static getDerivedStateFromError(error: Error): State
⋮----
public componentDidCatch(error: Error, errorInfo: ErrorInfo)
⋮----
// Automatically reload on Vite chunk loading errors
```

## File: src/components/ui/SkeletonLoader.tsx
```typescript
import React from 'react';
⋮----
type SkeletonVariant = 'dashboard' | 'list' | 'chart' | 'goals' | 'budget' | 'analytics';
⋮----
interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  className?: string;
}
⋮----
// ─── Reusable shimmer block ───────────────────────────────────────────────────
⋮----
// ─── Variant renderers ────────────────────────────────────────────────────────
⋮----
{/* Hero card */}
⋮----
{/* Stat row */}
⋮----
{/* Two col layout */}
⋮----
{/* Bar chart skeleton */}
⋮----
{/* Legend */}
⋮----
{/* Summary bar */}
⋮----
{/* Budget rows */}
⋮----
{/* Tabs */}
⋮----
{/* Donut + bar grid */}
⋮----
{/* Heatmap placeholder */}
⋮----
// ─── Main export ──────────────────────────────────────────────────────────────
```

## File: src/components/ui/types.ts
```typescript
import { Category } from '@/types/finance';
⋮----
export type AppView =
  | 'dashboard'
  | 'transactions'
  | 'budget'
  | 'analytics'
  | 'history'
  | 'settings'
  | 'goals'
  | 'quests'
  | 'inventory'
  | 'shop'
  | 'badges'
  | 'shared'
  | 'sync'
  | 'profile'
  | 'parental'
  | 'portfolio'
  | 'subscriptions'
  | 'advisor'
  | 'education'
  | 'reports'
  | 'gamification';
⋮----
export type AlertSeverity = 'info' | 'warning' | 'danger';
⋮----
export interface SpendingAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  category?: Category;
  actionLabel?: string;
  createdAt: number;
  dismissed: boolean;
}
⋮----
export type NotificationType =
  | 'alert'
  | 'recurring'
  | 'goal'
  | 'insight'
  | 'budget'
  | 'subscription';
⋮----
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  severity: AlertSeverity;
  read: boolean;
  timestamp: number;
  link?: AppView;
}
⋮----
export type ThemeMode = 'dark' | 'light';
```

## File: src/core/api/gemini.ts
```typescript
import { isSupabaseConfigured } from '@/core/api/supabase';
⋮----
interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}
⋮----
interface GeminiContent {
  role?: string;
  parts: GeminiPart[];
}
⋮----
interface GeminiGenerationConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  responseMimeType?: string;
}
⋮----
interface GeminiCallParams {
  contents: GeminiContent[];
  generationConfig?: GeminiGenerationConfig;
  system_instruction?: GeminiContent;
}
⋮----
interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}
⋮----
/**
 * Universal Gemini caller for SpendWise.
 * Dynamically routes queries:
 * 1. Safe Production Proxy: Calls Supabase Edge Function proxy (GAP-B) if Supabase is configured.
 * 2. Local Fallback: Direct call to Google APIs if local VITE_GEMINI_API_KEY is present in dev.
 */
export async function callGemini(params: GeminiCallParams): Promise<GeminiResponse>
⋮----
/**
 * Streaming Gemini caller — yields text chunks as they arrive from the API.
 * Falls back to a single-chunk yield when streaming is not available (e.g. Supabase proxy).
 */
⋮----
// Supabase proxy doesn't support SSE streaming — fall back to batch call and yield full text
⋮----
// Each SSE event is separated by "\n\n"; lines starting with "data: " carry the JSON
⋮----
// Incomplete JSON chunk — skip
```

## File: src/core/api/OCRService.ts
```typescript
import { callGemini } from '@/core/api/gemini';
import { formatLocalYYYYMMDD } from '@/utils/date';
import { inferCategory } from '@/features/ai/parsers/common';
⋮----
export interface OCRResult {
  merchant?: string;
  amount?: number;
  date?: string;
  category?: string;
  rawText: string;
}
⋮----
export const processReceipt = async (imageFile: File): Promise<OCRResult> =>
⋮----
// Convert file to base64
⋮----
// Tesseract.js fallback (Highly advanced heuristic extraction)
⋮----
// 1. Find Total Amount (Prioritize "total" over "subtotal")
⋮----
// 2. Find Merchant (Skip address, phone, and store metadata lines)
⋮----
// 3. Find Date
⋮----
// R4 fix: use formatLocalYYYYMMDD for parsed receipt dates too
⋮----
} catch { /* invalid date format — keep default */ }
⋮----
// 4. Find Category
⋮----
function fileToBase64(file: File): Promise<string>
```

## File: src/core/api/supabase.ts
```typescript
/**
 * SpendWise — Supabase Integration Layer
 *
 * Production-ready Supabase client + sync utilities.
 * To activate: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 *
 * SQL Schema (run once in Supabase SQL editor):
 * ──────────────────────────────────────────────
 * create table if not exists public.transactions (
 *   id           text primary key,
 *   user_id      uuid references auth.users(id) on delete cascade,
 *   date         text not null,
 *   amount       numeric not null,
 *   type         text not null check (type in ('debit','credit')),
 *   category     text not null,
 *   merchant     text not null,
 *   description  text,
 *   tags         text[],
 *   confidence   numeric,
 *   ai_parsed    boolean default false,
 *   created_at   timestamptz default now()
 * );
 *
 * create table if not exists public.gamification (
 *   user_id      uuid primary key references auth.users(id) on delete cascade,
 *   total_xp     int default 0,
 *   level        int default 1,
 *   streak       int default 0,
 *   last_active  text,
 *   updated_at   timestamptz default now()
 * );
 *
 * -- Row-level security
 * alter table public.transactions enable row level security;
 * create policy "own rows" on public.transactions
 *   using (auth.uid() = user_id);
 *
 * alter table public.gamification enable row level security;
 * create policy "own row" on public.gamification
 *   using (auth.uid() = user_id);
 */
⋮----
import { Transaction } from '@/types';
import { STORAGE_KEYS } from '@/constants';
⋮----
// ─── Config ──────────────────────────────────────────────────────────────────
⋮----
// ─── Lightweight REST client (no npm package required) ───────────────────────
⋮----
async function supabaseRequest(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<unknown>
⋮----
// ─── Auth ─────────────────────────────────────────────────────────────────────
⋮----
export interface SupabaseUser {
  id: string;
  email: string;
  access_token: string;
}
⋮----
export async function signUpWithEmail(email: string, password: string): Promise<SupabaseUser>
⋮----
export async function signInWithEmail(email: string, password: string): Promise<SupabaseUser>
⋮----
export async function signOut(token: string): Promise<void>
⋮----
// Revoke session server-side as well (scope=global invalidates all sessions for this user)
⋮----
// Clear any locally stored session data
⋮----
// ─── Transactions ─────────────────────────────────────────────────────────────
⋮----
/** Upload local transactions to Supabase (upsert on id conflict) */
export async function pushTransactions(
  transactions: Transaction[],
  userId: string,
  token: string
): Promise<void>
⋮----
// Batch in chunks of 500
⋮----
/** Pull all transactions for user from Supabase */
export async function pullTransactions(
  userId: string,
  token: string,
  since?: string // ISO date string
): Promise<Transaction[]>
⋮----
since?: string // ISO date string
⋮----
// ─── Gamification sync ────────────────────────────────────────────────────────
⋮----
export interface GamificationState {
  totalXP: number;
  level: number;
  streak: number;
  lastActive: string;
}
⋮----
export async function pushGamification(
  state: GamificationState,
  userId: string,
  token: string
): Promise<void>
⋮----
export async function pullGamification(
  userId: string,
  token: string
): Promise<GamificationState | null>
⋮----
// ─── Full sync (bidirectional) ────────────────────────────────────────────────
⋮----
export interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
}
⋮----
/**
 * Bidirectional sync:
 * 1. Push all local transactions not in cloud
 * 2. Pull all cloud transactions not in local
 * Returns counts for UI feedback
 */
export async function syncAll(
  localTransactions: Transaction[],
  userId: string,
  token: string,
  lastSyncDate?: string
): Promise<
⋮----
// Push local → cloud
⋮----
// Pull cloud → local
```

## File: src/core/api/VoiceService.ts
```typescript
import { callGemini } from '@/core/api/gemini';
import type { Category } from '@/types';
import type { VoiceCommand } from '@/core/voiceCommands/types';
⋮----
export interface VoiceParsedTransaction {
  amount: number;
  category: Category;
  merchant: string;
  type: 'credit' | 'debit';
  date: string;
  recurring?: string;
}
⋮----
export const parseVoiceWithGemini = async (
  text: string,
  today: string
): Promise<VoiceParsedTransaction> =>
⋮----
export const parseMasterVoiceWithGemini = async (
  text: string,
  today: string
): Promise<VoiceCommand> =>
```

## File: src/core/crdt.ts
```typescript
export interface SharedGroup {
  id: string;
  name: string;
  purpose: string;
  created_by: string;
}
⋮----
export interface SharedGroupMember {
  id: string;
  group_id: string;
  user_id?: string;
  invited_email?: string;
  display_name: string;
  emoji: string;
  role: string;
  status: string;
  invited_at: string;
  joined_at?: string;
}
⋮----
export interface SharedWalletEntry {
  id: string;
  group_id: string;
  member_id: string;
  kind: 'contribution' | 'spend_from_pot' | 'withdrawal';
  amount: number;
  label: string;
  date: string;
}
⋮----
export interface SharedExpenseSplit {
  id: string;
  expense_id: string;
  member_id: string;
  share_percent: number;
}
⋮----
export interface SharedExpense {
  id: string;
  group_id: string;
  paid_by_member_id: string;
  label: string;
  category: string;
  amount: number;
  date: string;
  splits?: SharedExpenseSplit[];
}
⋮----
export interface SharedGoalContribution {
  id: string;
  goal_id: string;
  member_id: string;
  amount: number;
  date: string;
  note?: string;
}
⋮----
export interface SharedGoal {
  id: string;
  group_id: string;
  name: string;
  emoji: string;
  target_amount: number;
  target_date: string;
  color: string;
  contributions?: SharedGoalContribution[];
}
⋮----
export interface SharedStorage {
  groups: SharedGroup[];
  members: SharedGroupMember[];
  walletEntries: SharedWalletEntry[];
  expenses: SharedExpense[];
  goals: SharedGoal[];
  deleted_ids: string[]; // Tombstones
}
⋮----
deleted_ids: string[]; // Tombstones
⋮----
// LWW Union by ID, with Tombstone filtering
export function mergeSharedStorage(local: SharedStorage, remote: SharedStorage): SharedStorage
⋮----
const unionById = <T extends
⋮----
// Insert local first
⋮----
// Overwrite with remote (remote wins conflicts in basic LWW)
⋮----
// Filter out deleted items
```

## File: src/core/encryption.ts
```typescript
/**
 * WebCrypto-based encryption for SpendWise backups.
 * Uses AES-GCM for authenticated encryption and PBKDF2 for key derivation.
 */
⋮----
export async function encryptData(data: string, password: string): Promise<string>
⋮----
// Combine salt + iv + content into a single Buffer/Array
⋮----
// Convert to Base64 for export
⋮----
export async function decryptData(encryptedBase64: string, password: string): Promise<string>
```

## File: src/core/exportPDF.ts
```typescript
import { Transaction, MonthlyStats, Budget, SavingsGoal } from '@/types';
⋮----
interface PDFReportData {
  transactions: Transaction[];
  monthlyStats: MonthlyStats;
  budgets: Budget[];
  goals: SavingsGoal[];
  currency: string;
  month: string; // e.g. "April 2026"
}
⋮----
month: string; // e.g. "April 2026"
⋮----
// ─── Inline styles (no external CSS needed for print window) ───────────────────
⋮----
function fmt(currency: string, amount: number): string
⋮----
function pct(val: number, total: number): string
⋮----
// ─── Category aggregation ──────────────────────────────────────────────────────
⋮----
function aggregateByCategory(
  txs: Transaction[]
):
⋮----
// ─── HTML template ─────────────────────────────────────────────────────────────
⋮----
function buildHTML(data: PDFReportData): string
⋮----
// ── Transaction rows (top 20 for PDF readability) ──────────────────────────
⋮----
// ── Budget rows ────────────────────────────────────────────────────────────
⋮----
// ── Goals rows ─────────────────────────────────────────────────────────────
⋮----
// ── Category breakdown rows ────────────────────────────────────────────────
⋮----
// ─── Public API ────────────────────────────────────────────────────────────────
⋮----
export function generatePDFReport(data: PDFReportData): void
⋮----
// Give browser a moment to render before auto-focusing
```

## File: src/core/haptic.ts
```typescript
import { STORAGE_KEYS } from '@/constants';
⋮----
/**
 * Utility for native-like haptic feedback on Android/iOS
 * Only works if the device supports the Vibration API
 */
const isEnabled = () =>
⋮----
/**
   * Light impact (e.g. navigation, selection change)
   */
⋮----
/**
   * Medium impact (e.g. opening a modal, button toggle)
   */
⋮----
/**
   * Heavy impact (e.g. shake detection)
   */
⋮----
/**
   * Success feedback (e.g. transaction added)
   */
⋮----
// Short double pulse
⋮----
/**
   * Warning/Error feedback
   */
⋮----
// Longer pulse
```

## File: src/core/security.ts
```typescript
import { STORAGE_KEYS } from '@/constants';
⋮----
const HASH_LENGTH = 32; // 256 bits
⋮----
function getPinSalt(): string
⋮----
function base64Url(buffer: ArrayBuffer): string
⋮----
export async function hashPin(pin: string): Promise<string>
⋮----
export async function hashPinLegacy(pin: string): Promise<string>
⋮----
export async function verifyPinHash(pin: string, hash: string): Promise<boolean>
⋮----
// Migrated PBKDF2 hash
⋮----
// Fallback: old SHA-256 salted hash for backward compatibility
⋮----
// Fallback: old unsalted SHA-256 for migration
```

## File: src/core/setuAA.ts
```typescript
/**
 * Setu Account Aggregator (AA) Sandbox Mock
 *
 * This file simulates the interaction with the Setu AA API.
 * In a real environment, these calls would be made from a secure backend
 * to prevent leaking the Setu Client ID and Secret.
 *
 * Flow:
 * 1. Create Consent Request (POST /consents)
 * 2. User approves consent via Setu UI
 * 3. Fetch Data Session (POST /sessions)
 * 4. Fetch Bank Statements (GET /sessions/{id}/data)
 */
⋮----
import { Transaction } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
// These would normally be stored in .env and only accessed by the backend
⋮----
export interface SetuConsentResponse {
  id: string;
  url: string; // The URL to redirect the user to for approval
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
}
⋮----
url: string; // The URL to redirect the user to for approval
⋮----
/**
 * Step 1: Request consent to view bank data
 */
export async function createSetuConsent(mobileNumber: string): Promise<SetuConsentResponse>
⋮----
// Simulate network delay
⋮----
/**
 * Step 2: Poll for consent status (In production, use Webhooks instead)
 */
export async function checkSetuConsentStatus(
  consentId: string
): Promise<'PENDING' | 'ACTIVE' | 'REJECTED'>
⋮----
// ⚠️ SANDBOX MODE: In production, this polls the Setu AA API.
⋮----
/**
 * Step 3 & 4: Fetch bank statements using the active consent
 */
export async function fetchSetuBankStatements(consentId: string): Promise<Partial<Transaction>[]>
⋮----
// Return realistic mock data that matches the FI (Financial Information) data schema
// ⚠️ All entries marked with _mock: true — they are fabricated, NOT from a real bank
```

## File: src/core/store/securedSlice.ts
```typescript
import { StateCreator } from 'zustand';
import { SavingsGoal } from '@/types';
import { SharedStorage } from '@/core/crdt';
import { SpendWiseStore } from '@/store/index';
⋮----
export interface VaultData {
  total: number;
  count: number;
  history: { date: string; amount: number; merchant: string }[];
  sweptIds?: string[];
}
⋮----
export interface UserPreferences {
  fontSize: string;
  darkMode: boolean;
  highContrast: boolean;
  hapticsEnabled: boolean;
  shakeEnabled: boolean;
  biometricEnabled: boolean;
  avatar: string | null;
}
⋮----
export interface SecuredSlice {
  goals: SavingsGoal[];
  setGoals: (goals: SavingsGoal[] | ((prev: SavingsGoal[]) => SavingsGoal[])) => void;

  sharedData: SharedStorage;
  setSharedData: (data: SharedStorage | ((prev: SharedStorage) => SharedStorage)) => void;

  merchantMemory: Record<string, { merchant: string; category: string }>;
  setMerchantMemory: (
    mem:
      | Record<string, { merchant: string; category: string }>
      | ((
          prev: Record<string, { merchant: string; category: string }>
        ) => Record<string, { merchant: string; category: string }>)
  ) => void;

  readNotificationIds: string[];
  setReadNotificationIds: (ids: string[] | ((prev: string[]) => string[])) => void;

  snoozedNotifications: Record<string, number>;
  setSnoozedNotifications: (
    snoozed: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)
  ) => void;

  // BUG-02 fix: Round-Up Vault moved from localStorage to encrypted IDB
  roundUpVault: VaultData;
  setRoundUpVault: (vault: VaultData | ((prev: VaultData) => VaultData)) => void;

  userPreferences: UserPreferences;
  setUserPreferences: (
    prefs: UserPreferences | ((prev: UserPreferences) => UserPreferences)
  ) => void;
}
⋮----
// BUG-02 fix: Round-Up Vault moved from localStorage to encrypted IDB
⋮----
export const createSecuredSlice: StateCreator<
  SpendWiseStore,
  [['zustand/persist', unknown]],
  [],
  SecuredSlice
> = set => ({
  goals: [],
  setGoals: goalsOrUpdater =>
    set(state => ({
      goals: typeof goalsOrUpdater === 'function' ? goalsOrUpdater(state.goals) : goalsOrUpdater,
    })),

  sharedData: {
    groups: [],
    members: [],
    walletEntries: [],
    expenses: [],
    goals: [],
    deleted_ids: [],
  },
  setSharedData: dataOrUpdater =>
    set(state => ({
      sharedData:
        typeof dataOrUpdater === 'function' ? dataOrUpdater(state.sharedData) : dataOrUpdater,
    })),

  merchantMemory: {},
  setMerchantMemory: memOrUpdater =>
    set(state => ({
      merchantMemory:
        typeof memOrUpdater === 'function' ? memOrUpdater(state.merchantMemory) : memOrUpdater,
    })),

  readNotificationIds: [],
  setReadNotificationIds: idsOrUpdater =>
    set(state => ({
      readNotificationIds:
        typeof idsOrUpdater === 'function' ? idsOrUpdater(state.readNotificationIds) : idsOrUpdater,
    })),

  snoozedNotifications: {},
  setSnoozedNotifications: snoozedOrUpdater =>
    set(state => ({
      snoozedNotifications:
        typeof snoozedOrUpdater === 'function'
          ? snoozedOrUpdater(state.snoozedNotifications)
          : snoozedOrUpdater,
    })),

  // BUG-02 fix: vault migrated from localStorage to encrypted IDB
  roundUpVault: { total: 0, count: 0, history: [], sweptIds: [] },
  setRoundUpVault: vaultOrUpdater =>
    set(state => ({
      roundUpVault:
        typeof vaultOrUpdater === 'function' ? vaultOrUpdater(state.roundUpVault) : vaultOrUpdater,
    })),

  userPreferences: {
    fontSize: 'text-base',
    darkMode:
      typeof window !== 'undefined'
        ? document.documentElement.getAttribute('data-theme') === 'dark'
        : false,
    highContrast: false,
    hapticsEnabled: true,
    shakeEnabled: true,
    biometricEnabled: false,
    avatar: null,
  },
  setUserPreferences: prefsOrUpdater =>
    set(state => ({
      userPreferences:
        typeof prefsOrUpdater === 'function'
          ? prefsOrUpdater(state.userPreferences)
          : prefsOrUpdater,
    })),
});
⋮----
// BUG-02 fix: vault migrated from localStorage to encrypted IDB
```

## File: src/core/syncEngine.ts
```typescript
/**
 * syncEngine.ts — Supabase Realtime P2P sync
 *
 * REPLACES the PeerJS implementation entirely.
 * PeerJS relies on a public signaling server (0.peerjs.com) that is
 * frequently blocked in India and overloaded globally.
 *
 * Supabase Realtime uses WebSockets through our own Supabase project —
 * same domain, already authenticated, no third-party dependency.
 *
 * ARCHITECTURE:
 *   • Each SpendWise client joins a Supabase Realtime channel named
 *     "shared-wallet:{groupId}" when a group is selected.
 *   • Mutations are broadcast to all other clients in the same channel.
 *   • CRDT merge handles conflicts — same as before.
 *   • localPeerId is kept for backward compat (= Supabase socket ID).
 */
⋮----
import { STORAGE_KEYS } from '@/constants';
import { joinRoom, Room } from '@trystero-p2p/mqtt';
⋮----
export type SyncState = 'disconnected' | 'connecting' | 'connected';
⋮----
type DataCallback = (data: unknown) => void;
type StateCallback = (state: SyncState, peers: number) => void;
⋮----
class SyncEngine
⋮----
constructor()
⋮----
public init()
⋮----
public joinGroup(groupId: string)
⋮----
// ── Local Cross-Tab Sync via BroadcastChannel ──
⋮----
// Skip messages sent from ourselves
⋮----
// ── Global P2P Sync via MQTT WebRTC ──
⋮----
// Use secure WebSockets on public brokers for discovery/signaling with fallback support
⋮----
public broadcast(data: unknown)
⋮----
// 1. Broadcast globally via WebRTC
⋮----
// 2. Broadcast locally to other tabs
⋮----
public connect(_remotePeerId: string)
⋮----
public onData(cb: DataCallback)
⋮----
public onStateChange(cb: StateCallback)
⋮----
public get connectedPeers(): number
⋮----
private leaveChannel()
⋮----
private notifyState(state: SyncState)
```

## File: src/core/voiceCommands/commandParser.ts
```typescript
/**
 * Voice Command Parser — SpendWise Master Voice Engine
 *
 * Primary parsing is handled via Gemini (parseMasterVoiceWithGemini).
 * This file provides the fallback local parser and validation logic.
 */
⋮----
import { VoiceCommand, AppView } from '@/core/voiceCommands/types';
import { FALLBACK_PATTERNS } from '@/core/voiceCommands/fallbackPatterns';
⋮----
// ─── Indian Number Parser ─────────────────────────────────────────────────────
⋮----
export function parseIndianNumber(text: string): number | null
⋮----
// ─── Category Normalizer ──────────────────────────────────────────────────────
⋮----
export function normalizeCategory(raw: string): string
⋮----
// ─── Navigation Map ───────────────────────────────────────────────────────────
⋮----
// ─── Main Parser ──────────────────────────────────────────────────────────────
⋮----
/**
 * Validates that required entities are present.
 */
export function getMissingEntityPrompt(command: VoiceCommand): string | null
⋮----
/** True if this command should require explicit confirmation */
export function requiresConfirmation(command: VoiceCommand): boolean
⋮----
/** Fallback local regex parser */
export function parseVoiceCommand(transcript: string): VoiceCommand
```

## File: src/core/voiceCommands/commandRouter.ts
```typescript
/**
 * Voice Command Router — SpendWise Master Voice Engine
 *
 * Routes parsed VoiceCommand objects to the correct Zustand store actions.
 * Handles all intents: budget updates, transactions, liabilities, portfolio,
 * goals, subscriptions, navigation, and PDF report export.
 */
⋮----
import { VoiceCommand, CommandResult } from '@/core/voiceCommands/types';
import { AppView } from '@/types';
import { IntentHandler } from './handlers/types';
⋮----
// Map of intents to their respective handlers
⋮----
// Navigation & UI
⋮----
// Queries
⋮----
// Transactions
⋮----
// Budgets
⋮----
// Liabilities
⋮----
// Portfolio
⋮----
// Goals
⋮----
// Subscriptions
⋮----
// Gamification (Quests)
⋮----
// Parental & Settings
⋮----
/**
 * Execute a parsed VoiceCommand against the Zustand store.
 * Returns a CommandResult with success status and user-facing message.
 */
export async function executeCommand(
  command: VoiceCommand,
  navigate: (view: AppView) => void,
  onExport: () => void,
  toggleTheme: () => void,
  setSearchQuery?: (q: string) => void
): Promise<CommandResult>
⋮----
// Fallback for unknown intents
```

## File: src/core/voiceCommands/fallbackPatterns.ts
```typescript
/**
 * Fallback Patterns — SpendWise Master Voice Engine
 *
 * Contains regex patterns for local command parsing when Gemini is unavailable.
 */
⋮----
import { VoiceIntent, VoiceEntities, AppView } from '@/core/voiceCommands/types';
⋮----
// Utility for Indian Number Parsing and Category normalization is still in main commandParser.ts
// We import them from there in the actual implementation, but here we define the patterns.
⋮----
export interface Pattern {
  intent: VoiceIntent;
  regex: RegExp;
  extract: (match: RegExpMatchArray, transcript: string, helpers: { today: string; currency: string; normalizeCategory: (cat: string) => string; parseIndianNumber: (s: string) => number | null; NAV_MAP: Record<string, AppView> }) => VoiceEntities;
  summarize: (entities: VoiceEntities) => string;
  confidence: number;
}
⋮----
// ── HELP ───────────────────────────────────────────────────────────────────
⋮----
// ── REPORT EXPORT ───────────────────────────────────────────────────────────
⋮----
// ── QUERY REPORT ────────────────────────────────────────────────────────────
⋮----
// ── BUDGET UPDATE ───────────────────────────────────────────────────────────
⋮----
// Matches "set budget for food to 500" OR "500 on budget for food" OR "burget 500 for food"
⋮----
// Avoid capturing the action verb as category
⋮----
// ── TRANSACTION ADD ─────────────────────────────────────────────────────────
⋮----
// Now even more flexible: matches "200 on food" or "paid 200" or "food 200"
⋮----
// ── UNDO LAST COMMAND ────────────────────────────────────────────────────────
⋮----
// ── NAVIGATE ────────────────────────────────────────────────────────────────
⋮----
// ── SETTINGS TOGGLE ────────────────────────────────────────────────────────
```

## File: src/core/voiceCommands/handlers/assetHandlers.ts
```typescript
import { useStore } from '@/store';
import { IntentHandler, formatCurrency, shortId, todayISO } from './types';
import { Transaction } from '@/types';
⋮----
// LIABILITY HANDLERS
export const handleLiabilityAdd: IntentHandler = (
⋮----
export const handleLiabilityPay: IntentHandler = (
⋮----
export const handleLiabilityDelete: IntentHandler = (
⋮----
// PORTFOLIO HANDLERS
export const handlePortfolioUpdate: IntentHandler = (
⋮----
export const handlePortfolioAdjust: IntentHandler = (
⋮----
export const handlePortfolioDelete: IntentHandler = (
⋮----
// GOAL HANDLERS
export const handleGoalAdd: IntentHandler = (
⋮----
export const handleGoalUpdate: IntentHandler = (
⋮----
export const handleGoalDelete: IntentHandler = (
```

## File: src/core/voiceCommands/handlers/budgetHandlers.ts
```typescript
import { useStore } from '@/store';
import { Category } from '@/types';
import { IntentHandler, formatCurrency } from './types';
⋮----
export const handleBudgetUpdate: IntentHandler = (
⋮----
export const handleBudgetDelete: IntentHandler = (
⋮----
export const handleBudgetReset: IntentHandler = () =>
⋮----
export const handleBudgetSettingsUpdate: IntentHandler = (
```

## File: src/core/voiceCommands/handlers/navigationHandlers.ts
```typescript
import { IntentHandler } from './types';
import { useStore } from '@/store';
import { AppView } from '@/types';
⋮----
export const handleNavigate: IntentHandler = (
⋮----
export const handleSearchAction: IntentHandler = (
⋮----
export const handleReportExport: IntentHandler = (
⋮----
export const handleHelp: IntentHandler = () =>
⋮----
export const handleUndoAction: IntentHandler = () =>
⋮----
export const handleQuestAction: IntentHandler = (
⋮----
export const handleQuestClaim: IntentHandler = (
```

## File: src/core/voiceCommands/handlers/queryHandlers.ts
```typescript
import { IntentHandler, formatCurrency, todayISO } from './types';
import { useStore } from '@/store';
⋮----
export const handleDataQuery: IntentHandler = (
⋮----
export const handleQueryReport: IntentHandler = (
```

## File: src/core/voiceCommands/handlers/settingsHandlers.ts
```typescript
import { IntentHandler, formatCurrency } from './types';
import { useStore } from '@/store';
import { Category } from '@/types';
⋮----
export const handleSettingsToggle: IntentHandler = (
⋮----
export const handleParentalToggle: IntentHandler = (
⋮----
export const handleParentalLimitSet: IntentHandler = (
⋮----
export const handleParentalRestrictCategory: IntentHandler = (
⋮----
export const handleParentalApproveTx: IntentHandler = (
⋮----
export const handleParentalDenyTx: IntentHandler = (
⋮----
export const handleSessionLock: IntentHandler = () =>
```

## File: src/core/voiceCommands/handlers/subscriptionHandlers.ts
```typescript
import { IntentHandler, formatCurrency, todayISO } from './types';
import { useStore } from '@/store';
⋮----
export const handleSubscriptionAdd: IntentHandler = (
⋮----
export const handleSubscriptionUpdate: IntentHandler = (
⋮----
export const handleSubscriptionDelete: IntentHandler = (
```

## File: src/core/voiceCommands/handlers/transactionHandlers.ts
```typescript
import { useStore } from '@/store';
import { Transaction, Category } from '@/types';
import { IntentHandler, formatCurrency, shortId, todayISO, yesterdayISO } from './types';
⋮----
export const handleTransactionAdd: IntentHandler = (
⋮----
export const handleTransactionDelete: IntentHandler = (
⋮----
export const handleTransactionUpdate: IntentHandler = (
⋮----
export const handleBatchTransactions: IntentHandler = (
⋮----
export const handleTransactionBulkDelete: IntentHandler = (
⋮----
export const handleTransactionBulkUpdate: IntentHandler = (
⋮----
export const handleRecurringAdd: IntentHandler = (
⋮----
export const handleRecurringDelete: IntentHandler = (
```

## File: src/core/voiceCommands/tts.ts
```typescript
/**
 * Text-to-Speech utility — SpendWise Voice Engine
 * Wraps the Web Speech Synthesis API for result readback.
 * Uses Indian English voice preference when available.
 */
⋮----
function loadVoice()
⋮----
// Prefer en-IN, then en-GB, then any English
⋮----
// Voices load asynchronously on first call
⋮----
export function speak(text: string, options?:
⋮----
// Cancel any pending speech
⋮----
export function cancelSpeech()
```

## File: src/core/voiceCommands/types.ts
```typescript
/**
 * Voice Command Types — SpendWise Master Voice Engine
 * Defines all intents, entities, and result structures.
 */
⋮----
export type VoiceIntent =
  | 'BUDGET_UPDATE'
  | 'BUDGET_DELETE'
  | 'BUDGET_RESET'
  | 'BUDGET_SETTINGS_UPDATE'
  | 'TRANSACTION_ADD'
  | 'TRANSACTION_UPDATE'
  | 'TRANSACTION_DELETE'
  | 'LIABILITY_ADD'
  | 'LIABILITY_PAY'
  | 'LIABILITY_DELETE'
  | 'PORTFOLIO_UPDATE'
  | 'PORTFOLIO_ADJUST'
  | 'PORTFOLIO_DELETE'
  | 'GOAL_ADD'
  | 'GOAL_UPDATE'
  | 'GOAL_DELETE'
  | 'SUBSCRIPTION_ADD'
  | 'SUBSCRIPTION_UPDATE'
  | 'SUBSCRIPTION_DELETE'
  | 'RECURRING_ADD'
  | 'RECURRING_DELETE'
  | 'REPORT_EXPORT'
  | 'QUERY_REPORT'
  | 'BATCH_TRANSACTIONS'
  | 'TRANSACTION_BULK_DELETE'
  | 'TRANSACTION_BULK_UPDATE'
  | 'SETTINGS_TOGGLE'
  | 'PARENTAL_TOGGLE'
  | 'PARENTAL_LIMIT_SET'
  | 'PARENTAL_RESTRICT_CATEGORY'
  | 'PARENTAL_APPROVE_TX'
  | 'PARENTAL_DENY_TX'
  | 'SESSION_LOCK'
  | 'DATA_QUERY'
  | 'QUEST_ACTION'
  | 'QUEST_CLAIM'
  | 'SEARCH_ACTION'
  | 'NAVIGATE'
  | 'UNDO_ACTION'
  | 'HELP'
  | 'UNKNOWN';
⋮----
export type AppView =
  | 'dashboard'
  | 'analytics'
  | 'budget'
  | 'goals'
  | 'shared'
  | 'history'
  | 'sync'
  | 'profile'
  | 'portfolio'
  | 'subscriptions';
⋮----
export interface VoiceEntities {
  category?: string; // "food", "transport", "fuel"
  amount?: number; // 1200, 200000
  targetAmount?: number; // for goal deposits, liability payments
  previousAmount?: number; // for "from X to Y" patterns
  name?: string; // merchant, liability name, goal name
  period?: string; // "yesterday", "today", "this month"
  ticker?: string; // investment name / symbol
  view?: AppView; // for navigation commands
  frequency?: 'daily' | 'weekly' | 'monthly' | 'annual';
  type?: 'debit' | 'credit';
  items?: Array<{ amount?: number; category?: string; name?: string }>; // for batching
  settingKey?: string; // "dark mode", "privacy", "currency"
  settingValue?: string; // "on", "off", "usd", "inr"
  searchQuery?: string; // "rent", "starbucks"
  actionType?: string; // "start", "check", "claim"
}
⋮----
category?: string; // "food", "transport", "fuel"
amount?: number; // 1200, 200000
targetAmount?: number; // for goal deposits, liability payments
previousAmount?: number; // for "from X to Y" patterns
name?: string; // merchant, liability name, goal name
period?: string; // "yesterday", "today", "this month"
ticker?: string; // investment name / symbol
view?: AppView; // for navigation commands
⋮----
items?: Array<{ amount?: number; category?: string; name?: string }>; // for batching
settingKey?: string; // "dark mode", "privacy", "currency"
settingValue?: string; // "on", "off", "usd", "inr"
searchQuery?: string; // "rent", "starbucks"
actionType?: string; // "start", "check", "claim"
⋮----
export interface VoiceCommand {
  intent: VoiceIntent;
  entities: VoiceEntities;
  confidence: number; // 0–1
  rawTranscript: string;
  summary: string; // human-readable description of action
}
⋮----
confidence: number; // 0–1
⋮----
summary: string; // human-readable description of action
⋮----
export interface CommandResult {
  success: boolean;
  message: string;
  undoable?: boolean;
}
```

## File: src/data/currencies.ts
```typescript

```

## File: src/features/advisor/components/ChatInput.tsx
```typescript
import React from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
⋮----
interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  isListening: boolean;
  toggleListening: () => void;
  isLoading: boolean;
  dynamicQuickActions: string[];
}
⋮----
setInput(action);
⋮----
{/* Voice Listening Overlay */}
⋮----
onChange=
⋮----
onClick=
```

## File: src/features/advisor/components/ChatMessageList.tsx
```typescript
import React, { memo, useCallback, useRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Bot, User, Zap } from 'lucide-react';
import { Message } from '../types';
import { AppView } from '@/types';
import { CurrencyCode } from '@/contexts/CurrencyContext';
⋮----
// eslint-disable-next-line react-refresh/only-export-components
⋮----
const handleNavigate = useCallback((v: AppView)
⋮----

⋮----
<button onClick=
```

## File: src/features/ai/parsers/common.ts
```typescript
import { Category } from '@/types';
⋮----
// ─── Merchant → Category map ────────────────────────────────────────────────
⋮----
// ── Transport ─────────────────────────────────────────────────────────────
⋮----
// ── Travel (Tourist Places, Hotels, etc.) ──────────────────────────────────
⋮----
// ── Shopping ──────────────────────────────────────────────────────────────
⋮----
// ── Subscriptions & Telecom ───────────────────────────────────────────────
⋮----
// ── Entertainment & Movies ────────────────────────────────────────────────
⋮----
// ── Utilities & Bills ─────────────────────────────────────────────────────
⋮----
// ── Health, Medical & Pharmacy ──────────────────────────────────────────
⋮----
// ── Income ────────────────────────────────────────────────────────────────
⋮----
// ── Education ──────────────────────────────────────────────────────────────
⋮----
// ─── Regex patterns for high-specificity matching ────────────────────────────
⋮----
export function inferCategory(text: string): Category
⋮----
// 1. Food regex patterns — catches dish names
⋮----
// 2. Transport regex patterns — catches operator codes
⋮----
// 3. Travel regex patterns
⋮----
// 4. Medical regex patterns
⋮----
// 5. Full keyword map — substring match
⋮----
// 4. Smart fallback — if no shopping signals present, lean toward Food
⋮----
export function inferType(text: string, amount?: number): 'credit' | 'debit'
⋮----
export function toTitleCase(str: string): string
```

## File: src/features/ai/parsers/nlp.ts
```typescript
import { callGemini } from '@/core/api/gemini';
import { Category } from '@/types';
⋮----
export interface AIParseResult {
  merchant: string;
  category: Category;
  amount?: number;
  date?: string;
  type?: 'credit' | 'debit';
  confidence: number;
}
⋮----
/**
 * Uses Gemini AI (if key present) or local heuristics to analyze a transaction string.
 * Supports extracting multiple transactions from a single sentence (e.g., "500 on food 700 on travel 800 on subscription").
 */
export async function processNaturalLanguageExpense(
  text: string,
  currencyContext?: string
): Promise<AIParseResult[] | null>
⋮----
// Helper functions
const toTitleCase = (str: string)
⋮----
const expandIndianShorthand = (t: string) =>
⋮----
// Separate attached currencies so \b boundaries work correctly (e.g. "500usd" -> "500 usd")
⋮----
// Local Heuristics Fallback for multiple items (Highly advanced tokenizer)
⋮----
// Find all number occurrences in the text (e.g., 500, 700, 1,200.50)
⋮----
// Helper to determine credit and category
const analyzeItem = (
    desc: string,
    _fullText: string
):
⋮----
// Check explicit debit categories first
⋮----
// Explicit credit keywords that guarantee credit
⋮----
// Ambiguous credit keywords (got, get, received, win, won, gain, profit, gift)
// If these exist AND no debit category matched, it's credit/income! E.g. "I got 2000 rs"
⋮----
// Explicit debit keywords
⋮----
// Assign final category
⋮----
// We have multiple numbers! Determine if it's Amount-First or Description-First
⋮----
// Single number or fallback splitting by "and", "&", ",", ";", "+"
```

## File: src/features/ai/parsers/ocr.ts
```typescript
import { Transaction } from '@/types';
import { inferCategory, MERCHANT_CATEGORY_MAP } from '@/features/ai/parsers/common';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export async function recognizeReceipt(imageBase64: string): Promise<string>
⋮----
// Optional progress logging
⋮----
interface SplitItem {
  label: string;
  amount: number;
  category: string;
}
⋮----
export function parseOfflineReceipt(rawText: string): Partial<Transaction> &
⋮----
// 1. Find Total Amount (Prioritize "total" over "subtotal")
⋮----
// Check for line items
⋮----
// 2. Find Merchant (Skip address, phone, and store metadata lines)
⋮----
// 3. Find Category
⋮----
// Final check against merchant category map
```

## File: src/features/ai/parsers/voice.ts
```typescript
import { Category } from '@/types';
import { Transaction } from '@/types';
⋮----
export function parseVoiceLocally(transcript: string, date: string): Partial<Transaction>
⋮----
// Extract amount
⋮----
// Extract category
⋮----
// Extract merchant - very simple logic
```

## File: src/features/analytics/components/AnalyticsPrimitives.tsx
```typescript
/** Shared chart tooltip for bar/line charts */
export function ChartTooltip({
  active,
  payload,
  label,
  currency = '$',
}: {
  active?: boolean;
  payload?: unknown[];
  label?: string;
  currency?: string;
})
⋮----
/** Savings-specific tooltip */
export function SavingsTooltip({
  active,
  payload,
  label,
  currency = '$',
}: {
  active?: boolean;
  payload?: unknown[];
  label?: string;
  currency?: string;
})
⋮----
/** Mini KPI card */
```

## File: src/features/analytics/components/CashFlowWaterfall.tsx
```typescript
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Activity } from 'lucide-react';
```

## File: src/features/analytics/components/HealthIndexCard.tsx
```typescript
import { motion } from 'framer-motion';
import { ShieldCheck, Info } from 'lucide-react';
⋮----
interface HealthResult {
  score: number;
  grade: string;
  color: string;
  breakdown: Record<string, number>;
  recommendations: string[];
}
⋮----
{/* Gauge */}
```

## File: src/features/analytics/components/IncomeExpensesChart.tsx
```typescript
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { MonthlyHistoryPoint } from '@/types';
import { ChartTooltip } from '@/features/analytics/components/AnalyticsPrimitives';
⋮----
interface IncomeExpensesChartProps {
  monthlyHistory: MonthlyHistoryPoint[];
  currency: string;
}
```

## File: src/features/analytics/components/PeerComparison.tsx
```typescript
import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Users } from 'lucide-react';
import { CategorySpend } from '@/types';
⋮----
// Stable hash-based pseudo-random number generator
function seededRandom(seed: number): () => number
```

## File: src/features/analytics/components/SavingsTrendChart.tsx
```typescript
import {
  LineChart,
  Line,
  ReferenceLine,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MonthlyHistoryPoint } from '@/types';
import { SavingsTooltip } from '@/features/analytics/components/AnalyticsPrimitives';
⋮----
interface SavingsTrendChartProps {
  monthlyHistory: MonthlyHistoryPoint[];
  currency: string;
  latestMonth: MonthlyHistoryPoint | null;
}
```

## File: src/features/analytics/components/TaxPredictor.tsx
```typescript
import React from 'react';
import { CategorySpend } from '@/types';
⋮----
interface TaxPredictorProps {
  income: number;
  categorySpending: CategorySpend[];
  currency: string;
}
⋮----
// Simple progressive tax simulation (e.g., 10% up to 50k, 20% up to 100k, 30% above)
const calculateTax = (amt: number) =>
⋮----
// Identify deductible spending (e.g., Health, Charities - simulated)
```

## File: src/features/analytics/components/TopMerchants.tsx
```typescript
import { Store } from 'lucide-react';
import { Transaction } from '@/types';
⋮----
interface Props {
  transactions: Transaction[];
  currency: string;
}
```

## File: src/features/analytics/insights/advisor.ts
```typescript
/**
 * advisor.ts — Greatly Improved SpendWise AI Advisor
 *
 * Improvements over original:
 *  1. Multi-turn conversation context — Gemini receives the last 6 messages
 *     so follow-up questions ("why?" "what should I cut?") work correctly.
 *  2. Full financial briefing sent to Gemini — not just totals, but category
 *     breakdown, top merchants, month-over-month trend, savings rate trend,
 *     subscription burn, and anomaly flag count.
 *  3. Proactive nudge engine — returns a nudge string when urgent conditions
 *     are met (over-budget, goal falling behind, streak at risk, large anomaly).
 *  4. Spending personality — 7 archetypes with 7-day challenges.
 *  5. Local fallback is now a full rule engine (20+ rules) that covers all
 *     common financial question types with specific, data-driven answers.
 *  6. Action tags extended: ADD_TRANSACTION, VIEW_BUDGET, VIEW_GOALS,
 *     VIEW_SUBSCRIPTIONS, VIEW_HISTORY, EXPORT_REPORT added.
 */
⋮----
import { callGemini } from '@/core/api/gemini';
import { Transaction } from '@/types';
⋮----
// ─── Types ────────────────────────────────────────────────────────────────────
⋮----
export interface ConversationMessage {
  role: 'user' | 'model';
  content: string;
}
⋮----
export interface FinancialBriefing {
  totalIncome: number;
  totalSpent: number;
  net: number;
  savingsRate: number;
  topCategories: { name: string; amount: number; percent: number }[];
  topMerchants: { name: string; amount: number }[];
  subscriptionTotal: number;
  transactionCount: number;
  avgDailySpend: number;
  largestExpense: { merchant: string; amount: number; category: string } | null;
  unusualCount: number; // anomaly count
  monthLabel: string;
}
⋮----
unusualCount: number; // anomaly count
⋮----
export interface GeneratedQuest {
  id: string;
  title: string;
  description: string;
  reward: string;
  type: 'category' | 'uncategorized' | 'budget' | 'streak' | 'savings' | 'logging';
  completed: boolean;
}
⋮----
export interface SpendingPersonalityResult {
  archetype: string;
  emoji: string;
  description: string;
  challenge: string;
  tip: string;
}
⋮----
// ─── Financial Briefing Builder ───────────────────────────────────────────────
⋮----
export function buildBriefing(transactions: Transaction[], _currency = '₹'): FinancialBriefing
⋮----
// Use all transactions (not just this month) for richer context
⋮----
// Category breakdown
⋮----
// Top merchants
⋮----
// Subscription spend
⋮----
// Daily average (last 30 days)
⋮----
// Largest single expense
⋮----
unusualCount: 0, // caller can pass actual anomaly count if available
⋮----
// ─── System Prompt Builder ────────────────────────────────────────────────────
⋮----
function buildSystemPrompt(briefing: FinancialBriefing, currency: string): string
⋮----
// ─── Main Advisor Function ────────────────────────────────────────────────────
⋮----
/**
 * getFinancialAdvice
 * @param query        - The user's current message
 * @param transactions - All transactions
 * @param history      - Previous messages in the conversation (for multi-turn context)
 * @param currency     - Currency symbol (default ₹)
 */
export async function getFinancialAdvice(
  query: string,
  transactions: Transaction[],
  history: ConversationMessage[] = [],
  currency = '₹'
): Promise<string>
⋮----
// ── Try Gemini with full conversation context ─────────────────────
⋮----
// Build multi-turn contents array
⋮----
// Keep last 6 messages for context (3 user + 3 model turns)
⋮----
// Inject system context as the first user turn + model acknowledgement
⋮----
// Current user message
⋮----
// Pass system instruction via system_instruction field (Gemini 2.0 supports this)
⋮----
// Fall through to local engine
⋮----
// ── Local rule-based fallback (20+ rules) ────────────────────────
⋮----
// ─── Local Advisor (Full Rule Engine) ────────────────────────────────────────
⋮----
function localAdvisor(query: string, b: FinancialBriefing, currency: string): string
⋮----
const C = (v: number) => `$
⋮----
// Guard: no data
⋮----
// ── Topic detection ───────────────────────────────────────────────
⋮----
// Budget / deficit
⋮----
// Savings / save more
⋮----
// Spending breakdown / where did my money go
⋮----
// Largest expense
⋮----
// Subscriptions
⋮----
// Health score / financial health
⋮----
// Income
⋮----
// Export / report
⋮----
// Goals
⋮----
// Anomaly / unusual
⋮----
// Merchant-specific questions
⋮----
// EMI / loan / debt
⋮----
// Tax
⋮----
// Advice / tips / help
⋮----
// Non-finance question guard
⋮----
// General catch-all
⋮----
// ─── Proactive Nudge Engine ───────────────────────────────────────────────────
⋮----
export interface ProactiveNudge {
  message: string;
  action: string;
  urgency: 'low' | 'medium' | 'high';
}
⋮----
/**
 * Returns the single most urgent nudge, or null if everything is fine.
 * Call this on dashboard load to surface a contextual alert strip.
 */
export function getProactiveNudge(
  transactions: Transaction[],
  budgets: Record<string, { limit: number; spent: number }>,
  goals: { name: string; savedAmount: number; targetAmount: number; targetDate: string }[],
  streak: number,
  currency = '₹'
): ProactiveNudge | null
⋮----
// 1. Critical deficit
⋮----
// 2. Budget nearly exceeded (>90%)
⋮----
// 3. Goal falling behind
⋮----
// 4. Streak at risk (no transaction logged today)
⋮----
// 5. High subscription spend (>15% of income)
⋮----
return null; // All good — show nothing
⋮----
// ─── Spending Personality ─────────────────────────────────────────────────────
⋮----
export function getSpendingPersonality(
  transactions: Transaction[],
  currency = '₹'
): SpendingPersonalityResult
⋮----
// Not enough data
⋮----
// Personality detection logic
⋮----
// ─── Quest Generator (unchanged from original, kept here for co-location) ─────
⋮----
export function generateQuests(transactions: Transaction[], currency = '₹'): GeneratedQuest[]
```

## File: src/features/analytics/insights/anomaly.ts
```typescript
import { Transaction } from '@/types/finance';
⋮----
export interface AnomalyResult {
  transaction: Transaction;
  reason: string;
  zScore: number;
}
⋮----
export function detectAnomalies(transactions: Transaction[]): AnomalyResult[]
⋮----
// Group by category
⋮----
if (txs.length < 3) return; // Need at least 3 to calculate stdDev meaningfully
⋮----
// If amount is > mean + 2*stdDev AND amount > 2 * mean (to avoid flagging small variations)
⋮----
// Sort by Z-score descending
```

## File: src/features/analytics/insights/forecast.ts
```typescript
import { Transaction, Category } from '@/types';
⋮----
export interface CategoryForecast {
  category: Category;
  avgMonthly: number;
  lastMonth: number;
  predicted: number;
  trend: 'up' | 'down' | 'stable';
  trendPct: number;
}
⋮----
export interface SpendingForecast {
  predictedTotal: number;
  predictedIncome: number;
  predictedSavings: number;
  categoryForecasts: CategoryForecast[];
  confidence: 'high' | 'medium' | 'low';
  confidenceReason: string;
  daysRemaining: number;
  spentSoFar: number;
  runRate: number; // projected spend if current rate continues
}
⋮----
runRate: number; // projected spend if current rate continues
⋮----
/**
 * Pure local forecast — zero API calls.
 * Uses a simple weighted average (recent months weigh more)
 * and a "burn rate" extrapolation for the current month.
 */
export function forecastNextMonth(
  transactions: Transaction[],
  referenceDate: Date = new Date()
): SpendingForecast
⋮----
// Group transactions by YYYY-MM
⋮----
// Sort months ascending, exclude current month from historical average
⋮----
const months = historicalMonths.slice(-6); // last 6 completed months
⋮----
// Weighted average (last month = 3x, second to last = 2x, rest = 1x)
⋮----
// Per-category weighted averages
⋮----
// Pad shorter arrays with 0
⋮----
// Build category forecasts
⋮----
// Sort by predicted spend descending
⋮----
// Income forecast from historical credit months
⋮----
// Current month spending (so far)
⋮----
// Run-rate: if we continue spending at current pace (with minimum telemetry guard of 5 days)
⋮----
// Graceful fallback to predicted total if historical data is available, otherwise simple projection
```

## File: src/features/analytics/insights/healthScore.ts
```typescript
import { Transaction, CategorySpend, MonthlyStats } from '@/types';
⋮----
export interface HealthScoreResult {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  breakdown: {
    savings: number; // 0-100
    stability: number; // 0-100
    discipline: number; // 0-100
    emergency: number; // 0-100
  };
  recommendations: string[];
}
⋮----
savings: number; // 0-100
stability: number; // 0-100
discipline: number; // 0-100
emergency: number; // 0-100
⋮----
export function calculateHealthScore(
  transactions: Transaction[],
  monthlyStats: MonthlyStats,
  categorySpending: CategorySpend[],
  currentBalance: number
): HealthScoreResult
⋮----
// 1. Savings Rate Score (40% weight)
// Target: 20% or more savings rate
⋮----
// 2. Stability Score (30% weight)
// Variability in spending week over week (simulated or based on history)
// For now, use daily spend rate vs balance
⋮----
const stabilityScore = Math.min(100, (daysOfRunway / 90) * 100); // 90 days of runway = 100%
⋮----
// 3. Discipline Score (20% weight)
// Ratio of needs vs wants (Wants: Entertainment, Travel, Dining)
⋮----
// Target: Wants < 30% of total spending
⋮----
// 4. Emergency Fund Score (10% weight)
// Target: 3 months of average monthly expenses
⋮----
// Final Weighted Score
⋮----
recommendations: recommendations.slice(0, 2), // Top 2 recommendations
```

## File: src/features/auth/AuthView.tsx
```typescript
import { useState } from 'react';
import {
  Mail,
  Lock,
  Wallet,
  ArrowRight,
  Loader2,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Star,
  ChevronRight,
} from 'lucide-react';
import { ChildQRScanner } from '@/features/parental/components/ChildQRScanner';
import { useAuth } from '@/hooks/useAuth';
import { STORAGE_KEYS } from '@/constants';
⋮----
// ── Feature list shown on left panel ────────────────────────────
⋮----
// ── Main component ───────────────────────────────────────────────
⋮----
const handleSubmit = async (e: React.FormEvent) =>
⋮----
const handleChildScanSuccess = (parentId: string) =>
⋮----
/* ignore */
⋮----
const switchMode = () =>
```

## File: src/features/budget/components/BudgetAlertToast.tsx
```typescript
import { useEffect, useRef } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
⋮----
interface BudgetAlertToastProps {
  currency?: string;
}
⋮----
const ALERT_KEY = (cat: string, level: '80' | '100')
⋮----
function getContainer()
⋮----
function showToast(message: string, color: string, icon: string)
⋮----
// Inject keyframe once
⋮----
function escapeHtml(str: string): string
⋮----
export function BudgetAlertToast(
⋮----
/* ignore */
⋮----
/* ignore */
⋮----
return null; // Renders toasts imperatively via DOM
```

## File: src/features/budget/components/BudgetCategoryCard.tsx
```typescript
import { motion } from 'framer-motion';
import { Target, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Category, Budget } from '@/types';
⋮----
interface BudgetCategoryCardProps {
  b: Budget;
  currency: string;
  onEdit: (category: Category, limit: string) => void;
  onRemove: (category: Category) => void;
}
⋮----
onClick=
```

## File: src/features/budget/components/BudgetManager.tsx
```typescript
import {
  Target,
  TrendingUp,
  RotateCcw,
  RefreshCw,
  Shield,
  X,
  Tag as TagIcon,
  Calendar,
  Plus,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Budget, BudgetPeriod, Category, Transaction, BudgetSuggestion } from '@/types';
import { useBudgetManager } from '@/features/budget/hooks/useBudgetManager';
import { PeriodSelector } from '@/features/budget/components/PeriodSelector';
import { RolloverToggle } from '@/features/budget/components/RolloverToggle';
import { BudgetSummaryBar } from '@/features/budget/components/BudgetSummaryBar';
import { BudgetRow } from '@/features/budget/components/BudgetRow';
⋮----
interface BudgetManagerProps {
  budgets: Budget[];
  totalBudgeted: number;
  totalSpentAgainstBudget: number;
  overBudgetCount: number;
  period: BudgetPeriod;
  periodLabel: string;
  rolloverEnabled: boolean;
  onUpdateLimit: (category: Category, limit: number) => void;
  onDeleteLimit: (category: Category) => void;
  onResetLimits: () => void;
  onChangePeriod: (p: BudgetPeriod) => void;
  onToggleRollover: () => void;
  onManageCategories?: () => void;
  currency?: string;
  transactions?: Transaction[];
}
⋮----
export default function BudgetManager({
  budgets,
  totalBudgeted,
  totalSpentAgainstBudget,
  overBudgetCount,
  period,
  periodLabel,
  rolloverEnabled,
  onUpdateLimit,
  onDeleteLimit,
  onResetLimits,
  onChangePeriod,
  onToggleRollover,
  onManageCategories,
  currency = '$',
  transactions = [],
}: BudgetManagerProps)
⋮----
{/* Page Header */}
⋮----
{/* Controls */}
⋮----
{/* Period selector */}
⋮----
{/* Rollover toggle */}
⋮----
{/* Add Budget button */}
⋮----
{/* Categories button */}
⋮----
{/* Reset */}
⋮----
{/* ── AI Budget Suggestions ───────────────────────────────── */}
⋮----
{/* ── Add Budget Form Panel ───────────────────────────────── */}
⋮----
setShowAddForm(false);
setAddCategory('');
setAddLimit('');
⋮----
onClick=
⋮----
{/* Period tip (when rollover is off) */}
⋮----
{/* Summary */}
⋮----
{/* Empty state */}
⋮----
{/* Budget grid */}
```

## File: src/features/budget/components/BudgetRow.tsx
```typescript
import { useState, useCallback, memo } from 'react';
import { AlertTriangle, CheckCircle2, Edit3, RefreshCw, Link } from 'lucide-react';
import { Budget, Category } from '@/types';
import { useCategories } from '@/hooks/useCategories';
⋮----
type BudgetStatus = 'safe' | 'warning' | 'danger';
```

## File: src/features/budget/components/BudgetSummary.tsx
```typescript
import { motion } from 'framer-motion';
⋮----
interface BudgetSummaryProps {
  currency: string;
  totalBudgeted: number;
  overallBudgetPercent: number;
}
```

## File: src/features/budget/components/BudgetSummaryBar.tsx
```typescript
import { Shield, RefreshCw, AlertTriangle, Flame, Star, Award } from 'lucide-react';
import { Budget } from '@/types';
⋮----
// Gamification Milestones
⋮----
{/* Gamification Badges */}
```

## File: src/features/budget/components/BudgetSummaryMobile.tsx
```typescript
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
⋮----
interface BudgetSummaryMobileProps {
  currency: string;
  totalBudgeted: number;
  overallBudgetPercent: number;
}
⋮----
{/* Abstract background shapes */}
```

## File: src/features/budget/components/PeriodSelector.tsx
```typescript
import { BudgetPeriod } from '@/types';
```

## File: src/features/budget/components/RolloverToggle.tsx
```typescript
import { RefreshCw } from 'lucide-react';
```

## File: src/features/budget/components/SmartBudgetSuggestions.tsx
```typescript
import { useState, useMemo } from 'react';
import { Lightbulb, X, Check, TrendingDown } from 'lucide-react';
import { Transaction, Category } from '@/types';
⋮----
interface SmartBudgetSuggestionsProps {
  transactions: Transaction[];
  existingBudgets: Record<string, number>;
  onAccept: (category: Category, amount: number) => void;
  currency?: string;
}
⋮----
interface Suggestion {
  category: Category;
  avgMonthlySpend: number;
  suggestedLimit: number;
  months: number;
}
⋮----
// Group debit transactions by category and month
⋮----
// Aggregate avg spend per category across months
⋮----
.filter(([cat]) => !existingBudgets[cat]) // only suggest for unbudgeted categories
⋮----
// Suggest ~10% below avg to encourage saving
⋮----
.filter(s => s.months >= 1 && s.avgMonthlySpend > 200) // only meaningful categories
⋮----
onAccept(s.category, s.suggestedLimit);
setAccepted(prev
```

## File: src/features/budget/insights/budgetSuggestions.ts
```typescript
import { Transaction, BudgetSuggestion } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
/**
 * Analyzes last 3 months of spending to suggest smart budget limits.
 * Applies the 110% rule: suggest 10% buffer above average for most categories,
 * or 90% for categories that look reducible.
 */
export function generateBudgetSuggestions(transactions: Transaction[]): BudgetSuggestion[]
⋮----
// Group by category
⋮----
const month = t.date.slice(0, 7); // YYYY-MM
⋮----
// Need at least 2 months of data or 3+ transactions for confidence
⋮----
// Essentials: set exact average (can't really cut these)
⋮----
// Discretionary: suggest 90% of average to encourage reduction
⋮----
// Others: 110% buffer
⋮----
suggestedLimit: Math.max(suggestedLimit, 100), // minimum ₹100
⋮----
// Sort by avg spend descending
```

## File: src/features/dashboard/components/AIInsights.tsx
```typescript
import { BrainCircuit, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
⋮----
interface AIInsightsProps {
  insights: {
    topCat: [string, number] | undefined;
    topCatChange: number | null;
    savingsRate: number;
    totalExpensesChange: number | null;
  };
  transactionsCount: number;
  currency: string;
}
```

## File: src/features/dashboard/components/ChartTooltip.tsx
```typescript
interface TooltipPayloadEntry {
  dataKey: string;
  color: string;
  name: string;
  value: number;
}
⋮----
export interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  currency: string;
}
⋮----
export function ChartTooltip(
```

## File: src/features/dashboard/components/DashboardHeader.tsx
```typescript
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
⋮----
interface DashboardHeaderProps {
  config: SpendWiseConfig | null;
  isMobile: boolean;
  streak: number;
}
```

## File: src/features/dashboard/components/DashboardHero.tsx
```typescript
import React from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import DashboardHeroDesktop from '@/features/dashboard/components/DashboardHeroDesktop';
import DashboardHeroMobile from '@/features/dashboard/components/DashboardHeroMobile';
import { MonthlyStats, BalanceDataPoint } from '@/types';
⋮----
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
⋮----
export default function DashboardHero(props: DashboardHeroProps)
```

## File: src/features/dashboard/components/MetricCards.tsx
```typescript
import { useIsMobile } from '@/hooks/useMediaQuery';
import MetricCardsDesktop from '@/features/dashboard/components/MetricCardsDesktop';
import MetricCardsMobile from '@/features/dashboard/components/MetricCardsMobile';
import { MonthlyStats } from '@/types';
⋮----
interface MetricCardsProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  projectionMeta: {
    daysLeftInMonth: number;
    dataQuality: 'low' | 'medium' | 'high';
    expectedChange: number;
  };
  monthlyStats: MonthlyStats;
  currency?: string;
  healthScore?: number;
}
⋮----
export default function MetricCards(props: MetricCardsProps)
```

## File: src/features/dashboard/components/MetricCardsDesktop.tsx
```typescript
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
} from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { MonthlyStats } from '@/types';
import { useStore } from '@/store';
⋮----
interface MetricCardsProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  projectionMeta: {
    daysLeftInMonth: number;
    dataQuality: 'low' | 'medium' | 'high';
    expectedChange: number;
  };
  monthlyStats: MonthlyStats;
  currency?: string;
  healthScore?: number;
}
```

## File: src/features/dashboard/components/MetricCardsMobile.tsx
```typescript
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
} from 'lucide-react';
import { MonthlyStats } from '@/types';
import { useStore } from '@/store';
⋮----
interface MetricCardsProps {
  currentBalance: number;
  predictedEndOfMonth: number;
  projectionMeta: {
    daysLeftInMonth: number;
    dataQuality: 'low' | 'medium' | 'high';
    expectedChange: number;
  };
  monthlyStats: MonthlyStats;
  currency?: string;
  healthScore?: number;
}
⋮----
// Keep subtext shorter for mobile
```

## File: src/features/dashboard/components/MobileBalanceHero.tsx
```typescript
import { TrendingDown, TrendingUp } from 'lucide-react';
⋮----
interface MobileBalanceHeroProps {
  currentBalance: number;
  currency: string;
  hideBalances: boolean;
  trendUp: boolean;
  monthlyIncome: number;
  monthlyExpenses: number;
}
⋮----
{/* Top row: label + trend */}
⋮----
{/* Balance numeral */}
⋮----
{/* Income / Spent chips */}
```

## File: src/features/dashboard/components/PremiumCard.tsx
```typescript
import { motion } from 'framer-motion';
⋮----
interface PremiumCardProps {
  currentBalance: number;
  currency: string;
}
⋮----
export default function PremiumCard(
⋮----
{/* Decorative shimmer */}
⋮----
{/* Decorative circles */}
```

## File: src/features/dashboard/components/QuickAddPanel.tsx
```typescript
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import MagicInput from '@/features/ai/components/MagicInput';
import { Transaction } from '@/types';
⋮----
interface QuickAddPanelProps {
  onAdd: (transaction: Transaction) => void;
  recentMerchants?: string[];
  onQuickInput?: (text: string) => void;
  dashboardInput?: string;
  setDashboardInput?: (val: string) => void;
  transactions?: Transaction[];
}
⋮----
export default function QuickAddPanel({
  onAdd,
  recentMerchants = [],
  onQuickInput,
  dashboardInput,
  setDashboardInput,
  transactions,
}: QuickAddPanelProps)
⋮----
{/* Panel Header */}
⋮----
{/* MagicInput handles all 3 modes internally */}
```

## File: src/features/dashboard/hooks/useDashboardData.ts
```typescript
import { useMemo } from 'react';
import { Transaction } from '@/types';
import { FinanceState } from '@/types/state';
⋮----
export function useDashboardData(
  transactions: Transaction[],
  monthlyStats: FinanceState['monthlyStats'],
  monthlyHistory: FinanceState['monthlyHistory'],
  balanceTrend: FinanceState['balanceTrend']
)
⋮----
// Chart Data
⋮----
// Recent Merchants
⋮----
// Recent Transactions (Desktop)
⋮----
// Recent Transactions (Mobile)
⋮----
// Balance Trend Percentage
⋮----
// Balance Trend Direction (Mobile)
⋮----
// Savings Rate
⋮----
// Subscription Spend (Mobile)
⋮----
// AI Insights
```

## File: src/features/education/components/EducationCards.tsx
```typescript
import React, { useState } from 'react';
import {
  BookOpen,
  Target,
  Shield,
  Zap,
  ArrowRight,
  TrendingUp,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
⋮----
interface EducationTip {
  id: string;
  title: string;
  summary: string;
  content: string;
  icon: React.ReactNode;
  color: string;
}
⋮----
const handlePrev = ()
⋮----
{/* Progress Bar */}
```

## File: src/features/education/components/LessonCard.tsx
```typescript
import { motion } from 'framer-motion';
import { Lock, Check, Clock, Star, ChevronRight } from 'lucide-react';
import { Lesson } from '@/data/lessons';
import { CATEGORY_CONFIG } from '@/features/education/components/categoryConfig';
import { STORAGE_KEYS } from '@/constants';
⋮----
export interface LessonCardProps {
  lesson: Lesson;
  completed: boolean;
  locked: boolean;
  onClick: () => void;
}
⋮----
{/* Progress Bar (if started but not completed) */}
⋮----
{/* Completion glow */}
⋮----
{/* Locked overlay */}
⋮----
{/* Completed badge */}
```

## File: src/features/education/components/LessonModal.tsx
```typescript
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, X, Check, Trophy } from 'lucide-react';
import { Lesson } from '@/data/lessons';
import { CATEGORY_CONFIG } from '@/features/education/components/categoryConfig';
import { STORAGE_KEYS } from '@/constants';
⋮----
export interface LessonModalProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete: () => void;
  completed: boolean;
}
⋮----
const handleNextPara = () =>
⋮----
const handleAnswer = (index: number) =>
⋮----
{/* Body */}
⋮----
{/* Footer */}
```

## File: src/features/education/EducationView.tsx
```typescript
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';
import { useStore } from '@/store';
import { Transaction, AppNotification } from '@/types';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
⋮----
import { LESSONS, Lesson } from '@/data/lessons';
import { CATEGORY_CONFIG } from '@/features/education/components/categoryConfig';
import LessonModal from '@/features/education/components/LessonModal';
import LessonCard from '@/features/education/components/LessonCard';
import { STORAGE_KEYS } from '@/constants';
⋮----
// ─── Lesson Data ─────────────────────────────────────────────────────────────
⋮----
// ─── Lesson Modal ─────────────────────────────────────────────────────────────
⋮----
// ─── Lesson Card ─────────────────────────────────────────────────────────────
⋮----
// ─── Main View ────────────────────────────────────────────────────────────────
⋮----
const handleComplete = (lesson: Lesson) =>
⋮----
// Personalized insight from spending data
⋮----
{/* ── Header ── */}
⋮----
{/* ── Progress Hero ── */}
⋮----
{/* ── Personalized Tip ── */}
⋮----
onClick=
⋮----
{/* ── Completion Banner ── */}
```

## File: src/features/gamification/components/LevelUpModal.tsx
```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ArrowRight, Building2, Landmark, Castle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
⋮----
interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  rank: string;
}
⋮----
const randomInRange = (min: number, max: number)
⋮----
const getRankIcon = () =>
⋮----
{/* Glowing background orbs */}
```

## File: src/features/gamification/components/QuestCompletionOverlay.tsx
```typescript
import React, { useEffect, useState } from 'react';
import { Trophy, Star, Sparkles, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { Quest } from '@/features/gamification/types';
import confetti from 'canvas-confetti';
⋮----
// Find quests that are 100% but not yet "celebrated"
⋮----
// eslint-disable-next-line react-hooks/set-state-in-effect
⋮----
const handleClose = () =>
```

## File: src/features/gamification/components/SavingsChallenges.tsx
```typescript
import React from 'react';
import { Target, Zap, Coffee, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppView } from '@/types';
⋮----
interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  icon: React.ReactNode;
  progress: number;
  color: string;
}
```

## File: src/features/gamification/components/SocialLeaderboard.tsx
```typescript
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, TrendingUp } from 'lucide-react';
import { useStore } from '@/store';
⋮----
// Mock leaderboard data (in a real app this would come from a backend)
⋮----
type SortKey = 'xp' | 'level' | 'streak' | 'savingsRate';
⋮----
{/* Sort tabs */}
⋮----
{/* Leaderboard rows */}
⋮----
{/* Avatar */}
⋮----
{/* Info */}
⋮----
{/* Sort value */}
```

## File: src/features/gamification/components/UserLevelCard.tsx
```typescript
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Flame, Award } from 'lucide-react';
⋮----
interface UserLevelCardProps {
  level: number;
  rank: string;
  currentLevelXP: number;
  xpProgress: number;
  XP_PER_LEVEL: number;
  streak: number;
  totalXPToday: number;
  completedCount: number;
}
⋮----
{/* Background glow */}
⋮----
{/* Level badge */}
⋮----
{/* Stats */}
⋮----
{/* XP bar */}
```

## File: src/features/gamification/hooks/useGamification.ts
```typescript
import { useEffect, useMemo } from 'react';
import { Transaction } from '@/types';
import { useStore } from '@/store';
import { useCategories } from '@/hooks/useCategories';
⋮----
export function useGamification(transactions: Transaction[])
⋮----
// 1. Calculate Daily Streak (delegated to store)
⋮----
// 2. Calculate Health Score (0-100)
⋮----
// 3. Calculate XP and Levels
⋮----
// Base XP from historical actions
⋮----
// Budget Adherence Bonus
⋮----
// Level = floor(sqrt(xp / 250)) + 1
⋮----
// XP math for progress bar
```

## File: src/features/gamification/store/gamificationSlice.ts
```typescript
import { StateCreator } from 'zustand';
import { Quest } from '@/types';
import { SpendWiseStore } from '@/store/index';
⋮----
export interface GamificationSlice {
  quests: Quest[];
  totalXP: number;
  level: number;
  rank: string;
  streak: number;
  lastLoginDate: string | null;
  showLevelUp: boolean;
  addXP: (amount: number) => void;
  dismissLevelUp: () => void;
  updateQuestProgress: (id: string, progress: number) => void;
  completeQuest: (id: string) => void;
  resetQuests: () => void;
  checkStreak: () => void;
}
⋮----
export const createGamificationSlice: StateCreator<
  SpendWiseStore,
  [['zustand/persist', unknown]],
  [],
  GamificationSlice
> = (set, get) => (
⋮----
if (state.lastLoginDate === today) return state; // Already checked today ✓
⋮----
let newStreak = 1; // Always start at 1 (today counts)
⋮----
newStreak = state.streak + 1; // Genuine consecutive day
⋮----
return state; // Same day, no change
⋮----
// diffDays > 1: streak broken, newStreak stays 1
```

## File: src/features/gamification/types.ts
```typescript
import { Category } from '@/types/finance';
⋮----
export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: string;
  xpReward: number;
  category?: Category;
  targetAmount?: number;
  progress: number;
  completed: boolean;
  type: 'saving' | 'spending' | 'habit' | 'milestone';
  icon: string;
}
⋮----
export type Rank = 'Novice' | 'Saver' | 'Budget Baron' | 'Wealth Wizard' | 'Infinity Tycoon';
⋮----
export interface GamificationStats {
  totalXP: number;
  level: number;
  rank: Rank;
  streak: number;
  lastActive: string;
}
```

## File: src/features/goals/components/constants.ts
```typescript
import { GoalStatus } from '@/types';
import { CheckCircle2, TrendingUp, AlertTriangle, PauseCircle } from 'lucide-react';
```

## File: src/features/goals/components/GoalsSummary.tsx
```typescript

```

## File: src/features/goals/components/ProgressRing.tsx
```typescript

```

## File: src/features/goals/components/utils.ts
```typescript
export function daysUntil(dateStr: string): number
⋮----
export function formatDate(dateStr: string): string
```

## File: src/features/onboarding/components/OnboardingStep1.tsx
```typescript
import React, { RefObject } from 'react';
import { Check, ArrowRight } from 'lucide-react';
⋮----
export type CurrencySymbol = '$' | '£' | '€' | '₹';
⋮----
interface OnboardingStep1Props {
  step: number;
  currency: CurrencySymbol;
  setCurrency: (c: CurrencySymbol) => void;
  rawValue: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  focused: boolean;
  setFocused: (f: boolean) => void;
  isValid: boolean;
  handleNextStep: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
}
⋮----
onBlur=
```

## File: src/features/onboarding/components/OnboardingStep2.tsx
```typescript
import React from 'react';
import { ArrowRight } from 'lucide-react';
⋮----
export type UserRole = 'student' | 'professional' | 'business';
⋮----
interface OnboardingStep2Props {
  step: number;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  setStep: (step: 1 | 2 | 3) => void;
}
⋮----
onClick=
```

## File: src/features/onboarding/components/OnboardingStep3.tsx
```typescript
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { UserRole } from './OnboardingStep2';
⋮----
interface OnboardingStep3Props {
  step: number;
  name: string;
  setName: (v: string) => void;
  userRole: UserRole;
  occupation: string;
  setOccupation: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  monthlyGoal: string;
  setMonthlyGoal: (v: string) => void;
  handleFinalSubmit: () => void;
}
```

## File: src/features/parental/components/ChildQRScanner.tsx
```typescript
import React, { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
⋮----
interface Html5QrcodeScannerInstance {
  render: (onSuccess: (text: string) => void, onError: (err: string) => void) => void;
  clear: () => Promise<void>;
}
⋮----
interface Html5QrcodeScannerConstructor {
  new (elementId: string, config: { fps: number; qrbox: { width: number; height: number } }, verbose: boolean): Html5QrcodeScannerInstance;
}
⋮----
interface Window {
    Html5QrcodeScanner?: Html5QrcodeScannerConstructor;
  }
⋮----
interface ChildQRScannerProps {
  show: boolean;
  onClose: () => void;
  onSuccess: (parentId: string) => void;
}
⋮----
// ignore scan errors (they happen every frame)
⋮----
// eslint-disable-next-line react-hooks/set-state-in-effect
```

## File: src/features/parental/components/LinkingQRModal.tsx
```typescript
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/hooks/useAuth';
⋮----
interface LinkingQRModalProps {
  show: boolean;
  onClose: () => void;
}
⋮----
timestamp: Date.now(), // eslint-disable-line react-hooks/purity
```

## File: src/features/parental/components/ParentalActivity.tsx
```typescript
import React from 'react';
import { ClipboardList, Star, Smartphone, MoreHorizontal } from 'lucide-react';
```

## File: src/features/parental/components/ParentalDashboard.tsx
```typescript
import React from 'react';
import { PendingApprovals } from '@/features/parental/components/PendingApprovals';
import {
  ChoreVerification,
  DeviceLinkingCard,
} from '@/features/parental/components/ParentalActivity';
import { ParentalSettingsCard } from '@/features/parental/components/ParentalSettingsCard';
import { AllowanceCard } from '@/features/parental/components/AllowanceCard';
import { Transaction } from '@/types';
import { LinkingQRModal } from '@/features/parental/components/LinkingQRModal';
import { Shield } from 'lucide-react';
⋮----
import { ParentalControlState } from '@/store';
⋮----
interface ParentalDashboardProps {
  pendingTransactions: Transaction[];
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  settings: ParentalControlState;
  updateSettings: (updates: Partial<ParentalControlState>) => void;
  lockSession: () => void;
  removePin: () => void;
}
⋮----
```

## File: src/features/parental/components/ParentalSettingsCard.tsx
```typescript
import React from 'react';
import { Shield, Lock, Bell, AlertTriangle, Trash2 } from 'lucide-react';
⋮----
import { ParentalControlState } from '@/store';
⋮----
interface ParentalSettingsCardProps {
  settings: ParentalControlState;
  updateSettings: (updates: Partial<ParentalControlState>) => void;
  lockSession: () => void;
  removePin: () => void;
}
⋮----
checked=
```

## File: src/features/parental/components/PendingApprovals.tsx
```typescript
import React from 'react';
import { AlertCircle, Check, X, Clock } from 'lucide-react';
import { Transaction } from '@/types';
⋮----
interface PendingApprovalsProps {
  pendingTransactions: Transaction[];
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
}
⋮----
onClick=
```

## File: src/features/parental/ParentalView.tsx
```typescript
import React from 'react';
import { useParentalManager } from '@/features/parental/hooks/useParentalManager';
import { ParentalLockScreen } from '@/features/parental/components/ParentalLockScreen';
import { ParentalSetupFlow } from '@/features/parental/components/ParentalSetupFlow';
import { ParentalDashboard } from '@/features/parental/components/ParentalDashboard';
import { Shield } from 'lucide-react';
⋮----
export const ParentalView: React.FC = () =>
```

## File: src/features/parental/store/parentalSlice.ts
```typescript
import { StateCreator } from 'zustand';
import { Transaction, Category } from '@/types';
import { SpendWiseStore, ParentalControlState } from '@/store/index';
import { hashPin, verifyPinHash } from '@/core/security';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export interface ParentalSlice {
  parentalState: ParentalControlState;
  setTeenMode: (enabled: boolean, pin?: string) => void;
  setMonthlyLimit: (limit: number | null) => void;
  toggleRestrictedCategory: (category: Category) => void;
  updateParentalSettings: (updates: Partial<ParentalControlState>) => void;
  removePin: () => void;
  unlockSession: () => void;
  lockSession: () => void;
  requestTransactionApproval: (tx: Transaction) => void;
  approveTransaction: (id: string) => void;
  denyTransaction: (id: string) => void;
  verifyPin: (pin: string) => Promise<boolean>;
  setupPin: (pin: string) => Promise<void>;
  togglePrivacy: () => void;
  setAllowance: (amount: number, frequency: 'weekly' | 'monthly') => void;
  setSpendingCap: (cap: number | null) => void;
  payAllowance: () => void;
  getAllowanceDue: () => boolean;
}
⋮----
export const createParentalSlice: StateCreator<
  SpendWiseStore,
  [['zustand/persist', unknown]],
  [],
  ParentalSlice
> = (set, get) => (
```

## File: src/features/portfolio/components/AllocationDonut.tsx
```typescript
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ASSET_TYPES } from '@/data/portfolioConfig';
import type { AllocationByType } from '@/types';
⋮----
export interface AllocationDonutProps {
  allocationByType: AllocationByType[];
  total: number;
  currency: string;
}
⋮----
function fmt(n: number, currency: string)
```

## File: src/features/portfolio/components/DebtPlanner.tsx
```typescript
import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Zap,
  TrendingDown,
  Calendar,
  BrainCircuit,
  Info,
} from 'lucide-react';
import { LiabilityEntry } from '@/types';
⋮----
interface DebtPlannerProps {
  liabilities: LiabilityEntry[];
  currency: string;
  monthlyExtra?: number; // How much extra the user can pay each month
  userRole?: string;
}
⋮----
monthlyExtra?: number; // How much extra the user can pay each month
⋮----
type PayoffStrategy = 'avalanche' | 'snowball';
⋮----
minPayment: l.minPayment || Math.max(l.balance * 0.02, 500), // Default 2% or 500
⋮----
// Comparison Logic
⋮----
const simulate = (strat: PayoffStrategy) =>
⋮----
const MAX_MONTHS = 600; // 50 years limit
⋮----
// 1. Pay minimums and apply interest
⋮----
// 2. Extra payment
⋮----
{/* Strategy Selector */}
⋮----
onClick=
⋮----
{/* Quick Stats */}
⋮----
{/* Repayment Order */}
⋮----
{/* Advisor Context */}
```

## File: src/features/portfolio/components/EntryCard.tsx
```typescript
import React from 'react';
import { Trash2 } from 'lucide-react';
⋮----
export interface EntryCardProps {
  label: string;
  icon: React.ReactNode;
  iconEmoji?: string;
  color: string;
  balance: number;
  currency: string;
  type?: string;
  onDelete: () => void;
}
⋮----
function getConsistentTrend(label: string): string
⋮----
const value = Math.abs(hash % 500) / 100 - 1.5; // -1.5 to 3.5
⋮----
function fmt(n: number, currency: string)
```

## File: src/features/portfolio/components/FutureWealthSimulator.tsx
```typescript
import { useState, useMemo } from 'react';
import { TrendingUp, Landmark, Info } from 'lucide-react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
⋮----
interface FutureWealthSimulatorProps {
  currentBalance: number;
  monthlySavings: number;
  currency?: string;
}
⋮----
const [expectedROI, setExpectedROI] = useState(7); // 7% annual return
⋮----
{/* Header */}
⋮----
{/* Controls */}
⋮----
onChange=
⋮----
{/* Stats Summary & Result */}
⋮----
{/* Chart */}
```

## File: src/features/portfolio/components/MobilePortfolioHero.tsx
```typescript
import { Sparkles } from 'lucide-react';
⋮----
interface MobilePortfolioHeroProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  currency: string;
}
⋮----
export function MobilePortfolioHero({
  netWorth,
  totalAssets,
  totalLiabilities,
  currency,
}: MobilePortfolioHeroProps)
```

## File: src/features/portfolio/components/PortfolioHeader.tsx
```typescript
import { TrendingUp, BarChart2, BrainCircuit, Zap, Plus } from 'lucide-react';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
⋮----
interface PortfolioHeaderProps {
  config: SpendWiseConfig | null;
  activeTab: 'overview' | 'simulation' | 'debt';
  setActiveTab: (tab: 'overview' | 'simulation' | 'debt') => void;
  onAddAsset: () => void;
  onAddLiability: () => void;
}
⋮----
onClick=
```

## File: src/features/portfolio/components/PortfolioInsights.tsx
```typescript
import { BrainCircuit, Sparkles } from 'lucide-react';
import AllocationDonut from '@/features/portfolio/components/AllocationDonut';
import NetWorthEvolution from '@/features/portfolio/components/NetWorthEvolution';
import { WealthTree } from '@/features/portfolio/components/WealthTree';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import type { AllocationByType } from '@/types';
import type { FinanceState } from '@/types/state';
⋮----
interface PortfolioInsightsProps {
  financeState: FinanceState;
  currency: string;
  healthScore: number;
  savingsRate: number;
  config: SpendWiseConfig | null;
  allocationByType: AllocationByType[];
  totalAssets: number;
  netWorth: number;
}
⋮----
export function PortfolioInsights({
  financeState,
  currency,
  healthScore,
  savingsRate,
  config,
  allocationByType,
  totalAssets,
  netWorth,
}: PortfolioInsightsProps)
```

## File: src/features/portfolio/components/PortfolioLists.tsx
```typescript
import { Landmark, Zap, ShieldAlert } from 'lucide-react';
import EntryCard from '@/features/portfolio/components/EntryCard';
import { getAssetCfg, getLiabilityCfg } from '@/data/portfolioConfig';
import type { Asset, Liability } from '@/types';
⋮----
function fmt(n: number, currency: string)
⋮----
interface PortfolioListsProps {
  assets: Asset[];
  liabilities: Liability[];
  totalLiabilities: number;
  currency: string;
  deleteAsset: (id: string) => void;
  deleteLiability: (id: string) => void;
  setModal: (modal: 'asset' | 'liability' | null) => void;
}
⋮----
onDelete=
```

## File: src/features/portfolio/components/PortfolioSummaryBanner.tsx
```typescript
import { Sparkles } from 'lucide-react';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
⋮----
function fmt(n: number, currency: string)
⋮----
interface PortfolioSummaryBannerProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  currency: string;
  config: SpendWiseConfig | null;
}
⋮----
export function PortfolioSummaryBanner({
  netWorth,
  totalAssets,
  totalLiabilities,
  currency,
  config,
}: PortfolioSummaryBannerProps)
```

## File: src/features/portfolio/components/WealthTree.tsx
```typescript
import React from 'react';
import { motion } from 'framer-motion';
⋮----
interface WealthTreeProps {
  score: number; // 0 to 100
  savingsRate: number; // percentage
  role?: string;
}
⋮----
score: number; // 0 to 100
savingsRate: number; // percentage
⋮----
// Tree state: 0-20: Seed, 21-40: Sprout, 41-60: Small Tree, 61-80: Healthy Tree, 81-100: Lush Tree
⋮----
const getScale = () =>
⋮----
const getLeaves = () =>
⋮----
{/* Pot */}
⋮----
{/* Trunk */}
⋮----
{/* Leaves / Canopy */}
⋮----
marginTop: Math.random() * 10 - 5, // eslint-disable-line react-hooks/purity
marginLeft: Math.random() * 10 - 5, // eslint-disable-line react-hooks/purity
```

## File: src/features/portfolio/hooks/usePortfolio.ts
```typescript
import { AssetType } from '@/types';
import { useStore } from '@/store';
⋮----
export function usePortfolio()
⋮----
// ── Computed ─────────────────────────────────────────────────────────────────
⋮----
// Allocation by type
```

## File: src/features/portfolio/store/portfolioSlice.ts
```typescript
import { StateCreator } from 'zustand';
import { AssetEntry, LiabilityEntry } from '@/types';
import { SpendWiseStore } from '@/store/index';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export interface PortfolioSlice {
  assets: AssetEntry[];
  liabilities: LiabilityEntry[];
  addAsset: (asset: Omit<AssetEntry, 'id' | 'lastUpdated'>) => void;
  updateAsset: (id: string, data: Partial<AssetEntry>) => void;
  deleteAsset: (id: string) => void;
  addLiability: (liability: Omit<LiabilityEntry, 'id' | 'lastUpdated'>) => void;
  updateLiability: (id: string, data: Partial<LiabilityEntry>) => void;
  deleteLiability: (id: string) => void;
}
⋮----
export const createPortfolioSlice: StateCreator<
  SpendWiseStore,
  [['zustand/persist', unknown]],
  [],
  PortfolioSlice
> = set => ({
  assets: [],
  liabilities: [],
  addAsset: asset =>
    set(state => ({
      assets: [
        ...state.assets,
        { ...asset, id: `a-${Date.now()}`, lastUpdated: formatLocalYYYYMMDD(new Date()) },
      ],
    })),
updateAsset: (id, data)
```

## File: src/features/portfolio/types.ts
```typescript
export type AssetType =
  | 'bank'
  | 'investment'
  | 'crypto'
  | 'property'
  | 'business'
  | 'education'
  | 'other';
export type LiabilityType =
  | 'loan'
  | 'car_loan'
  | 'credit_card'
  | 'mortgage'
  | 'student_loan'
  | 'business_loan'
  | 'other';
export type FinanceProvider =
  | 'gpay'
  | 'phonepe'
  | 'paytm'
  | 'cred'
  | 'bhim'
  | 'razorpay'
  | 'plaid'
  | 'web3'
  | 'other';
⋮----
export interface AssetEntry {
  id: string;
  name: string;
  type: AssetType;
  balance: number;
  currency?: string;
  icon?: string;
  color?: string;
  lastUpdated: string;
  ticker?: string;
  quantity?: number;
}
⋮----
export interface LiabilityEntry {
  id: string;
  name: string;
  type: LiabilityType;
  balance: number;
  interestRate?: number; // Annual percentage rate
  minPayment?: number;
  currency?: string;
  icon?: string;
  lastUpdated: string;
}
⋮----
interestRate?: number; // Annual percentage rate
⋮----
export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  balance: number;
  currency?: string;
  icon?: string;
  color?: string;
  lastUpdated: string;
}
⋮----
export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  balance: number;
  interestRate?: number;
  minPayment?: number;
  currency?: string;
  icon?: string;
  lastUpdated: string;
}
⋮----
export interface AllocationByType {
  type: AssetType;
  value: number;
  pct: number;
}
⋮----
export interface LinkedAccount {
  id: string;
  provider: FinanceProvider;
  upiId: string;
  linkedAt: string;
  lastSynced: string;
  status: 'active' | 'error' | 'disconnected';
}
```

## File: src/features/profile/components/AccessibilitySection.tsx
```typescript
import { Sun, Moon, Type, Smartphone } from 'lucide-react';
import type { FontSizeKey } from '@/features/profile/components/useProfileView';
⋮----
function ToggleRow({
  label,
  desc,
  checked,
  onChange,
  icon,
}: {
  label: string;
  desc: string;
  checked: boolean;
onChange: (v: boolean)
⋮----
onChange=
⋮----
interface AccessibilitySectionProps {
  darkMode: boolean;
  onDarkMode: (v: boolean) => void;
  highContrast: boolean;
  onHighContrast: (v: boolean) => void;
  hapticsEnabled: boolean;
  onHaptics: (v: boolean) => void;
  shakeEnabled: boolean;
  onShake: (v: boolean) => void;
  fontSize: FontSizeKey;
  FONT_SIZES: readonly FontSizeKey[];
  FONT_LABELS: Record<FontSizeKey, string>;
  onFontSize: (s: FontSizeKey) => void;
}
⋮----
{/* Dark Mode */}
⋮----
{/* Font Size */}
```

## File: src/features/profile/components/CurrencySelector.tsx
```typescript
import { Globe } from 'lucide-react';
import { useCurrency, CurrencyCode } from '@/contexts/CurrencyContext';
import { COMMON_CURRENCIES } from '@/data/currencies';
⋮----
interface CurrencySelectorProps {
  activeCurrency: string;
  baseCurrency: string;
  onSelect: (code: string) => void;
}
```

## File: src/features/profile/components/DataManagement.tsx
```typescript
import { useRef } from 'react';
import { Download, Trash2, Lock, DownloadCloud } from 'lucide-react';
import { Transaction } from '@/types';
⋮----
interface DataManagementProps {
  transactions: Transaction[];
  onExportCSV: () => void;
  onOpenResetConfirm: () => void;
  onOpenSecureExport: () => void;
  onOpenRestore: () => void;
  onRawDBExport: () => void;
  onRawDBImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportTransactions: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
⋮----
interface DataCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  titleColor?: string;
  description: React.ReactNode;
  borderColor?: string;
  children: React.ReactNode;
}
⋮----
function DataCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  titleColor,
  description,
  borderColor,
  children,
}: DataCardProps)
⋮----
export function DataManagement({
  transactions,
  onExportCSV,
  onOpenResetConfirm,
  onOpenSecureExport,
  onOpenRestore,
  onRawDBExport,
  onRawDBImport,
  onImportTransactions,
}: DataManagementProps)
⋮----
{/* Export CSV */}
⋮----
{/* Danger Zone */}
⋮----
{/* Secure Backup — full width */}
⋮----
{/* Raw DB Backup - Dev Only */}
⋮----
onClick=
⋮----
{/* Transaction-only Import */}
```

## File: src/features/profile/components/FamilySafetySection.tsx
```typescript
import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { AppView } from '@/types';
⋮----
interface FamilySafetySectionProps {
  onNavigate?: (view: AppView) => void;
}
⋮----
export function FamilySafetySection(
```

## File: src/features/profile/components/NotificationsSection.tsx
```typescript
import { Bell } from 'lucide-react';
⋮----
interface NotificationsSectionProps {
  notifPermission: NotificationPermission;
  onRequestPermission: () => void;
  onTestNotification: () => void;
}
```

## File: src/features/profile/components/ProfileForm.tsx
```typescript
import { CheckCircle2 } from 'lucide-react';
⋮----
interface ProfileFormField {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}
⋮----
interface ProfileFormProps {
  fields: ProfileFormField[];
  currency: string;
  onSave: () => void;
  showSavedMsg: boolean;
}
⋮----
onChange=
⋮----
onFocus=
```

## File: src/features/profile/components/ProfileHeader.tsx
```typescript
import React, { RefObject } from 'react';
import { User, Camera } from 'lucide-react';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
⋮----
interface ProfileHeaderProps {
  avatar: string | null;
  name: string;
  occupation: string;
  location: string;
  config: SpendWiseConfig | null;
  avatarInputRef: RefObject<HTMLInputElement | null>;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
⋮----
onClick=
```

## File: src/features/profile/components/ResetConfirmModal.tsx
```typescript
import React from 'react';
import { Trash2 } from 'lucide-react';
⋮----
export interface ResetConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
}
```

## File: src/features/profile/components/RestoreModal.tsx
```typescript
import React, { useState } from 'react';
import { DownloadCloud, Lock } from 'lucide-react';
⋮----
export interface RestoreModalProps {
  onClose: () => void;
  onRestore: (file: File, password: string) => void;
  isRestoring: boolean;
}
⋮----
const handleRestore = () =>
⋮----
onClose();
setPassword('');
setFile(null);
```

## File: src/features/profile/components/SecureExportModal.tsx
```typescript
import React, { useState } from 'react';
import { Shield, Lock } from 'lucide-react';
⋮----
export interface SecureExportModalProps {
  onClose: () => void;
  onExport: (password: string) => void;
  isExporting: boolean;
}
⋮----
const handleExport = () =>
⋮----
onClose();
setPassword('');
```

## File: src/features/recurring/RecurringView.tsx
```typescript
import { useState, memo } from 'react';
import { RefreshCw, Calendar, TrendingUp, Clock, Zap, LayoutGrid } from 'lucide-react';
import { RecurringPattern, Transaction } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { SubscriptionCalendar } from '@/features/subscriptions/components/SubscriptionCalendar';
import { PriceHikeDetector } from '@/features/subscriptions/components/PriceHikeDetector';
⋮----
interface RecurringViewProps {
  patterns: RecurringPattern[];
  currency?: string;
  transactions?: Transaction[];
}
⋮----
function daysUntil(dateStr: string): number
⋮----
function formatDate(dateStr: string): string
⋮----
{/* Top accent */}
⋮----
{/* Category icon */}
⋮----
{/* Merchant + frequency badge */}
⋮----
{/* Category + occurrences */}
⋮----
{/* Amount */}
⋮----
{/* Next expected */}
⋮----
{/* Header */}
⋮----
{/* View toggle */}
```

## File: src/features/reports/insights/reporting.ts
```typescript
import { Transaction } from '@/types';
⋮----
export async function generateMonthlyReport(
  month: string,
  transactions: Transaction[]
): Promise<string>
⋮----
export async function getSpendingPersonality(transactions: Transaction[]): Promise<
```

## File: src/features/shared/types.ts
```typescript
export type HouseholdPurpose = 'roommates' | 'friends' | 'family' | 'other';
⋮----
export interface HouseholdMember {
  id: string;
  name: string;
  emoji: string;
  relation?: string;
}
⋮----
export interface HouseholdSettings {
  name: string;
  purpose: HouseholdPurpose;
  members: HouseholdMember[];
}
⋮----
export type SharedWalletEntryKind = 'contribution' | 'spend_from_pot' | 'withdrawal';
⋮----
export interface SharedWalletEntry {
  id: string;
  date: string;
  kind: SharedWalletEntryKind;
  amount: number;
  memberId: string;
  label: string;
  createdAt: string;
}
⋮----
export interface SharedExpenseSplit {
  memberId: string;
  sharePercent: number;
}
⋮----
export interface SharedExpense {
  id: string;
  date: string;
  label: string;
  category: string;
  amount: number;
  paidByMemberId: string;
  splits: SharedExpenseSplit[];
  createdAt: string;
}
⋮----
export interface SharedGoalContribution {
  id: string;
  date: string;
  memberId: string;
  amount: number;
  note?: string;
}
⋮----
export interface SharedSavingsGoal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  targetDate: string;
  color: string;
  memberIds: string[];
  contributions: SharedGoalContribution[];
  createdAt: string;
}
```

## File: src/features/subscriptions/components/AddSubscriptionModal.tsx
```typescript
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useStore } from '@/store';
import { useCategories } from '@/hooks/useCategories';
import { RecurringFrequency, Category } from '@/types';
⋮----
interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
}
⋮----
const handleSubmit = (e: React.FormEvent) =>
⋮----
// Reset and close
⋮----
onChange=
```

## File: src/features/subscriptions/components/SubscriptionCalendar.tsx
```typescript
/**
 * SubscriptionCalendar.tsx
 * Monthly grid view showing when each subscription bill hits.
 */
import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
⋮----
interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingDay?: number; // day of month (1-31)
  emoji?: string;
  color?: string;
}
⋮----
billingDay?: number; // day of month (1-31)
⋮----
interface Props {
  subscriptions: Subscription[];
  currency?: string;
}
⋮----
// Build bill map: day → subscriptions
⋮----
const prev = () =>
const next = () =>
⋮----
{/* Header */}
⋮----
{/* Nav */}
⋮----
{/* Day Headers */}
⋮----
{/* Grid */}
⋮----
{/* Upcoming bills list */}
```

## File: src/features/subscriptions/hooks/useSubscriptionManager.ts
```typescript
import { useMemo } from 'react';
import { RecurringPattern } from '@/types';
import { useStore } from '@/store';
⋮----
function daysUntil(dateStr: string): number
⋮----
export function useSubscriptionManager(patterns: RecurringPattern[])
```

## File: src/features/sync/components/PayForm.tsx
```typescript
import React, { useState } from 'react';
import { ArrowLeft, Zap, Smartphone, ChevronRight, Info, Send } from 'lucide-react';
import { SyncView } from '@/types';
import { UPI_APP_INTENTS, initiateUPIPayment } from '@/utils/upiPayment';
import { useStore } from '@/store';
⋮----
export interface PayFormProps {
  onSetView: (view: SyncView) => void;
  onPay: (amount: number, description: string) => void;
  currency: string;
}
⋮----
type PayMode = 'select' | 'upi-id' | 'razorpay';
⋮----
const validateVPA = (v: string)
⋮----
const handleUPIAppPay = (appId: string) =>
⋮----
// If specific app, build app-specific URL
⋮----
// Save pending payment + open UPI intent using the correct urlScheme
⋮----
const handleQuickAnyUPI = () =>
⋮----
const handleRazorpay = () =>
⋮----
setLaunched(false);
setPayMode('select');
⋮----
{/* ── Amount Input (always visible) ───────────────────────────── */}
⋮----
onChange=
⋮----
{/* ── Mode: Select ────────────────────────────────────────────── */}
⋮----
{/* Native UPI — send to UPI ID */}
⋮----
{/* Razorpay fallback */}
⋮----
onClick=
⋮----
{/* ── Mode: UPI ID Entry ─────────────────────────────────────── */}
⋮----
{/* Choose which UPI app to open */}
⋮----
{/* ── Mode: Razorpay ────────────────────────────────────────── */}
```

## File: src/features/sync/components/RazorpayLink.tsx
```typescript
import React, { useState } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { SyncView } from '@/types';
⋮----
export interface RazorpayLinkProps {
  onSetView: (view: SyncView) => void;
  onConnect: (keyId: string, secret: string) => void;
}
⋮----
export function RazorpayLink(
⋮----
const handleSubmit = (e: React.FormEvent) =>
⋮----
onClick=
```

## File: src/features/sync/components/SelectSource.tsx
```typescript
import React from 'react';
import { ArrowLeft, Landmark, Zap, UploadCloud, ChevronRight } from 'lucide-react';
import { SyncView } from '@/types';
⋮----
export interface SelectSourceProps {
  onSetView: (view: SyncView) => void;
}
⋮----
onClick=
```

## File: src/features/sync/parsers/csv.ts
```typescript
import { Transaction, Category } from '@/types';
import {
  inferCategory,
  inferType,
  toTitleCase,
} from '@/features/ai/parsers/common';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
/*
 * Known gaps / not yet supported:
 *   - HDFC, ICICI, Axis Bank statement formats (column names differ)
 *   - Multi-currency CSV files
 *   - Credit-card statement PDFs (pre-CSV extraction required)
 *   - Transaction splitting across categories
 *
 * The auto-detect logic handles standard column headers:
 *   date, merchant/description/payee, amount, type (credit/debit), category
 */
⋮----
export function parseCSVLocally(csvContent: string): Transaction[]
⋮----
const parseRow = (line: string): string[] =>
```

## File: src/features/sync/parsers/upi.ts
```typescript
/**
 * upi.ts — Complete UPI / Bank Sync Engine
 *
 * Covers:
 *  1. UPI string parser — all 12 Indian bank SMS formats
 *  2. CSV bank statement importer — HDFC, SBI, ICICI, Axis, Kotak column mapping
 *  3. Razorpay payment fetch — real API call via Supabase proxy
 *  4. Merchant → category memory with learning
 *  5. Duplicate detection — same amount ±60 seconds
 */
⋮----
import { Transaction, DefaultCategory } from '@/types';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';
import { inferCategory } from '@/features/ai/parsers/common';
⋮----
// ─── Types ────────────────────────────────────────────────────────────────────
⋮----
/** Fields extracted by a single UPI pattern extractor */
interface ExtractedFields {
  merchant?: string;
  amount?: number;
  type?: 'debit' | 'credit';
  upiId?: string;
  bankRef?: string;
  date?: string;
}
⋮----
/** Raw Razorpay payment item from API response */
interface RazorpayPaymentItem {
  id: string;
  status: string;
  description?: string;
  email?: string;
  amount: number;
  created_at: number;
}
⋮----
export interface ParsedUPITransaction {
  id: string;
  merchant: string;
  amount: number;
  type: 'debit' | 'credit';
  category: DefaultCategory;
  date: string;
  upiId?: string;
  bankRef?: string;
  rawText: string;
  confidence: 'high' | 'medium' | 'low';
}
⋮----
export interface ReviewTransaction extends ParsedUPITransaction {
  isDuplicate: boolean;
  selected: boolean;
}
⋮----
// ─── Merchant Memory (Phase 8.3) ─────────────────────────────────────────────
⋮----
function detectCategory(merchant: string): DefaultCategory
⋮----
function learnMerchant(merchant: string, category: DefaultCategory)
⋮----
// ─── UPI String Parser ────────────────────────────────────────────────────────
// Handles all major Indian bank SMS + UPI notification formats
⋮----
// PhonePe: "UPI/CR/PhonePe/SWIGGY INDIA/payment@okicici"
// PhonePe: "UPI/DR/PhonePe/MERCHANT NAME/vpa@ybl"
⋮----
// HDFC SMS: "Rs 350.00 debited from A/c XX1234 on 19-05-26 to UPI-SWIGGY-swiggy@ic"
⋮----
// SBI: "Your A/c XX1234 debited by INR 350.00 on 19/05/26. UPI Ref: 123456789012"
⋮----
// ICICI: "ICICI Bank Acct XX1234 debited with Rs.350.00 on 19-May-26; UPI:swiggy@ic"
⋮----
// Axis Bank: "INR 350.00 debited from Axis Bank Acct XX1234 towards UPI/SWIGGY/payment@upi"
⋮----
// Paytm: "PAYTM/UPI/merchant@paytm/MERCHANT NAME"
⋮----
// Generic UPI VPA pattern: anything@bank
⋮----
function parseIndianDate(dateStr: string): string
⋮----
// DD/MM/YY or DD-MM-YY
⋮----
// DD-Mon-YY: 19-May-26
⋮----
/**
 * parseUPIString — Parse a single UPI notification / bank SMS string
 */
export function parseUPIString(text: string): ParsedUPITransaction | null
⋮----
// Run all patterns
⋮----
// Extract amount if not yet found
⋮----
// Extract merchant from UPI ID if still missing
⋮----
// Detect type from keywords if not set by pattern
⋮----
// Detect date from text if still today
⋮----
/**
 * parseMultipleUPIStrings — Parse a block of text containing multiple UPI notifications
 * (e.g. paste from SMS inbox). Each line / double-newline = one transaction.
 */
export function parseMultipleUPIStrings(bulkText: string): ParsedUPITransaction[]
⋮----
// Split by blank lines or lines that look like new SMS starts
⋮----
// ─── Duplicate Detector ───────────────────────────────────────────────────────
⋮----
export function markDuplicates(
  parsed: ParsedUPITransaction[],
  existing: Transaction[]
): ReviewTransaction[]
⋮----
// ─── CSV Bank Statement Importer ──────────────────────────────────────────────
⋮----
interface ColumnMap {
  date: string | number;
  narration: string | number;
  debit?: string | number;
  credit?: string | number;
  amount?: string | number;
  type?: string | number;
  balance?: string | number;
}
⋮----
// Column mappings for major Indian banks (header-row detection)
⋮----
headers: [], // fallback — used if no profile matches
⋮----
function detectBankProfile(headers: string[]): (typeof BANK_COLUMN_PROFILES)[0]
⋮----
return BANK_COLUMN_PROFILES[BANK_COLUMN_PROFILES.length - 1]; // Generic
⋮----
function getCol(row: string[], headers: string[], key: string | number): string
⋮----
/**
 * parseCSVStatement — Import a CSV bank statement and return parsed transactions.
 * @param csvText   Raw CSV text from File reader
 * @param bankHint  Optional bank name hint ("HDFC", "SBI", "ICICI", etc.)
 */
export function parseCSVStatement(csvText: string, bankHint?: string): ParsedUPITransaction[]
⋮----
// Find the header row (first line with recognisable column names)
⋮----
// Parse CSV (handles quoted fields with commas inside)
const parseRow = (line: string): string[] =>
⋮----
// Try extracting UPI VPA from narration
⋮----
// Extract merchant name from narration
⋮----
// Strip common bank boilerplate
⋮----
.replace(/\d{10,}/g, '') // remove long ref numbers
.replace(/[A-Z0-9]{20,}/g, '') // remove long reference strings
⋮----
// ─── Razorpay Live Transaction Fetch ─────────────────────────────────────────
⋮----
/**
 * fetchRazorpayTransactions — Fetch real payments from Razorpay via Supabase proxy.
 *
 * The Edge Function `razorpay-proxy` makes the server-side API call
 * (so the secret key never leaves the server). Install it:
 *   supabase functions deploy razorpay-proxy
 *   supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxx
 *   supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxxxx
 */
export async function fetchRazorpayTransactions(
  from?: Date,
  to?: Date
): Promise<ParsedUPITransaction[]>
⋮----
amount: p.amount / 100, // Razorpay stores in paise
type: 'credit' as const, // received payment = credit
⋮----
// ─── Merchant Category Learning ───────────────────────────────────────────────
⋮----
/** Call this when user manually changes a category in the review table */
export function saveMerchantCorrection(merchant: string, category: DefaultCategory)
⋮----
// ─── Convert to App Transaction ──────────────────────────────────────────────
⋮----
export function toAppTransaction(p: ParsedUPITransaction, _currency = '₹'): Omit<Transaction, 'id'>
⋮----
export function generateRealisticMocks(): ParsedUPITransaction[]
⋮----
const count = Math.floor(Math.random() * 5) + 5; // 5 to 9 transactions
⋮----
// Generate dates within the last 14 days
⋮----
// Sort by date descending
```

## File: src/features/sync/types.ts
```typescript
export type SyncView =
  | 'dashboard'
  | 'select-source'
  | 'upi-link'
  | 'plaid-link'
  | 'rzp-link'
  | 'web3-link'
  | 'pay-form'
  | 'pay-parsing'
  | 'pay-success'
  | 'pay-correction'
  | 'csv';
⋮----
export type WizardStep = 'upi-select' | 'upi-credentials' | 'upi-connecting' | 'upi-success';
```

## File: src/features/transactions/components/DeleteConfirmModal.tsx
```typescript
import { AlertCircle } from 'lucide-react';
⋮----
interface DeleteConfirmModalProps {
  deleteConfirmId: string | null;
  onCancel: () => void;
  onConfirm: (id: string) => void;
}
```

## File: src/features/transactions/components/historyTypes.ts
```typescript
export type SortKey = 'date' | 'amount' | 'merchant' | 'category';
export type SortDir = 'asc' | 'desc';
export type TypeFilter = 'all' | 'credit' | 'debit';
```

## File: src/features/transactions/hooks/useTransactionHistory.ts
```typescript
import { useState, useMemo, useEffect } from 'react';
import { Transaction, Category } from '@/types';
import type { SortKey, SortDir, TypeFilter } from '@/features/transactions/components/historyTypes';
⋮----
export type DisplayRow =
  | { type: 'header'; date: string; subtotal: number }
  | { type: 'tx'; tx: Transaction };
⋮----
export function useTransactionHistory(
  transactions: Transaction[],
  initialSearchQuery: string = ''
)
⋮----
// eslint-disable-next-line react-hooks/set-state-in-effect
⋮----
const handleSort = (key: SortKey) =>
⋮----
const clearFilters = () =>
```

## File: src/features/transactions/store/financeSlice.ts
```typescript
import { StateCreator } from 'zustand';
import { Transaction, Category, RecurringPattern, RecurringTransaction } from '@/types';
import { SpendWiseStore } from '@/store/index';
⋮----
export interface BudgetSettings {
  period: 'weekly' | 'biweekly' | 'monthly';
  rolloverEnabled: boolean;
}
⋮----
export interface FinanceSlice {
  transactions: Transaction[];
  indexedData: {
    byCategory: Record<string, Transaction[]>;
    byMonth: Record<string, Transaction[]>;
  };
  budgets: Record<string, number>;
  budgetSettings: BudgetSettings;
  subscriptions: RecurringPattern[];
  recurringTransactions: RecurringTransaction[];
  razorpayKeys: { keyId: string; keySecret: string } | null;

  addTransaction: (tx: Transaction) => void;
  addTransactions: (txs: Transaction[]) => void;
  deleteTransaction: (id: string) => void;
  updateTransactionCategory: (id: string, newCategory: Category) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void;
  bulkUpdateTransactionsCategory: (ids: string[], newCategory: Category) => void;
  bulkDeleteTransactions: (ids: string[]) => void;
  bulkReassignCategory: (oldCategory: string, newCategory: string) => void;
  setBudget: (category: string, amount: number) => void;
  removeBudget: (category: string) => void;
  resetBudgets: () => void;
  resetLimits: () => void;
  updateBudgetSettings: (settings: Partial<BudgetSettings>) => void;
  toggleRollover: () => void;
  addSubscription: (sub: RecurringPattern) => void;
  updateSubscription: (merchant: string, data: Partial<RecurringPattern>) => void;
  deleteSubscription: (merchant: string) => void;
  addRecurringTransaction: (rt: RecurringTransaction) => void;
  updateRecurringTransaction: (id: string, data: Partial<RecurringTransaction>) => void;
  removeRecurringTransaction: (id: string) => void;
  setRazorpayKeys: (keys: { keyId: string; keySecret: string } | null) => void;
  reindex: () => void;
}
⋮----
export const createFinanceSlice: StateCreator<
  SpendWiseStore,
  [['zustand/persist', unknown]],
  [],
  FinanceSlice
> = (set, get) => (
⋮----
// resetLimits intentionally clears budgets since spend limits are derived from budget caps
```

## File: src/hooks/useUPIReturn.tsx
```typescript
/**
 * useUPIReturn Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Detects when the user returns from a UPI payment app and processes the result.
 *
 * Detection strategy (multi-layered):
 * 1. On mount: Check current URL for UPI return params
 * 2. On `visibilitychange`: App resumes — check pending payment, ask user
 * 3. On `pageshow` (bfcache restore): Same as above
 */
⋮----
import { useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  parseUPIReturnParams,
  getPendingUPIPayment,
  clearPendingUPIPayment,
  upiResultToTransaction,
  UPIPaymentResult,
  PendingUPIPayment,
} from '@/utils/upiPayment';
import { Transaction } from '@/types';
⋮----
interface UseUPIReturnOptions {
  onTransactionAdded: (txs: Transaction[]) => void;
  onPaymentDetected?: (result: UPIPaymentResult) => void;
}
⋮----
function cleanURLParams()
⋮----
async function addUPITransaction(
  result: UPIPaymentResult,
  onTransactionAdded: (txs: Transaction[]) => void
)
⋮----
// eslint-disable-next-line react-refresh/only-export-components
⋮----
const handleYes = async () =>
⋮----
const handleNo = () =>
⋮----
// Strategy 1: URL params on mount (immediate redirect return from UPI app)
⋮----
// Strategy 2: visibilitychange — app resumes after switching from UPI app
⋮----
const onVisibilityChange = () =>
⋮----
// Only act if the app was hidden for at least 1 second
⋮----
// Strategy 3: pageshow event (back navigation / bfcache restore)
⋮----
const onPageShow = (e: PageTransitionEvent) =>
```

## File: src/utils/avatar.ts
```typescript
export function initials(name: string)
⋮----
export function avatarColor(name: string)
```

## File: src/utils/pushNotification.ts
```typescript
export async function requestNotificationPermission(): Promise<boolean>
⋮----
// Attempt to register for service worker push notifications
⋮----
// Check if already subscribed
⋮----
// Subscribe without a server key (for demo/dev use)
// In production, you would send the subscription to your server
⋮----
export async function sendBrowserNotification(
  title: string,
  body: string,
  icon = '/icons/pwa-192x192.png'
)
⋮----
// Try service worker notification first (works when backgrounded)
⋮----
// Fallback to browser Notification API (only works when tab is focused)
```

## File: src/app/AppModals.tsx
```typescript
import React from 'react';
import NotificationCenter from '@/components/layout/NotificationCenter';
import CustomCategoriesModal from '@/components/layout/CustomCategoriesModal';
import CommandPalette from '@/components/layout/CommandPalette';
import LevelUpModal from '@/features/gamification/components/LevelUpModal';
import PrivacyShield from '@/components/layout/PrivacyShield';
import { OfflineIndicator } from '@/components/layout/OfflineIndicator';
import { BudgetAlertToast } from '@/features/budget/components/BudgetAlertToast';
import { AppView, Transaction, AppNotification } from '@/types';
⋮----
interface AppModalsProps {
  showLevelUp: boolean;
  dismissLevelUp: () => void;
  level: number;
  rank: string;
  appState: {
    notifState: {
      notifications: AppNotification[];
      unreadCount: number;
      markRead: (id: string) => void;
      markAllRead: () => void;
      snoozeNotification: (id: string) => void;
    };
    categoryState: {
      customCategories: { id: string; name: string; icon: string; color: string }[];
      addCustomCategory: (cat: { name: string; icon: string; color: string }) => void;
      updateCustomCategory: (id: string, updates: Partial<{ name: string; icon: string; color: string }>) => void;
      deleteCustomCategory: (id: string) => void;
    };
    transactions: Transaction[];
    financeState: { bulkReassignCategory: (oldCat: string, newCat: string) => void };
  };
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
⋮----
export const AppModals: React.FC<AppModalsProps> = ({
  showLevelUp,
  dismissLevelUp,
  level,
  rank,
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
}) =>
⋮----
handleViewChange(view);
setShowNotifications(false);
⋮----
cloudMode=
```

## File: src/app/hooks/useAppNavigation.ts
```typescript
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppView } from '@/types';
import { haptic } from '@/core/haptic';
⋮----
interface UseAppNavigationProps {
  initialView: AppView;
  showQuickAdd: boolean;
  setShowQuickAdd: (show: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (_show: boolean) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (_show: boolean) => void;
  showCategoriesModal: boolean;
  setShowCategoriesModal: (_show: boolean) => void;
}
⋮----
function resolveViewFromPath(pathname: string): AppView
⋮----
export function useAppNavigation({
  initialView: _initialView,
  showQuickAdd,
  setShowQuickAdd,
}: UseAppNavigationProps)
⋮----
// Derive activeView from URL pathname directly
⋮----
// Sync URL when activeView changes (effected via navigation)
⋮----
// Handle PWA shortcuts / deep links once on mount
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
// Edge Swipe Detection (Android Style Navigation)
⋮----
const handleTouchStart = (e: TouchEvent) =>
⋮----
const handleTouchEnd = (e: TouchEvent) =>
⋮----
// Track path changes to sync modals with history state
⋮----
}, [location.pathname, location.search, showQuickAdd]); // eslint-disable-line react-hooks/exhaustive-deps
```

## File: src/app/hooks/useShakeFeedback.ts
```typescript
import { useEffect } from 'react';
import { useStore } from '@/store';
import { haptic } from '@/core/haptic';
import { AppNotification } from '@/components/ui/types';
⋮----
interface DeviceMotionEventWithPermission extends DeviceMotionEvent {
  requestPermission?: () => Promise<string>;
}
⋮----
export function useShakeFeedback(
  setShowFeedback: (show: boolean) => void,
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void
)
⋮----
// Shake Detection for Feedback & AI Assistant
⋮----
const threshold = 18; // Slightly higher threshold for fewer false positives
⋮----
const handleMotion = (e: DeviceMotionEvent) =>
⋮----
// Shake detected!
⋮----
// Show feedback modal instead of just switching view
⋮----
// Permission request failed silently
```

## File: src/components/ui/Alert.tsx
```typescript
import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
```

## File: src/components/ui/Avatar.tsx
```typescript
import React from 'react';
⋮----
export function Avatar(
⋮----
export function EmojiBtn({
  e,
  active,
  onPick,
}: {
  e: string;
  active: boolean;
onPick: (e: string)
```

## File: src/components/ui/Button.tsx
```typescript
import React from 'react';
⋮----
type BtnVariant = 'primary' | 'ghost' | 'danger' | 'dashed';
⋮----
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  v?: BtnVariant;
  full?: boolean;
}
⋮----
export function Btn(
```

## File: src/components/ui/Icons.tsx
```typescript
import React from 'react';
⋮----
interface IcoProps {
  className?: string;
  size?: number;
}
```

## File: src/components/ui/Input.tsx
```typescript
import React from 'react';
⋮----
export function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
})
⋮----
export function Inp(props: React.InputHTMLAttributes<HTMLInputElement>)
```

## File: src/components/ui/Modal.tsx
```typescript
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
⋮----
/**
 * Focusable element selectors for the focus-trap implementation.
 * We avoid a full package dependency and implement a lightweight trap inline.
 */
⋮----
// Prevent body scroll and trap focus
⋮----
// Save the element that triggered the modal so we can restore focus on close
⋮----
// Focus the first focusable element inside the modal
⋮----
// Restore focus to the triggering element
⋮----
// Handle Escape key + focus-trap on Tab
⋮----
const handleKeyDown = (e: KeyboardEvent) =>
⋮----
// Shift+Tab → wrap to last
⋮----
// Tab → wrap to first
⋮----
{/* Backdrop */}
⋮----
{/* Card */}
```

## File: src/components/ui/Select.tsx
```typescript
import React from 'react';
⋮----
export function Sel({
  children,
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>)
```

## File: src/components/ui/StatusPill.tsx
```typescript
import React from 'react';
⋮----
export function StatusPill(
```

## File: src/components/ui/Toggle.tsx
```typescript
import React from 'react';
⋮----
export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
onChange: (v: boolean)
⋮----
onClick=
```

## File: src/db/db.ts
```typescript
import Dexie, { Table } from 'dexie';
import {
  Transaction,
  CustomCategoryDef,
  Budget,
  SavingsGoal,
  SharedWalletEntry,
  SharedExpense,
  HouseholdSettings,
  AssetEntry,
  LiabilityEntry,
} from '@/types';
⋮----
export interface AppConfig {
  id: string; // usually 'app-config'
  theme: 'dark' | 'light';
  onboardingCompleted: boolean;
  currency: string;
}
⋮----
id: string; // usually 'app-config'
⋮----
export class SpendWiseDatabase extends Dexie
⋮----
householdSettings!: Table<HouseholdSettings, string>; // Since id is optional in HouseholdSettings, we might use a fixed key
⋮----
constructor()
⋮----
// Define tables and indexes
// Note: only index fields you want to query by.
// '&id' means it's a primary key and unique.
⋮----
budgets: 'category', // category string is unique enough for budget (since it maps to Category type)
⋮----
householdSettings: 'name', // or some fixed id
```

## File: src/db/migration.ts
```typescript
import { db } from '@/db/db';
⋮----
export const runDexieMigration = async () =>
⋮----
// Check if Dexie has any transactions
⋮----
// Try to read from localStorage
⋮----
// We can use a transaction to ensure all or nothing
```

## File: src/features/ai/components/SpendingPersonality.tsx
```typescript
import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Brain, Zap, Target, Quote } from 'lucide-react';
import { getSpendingPersonality } from '@/features/reports/insights/reporting';
import { Transaction } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
⋮----
interface SpendingPersonalityProps {
  transactions: Transaction[];
}
⋮----
// silently fail
⋮----
// eslint-disable-next-line react-hooks/set-state-in-effect
```

## File: src/features/analytics/AnalyticsViewMobile.tsx
```typescript
import React from 'react';
import {
  Zap,
  Target,
  PieChart,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MonthlyStats, CategorySpend, Transaction } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { haptic } from '@/core/haptic';
⋮----
interface AnalyticsViewMobileProps {
  monthlyStats: MonthlyStats;
  categorySpending: CategorySpend[];
  totalSpent: number;
  currency: string;
  transactions: Transaction[];
}
⋮----
// Calculate some quick insights
⋮----
{/* Month Progress Card */}
⋮----
{/* Category Breakdown Section */}
⋮----
{/* AI Intelligence Micro-Cards */}
```

## File: src/features/analytics/components/AnomalyDetector.tsx
```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '@/types/finance';
import { detectAnomalies } from '@/features/analytics/insights/anomaly';
import { AlertTriangle, Sparkles } from 'lucide-react';
⋮----
interface AnomalyDetectorProps {
  transactions: Transaction[];
  currency: string;
}
⋮----
export function AnomalyDetector(
```

## File: src/features/analytics/components/BalanceChart.tsx
```typescript
import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { BalanceDataPoint } from '@/types';
import { useStore } from '@/store';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
⋮----
interface BalanceChartProps {
  data: BalanceDataPoint[];
  currency?: string;
}
⋮----
{/* Visually hidden screen reader summary */}
⋮----
{/* Header */}
⋮----
{/* Legend */}
```

## File: src/features/analytics/components/CategoryAnalyzer.tsx
```typescript
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, Sparkles } from 'lucide-react';
import { CategorySpend, Transaction } from '@/types';
import { haptic } from '@/core/haptic';
import { useCategories } from '@/hooks/useCategories';
⋮----
interface CategoryAnalyzerProps {
  categorySpending: CategorySpend[];
  transactions: Transaction[];
  currency: string;
  userRole?: string;
}
⋮----
export function CategoryAnalyzer({
  categorySpending,
  transactions,
  currency,
  userRole,
}: CategoryAnalyzerProps)
⋮----
// 1. Identify Highest Spending
⋮----
// Historical Comparison for Top Category
⋮----
// 2. Trend Analysis (Simulated for demo, but could be real if we had monthlyHistory)
// For now, let's look for weekend vs weekday patterns in the top category
⋮----
// 3. Subscription Insight
⋮----
// 4. Persona Specific Insights
⋮----
// 5. Category Limits
```

## File: src/features/analytics/components/CategoryBreakdownList.tsx
```typescript
import { CategorySpend, AppView } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { haptic } from '@/core/haptic';
⋮----
interface CategoryBreakdownListProps {
  categorySpending: CategorySpend[];
  totalSpent: number;
  currency: string;
  onNavigate?: (view: AppView, category?: string) => void;
}
⋮----
haptic.light();
onNavigate?.('history', cat.name);
```

## File: src/features/analytics/components/HealthScoreChart.tsx
```typescript
/**
 * HealthScoreChart.tsx
 * Line chart showing Financial Health Score over the past N days.
 */
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { ShieldCheck } from 'lucide-react';
import { useHealthHistory } from '@/features/analytics/hooks/useHealthHistory';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface Props {
  currentScore: number;
}
⋮----
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}
⋮----
function CustomTooltip(
⋮----
// Always include today
⋮----
{/* Legend */}
```

## File: src/features/analytics/components/PredictiveForecasting.tsx
```typescript
import React, { useMemo, useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Brain, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Transaction } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface PredictiveForecastingProps {
  transactions: Transaction[];
  currency: string;
  currentBalance: number;
}
⋮----
interface ForecastTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: { future?: boolean } }[];
  label?: string;
  currency?: string;
}
⋮----
useEffect(() => { setMounted(true); }, []); // eslint-disable-line react-hooks/set-state-in-effect
⋮----
// Calculate daily spend rate from last 30 days
// eslint-disable-next-line react-hooks/purity
⋮----
// Build chart points: actual (past) + projected (future)
⋮----
// Reconstruct past balance by replaying transactions day-by-day this month
⋮----
const bal = currentBalance + (dayOfMonth - d) * dailyNetRate * -1; // approximate
⋮----
// Project remaining days
⋮----
// Scenarios
⋮----
{/* KPI strip */}
⋮----
{/* Chart */}
⋮----
{/* Solid line for historical */}
⋮----
{/* Scenarios — only shown when there is actual spend data */}
```

## File: src/features/analytics/components/SpendingDonut.tsx
```typescript
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategorySpend } from '@/types';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
⋮----
interface SpendingDonutProps {
  data: CategorySpend[];
  totalSpent: number;
  currency?: string;
}
⋮----
{/* Visually hidden screen reader summary */}
⋮----
{/* Center */}
⋮----
{/* Category list — Finebank style row list */}
```

## File: src/features/analytics/components/SpendingForecast.tsx
```typescript
import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Transaction } from '@/types';
import { forecastNextMonth } from '@/features/analytics/insights/forecast';
⋮----
interface SpendingForecastProps {
  transactions: Transaction[];
  currency?: string;
}
⋮----
const ConfidenceBadge = (
⋮----
const TrendArrow = (
⋮----
const fmt = (n: number)
⋮----
{/* Header */}
⋮----
{/* Summary bar */}
⋮----
{/* Predicted Income */}
⋮----
{/* Predicted Spend */}
⋮----
Run-rate:
⋮----
{/* Savings */}
⋮----
{/* Current month snapshot */}
⋮----
{/* Category breakdown */}
```

## File: src/features/analytics/hooks/useHealthHistory.ts
```typescript
/**
 * Health Score History Hook
 * Stores a daily snapshot of the health score in localStorage so we can
 * chart it over time in the Analytics view.
 */
import { useEffect, useMemo } from 'react';
import { formatLocalYYYYMMDD } from '@/utils/date';
import { STORAGE_KEYS } from '@/constants';
⋮----
export interface HealthHistoryPoint {
  date: string; // YYYY-MM-DD
  score: number;
}
⋮----
date: string; // YYYY-MM-DD
⋮----
export function useHealthHistory(currentScore: number): HealthHistoryPoint[]
⋮----
// Load existing history once
⋮----
// Append today's snapshot (de-duped by date)
⋮----
/* ignore */
```

## File: src/features/auth/components/BiometricLock.tsx
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Fingerprint, CheckCircle2, AlertCircle } from 'lucide-react';
import { haptic } from '@/core/haptic';
import { STORAGE_KEYS } from '@/constants';
⋮----
interface BiometricLockProps {
  onUnlocked: () => void;
  appName?: string;
}
⋮----
export const BiometricLock: React.FC<BiometricLockProps> = ({
  onUnlocked,
  appName = 'SpendWise',
}) =>
⋮----
// Check if WebAuthn is available
⋮----
// Check if platform authenticator is available (e.g., FaceID/Fingerprint)
⋮----
// Get the stored credential ID (set during biometric enrollment)
⋮----
// First time — enroll the biometric credential
⋮----
authenticatorAttachment: 'platform', // device biometric only
⋮----
// Subsequent logins — verify with stored credential
⋮----
// Fallback simulation:
⋮----
{/* Background Glow */}
⋮----
{/* Animated Rings */}
```

## File: src/features/budget/BudgetView.tsx
```typescript
import React, { useState } from 'react';
import { Target, Plus, Check, X } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/types';
import { SmartBudgetSuggestions } from '@/features/budget/components/SmartBudgetSuggestions';
import { BudgetSummary } from '@/features/budget/components/BudgetSummary';
import { BudgetCategoryCard } from '@/features/budget/components/BudgetCategoryCard';
import { useIsMobile } from '@/hooks/useMediaQuery';
import BudgetViewMobile from '@/features/budget/BudgetViewMobile';
⋮----
const handleAdd = () =>
⋮----
{/* Smart Budget Suggestions */}
⋮----
{/* Header Summary */}
⋮----
{/* Budget List */}
⋮----
onClick=
⋮----
setSelectedCategory(cat);
setLimitAmount(limit);
setIsAdding(true);
```

## File: src/features/budget/components/BudgetCategoryCardMobile.tsx
```typescript
import { motion } from 'framer-motion';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Category, Budget } from '@/types';
import { haptic } from '@/core/haptic';
⋮----
interface BudgetCategoryCardMobileProps {
  b: Budget;
  currency: string;
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
  onEdit: (category: string, limit: number) => void;
  onRemove: (category: Category) => void;
}
⋮----
{/* Background progress indicator (subtle) */}
⋮----
onClick=
```

## File: src/features/budget/hooks/useAlerts.ts
```typescript
import { useMemo, useCallback, useState } from 'react';
import { Transaction, SpendingAlert, AlertSeverity, Budget, Category } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
import { STORAGE_KEYS } from '@/constants';
⋮----
function loadDismissed(): Set<string>
⋮----
/* ignore */
⋮----
function saveDismissed(ids: Set<string>)
⋮----
/* ignore */
⋮----
// ─── Alert generators ─────────────────────────────────────────────────────────
⋮----
function makeId(...parts: (string | number)[]): string
⋮----
function alert(
  id: string,
  severity: AlertSeverity,
  title: string,
  message: string,
  category?: Category,
  actionLabel?: string
): SpendingAlert
⋮----
function median(nums: number[]): number
⋮----
export interface UseAlertsExtras {
  currency?: string;
  predictedEndOfMonth?: number;
  daysLeftInMonth?: number;
}
⋮----
// ─── Hook ─────────────────────────────────────────────────────────────────────
⋮----
export function useAlerts(
  transactions: Transaction[],
  currentBalance: number,
  budgets: Budget[],
  dailySpendRate: number,
  extras?: UseAlertsExtras
)
⋮----
// ── Generate all alerts from current state ─────────────────────────────────
⋮----
// R3-B fix: fmt helpers defined inside useMemo to avoid stale-closure issues
⋮----
const fmt = (n: number, fractionDigits = 2)
const fmt0 = (n: number) => `$
⋮----
// 0. Predictive: month-end balance trajectory
⋮----
// 1. Low balance warning
⋮----
// 2. Critically low balance
⋮----
// 3. Negative balance
⋮----
// 4. High daily spend rate (velocity)
⋮----
// 5. Budget breaches
⋮----
// 6. Spending spike — today vs daily average
⋮----
// 7. Large single transaction (absolute + relative threshold)
⋮----
// 8. Unusual vs your median in that category (30d)
⋮----
// 9. Weekend note
⋮----
// ── Filter out dismissed alerts ────────────────────────────────────────────
⋮----
// ── Actions ────────────────────────────────────────────────────────────────
```

## File: src/features/budget/hooks/useBudgetManager.ts
```typescript
import { useState, useMemo } from 'react';
import { Category, Transaction, Budget, BudgetSuggestion } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { generateBudgetSuggestions } from '@/features/budget/insights/budgetSuggestions';
⋮----
interface UseBudgetManagerOptions {
  budgets: Budget[];
  transactions: Transaction[];
  onUpdateLimit: (category: Category, limit: number) => void;
}
⋮----
export function useBudgetManager({
  budgets,
  transactions,
  onUpdateLimit,
}: UseBudgetManagerOptions)
⋮----
// UI state
⋮----
// Derived data
⋮----
// Handlers
function handleApplySuggestion(category: string, limit: number)
⋮----
function handleApplyAll()
⋮----
function handleAddBudget()
⋮----
// state
⋮----
// derived
⋮----
// handlers
⋮----
// constants
```

## File: src/features/dashboard/components/DailyStats.tsx
```typescript
import Card from '@/components/ui/Card';
⋮----
interface DailyStatsProps {
  currency: string;
  dailySpendRate: number;
  streak: number;
  transactionCount: number;
}
⋮----
export default function DailyStats({
  currency,
  dailySpendRate,
  streak,
  transactionCount,
}: DailyStatsProps)
```

## File: src/features/dashboard/components/FinanceChart.tsx
```typescript
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Card from '@/components/ui/Card';
import ChartTooltip from '@/features/dashboard/components/ChartTooltip';
⋮----
interface FinanceChartProps {
  chartData: Array<{
    month: string;
    Income: number;
    Expenses: number;
  }>;
  currency: string;
}
```

## File: src/features/dashboard/components/GoalsSummary.tsx
```typescript
import { Plus, Target } from 'lucide-react';
import Card from '@/components/ui/Card';
import { AppView } from '@/types';
⋮----
interface GoalsSummaryProps {
  goals: Array<{
    id: string;
    name: string;
    targetAmount: number;
    savedAmount: number;
    emoji: string;
    color?: string;
  }>;
  onNavigate: (view: AppView) => void;
}
⋮----
onClick=
```

## File: src/features/dashboard/components/MobileRecentTransactions.tsx
```typescript
import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { Transaction, AppView } from '@/types';
import { haptic } from '@/core/haptic';
⋮----
interface MobileRecentTransactionsProps {
  recentTransactions: Transaction[];
  onNavigate: (view: AppView) => void;
  currency: string;
}
⋮----
{/* Section header */}
⋮----
{/* Transaction rows */}
⋮----
{/* Category emoji badge */}
⋮----
{/* Name + category */}
⋮----
{/* Amount */}
```

## File: src/features/dashboard/components/RecentTransactions.tsx
```typescript
import React from 'react';
import { Transaction, AppView } from '@/types';
import Card from '@/components/ui/Card';
import { WalletCards } from 'lucide-react';
import { initials, avatarColor } from '@/utils/avatar';
⋮----
interface RecentTransactionsProps {
  recentTx: Transaction[];
  onNavigate: (view: AppView) => void;
  hideBalances: boolean;
  currency: string;
}
```

## File: src/features/dashboard/components/SafeToSpend.tsx
```typescript
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { Transaction } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface SafeToSpendProps {
  transactions: Transaction[];
  currency: string;
  currentBalance: number;
}
⋮----
// Monthly income (credits this month)
⋮----
// Estimate monthly fixed costs (recurring debits)
⋮----
// Target: save 20% of income
⋮----
const essentialBuffer = avgMonthlySpend * 0.3; // 30% for fixed costs remaining
⋮----
// Status
⋮----
{/* Background glow */}
⋮----
{/* Big number */}
⋮----
{/* Progress bar */}
⋮----
{/* Mini stats */}
```

## File: src/features/dashboard/components/SnapCardRow.tsx
```typescript
import React from 'react';
import { Target, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { AppView } from '@/types';
import { haptic } from '@/core/haptic';
⋮----
// ─── Snap-row card ────────────────────────────────────────────────────────────
⋮----
interface SnapCardProps {
  label: string;
  value: string;
  sub: string;
  accent: string;
  icon: React.ReactNode;
  onClick: () => void;
}
⋮----
function SnapCard(
⋮----
// ─── Container ────────────────────────────────────────────────────────────────
⋮----
interface SnapCardRowProps {
  overallBudgetPercent: number;
  totalBudgeted: number;
  goalsCount: number;
  savingsRate: number;
  subSpend: number;
  currency: string;
  onNavigate: (view: AppView) => void;
}
⋮----
export function SnapCardRow({
  overallBudgetPercent,
  totalBudgeted,
  goalsCount,
  savingsRate,
  subSpend,
  currency,
  onNavigate,
}: SnapCardRowProps)
⋮----
onClick=
```

## File: src/features/dashboard/components/StatCard.tsx
```typescript
import { memo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import { haptic } from '@/core/haptic';
⋮----
export interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  iconBg: string;
  trend?: 'up' | 'down' | 'neutral';
  hideBalances?: boolean;
}
⋮----
onClick=
```

## File: src/features/gamification/components/BadgeGallery.tsx
```typescript
/**
 * BadgeGallery.tsx
 * Full achievement badge showcase — unlocked + locked badges with earn criteria.
 */
import { useMemo } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { haptic } from '@/core/haptic';
import { Transaction, SavingsGoal } from '@/types';
⋮----
interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  criteria: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
}
⋮----
interface Props {
  transactions: Transaction[];
  streak: number;
  level: number;
  goals: SavingsGoal[];
  currency?: string;
}
⋮----
function computeBadges(props: Props): Badge[]
⋮----
{/* Header */}
⋮----
{/* Progress bar */}
⋮----
{/* Hover tooltip */}
```

## File: src/features/gamification/components/LevelProgress.tsx
```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { useStore } from '@/store';
import { useQuestReset } from '@/features/gamification/hooks/useQuestReset';
import { AppView } from '@/components/ui/types';
⋮----
{/* Daily XP — live from quest completions */}
⋮----
{/* XP Multiplier */}
⋮----
onClick=
```

## File: src/features/gamification/components/QuestsPanel.tsx
```typescript
import React, { useMemo, useState } from 'react';
import {
  Award,
  Zap,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Coffee,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/core/haptic';
import { generateQuests } from '@/features/analytics/insights/advisor';
import { Transaction } from '@/types';
import { useQuestReset } from '@/features/gamification/hooks/useQuestReset';
⋮----
interface QuestsPanelProps {
  transactions: Transaction[];
}
⋮----
const handleQuestClick = (questId: string, reward: string) =>
⋮----
{/* XP Pop Animation */}
```

## File: src/features/gamification/components/RoundUpVault.tsx
```typescript
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiggyBank, Sparkles, X, ChevronRight } from 'lucide-react';
import { Transaction } from '@/types';
import { useStore } from '@/store';
⋮----
interface RoundUpVaultProps {
  transactions: Transaction[];
  currency: string;
}
⋮----
const handleSweep = () =>
⋮----
const handleReset = () =>
⋮----
{/* Vault total */}
⋮----
{/* Pending sweep */}
⋮----
{/* History toggle */}
⋮----
onClick=
```

## File: src/features/gamification/components/StreakShareCard.tsx
```typescript
/**
 * StreakShareCard.tsx
 * A shareable streak card — renders a canvas/div that can be screenshot-shared.
 * Uses navigator.share or clipboard fallback.
 */
import { useRef, useState } from 'react';
import { Share2, Flame, X } from 'lucide-react';
import { haptic } from '@/core/haptic';
⋮----
interface Props {
  streak: number;
  level: number;
  levelName: string;
  savingsRate: number;
  currency?: string;
}
⋮----
export function StreakShareCard(
⋮----
const handleShare = async () =>
⋮----
/* user cancelled */
⋮----
setOpen(true);
haptic.light();
⋮----
{/* Close */}
⋮----
{/* Card preview */}
⋮----
{/* Background glow */}
⋮----
{/* Logo */}
⋮----
{/* Flame */}
⋮----
{/* Stats row */}
⋮----
{/* Actions */}
⋮----
onClick=
```

## File: src/features/gamification/components/WealthCity.tsx
```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Building2, Landmark, TreePine, Construction, Sparkles } from 'lucide-react';
import { useStore } from '@/store';
import { haptic } from '@/core/haptic';
import { useEffect, useRef } from 'react';
⋮----
// Determine city stage
⋮----
{/* Grid Pattern */}
⋮----
{/* City Title */}
⋮----
{/* Buildings */}
⋮----
{/* Floating Stats */}
```

## File: src/features/gamification/hooks/useQuestReset.ts
```typescript
/**
 * useQuestReset.ts
 * Manages daily quest state with automatic midnight reset.
 * Quests completed today are persisted in localStorage keyed by date.
 * On the next day, all completions reset.
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';
import { STORAGE_KEYS } from '@/constants';
⋮----
interface QuestProgress {
  date: string; // YYYY-MM-DD — the day this applies to
  completed: Record<string, boolean>; // questId → completed
  claimedXP: number; // total XP claimed today
}
⋮----
date: string; // YYYY-MM-DD — the day this applies to
completed: Record<string, boolean>; // questId → completed
claimedXP: number; // total XP claimed today
⋮----
const TODAY = ()
⋮----
function load(): QuestProgress
⋮----
// Reset if it's a new day
⋮----
function save(state: QuestProgress)
⋮----
/* ignore */
⋮----
export function useQuestReset()
⋮----
// Midnight auto-reset
⋮----
if (prev.completed[questId]) return prev; // already done
⋮----
// Add XP to the global store for Level calculation
```

## File: src/features/goals/components/ContributeModal.tsx
```typescript
import { useState } from 'react';
import { Zap } from 'lucide-react';
import Portal from '@/components/ui/Portal';
import { SavingsGoal } from '@/types';
```

## File: src/features/goals/components/GoalCard.tsx
```typescript
import { useEffect, useState, useCallback, memo } from 'react';
import { Calendar, DollarSign, Plus, Edit3, Trash2, Coins, Clock, Target } from 'lucide-react';
import { SavingsGoal } from '@/types';
import { ProgressRing } from '@/features/goals/components/ProgressRing';
import { STATUS_CONFIG } from '@/features/goals/components/constants';
import { daysUntil, formatDate } from '@/features/goals/components/utils';
import { ContributeModal } from '@/features/goals/components/ContributeModal';
import confetti from 'canvas-confetti';
import { STORAGE_KEYS } from '@/constants';
⋮----
// Persist round-up toggle per goal in localStorage
⋮----
const toggleRoundUp = () =>
⋮----
/* ignore */
⋮----
// Milestone confetti at 25%, 50%, 75%
⋮----
/* ignore */
⋮----
break; // one at a time
⋮----
// Time to completion estimate
⋮----
// Estimated monthly round-up savings: avg ₹0.40 spare change × ~25 transactions/month
const estMonthlyRoundUp = 10; // conservative ₹10/mo estimate
⋮----
{/* Colour tint background (§5 GoalCard gradient tint) */}
⋮----
onClick=
⋮----
{/* Countdown + time estimate row */}
⋮----
{/* Round-up active indicator */}
⋮----
onClose=
```

## File: src/features/goals/components/GoalModal.tsx
```typescript
import { useState } from 'react';
import { Target, X } from 'lucide-react';
import Portal from '@/components/ui/Portal';
import { GOAL_EMOJIS, GOAL_COLORS } from '@/features/goals/components/constants';
⋮----
export interface GoalFormData {
  name: string;
  emoji: string;
  targetAmount: string;
  savedAmount: string;
  targetDate: string;
  monthlyContribution: string;
  color: string;
}
⋮----
function defaultForm(): GoalFormData
⋮----
const set = (key: keyof GoalFormData)
⋮----
const validate = (): boolean =>
⋮----
const handleSave = () =>
⋮----
onChange=
```

## File: src/features/goals/GoalsView.tsx
```typescript
import { useState, useEffect } from 'react';
import { Target, Plus, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SavingsGoal, GoalStatus, Transaction } from '@/types';
import { GoalModal, GoalFormData } from '@/features/goals/components/GoalModal';
import { GoalCard } from '@/features/goals/components/GoalCard';
import { GoalsSummary } from '@/features/goals/components/GoalsSummary';
import { BadgeGallery } from '@/features/gamification/components/BadgeGallery';
import { useGamification } from '@/features/gamification/hooks/useGamification';
⋮----
import { useIsMobile } from '@/hooks/useMediaQuery';
import GoalsViewMobile from '@/features/goals/GoalsViewMobile';
⋮----
interface GoalStats {
  activeCount: number;
  achievedCount: number;
  totalTarget: number;
  totalSaved: number;
  overallPercent: number;
  monthlyCommitted: number;
}
⋮----
type GoalInput = Omit<SavingsGoal, 'id' | 'status' | 'createdAt'>;
⋮----
interface GoalsViewProps {
  goals: SavingsGoal[];
  stats: GoalStats;
  onAdd: (data: GoalInput) => void;
  onUpdate: (id: string, data: Partial<SavingsGoal>) => void;
  onDelete: (id: string) => void;
  onContribute: (id: string, amount: number) => void;
  currency?: string;
  transactions?: Transaction[];
}
⋮----
const handleOpenAdd = ()
⋮----
const handleAdd = (form: GoalFormData) =>
⋮----
const handleEdit = (form: GoalFormData) =>
⋮----
// Sort: active first (on-track, at-risk, paused), then achieved
⋮----
{/* Header */}
⋮----
onClick=
⋮----
{/* Summary stats */}
⋮----
{/* Active Goals grid */}
⋮----
{/* ── Hall of Fame — Achieved Goals ── */}
⋮----
{/* Achievement Badge Gallery */}
⋮----
{/* Add modal */}
```

## File: src/features/goals/GoalsViewMobile.tsx
```typescript
import React from 'react';
import { Target, Plus, ChevronRight, TrendingUp } from 'lucide-react';
import { SavingsGoal, Transaction } from '@/types';
import { GoalCard } from '@/features/goals/components/GoalCard';
import { BadgeGallery } from '@/features/gamification/components/BadgeGallery';
import { haptic } from '@/core/haptic';
⋮----
interface GoalsViewMobileProps {
  goals: SavingsGoal[];
  stats: {
    activeCount: number;
    achievedCount: number;
    totalTarget: number;
    totalSaved: number;
    overallPercent: number;
  };
  onAdd: () => void;
  onUpdate: (id: string, data: Partial<SavingsGoal>) => void;
  onDelete: (id: string) => void;
  onEdit: (goal: SavingsGoal) => void;
  onContribute: (id: string, amount: number) => void;
  currency: string;
  transactions: Transaction[];
  streak: number;
  level: number;
}
⋮----
// Sort: active first, then achieved
⋮----
{/* 1. Slim Header */}
⋮----
haptic.medium();
onAdd();
⋮----
{/* 2. Visual Progress Summary */}
⋮----
{/* 3. Goals List */}
⋮----
{/* 4. Badges Section */}
```

## File: src/features/goals/hooks/useGoals.ts
```typescript
import { useCallback, useMemo } from 'react';
import { SavingsGoal, GoalStatus } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
function computeStatus(goal: SavingsGoal): GoalStatus
⋮----
export function useGoals()
⋮----
// BUG-08 fix: use functional update — avoids stale closure when called rapidly
```

## File: src/features/onboarding/components/OnboardingModal.tsx
```typescript
import { useState, useRef, useEffect } from 'react';
import { STORAGE_KEYS } from '@/constants';
import { OnboardingSidebar } from '@/features/onboarding/components/OnboardingSidebar';
import { OnboardingStep1, CurrencySymbol } from '@/features/onboarding/components/OnboardingStep1';
import { OnboardingStep2, UserRole } from '@/features/onboarding/components/OnboardingStep2';
import { OnboardingStep3 } from '@/features/onboarding/components/OnboardingStep3';
⋮----
// ─── Types ─────────────────────────────────────────────────────────────────────
⋮----
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
}
⋮----
// ─── Helpers ───────────────────────────────────────────────────────────────────
⋮----
// eslint-disable-next-line react-refresh/only-export-components
export function loadConfig(): SpendWiseConfig | null
⋮----
function saveConfig(config: SpendWiseConfig): void
⋮----
// ─── Component ─────────────────────────────────────────────────────────────────
⋮----
interface OnboardingModalProps {
  onComplete: (config: SpendWiseConfig) => void;
  preferredName?: string;
  preferredPhone?: string;
}
⋮----
export default function OnboardingModal({
  onComplete,
  preferredName,
  preferredPhone,
}: OnboardingModalProps)
⋮----
const [currency, setCurrency] = useState<CurrencySymbol>('₹'); // Default to ₹ as per user audio
⋮----
// Advanced fields
⋮----
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
⋮----
const handleNextStep = () =>
⋮----
const handleFinalSubmit = () =>
⋮----
const handleKeyDown = (e: React.KeyboardEvent) =>
```

## File: src/features/onboarding/components/OnboardingSidebar.tsx
```typescript
import { Shield, TrendingUp, Target, Zap } from 'lucide-react';
⋮----
export function OnboardingSidebar()
```

## File: src/features/parental/components/ParentalControlGate.tsx
```typescript
import { useState } from 'react';
import { Lock, Baby, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';
import { PinInput } from '@/components/ui/PinInput';
⋮----
const handleUnlock = async () =>
```

## File: src/features/parental/components/ParentalLockScreen.tsx
```typescript
import React from 'react';
import { Lock } from 'lucide-react';
import { PinInput } from '@/components/ui/PinInput';
⋮----
interface ParentalLockScreenProps {
  unlockPin: string;
  setUnlockPin: (pin: string) => void;
  unlockError: string;
  setUnlockError: (error: string) => void;
  handleUnlock: () => void;
}
⋮----
export const ParentalLockScreen: React.FC<ParentalLockScreenProps> = ({
  unlockPin,
  setUnlockPin,
  unlockError,
  setUnlockError,
  handleUnlock,
}) =>
```

## File: src/features/parental/components/ParentalSetupFlow.tsx
```typescript
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Save, Lock, Camera } from 'lucide-react';
import { PinInput } from '@/components/ui/PinInput';
import { ChildQRScanner } from '@/features/parental/components/ChildQRScanner';
import type { ParentalControlState } from '@/store';
⋮----
interface ParentalSetupFlowProps {
  setupStep: 'welcome' | 'pin' | 'limits';
  setSetupStep: (step: 'welcome' | 'pin' | 'limits') => void;
  newPin: string;
  setNewPin: (pin: string) => void;
  pinError: string;
  handleSetPin: () => void;
  completeSetup: () => void;
  settings: ParentalControlState;
  updateSettings: (updates: Partial<ParentalControlState>) => void;
}
⋮----
onClick=
⋮----
onChange=
```

## File: src/features/parental/hooks/useParentalManager.ts
```typescript
import { useState } from 'react';
import { useStore } from '@/store';
⋮----
export function useParentalManager()
⋮----
// Setup state
⋮----
// Unlocking state
⋮----
const handleUnlock = async () =>
⋮----
const handleSetPin = async () =>
⋮----
const handleApprove = (id: string) =>
⋮----
const handleReject = (id: string) =>
⋮----
const updateSettings = (updates: Partial<typeof settings>) =>
⋮----
const lockSession = ()
const removePin = ()
⋮----
const completeSetup = () =>
```

## File: src/features/portfolio/components/AddModal.tsx
```typescript
import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import Portal from '@/components/ui/Portal';
import { ASSET_TYPES, LIABILITY_TYPES } from '@/data/portfolioConfig';
import type { AssetType, LiabilityType } from '@/features/portfolio/types';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
⋮----
export interface AddModalData {
  name: string;
  type: string | AssetType | LiabilityType;
  balance: number;
  icon?: string;
  color?: string;
  interestRate?: number;
  minPayment?: number;
}
⋮----
export interface AddModalProps {
  mode: 'asset' | 'liability';
  currency: string;
  onAdd: (data: AddModalData) => void;
  onClose: () => void;
  config: SpendWiseConfig | null;
}
⋮----
const handleSubmit = () =>
⋮----
onFocus=
```

## File: src/features/portfolio/components/NetWorthEvolution.tsx
```typescript
import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Transaction } from '@/types';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
⋮----
interface NetWorthEvolutionProps {
  transactions: Transaction[];
  currency: string;
}
⋮----
// Sort transactions by date
⋮----
// Group by date to show balance at end of each day
⋮----
// Only show percentage when initial is meaningful (abs > 10); cap at ±999%
⋮----
absInitial >= 10 ? Math.max(-999, Math.min(999, (netChange / absInitial) * 100)) : null; // null = not meaningful enough to show
```

## File: src/features/portfolio/PortfolioView.tsx
```typescript
import { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { usePortfolio } from '@/features/portfolio/hooks/usePortfolio';
import FutureWealthSimulator from '@/features/portfolio/components/FutureWealthSimulator';
import DebtPlanner from '@/features/portfolio/components/DebtPlanner';
import AddModal, { AddModalData } from '@/features/portfolio/components/AddModal';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { useIsMobile } from '@/hooks/useMediaQuery';
import PortfolioViewMobile from '@/features/portfolio/PortfolioViewMobile';
import { PortfolioHeader } from '@/features/portfolio/components/PortfolioHeader';
import { PortfolioSummaryBanner } from '@/features/portfolio/components/PortfolioSummaryBanner';
import { PortfolioInsights } from '@/features/portfolio/components/PortfolioInsights';
import { PortfolioLists } from '@/features/portfolio/components/PortfolioLists';
import type { FinanceState } from '@/types/state';
⋮----
// ─── Main ─────────────────────────────────────────────────────────────────────
⋮----
interface PortfolioViewProps {
  currency?: string;
  financeState: FinanceState;
  config: SpendWiseConfig | null;
}
⋮----
// Calculate Wealth Health Score (simplified)
⋮----
// Use monthlyStats from financeState for more accurate "Monthly" numbers
⋮----
onAddLiability=
```

## File: src/features/profile/components/useProfileView.ts
```typescript
import { useState, useCallback, useRef, useEffect } from 'react';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { parseTransactionsJSON } from '@/utils/import';
import { AppNotification } from '@/types';
import { encryptData, decryptData } from '@/core/encryption';
import { useStore } from '@/store';
import { downloadDatabaseBackup, importDatabase } from '@/db/backup';
import { useCurrency, CurrencyCode } from '@/contexts/CurrencyContext';
import { haptic } from '@/core/haptic';
⋮----
export type FontSizeKey = (typeof FONT_SIZES)[number];
⋮----
export function useProfileView(
  config: SpendWiseConfig | null,
  onUpdateConfig: (cfg: SpendWiseConfig) => void,
  addNotification?: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void
)
⋮----
// Preferences from secure store
⋮----
// Sync DOM with font size (in case it wasn't caught globally)
⋮----
// Handlers
const handleFontSize = (size: FontSizeKey) =>
const handleDarkMode = (on: boolean) =>
const toggleHighContrast = (checked: boolean) =>
const toggleHaptics = (enabled: boolean) =>
const toggleShake = (enabled: boolean) =>
const requestNotifPermission = async () =>
const testNotification = () =>
const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) =>
⋮----
const handleSecureExport = async (password: string) =>
const handleRestore = async (file: File, password: string) =>
const handleRawDBExport = async () =>
const handleRawDBImport = async (e: React.ChangeEvent<HTMLInputElement>) =>
const handleImportTransactions = async (e: React.ChangeEvent<HTMLInputElement>) =>
const handleCurrencySelect = (code: CurrencyCode) =>
⋮----
// form fields
⋮----
// modals
⋮----
// avatar
⋮----
// accessibility
⋮----
// handlers
```

## File: src/features/recurring/hooks/useAutomations.ts
```typescript
import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { RecurringTransaction, Transaction } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
function getNextDate(dateStr: string, frequency: RecurringTransaction['frequency']): string
⋮----
export function useAutomations()
⋮----
// Use a ref to ensure we only run this once per mount, or avoid infinite loops if state updates trigger re-renders
⋮----
// While the next occurrence is today or in the past
⋮----
// Create a transaction for this occurrence
⋮----
// Calculate the next one
```

## File: src/features/recurring/hooks/useRecurring.ts
```typescript
import { useMemo } from 'react';
import { Transaction, RecurringPattern } from '@/types';
import { detectRecurringPatterns } from '@/utils/recurringDetection';
⋮----
export function useRecurring(transactions: Transaction[]): RecurringPattern[]
```

## File: src/features/reports/ReportsView.tsx
```typescript
import React, { useRef, useState } from 'react';
import { FileText, Sparkles, Download, Share2, Calendar, Loader2, Printer } from 'lucide-react';
import { generateMonthlyReport } from '@/features/reports/insights/reporting';
⋮----
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Transaction, MonthlyStats } from '@/types';
⋮----
interface ReportsViewProps {
  transactions: Transaction[];
  currency: string;
  monthlyStats: MonthlyStats;
}
⋮----
const handleGenerate = async () =>
⋮----
const handleDownloadMD = () =>
⋮----
const handlePrintPDF = () =>
⋮----
// Simple sanitization to prevent XSS via print window (SEC-10)
const sanitizeHtml = (html: string): string =>
⋮----
const handleShare = async () =>
⋮----
setReport(null); // Reset report when month changes
```

## File: src/features/shared/components/SharedGroups.tsx
```typescript
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { Ico } from '@/components/ui/Icons';
import { SharedGroup } from '@/features/shared/hooks/useSharedWallets';
import { haptic } from '@/core/haptic';
⋮----
const relTime = (d: string) =>
⋮----
export function InviteBanner({
  invites,
  onAccept,
  onDecline,
}: {
  invites: {
    memberId: string;
    groupId: string;
    groupName: string;
    groupPurpose: string;
    invitedAt: string;
  }[];
onAccept: (id: string)
⋮----
haptic.medium();
onAccept(inv.memberId);
⋮----
export function EmptyState(
⋮----
haptic.light();
setOpen(v
⋮----
<div onClick=
⋮----
onCreate();
setOpen(false);
```

## File: src/features/shared/components/SharedOverview.tsx
```typescript
import { motion } from 'framer-motion';
import { Users, Sparkles, Wallet, Target } from 'lucide-react';
import { haptic } from '@/core/haptic';
⋮----
interface SharedOverviewProps {
  groupName: string;
  purposeConfig: { bg: string; border: string; text: string };
  purpose: string;
  tab: string;
  setTab: (tab: 'wallet' | 'expenses' | 'goals' | 'members' | 'activity') => void;
  currency: string;
  walletBalance: number;
  membersCount: number;
  goalsCount: number;
}
⋮----
haptic.light();
setTab('wallet');
⋮----
setTab('members');
⋮----
setTab('goals');
```

## File: src/features/shared/components/SharedTabs.tsx
```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { SharedGoal, SharedGroupMember, SharedWalletEntry, SharedExpense, SharedGoalContribution } from '@/features/shared/hooks/useSharedWallets';
import { Ico } from '@/components/ui/Icons';
import { Avatar } from '@/components/ui/Avatar';
import { StatusPill } from '@/components/ui/StatusPill';
import { Activity, Plus, ArrowRight, Sparkles } from 'lucide-react';
⋮----
const fmt = (v: number, currency: string) => `$
⋮----
interface TimelineItem {
  id: string;
  date: number;
  dateStr: string;
  type: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  amount: number;
  color: string;
  bg: string;
  border: string;
}
⋮----
// Settlement logic
⋮----
{/* Balances Board */}
⋮----
{/* Settlements Suggestion Panel */}
⋮----
{/* Expenses Log */}
⋮----
Math.ceil((new Date(g.target_date).getTime() - Date.now()) / 86400000) // eslint-disable-line react-hooks/purity
⋮----
onClick=
```

## File: src/features/subscriptions/components/PriceHikeDetector.tsx
```typescript
import React, { useMemo, useState } from 'react';
import { AlertTriangle, TrendingUp, Mail, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '@/types';
⋮----
interface PriceHikeDetectorProps {
  transactions: Transaction[];
  currency: string;
}
⋮----
interface HikeAlert {
  merchant: string;
  oldAmount: number;
  newAmount: number;
  changePct: number;
  lastDate: string;
}
⋮----
function CancellationEmail(
⋮----
const handleCopy = () =>
⋮----
onClick=
```

## File: src/features/subscriptions/components/SubscriptionManager.tsx
```typescript
import { useState } from 'react';
import {
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  Plus,
  Zap,
  Clock,
} from 'lucide-react';
import { RecurringPattern } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import AddSubscriptionModal from '@/features/subscriptions/components/AddSubscriptionModal';
import { useCurrency } from '@/contexts/CurrencyContext';
import { SubscriptionCalendar } from '@/features/subscriptions/components/SubscriptionCalendar';
import { useSubscriptionManager } from '@/features/subscriptions/hooks/useSubscriptionManager';
⋮----
interface SubscriptionManagerProps {
  patterns: RecurringPattern[];
  currency?: string;
}
⋮----
function getServiceColor(name: string): string
⋮----
function getServiceInitials(name: string): string
⋮----
{/* Header */}
⋮----
onClick=
⋮----
{/* Stat Cards */}
⋮----
{/* Upcoming this week alert */}
⋮----
{/* Calendar View */}
⋮----
{/* Annual Summary */}
```

## File: src/features/subscriptions/hooks/useSubscriptions.ts
```typescript
import { useMemo, useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';
import { detectRecurringPatterns } from '@/utils/recurringDetection';
⋮----
export function useSubscriptions()
⋮----
// Stable refs to prevent the effect from re-running when store functions are recreated
⋮----
// Auto-detector logic
```

## File: src/features/sync/components/CSVImporter.tsx
```typescript
import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { Transaction } from '@/types';
import { parseCSVLocally } from '@/features/sync/parsers/csv';
⋮----
interface CSVImporterProps {
  onImport: (transactions: Transaction[]) => void;
}
⋮----
type MappingKey = 'date' | 'merchant' | 'amount' | 'category' | 'type' | 'skip';
interface ColumnMapping {
  [colIndex: number]: MappingKey;
}
⋮----
// ── Helpers ───────────────────────────────────────────────────────────────────
⋮----
function parseCSVLine(line: string): string[]
⋮----
function guessMapping(headers: string[]): ColumnMapping
⋮----
// ── Component ─────────────────────────────────────────────────────────────────
⋮----
type Step = 'upload' | 'mapping' | 'preview' | 'done';
⋮----
const reset = () =>
⋮----
const buildPreview = async () =>
⋮----
e.preventDefault();
setIsDragging(true);
⋮----
onDragLeave=
⋮----
setIsDragging(false);
⋮----
if (f) processFile(f);
⋮----
onClick=
```

## File: src/features/transactions/components/BulkActionHeader.tsx
```typescript
import React from 'react';
import { Trash2, X } from 'lucide-react';
import { Category } from '@/types';
import { CategoryDropdown } from '@/components/ui/CategoryDropdown';
⋮----
export interface BulkActionHeaderProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkCategoryChange: (newCategory: Category) => void;
  onBulkDelete: () => void;
}
```

## File: src/features/transactions/components/HistoryToolbar.tsx
```typescript
import { useRef } from 'react';
import { Download, Upload, FileText } from 'lucide-react';
import { Transaction } from '@/types';
import { haptic } from '@/core/haptic';
import { exportCSV, exportJSON } from '@/utils/export';
⋮----
interface HistoryToolbarProps {
  filtered: Transaction[];
  currency: string;
  onImportClick?: () => void;
  onPDFReport?: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
⋮----
const tealBtn = (d: boolean) => (
⋮----
haptic.medium();
exportCSV(filtered);
⋮----
style=
⋮----
exportJSON(filtered);
⋮----
onClick=
```

## File: src/features/transactions/components/SortBtn.tsx
```typescript
import { ChevronUp, ChevronDown } from 'lucide-react';
import { haptic } from '@/core/haptic';
import type { SortKey, SortDir } from '@/features/transactions/components/historyTypes';
⋮----
interface SortBtnProps {
  label: string;
  field: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}
⋮----
export function SortBtn(
⋮----
haptic.light();
onSort(field);
```

## File: src/features/transactions/components/TransactionFilters.tsx
```typescript
import React from 'react';
import { Search, Filter, X, Calendar, IndianRupee } from 'lucide-react';
import { Category } from '@/types';
import { haptic } from '@/core/haptic';
⋮----
export type TypeFilter = 'all' | 'credit' | 'debit';
⋮----
export interface TransactionFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  showDateFilter: boolean;
  setShowDateFilter: React.Dispatch<React.SetStateAction<boolean>>;
  dateFrom: string;
  setDateFrom: (s: string) => void;
  dateTo: string;
  setDateTo: (s: string) => void;
  typeFilter: TypeFilter;
  setTypeFilter: (t: TypeFilter) => void;
  categoryFilter: Category | 'All';
  setCategoryFilter: (c: Category | 'All') => void;
  allCategories: Category[];
  mergedIcons: Record<string, string>;
  hasFilters: boolean;
  clearFilters: () => void;
  // Amount range
  amountMin?: string;
  setAmountMin?: (v: string) => void;
  amountMax?: string;
  setAmountMax?: (v: string) => void;
  showAmountFilter?: boolean;
  setShowAmountFilter?: React.Dispatch<React.SetStateAction<boolean>>;
}
⋮----
// Amount range
⋮----
onClick=
⋮----
haptic.light();
setShowDateFilter(s
⋮----
setDateFrom('');
setDateTo('');
⋮----
setAmountMin('');
setAmountMax('');
⋮----
setTypeFilter(t);
⋮----
setCategoryFilter(cat as Category | 'All');
```

## File: src/features/transactions/components/TransactionList.tsx
```typescript
import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { AlertCircle } from 'lucide-react';
import { SortBtn } from './SortBtn';
import TransactionRow from './TransactionRow';
import { DisplayRow } from '../hooks/useTransactionHistory';
import { Transaction, Category } from '@/types';
import type { SortKey, SortDir } from './historyTypes';
⋮----
export interface TransactionListProps {
  filtered: Transaction[];
  displayRows: DisplayRow[];
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onCategoryChange?: (id: string, newCategory: Category) => void;
  onDelete?: (id: string) => void;
  onEdit?: (tx: Transaction) => void;
  currency: string;
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
  sortKey: SortKey;
  sortDir: SortDir;
  handleSort: (key: SortKey) => void;
  virtuosoRef?: React.Ref<React.ElementRef<typeof Virtuoso>>;
}
⋮----
else setSelectedIds(new Set(filtered.map(t
```

## File: src/hooks/useTheme.ts
```typescript
import { useState, useEffect, useCallback } from 'react';
import { ThemeMode } from '@/types';
import { STORAGE_KEYS } from '@/constants';
⋮----
function loadTheme(): ThemeMode
⋮----
// Respect system preference on first visit
⋮----
/* ignore */
⋮----
// ─── Apply theme to <html> element ────────────────────────────────────────────
// We toggle a class on <html> that CSS variables are keyed to.
⋮----
function applyTheme(mode: ThemeMode)
⋮----
// ─── Hook ─────────────────────────────────────────────────────────────────────
⋮----
export function useTheme()
⋮----
// Apply on mount and whenever theme changes
⋮----
/* ignore */
```

## File: src/utils/export.ts
```typescript
import { Transaction } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export function exportCSV(transactions: Transaction[])
⋮----
export function exportJSON(transactions: Transaction[])
```

## File: src/utils/import.ts
```typescript
import { Transaction, Category } from '@/types';
⋮----
interface ParsedTransactionItem {
  id?: string;
  amount?: string | number;
  merchant?: string;
  category?: string;
  date?: string;
  type?: string;
  description?: string;
  tags?: string | string[];
  status?: string;
}
⋮----
/**
 * Validates and parses a JSON file containing an array of transactions.
 * Returns the valid transactions and any errors encountered.
 */
export async function parseTransactionsJSON(
  file: File
): Promise<
```

## File: src/utils/share.ts
```typescript
import { Transaction } from '@/types';
⋮----
export const shareTransactions = async (transactions: Transaction[], currency: string = '$') =>
```

## File: src/utils/upiPayment.ts
```typescript
/**
 * UPI Payment Intent Utility
 * ─────────────────────────────────────────────────────────────────────────────
 * Builds native `upi://` deep links that open any installed UPI app on Android
 * (GPay, PhonePe, Paytm, BHIM, etc.) and handles the payment return flow.
 *
 * When user completes payment in the UPI app, it calls the pn (payment notice)
 * URL which can be a page on our domain with query params, or we check URL
 * params on visibilitychange (app resumed) / pageshow.
 *
 * UPI deep link spec:
 *   upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE&tr=TXNREF
 */
⋮----
import { Transaction } from '@/types';
import { parseUPIPayment } from '@/utils/razorpaySync';
import { STORAGE_KEYS } from '@/constants';
⋮----
export interface UPIPaymentParams {
  /** Payee VPA — the merchant's UPI ID e.g. merchant@upi */
  pa: string;
  /** Payee name shown in UPI app */
  pn: string;
  /** Amount in INR (decimal string) */
  am: number;
  /** Transaction note / memo */
  tn?: string;
  /** Transaction reference — generated by us to track the payment */
  tr?: string;
}
⋮----
/** Payee VPA — the merchant's UPI ID e.g. merchant@upi */
⋮----
/** Payee name shown in UPI app */
⋮----
/** Amount in INR (decimal string) */
⋮----
/** Transaction note / memo */
⋮----
/** Transaction reference — generated by us to track the payment */
⋮----
export interface UPIPaymentResult {
  status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'SUBMITTED';
  transactionId: string;
  transactionRef: string;
  responseCode: string;
  amount: number;
  pa: string;
  pn: string;
  tn: string;
}
⋮----
/** How long (ms) to keep a pending payment before considering it abandoned */
const PENDING_TTL = 15 * 60 * 1000; // 15 minutes
⋮----
export interface PendingUPIPayment {
  tr: string; // transaction reference
  pa: string; // payee VPA
  pn: string; // payee name
  am: number; // amount
  tn: string; // note / description
  ts: number; // timestamp millis when initiated
}
⋮----
tr: string; // transaction reference
pa: string; // payee VPA
pn: string; // payee name
am: number; // amount
tn: string; // note / description
ts: number; // timestamp millis when initiated
⋮----
/**
 * Build a UPI intent URL.
 * Returns both a upi:// URL (works on Android apps) and a web-intent URL.
 */
export function buildUPIUrl(
  params: UPIPaymentParams,
  scheme?: string
):
⋮----
url: returnUrl, // merchant callback (not all apps support this)
mc: '0000', // merchant category code — generic
⋮----
/**
 * Save pending payment to localStorage so we can retrieve it
 * after the user returns from the UPI app.
 */
export function savePendingUPIPayment(payment: PendingUPIPayment)
⋮----
/** Retrieve and clear the saved pending UPI payment */
export function getPendingUPIPayment(): PendingUPIPayment | null
⋮----
export function clearPendingUPIPayment()
⋮----
/**
 * Parse UPI return query parameters from current URL.
 * UPI apps append: Status, txnId, txnRef, responseCode, ApprovalRefNo
 * We also add our own params: upi_status, upi_tr, upi_am, upi_pa, upi_pn, upi_tn
 */
export function parseUPIReturnParams(): UPIPaymentResult | null
⋮----
// Check our own params (appended when we open upi:// with the returnUrl trick)
⋮----
// No UPI params at all
⋮----
/**
 * Convert a UPI payment result into a SpendWise Transaction.
 * Calls AI categorisation for the merchant/note.
 */
export async function upiResultToTransaction(result: UPIPaymentResult): Promise<Transaction>
⋮----
/**
 * Opens a UPI intent link. On Android it launches the UPI app chooser.
 * On desktop/web it offers a fallback.
 */
export function openUPIIntent(upiUrl: string): void
⋮----
// Direct redirect is the safest, most robust way on mobile browsers (Chrome, Safari, etc.)
// It avoids "double intent" triggers and matches browser security policies.
⋮----
// On desktop, try iframe first so we don't navigate to an invalid scheme page
⋮----
} catch { /* iframe removal failed — non-critical */ }
⋮----
// Fallback if iframe didn't prompt anything
⋮----
/**
 * All-in-one: initiate a UPI payment.
 * Saves the pending payment, builds URL, opens intent.
 */
export function initiateUPIPayment(params: UPIPaymentParams, scheme?: string): string
⋮----
// Save pending payment for return detection
⋮----
// Open UPI app
⋮----
/** List of common UPI-enabled apps with their deep link app packages (Android) */
⋮----
/**
 * P2P Verification Strategy (No Backend Required)
 *
 * Since UPI intents (`upi://pay`) do not securely report back success to a web app,
 * and we don't have a merchant backend to receive Razorpay/Cashfree webhooks,
 * the only secure way to verify a P2P payment occurred on the device is by
 * reading the bank's SMS confirmation ("Debited Rs. 500").
 *
 * Future Implementation: WebOTP API or a React Native / Capacitor plugin.
 */
export async function verifyPaymentViaSMS(
  _expectedAmount: number,
  _expectedRef: string
): Promise<boolean>
⋮----
// Check if WebOTP API is available
⋮----
// Note: WebOTP requires the SMS to end with `@ourdomain.com #12345`
// which banks do not send. So WebOTP only works if the app has native SMS read permissions.
// In a PWA, this is highly restricted. In an Android wrapper (TWA/Capacitor), it's possible.
return false; // Stub
```

## File: src/components/ui/PinInput.tsx
```typescript
import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
⋮----
function PinDot(
⋮----
const press = (d: string) =>
```

## File: src/data/lessons.ts
```typescript
export interface Lesson {
  id: string;
  title: string;
  summary: string;
  readingTime: number; // minutes
  xpReward: number;
  level: number; // min level to unlock
  icon: string;
  color: string;
  category: 'budgeting' | 'investing' | 'debt' | 'mindset' | 'advanced';
  body: string[]; // paragraphs
  keyTakeaways: string[];
  roles?: ('student' | 'professional' | 'business')[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}
⋮----
readingTime: number; // minutes
⋮----
level: number; // min level to unlock
⋮----
body: string[]; // paragraphs
```

## File: src/data/portfolioConfig.ts
```typescript
import { AssetType, LiabilityType } from '@/types';
⋮----
export function getAssetCfg(type: AssetType)
⋮----
export function getLiabilityCfg(type: LiabilityType)
```

## File: src/db/backup.ts
```typescript
import { exportDB, importDB } from 'dexie-export-import';
import { db } from '@/db/db';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
/**
 * Exports the entire Dexie database to a JSON Blob.
 */
export const exportDatabase = async (): Promise<Blob> =>
⋮----
/**
 * Downloads the exported database as a JSON file.
 */
export const downloadDatabaseBackup = async () =>
⋮----
/**
 * Imports a JSON file into the Dexie database, overwriting existing data.
 */
export const importDatabase = async (file: File) =>
⋮----
// Overwrite existing data
await db.delete(); // Delete current DB
await db.open(); // Re-open fresh DB
⋮----
// After importing Dexie tables, we need to refresh the Zustand store
// Since Zustand's persist reads from db.keyval on init, we can force a reload
```

## File: src/features/advisor/AdvisorViewMobile.tsx
```typescript
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, MicOff, Trash2, Zap, AlertTriangle } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { haptic } from '@/core/haptic';
import { Message } from '@/features/advisor/types';
import { MonthlyStats, AppView } from '@/types';
⋮----
interface AdvisorViewMobileProps {
  messages: Message[];
  onSend: (text: string) => void;
  isLoading: boolean;
  isListening: boolean;
  toggleListening: () => void;
  onClearChat: () => void;
  monthlyStats: MonthlyStats;
  dynamicQuickActions: string[];
  hasGemini: boolean;
  onNavigate?: (view: AppView) => void;
}
⋮----
const handleSend = () =>
⋮----
{/* 1. Header */}
⋮----
haptic.medium();
onClearChat();
⋮----
{/* 2. Chat Area */}
⋮----

⋮----
{/* 3. Quick Actions */}
⋮----
haptic.light();
setInput(action);
⋮----
{/* 4. Input Area */}
⋮----
toggleListening();
```

## File: src/features/ai/components/AIInputTools.tsx
```typescript
import { Loader2, Camera, Mic } from 'lucide-react';
import { RefObject } from 'react';
⋮----
{/* ── Snap Receipt ─────────────────────────────────────────── */}
⋮----
{/* ── Magic Mic ─────────────────────────────────────────────── */}
⋮----
handleVoiceInput();
⋮----
{/* Live scan/voice status hint */}
```

## File: src/features/ai/components/ReceiptScanner.tsx
```typescript
import React, { useState, useRef, useEffect } from 'react';
import { processReceipt } from '@/core/api/OCRService';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface ReceiptScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onExtracted: (data: { merchant: string; amount: number; date: string }) => void;
}
⋮----
// Cropping & Resizing State (percentages)
⋮----
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
⋮----
// Custom pointer down handler for drag and resize
const handlePointerDown = (e: React.TouchEvent | React.MouseEvent, action: string) =>
⋮----
// Global pointer move and up handlers for smooth touch/mouse resizing
⋮----
const handleMove = (e: TouchEvent | MouseEvent) =>
⋮----
const maxDx = initCrop.width - 20; // min width 20%
const maxDy = initCrop.height - 20; // min height 20%
⋮----
const handleUp = () =>
⋮----
// Helper to draw cropped image to canvas and export new File
const cropImageToFile = async (
    dataUrl: string,
    cropArea: { x: number; y: number; width: number; height: number },
    originalFile: File
): Promise<File> =>
⋮----
const processImage = async () =>
⋮----
onClick=
⋮----
{/* Flawless Interactive Crop Box Overlay */}
⋮----
{/* Center Drag Area */}
⋮----
{/* Top-Left Corner Handle */}
⋮----
{/* Top-Right Corner Handle */}
⋮----
{/* Bottom-Left Corner Handle */}
⋮----
{/* Bottom-Right Corner Handle */}
⋮----
setImage(null);
setIsCropping(false);
```

## File: src/features/analytics/AnalyticsView.tsx
```typescript
import { useMemo } from 'react';
import { FINANCE_DEFAULTS } from '@/constants';
import { TrendingUp, Wallet, PiggyBank, ArrowUpRight, Receipt } from 'lucide-react';
import { MonthlyHistoryPoint, MonthlyStats, CategorySpend, Transaction, AppView } from '@/types';
⋮----
import { useTransactions } from '@/hooks/useTransactions';
import { TaxPredictor } from '@/features/analytics/components/TaxPredictor';
import { AnomalyDetector } from '@/features/analytics/components/AnomalyDetector';
import { SpendingForecast } from '@/features/analytics/components/SpendingForecast';
import { calculateHealthScore } from '@/features/analytics/insights/healthScore';
import { PeerComparison } from '@/features/analytics/components/PeerComparison';
import { CashFlowWaterfall } from '@/features/analytics/components/CashFlowWaterfall';
import { HealthScoreChart } from '@/features/analytics/components/HealthScoreChart';
import SpendingDonut from '@/features/analytics/components/SpendingDonut';
import BalanceChart from '@/features/analytics/components/BalanceChart';
import SpendingHeatmap from '@/features/analytics/components/SpendingHeatmap';
import { CategoryAnalyzer } from '@/features/analytics/components/CategoryAnalyzer';
import {
  StatCard,
} from '@/features/analytics/components/AnalyticsPrimitives';
import { TopMerchants } from '@/features/analytics/components/TopMerchants';
import { HealthIndexCard } from '@/features/analytics/components/HealthIndexCard';
import { useIsMobile } from '@/hooks/useMediaQuery';
import AnalyticsViewMobile from '@/features/analytics/AnalyticsViewMobile';
import { IncomeExpensesChart } from '@/features/analytics/components/IncomeExpensesChart';
import { SavingsTrendChart } from '@/features/analytics/components/SavingsTrendChart';
import { CategoryBreakdownList } from '@/features/analytics/components/CategoryBreakdownList';
⋮----
interface AnalyticsViewProps {
  monthlyHistory: MonthlyHistoryPoint[];
  monthlyStats: MonthlyStats;
  categorySpending: CategorySpend[];
  totalSpent: number;
  currency?: string;
  transactions?: Transaction[];
  onNavigate?: (view: AppView, category?: string) => void;
  config?: { userRole?: string };
}
⋮----
export default function AnalyticsView({
  monthlyHistory,
  monthlyStats,
  categorySpending,
  totalSpent,
  currency = '$',
  transactions = [],
  onNavigate,
  config,
}: AnalyticsViewProps)
⋮----
{/* AI Financial Health Index */}
⋮----
{/* Page Header */}
⋮----
{/* Mini Stats */}
⋮----
{/* Income vs Expenses Bar Chart */}
⋮----
{/* Two column: Savings trend + Category breakdown */}
⋮----
{/* Net Savings Line */}
⋮----
{/* Category Breakdown */}
⋮----
{/* Category Intelligence */}
⋮----
{/* Spending Donut + Balance */}
⋮----
{/* Spending Heatmap */}
⋮----
{/* Top Merchants */}
⋮----
{/* Tax Liability Predictor */}
⋮----
{/* Anomaly Detection */}
⋮----
{/* Spending Forecast */}
⋮----
{/* Peer Comparison */}
⋮----
{/* Cash Flow Waterfall */}
⋮----
{/* Financial Health Score History */}
```

## File: src/features/analytics/components/SpendingHeatmap.tsx
```typescript
import { useMemo } from 'react';
import { formatLocalYYYYMMDD } from '@/utils/date';
import { useTheme } from '@/hooks/useTheme';
⋮----
interface SpendingHeatmapProps {
  transactions: { date: string; amount: number; type: string }[];
  currency?: string;
}
⋮----
function getDayColor(amount: number, max: number): string
⋮----
if (ratio < 0.2) return '#dcfce7'; // lightest green
⋮----
if (ratio < 0.6) return '#fb923c'; // orange
if (ratio < 0.8) return '#ef4444'; // red
return '#b91c1c'; // darkest red
⋮----
function getDayColorDark(amount: number, max: number): string
⋮----
// R3-A fix: compute isDark inside useMemo so it re-evaluates on theme changes
⋮----
// Build a map of date → total debit spending
⋮----
// Build weeks array (rows = day of week 0-6, cols = weeks)
⋮----
const startDow = firstDay.getDay(); // 0=Sun
⋮----
// Pad start
⋮----
// Split into weeks (chunks of 7)
⋮----
{/* Legend */}
⋮----
{/* Day of week header */}
⋮----
{/* Calendar grid */}
⋮----
{/* Tooltip on hover */}
```

## File: src/features/budget/BudgetViewMobile.tsx
```typescript
import React, { useState } from 'react';
import {
  Target,
  Plus,
  Check,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types';
import { haptic } from '@/core/haptic';
import { BudgetSummaryMobile } from '@/features/budget/components/BudgetSummaryMobile';
import { BudgetCategoryCardMobile } from '@/features/budget/components/BudgetCategoryCardMobile';
⋮----
interface BudgetViewMobileProps {
  currency: string;
}
⋮----
const handleAdd = () =>
⋮----
const handleEdit = (category: string, limit: number) =>
⋮----
{/* Summary Header */}
⋮----
{/* Action Bar */}
⋮----
{/* Add/Edit Budget Form */}
⋮----
haptic.light();
setSelectedCategory(cat);
⋮----
{/* Budget List */}
```

## File: src/features/dashboard/components/DashboardHeroDesktop.tsx
```typescript
import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
} from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { MonthlyStats, BalanceDataPoint } from '@/types';
import { haptic } from '@/core/haptic';
⋮----
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
⋮----
function getGreeting(): string
⋮----
function getHealthLabel(score: number):
⋮----
export default function DashboardHeroDesktop({
  currentBalance,
  monthlyStats,
  balanceTrend,
  healthScore,
  currency = '₹',
  hideBalances = false,
  onTogglePrivacy,
}: DashboardHeroProps)
⋮----
useEffect(() => { setMounted(true); }, []); // eslint-disable-line react-hooks/set-state-in-effect
⋮----
{/* Glossy overlay */}
⋮----
{/* Animated mesh overlay - Keep on desktop */}
⋮----
{/* Subtle grid pattern */}
⋮----
{/* Content */}
⋮----
{/* Top row: greeting + sparkline */}
⋮----
{/* Greeting chip */}
⋮----
{/* Balance label */}
⋮----
{/* Big animated number */}
⋮----
{/* Trend indicator */}
⋮----
{/* Sparkline & Privacy Toggle */}
⋮----
{/* Divider */}
⋮----
{/* Bottom row: mini-stats + health bar */}
⋮----
{/* Mini stats */}
⋮----
{/* Income */}
⋮----
{/* Divider */}
⋮----
{/* Expenses */}
⋮----
{/* Divider */}
⋮----
{/* Net */}
⋮----
{/* Health score bar */}
```

## File: src/features/dashboard/components/DashboardHeroMobile.tsx
```typescript
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Shield } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { MonthlyStats, BalanceDataPoint } from '@/types';
import { haptic } from '@/core/haptic';
⋮----
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
⋮----
function getHealthLabel(score: number):
⋮----
export default function DashboardHeroMobile({
  currentBalance,
  monthlyStats,
  balanceTrend,
  healthScore,
  currency = '₹',
  hideBalances = false,
  onTogglePrivacy,
}: DashboardHeroProps)
⋮----
{/* Simplified Mobile Content */}
⋮----
{/* Top: Balance and Actions */}
⋮----
{/* Divider */}
⋮----
{/* Middle: Mini Stats */}
```

## File: src/features/dashboard/components/WeeklyDigestCard.tsx
```typescript
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  AlertTriangle,
  Flame,
  Award,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Transaction } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface WeeklyDigestCardProps {
  transactions: Transaction[];
  currency?: string;
}
⋮----
interface Insight {
  id: string;
  type: 'alert' | 'positive' | 'neutral' | 'tip';
  title: string;
  description: string;
  metric?: string;
  badge?: string;
  icon: React.ElementType;
  color: string;
}
⋮----
// ─── 1. Category surges & totals ──────────────────────────────────────────
⋮----
// Insight A: General spend trend comparison
⋮----
// Insight B: Top category surge
⋮----
// ─── 2. Weekend Spike analysis ────────────────────────────────────────────
⋮----
// ─── 3. No-Spend Streak analysis ──────────────────────────────────────────
⋮----
// ─── 4. Default Smart Tips if empty ───────────────────────────────────────
⋮----
const handleNext = () =>
⋮----
const handlePrev = () =>
⋮----
{/* Dynamic Metric Display */}
⋮----
{/* Navigation arrows */}
```

## File: src/features/gamification/GamificationView.tsx
```typescript
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Target, Award, Flame, Star, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';
import { AppView, Transaction, SavingsGoal } from '@/types';
import LevelProgress from '@/features/gamification/components/LevelProgress';
import { QuestsPanel } from '@/features/gamification/components/QuestsPanel';
import { BadgeGallery } from '@/features/gamification/components/BadgeGallery';
import { SavingsChallenges } from '@/features/gamification/components/SavingsChallenges';
import { useQuestReset } from '@/features/gamification/hooks/useQuestReset';
import { UserLevelCard } from '@/features/gamification/components/UserLevelCard';
import { getSpendingPersonality } from '@/features/analytics/insights/advisor';
⋮----
type Tab = 'overview' | 'quests' | 'badges' | 'challenges';
⋮----
interface GamificationViewProps {
  transactions: Transaction[];
  goals: SavingsGoal[];
  currency?: string;
  onNavigate: (view: AppView) => void;
}
⋮----
{/* ── Hero banner ── */}
⋮----
{/* ── Tab bar ── */}
⋮----
{/* ── Tab content ── */}
⋮----
{/* Personality Card */}
⋮----
{/* Quick-action tiles */}
⋮----
{/* Quests preview */}
```

## File: src/features/portfolio/PortfolioViewMobile.tsx
```typescript
import React from 'react';
import { Plus, BarChart2, BrainCircuit, Zap, PieChart, Wallet, ShieldAlert } from 'lucide-react';
import NetWorthEvolution from '@/features/portfolio/components/NetWorthEvolution';
import FutureWealthSimulator from '@/features/portfolio/components/FutureWealthSimulator';
import DebtPlanner from '@/features/portfolio/components/DebtPlanner';
import EntryCard from '@/features/portfolio/components/EntryCard';
import AllocationDonut from '@/features/portfolio/components/AllocationDonut';
import { MobilePortfolioHero } from '@/features/portfolio/components/MobilePortfolioHero';
import { haptic } from '@/core/haptic';
import type { Asset, Liability, AllocationByType } from '@/types';
import type { FinanceState } from '@/types/state';
import type { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
⋮----
interface PortfolioViewMobileProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  currency: string;
  assets: Asset[];
  liabilities: Liability[];
  activeTab: 'overview' | 'simulation' | 'debt';
  setActiveTab: (tab: 'overview' | 'simulation' | 'debt') => void;
  onAddAsset: () => void;
  onAddLiability: () => void;
  onDeleteAsset: (id: string) => void;
  onDeleteLiability: (id: string) => void;
  allocationByType: AllocationByType[];
  financeState: FinanceState;
  config: SpendWiseConfig | null;
  healthScore: number;
  savingsRate: number;
}
⋮----
{/* 1. Sticky Mini-Tab Selector */}
⋮----
haptic.light();
setActiveTab(tab.id as 'overview' | 'simulation' | 'debt');
⋮----
{/* Action Quick-Links */}
⋮----
haptic.medium();
onAddAsset();
⋮----
{/* Asset/Liability Lists */}
⋮----
onDeleteAsset(asset.id);
⋮----
onDeleteLiability(liability.id);
```

## File: src/features/profile/ProfileViewMobile.tsx
```typescript
import React from 'react';
import {
  User,
  ShieldCheck,
  DownloadCloud,
  CheckCircle2,
  Camera,
  ChevronRight,
  Globe,
  Bell,
  Smartphone,
  Database,
  Lock,
} from 'lucide-react';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { AppView } from '@/components/ui/types';
import { haptic } from '@/core/haptic';
⋮----
interface ProfileViewMobileProps {
  name: string;
  avatar: string | null;
  occupation: string;
  location: string;
  monthlyGoal: string;
  currency: string;
  config: SpendWiseConfig | null;
  onAvatarClick: () => void;
  onNavigate: (view: AppView) => void;
  isAppInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  triggerInstall: () => void;
  // Sections (Passed as pre-rendered components for simplicity/state management)
  profileForm: React.ReactNode;
  currencySelector: React.ReactNode;
  dataManagement: React.ReactNode;
  accessibility: React.ReactNode;
  notifications: React.ReactNode;
  transactionsCount: number;
}
⋮----
// Sections (Passed as pre-rendered components for simplicity/state management)
⋮----
{/* 1. Profile Hero */}
⋮----
haptic.medium();
onAvatarClick();
⋮----
{/* 2. Quick Stats Grid */}
⋮----
{/* 3. Settings Sections */}
⋮----
{/* Personal Details */}
⋮----
{/* Preferences & Localization */}
⋮----
{/* Accessibility & Experience */}
⋮----
{/* Family & Controls */}
⋮----
haptic.light();
onNavigate('parental');
⋮----
{/* Data Management */}
⋮----
{/* Notifications */}
⋮----
{/* 4. App Info & Install */}
⋮----
haptic.heavy();
triggerInstall();
```

## File: src/features/shared/components/SharedModals.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Button';
import { Field, Inp } from '@/components/ui/Input';
import { Sel } from '@/components/ui/Select';
import { Err, Ok } from '@/components/ui/Alert';
import { EmojiBtn } from '@/components/ui/Avatar';
import { Ico } from '@/components/ui/Icons';
import { SharedGoal, SharedGroupMember } from '@/features/shared/hooks/useSharedWallets';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
// Constants
// eslint-disable-next-line react-refresh/only-export-components
⋮----
// eslint-disable-next-line react-refresh/only-export-components
⋮----
// eslint-disable-next-line react-refresh/only-export-components
⋮----
export function CreateGroupModal({
  show,
  onClose,
  onSubmit,
  userName,
}: {
  show: boolean;
onClose: ()
⋮----
function reset()
⋮----
async function submit(e: React.FormEvent)
⋮----
reset();
onClose();
⋮----
// Mailto fallback
⋮----
onChange=
⋮----
const inviteLink = `https://spendwise.app/join?group=${groupId || ''}`;
⋮----
setOk('Invite link copied!');
setTimeout(()
⋮----
// eslint-disable-next-line react-hooks/set-state-in-effect
⋮----
<Inp type="date" value=
⋮----
// eslint-disable-next-line react-hooks/set-state-in-effect
⋮----
// eslint-disable-next-line react-hooks/set-state-in-effect
⋮----
setCustomSplits(prev => (
⋮----
// eslint-disable-next-line react-hooks/set-state-in-effect
⋮----
const fmt = (v: number) => `$
```

## File: src/features/shared/hooks/useSharedWallets.ts
```typescript
/**
 * useSharedWallets.ts
 *
 * Changes from original:
 *  1. Calls syncEngine.joinGroup(selectedGroupId) whenever the selected group changes
 *     so the Supabase Realtime channel is correctly subscribed.
 *  2. Removes the broken PeerJS-specific connectToPeer return value
 *     (replaced with a no-op that shows a toast instead).
 *  3. inviteMember now also calls the send-invite Edge Function so a real
 *     email is delivered via Resend (falls back silently if Supabase not configured).
 *
 * Everything else (CRDT, data shapes, return API) is identical to the original.
 */
⋮----
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SharedGroup,
  SharedGroupMember,
  SharedWalletEntry,
  SharedExpense,
  SharedExpenseSplit,
  SharedGoal,
  SharedGoalContribution,
  SharedStorage,
  mergeSharedStorage,
} from '@/core/crdt';
import { syncEngine, SyncState } from '@/core/syncEngine';
import { useStore } from '@/store';
import { isSupabaseConfigured } from '@/core/api/supabase';
⋮----
export interface PendingInvite {
  memberId: string;
  groupId: string;
  groupName: string;
  groupPurpose: string;
  invitedAt: string;
}
⋮----
// ─── Real email invite via Supabase Edge Function ────────────────────────────
⋮----
async function sendInviteEmail(params: {
  to: string;
  toName: string;
  groupName: string;
  groupId: string;
  fromName: string;
}): Promise<void>
⋮----
if (!isSupabaseConfigured) return; // skip silently in offline mode
⋮----
// Errors are swallowed — the invite is still stored locally.
// The mailto: fallback in InviteModal handles the UX.
⋮----
// ─── Hook ─────────────────────────────────────────────────────────────────────
⋮----
export function useSharedWallets(
  userId: string | null,
  userEmail: string | null = null,
  userName: string = 'A friend'
)
⋮----
// ── Sync engine wiring ────────────────────────────────────────────
⋮----
// Malformed packet — ignore
⋮----
// ── Join the Supabase Realtime channel for the selected group ─────
⋮----
// ── Broadcast our state when newly connected ──────────────────────
⋮----
}, [connectedPeers, syncState]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
// ── Derived slices ────────────────────────────────────────────────
⋮----
// Auto-select first group
⋮----
// eslint-disable-next-line react-hooks/set-state-in-effect
⋮----
// Pending invites for current user
⋮----
// Wallet balance
⋮----
// Split balances
⋮----
// ── Mutate helper ─────────────────────────────────────────────────
⋮----
const markDeleted = (prev: SharedStorage, id: string): SharedStorage => (
⋮----
const uid = ()
⋮----
// ── Actions ───────────────────────────────────────────────────────
⋮----
// Fire real email (non-blocking)
⋮----
/* InviteModal mailto: fallback still shown */
⋮----
channelHint: `shared-wallet:${groupId}`, // tell joiner which RT channel to use
⋮----
interface ImportedGroupData {
          type: string;
          group: SharedGroup;
          members: SharedGroupMember[];
          walletEntries: SharedWalletEntry[];
          expenses: SharedExpense[];
          goals: SharedGoal[];
          channelHint: string;
          exportedAt: string;
        }
⋮----
// Data
⋮----
// Sync state (now Supabase Realtime, not PeerJS)
⋮----
/**
     * connectToPeer — kept for UI compat but is now a no-op.
     * Supabase Realtime handles multi-peer automatically via joinGroup().
     * The ConnectCohortModal can be removed from the UI or repurposed
     * to show a "Share group QR to invite others" message.
     */
⋮----
// No-op — all peers sharing the same groupId are already connected
// via the Supabase Realtime channel "shared-wallet:{groupId}".
⋮----
// Actions
```

## File: src/features/sync/BankSyncView.tsx
```typescript
import { useState, useEffect } from 'react';
import { Brain, CheckCircle2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import {
  Transaction,
  LinkedAccount,
  FinanceProvider,
  Category,
  SyncView,
  AppView,
} from '@/types';
import { UPI_PROVIDERS } from '@/features/sync/parsers/upi';
import {
  initiateRazorpayPayment,
  parseUPIPayment,
  rememberMerchant,
  parseUPIDescription,
  loadMerchantMemory,
} from '@/utils/razorpaySync';
⋮----
import { predictCategory } from '@/utils/merchantMapper';
import { createSetuConsent, fetchSetuBankStatements } from '@/core/setuAA';
import { useStore } from '@/store';
⋮----
import SyncDashboard from '@/features/sync/components/SyncDashboard';
import SelectSource from '@/features/sync/components/SelectSource';
import UPILink from '@/features/sync/components/UPILink';
import RazorpayLink from '@/features/sync/components/RazorpayLink';
import PayForm from '@/features/sync/components/PayForm';
import CSVImporter from '@/features/sync/components/CSVImporter';
⋮----
interface BankSyncViewProps {
  onAutoAddTransactions: (txs: Transaction[]) => void;
  recentTransactions?: Transaction[];
  currency?: string;
  onNavigate?: (view: AppView) => void;
}
⋮----
// Load Razorpay account from store on mount
⋮----
// eslint-disable-next-line react-hooks/set-state-in-effect
⋮----
// Count merchant memory entries from secure storage
⋮----
const handleUPILinkSuccess = (provider: (typeof UPI_PROVIDERS)[number], id: string) =>
⋮----
id: `acc-${Date.now()}`, // eslint-disable-line react-hooks/purity
⋮----
const handlePay = (amount: number, description: string) =>
⋮----
const applyCorrection = () =>
⋮----
// BUG-15 fix: use merchant name as fallback key when no UPI VPA is available
⋮----
// BUG-15 fix: update the existing transaction instead of re-adding (was causing duplicates)
⋮----
/** Mock sync for non-Razorpay providers with Step-by-Step feedback and Review */
const handleMockSync = async (acc: LinkedAccount) =>
⋮----
// 1. Request Consent from Setu Account Aggregator
const mobileNumber = '9876543210'; // In a real app, prompt the user or pull from profile
⋮----
// (In real flow: we would redirect the user to `consent.url`, they approve, and return)
⋮----
// 2. Fetch Bank Statements from Setu AA
⋮----
// Step 1: Parse UPI strings
⋮----
// Step 2: Bulk categorise using existing merchant memory & merchantMapper
⋮----
const handleConfirmImport = () =>
⋮----
const handleCategoryChange = (txId: string, newCat: Category) =>
⋮----
const handleSyncAccount = (acc: LinkedAccount) =>
⋮----
const handleRazorpayConnect = (keyId: string, secret: string) =>
⋮----
onClick=
```

## File: src/features/sync/components/CloudSync.tsx
```typescript
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Database,
  ArrowUpDown,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  syncAll,
  pushGamification,
  SupabaseUser,
} from '@/core/api/supabase';
import { useStore } from '@/store';
import { STORAGE_KEYS } from '@/constants';
import { Transaction } from '@/types';
⋮----
function loadSession(): SupabaseUser | null
function saveSession(u: SupabaseUser | null)
⋮----
interface CloudSyncProps {
  transactions: Transaction[];
  onPullTransactions: (txs: Transaction[]) => void;
}
⋮----
function formatSyncTime(dateStr: string | null): string
⋮----
const handleAuth = async (isSignUp: boolean) =>
⋮----
const handleSignOut = async () =>
⋮----
/**/
⋮----
VITE_SUPABASE_URL=https://xxx.supabase.co
⋮----
{/* Header */}
⋮----
{/* Auth Forms */}
⋮----
onClick=
⋮----
{/* Not signed in — CTA */}
⋮----
{/* Signed in — sync panel */}
⋮----
{/* Stats strip */}
⋮----
{/* Sync result */}
```

## File: src/features/sync/components/SyncDashboard.tsx
```typescript
import React from 'react';
import {
  Landmark,
  Zap,
  MoreVertical,
  TrendingDown,
  Hash,
  Sparkles,
  Brain,
  SmartphoneNfc,
  Link2,
  History,
  CreditCard,
  Clock,
  RefreshCw,
  Activity,
  Users,
} from 'lucide-react';
import { Transaction, LinkedAccount, SyncView, AppView } from '@/types';
import { SharedGroup } from '@/core/crdt';
import { UPI_PROVIDERS } from '@/features/sync/parsers/upi';
import CSVImporter from '@/features/sync/components/CSVImporter';
import { CloudSync } from '@/features/sync/components/CloudSync';
import { useSharedWallets } from '@/features/shared/hooks/useSharedWallets';
import { useAuth } from '@/hooks/useAuth';
⋮----
export interface SyncDashboardProps {
  totalUPISpend: number;
  aiParsedCount: number;
  merchantMemoryCount: number;
  accounts: LinkedAccount[];
  recentTransactions: Transaction[];
  syncingAccountId: string | null;
  onSyncAccount: (acc: LinkedAccount) => void;
  onSetView: (view: SyncView) => void;
  currency: string;
  onAutoAddTransactions: (txs: Transaction[]) => void;
  onNavigate?: (view: AppView) => void;
}
⋮----
const formatDate = (iso: string)
⋮----
{/* Header */}
⋮----
onClick=
⋮----
{/* Stats Row */}
⋮----
{/* Connected Sources */}
⋮----
{/* Shared Wallets */}
⋮----
if (onNavigate) onNavigate('shared');
⋮----
{/* Recent Payments */}
⋮----
<Clock size=
```

## File: src/features/sync/components/UPILink.tsx
```typescript
import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { SyncView } from '@/types';
import { UPI_PROVIDERS } from '@/features/sync/parsers/upi';
⋮----
export interface UPILinkProps {
  onSetView: (view: SyncView) => void;
  onUPILinkSuccess: (provider: (typeof UPI_PROVIDERS)[number], id: string) => void;
}
⋮----
type WizardStep = 'upi-select' | 'upi-credentials' | 'upi-connecting' | 'upi-success';
⋮----
const handleVerifyAndLink = () =>
⋮----
onClick=
⋮----
setSelectedProvider(p);
setWizardStep('upi-credentials');
```

## File: src/features/transactions/HistoryViewMobile.tsx
```typescript
import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '@/types';
import { Virtuoso } from 'react-virtuoso';
import { Search } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { haptic } from '@/core/haptic';
import EmptyState from '@/components/ui/EmptyState';
import TransactionRow from './components/TransactionRow';
⋮----
interface HistoryViewMobileProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  onEdit?: (tx: Transaction) => void;
  currency?: string;
  onCategoryChange?: (id: string, newCategory: Category) => void;
}
⋮----
type DisplayRow =
    | { type: 'header'; date: string; subtotal: number }
    | { type: 'tx'; tx: Transaction };
⋮----
{/* 1. Header with Quick Stats */}
⋮----
{/* Search Bar */}
⋮----
onChange=
⋮----
{/* 2. Category Chips */}
⋮----
haptic.light();
setActiveCategory(cat as Category | 'All');
⋮----
setSelectedIds(prev => {
                    const next = new Set(prev);
```

## File: src/hooks/useCategories.tsx
```typescript
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CustomCategoryDef } from '@/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/data/mockData';
import { useStore } from '@/store';
import { STORAGE_KEYS } from '@/constants';
⋮----
interface CategoryContextType {
  customCategories: CustomCategoryDef[];
  allCategories: string[];
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
  addCustomCategory: (def: Omit<CustomCategoryDef, 'id'>) => void;
  updateCustomCategory: (id: string, def: Partial<CustomCategoryDef>) => void;
  deleteCustomCategory: (id: string) => void;
  suggestedCategories: string[];
  categoryLimits: Record<string, number>;
}
⋮----
export function CategoryProvider(
⋮----
/* ignore */
⋮----
} catch { /* JSON parse failed — use default */ }
⋮----
const hashStr = (str: string) =>
⋮----
// eslint-disable-next-line react-refresh/only-export-components
export function useCategories()
```

## File: src/types/index.ts
```typescript
export interface CustomCategoryDef {
  id: string;
  name: string;
  color: string;
  icon: string;
  monthlyLimit?: number;
}
```

## File: src/types/state.ts
```typescript
import {
  Transaction,
  Category,
  MonthlyStats,
  MonthlyHistoryPoint,
  CategorySpend,
  BalanceDataPoint,
  RecurringPattern,
  SavingsGoal,
  Budget,
  BudgetPeriod,
} from '@/types/finance';
import { SpendingAlert, AppNotification } from '@/components/ui/types';
import { ParentalControlState } from '@/store';
import { CustomCategoryDef } from '@/types/index';
⋮----
export interface FinanceState {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  addTransactions: (txs: Transaction[]) => void;
  deleteTransaction: (id: string) => void;
  updateTransactionCategory: (id: string, newCategory: Category) => void;
  bulkUpdateTransactionsCategory: (ids: string[], newCategory: Category) => void;
  bulkDeleteTransactions: (ids: string[]) => void;
  bulkReassignCategory: (oldCategory: string, newCategory: string) => void;
  resetData: () => void;
  currentBalance: number;
  predictedEndOfMonth: number;
  categorySpending: CategorySpend[];
  totalSpent: number;
  balanceTrend: BalanceDataPoint[];
  dailySpendRate: number;
  monthlyStats: MonthlyStats;
  monthlyHistory: MonthlyHistoryPoint[];
  projectionMeta: {
    daysLeftInMonth: number;
    dataQuality: 'low' | 'medium' | 'high';
    expectedChange: number;
  };
  topCategory: CategorySpend | null;
}
⋮----
export interface BudgetState {
  budgets: Record<string, number>;
  budgetStats: Budget[];
  setBudget: (category: string, amount: number) => void;
  removeBudget: (category: string) => void;
  totalBudgeted: number;
  overallBudgetPercent: number;
  monthlyExpenses: number;
  budgetSettings: {
    period: BudgetPeriod;
    rolloverEnabled: boolean;
  };
  updateBudgetSettings: (settings: Partial<BudgetState['budgetSettings']>) => void;
  resetBudgets: () => void;
  resetLimits: () => void;
  totalSpentAgainstBudget: number;
  overBudgetCount: number;
  periodLabel: string;
  updatePeriod: (p: BudgetPeriod) => void;
  toggleRollover: () => void;
}
⋮----
export interface GoalsState {
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, data: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (id: string, amount: number) => Promise<void>;
  totalSaved: number;
  totalTarget: number;
  overallProgress: number;
  goalStats: {
    onTrack: number;
    atRisk: number;
    achieved: number;
  };
  stats: {
    activeCount: number;
    achievedCount: number;
    totalTarget: number;
    totalSaved: number;
    overallPercent: number;
    monthlyCommitted: number;
  };
}
⋮----
export interface CategoryState {
  customCategories: CustomCategoryDef[];
  allCategories: string[];
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
  addCustomCategory: (def: Omit<CustomCategoryDef, 'id'>) => void;
  updateCustomCategory: (id: string, def: Partial<CustomCategoryDef>) => void;
  deleteCustomCategory: (id: string) => void;
  suggestedCategories: string[];
  categoryLimits: Record<string, number>;
}
⋮----
export interface AlertState {
  alerts: SpendingAlert[];
  alertCount: number;
  dangerCount: number;
  warningCount: number;
  dismissAlert: (id: string) => void;
  dismissAll: () => void;
  clearDismissed: () => void;
}
⋮----
export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  snoozeNotification: (id: string, hours?: number) => void;
  dismissNotification: (id: string) => void;
}
⋮----
export interface AppState {
  currency: string;
  transactions: Transaction[];
  financeState: FinanceState;
  budgetState: BudgetState;
  goalsState: GoalsState;
  categoryState: CategoryState;
  recurringData: RecurringPattern[];
  alertState: AlertState;
  notifState: NotificationState;
  parentalState: ParentalControlState;
}
```

## File: src/utils/merchantMapper.ts
```typescript
import { Category } from '@/types';
⋮----
/**
 * Smart Merchant Mapper
 * Automatically predicts categories based on merchant names
 */
⋮----
// Food & Dining
⋮----
// Shopping
⋮----
// Transport
⋮----
// Entertainment
⋮----
// Utilities
⋮----
// Professional / Business
⋮----
// Education
⋮----
export function predictCategory(merchant: string): Category
⋮----
// Exact matches
⋮----
// Partial matches
⋮----
// Default fallback based on keywords
```

## File: src/app/ViewRenderer.tsx
```typescript
import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, Category, AppView } from '@/types';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import AlertBanner from '@/components/layout/AlertBanner';
import { DesktopOnlyGuard } from '@/components/layout/DesktopOnlyGuard';
⋮----
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { ParentalControlState } from '@/store';
import { AppState } from '@/types/state';
⋮----
interface ViewRendererProps {
  activeView: unknown;
  appState: AppState;
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
  onTogglePrivacy?: () => void;
}
⋮----
const ViewWrapper: React.FC<{ children: React.ReactNode; id: string }> = ({ children, id }) => (
  <motion.div
    key={id}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ type: 'spring', stiffness: 400, damping: 40, opacity: { duration: 0.15 } }}
    className="w-full h-full"
  >
    <ErrorBoundary>
      <Suspense fallback={<SkeletonLoader />}>{children}</Suspense>
    </ErrorBoundary>
  </motion.div>
);
⋮----
const renderHistory = (searchQuery?: string) => (
    <ViewWrapper id="history">
      <HistoryView
        transactions={transactions}
        onCategoryChange={async (id: string, newCategory: string) => { financeState.updateTransactionCategory(id, newCategory as Category); }}
        onDelete={financeState.deleteTransaction}
        onBulkDelete={financeState.bulkDeleteTransactions}
        onBulkCategoryChange={financeState.bulkUpdateTransactionsCategory}
        onImportClick={() => onNavigate('sync')}
        onPDFReport={onPDFReport}
        currency={currency}
        initialSearchQuery={searchQuery}
      />
    </ViewWrapper>
  );
⋮----
onCategoryChange=
⋮----
onResetData=
```

## File: src/constants/index.ts
```typescript
/**
 * SpendWise — Global Constants
 * Single source of truth for all magic strings, numbers, and feature flags.
 */
⋮----
// ─── localStorage Keys ────────────────────────────────────────────────────────
⋮----
// ─── Financial Defaults ───────────────────────────────────────────────────────
⋮----
PRICE_HIKE_THRESHOLD: 0.1, // 10% increase triggers alert
⋮----
// ─── Gamification Thresholds ──────────────────────────────────────────────────
⋮----
XP_LEVEL_MULTIPLIER: 100, // level N requires N * 100 XP
⋮----
// ─── Feature Flags ────────────────────────────────────────────────────────────
// Set these via .env (VITE_FEATURE_*) for runtime configuration.
// BUG-M01 fix: guard `window` access so this module is safe to import in tests / edge workers
⋮----
// ─── App Metadata ─────────────────────────────────────────────────────────────
```

## File: src/contexts/CurrencyContext.tsx
```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS } from '@/constants';
⋮----
export type CurrencyCode = '$' | '€' | '£' | '₹' | '¥' | 'A$' | 'C$' | 'AED';
⋮----
interface CurrencyContextType {
  baseCurrency: CurrencyCode;
  activeCurrency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  convert: (amount: number, from?: CurrencyCode, to?: CurrencyCode) => number;
  format: (amount: number, currency?: CurrencyCode) => string;
  setActiveCurrency: (code: CurrencyCode) => void;
}
⋮----
// Simulated rates relative to USD (1.0)
⋮----
export const CurrencyProvider: React.FC<
⋮----
/* ignore */
⋮----
return '₹'; // Default to Rupees as requested
⋮----
/* ignore */
⋮----
const handleConfigChange = () =>
⋮----
/* ignore */
⋮----
const convert = (
    amount: number,
    from: CurrencyCode = baseCurrency,
    to: CurrencyCode = activeCurrency
) =>
⋮----
// Convert to USD first, then to target
⋮----
const format = (amount: number, currency: CurrencyCode = activeCurrency) =>
⋮----
.replace(/[A-Z]{3}/, currency); // Replace ISO with our custom symbol if needed
⋮----
const getISOCode = (code: CurrencyCode): string =>
⋮----
// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () =>
```

## File: src/data/mockData.ts
```typescript
import { Transaction, Category } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
// ─── Helpers ──────────────────────────────────────────────────────────────────
⋮----
function daysAgo(n: number): string
⋮----
/** Replaces ALL occurrences of every {key} in a template string */
export function applyTemplate(template: string, vars: Record<string, string | number>): string
⋮----
// Use a global regex so ALL occurrences are replaced
⋮----
// ─── Category Metadata ────────────────────────────────────────────────────────
⋮----
// ─── Initial Mock Transactions ─────────────────────────────────────────────────
⋮----
/** Net effect of bundled demo transactions (for balance anchor when using sample data). */
⋮----
/** Category keyword detection map */
⋮----
// ─── Main Parser ───────────────────────────────────────────────────────────────
⋮----
export function parseTransaction(text: string): Transaction
⋮----
// --- Amount extraction ---
// Handles: "$45", "$1,200.50", "45.99", "USD 45"
⋮----
// --- Income detection ---
⋮----
// --- Category detection ---
⋮----
// --- Merchant detection ---
// Try: "at <Merchant>", quoted name, or fallback to map
⋮----
// ─── AI Insight Templates ──────────────────────────────────────────────────────
// Uses {placeholder} syntax — applyTemplate() replaces ALL occurrences safely
```

## File: src/features/advisor/AdvisorView.tsx
```typescript
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Bot,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  X,
  Trash2,
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { SpendingPersonality } from '@/types';
import {
  getFinancialAdvice,
  getSpendingPersonality,
  ConversationMessage,
} from '@/features/analytics/insights/advisor';
import { useCurrency } from '@/contexts/CurrencyContext';
import EducationCards from '@/features/education/components/EducationCards';
import { SpeechRecognition, SpeechRecognitionEvent } from '@/types/dom';
import { useIsMobile } from '@/hooks/useMediaQuery';
import AdvisorViewMobile from '@/features/advisor/AdvisorViewMobile';
import { isSupabaseConfigured } from '@/core/api/supabase';
import { AppView } from '@/types';
import { STORAGE_KEYS } from '@/constants';
⋮----
import ChatMessageList from './components/ChatMessageList';
import ChatInput from './components/ChatInput';
import { Message, MessageData } from './types';
⋮----
interface AdvisorViewProps {
  onNavigate?: (view: AppView) => void;
}
⋮----
// Persist messages in localStorage
⋮----
/* ignore */
⋮----
// Persist messages whenever they change
⋮----
/* ignore */
⋮----
setIsLoading(true); // show typing dots before first token
⋮----
// Map messages to ConversationMessage format
⋮----
// Finalise: extract [ACTION:...] tag and set proper type
⋮----
// Proactive Daily Briefing
⋮----
// eslint-disable-next-line react-hooks/set-state-in-effect
⋮----
const toggleListening = () =>
⋮----
const handleAnalyzePersonality = async () =>
⋮----
// silently fail
⋮----
const handleClearChat = () =>
⋮----
{/* Sidebar - Desktop Only */}
⋮----
{/* Quick Stats Mini-Card */}
⋮----
{/* Main Chat Area */}
⋮----
{/* Header */}
⋮----
{/* Personality Card */}
⋮----
onClick=
⋮----
{/* Empty state for new users */}
⋮----
{/* Messages */}
⋮----
{/* Insights Bar */}
⋮----
{/* Quick Actions & Input */}
```

## File: src/features/dashboard/DashboardView.tsx
```typescript
import { useState, lazy, Suspense, useMemo, useCallback } from 'react';
import { AppView } from '@/types';
import { FinanceState } from '@/types/state';
import { useGamification } from '@/features/gamification/hooks/useGamification';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { usePortfolio } from '@/features/portfolio/hooks/usePortfolio';
import LevelProgress from '@/features/gamification/components/LevelProgress';
import DashboardHero from '@/features/dashboard/components/DashboardHero';
import MagicInput from '@/features/ai/components/MagicInput';
import PullToRefresh from '@/components/layout/PullToRefresh';
import { haptic } from '@/core/haptic';
import StatCard from '@/features/dashboard/components/StatCard';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
⋮----
import RecentTransactions from '@/features/dashboard/components/RecentTransactions';
import GoalsSummary from '@/features/dashboard/components/GoalsSummary';
import DailyStats from '@/features/dashboard/components/DailyStats';
import { SafeToSpend } from '@/features/dashboard/components/SafeToSpend';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { useIsMobile } from '@/hooks/useMediaQuery';
import DashboardViewMobile from '@/features/dashboard/DashboardViewMobile';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { AIInsights } from '@/features/dashboard/components/AIInsights';
import { useBudgets } from '@/hooks/useBudgets';
import { getProactiveNudge } from '@/features/analytics/insights/advisor';
import ProactiveNudge from '@/features/dashboard/components/ProactiveNudge';
⋮----
// Lazy load non-critical/heavy components
⋮----
const WidgetSkeleton = () => (
  <div className="w-full h-32 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
);
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// Main DashboardView
// ─────────────────────────────────────────────────────────────────────────────
⋮----
{/* Header */}
⋮----
{/* AI Insights - Hidden on mobile unless expanded to save space */}
⋮----
{/* Core Dashboard Hero */}
⋮----
{/* ── LEFT COLUMN ─────────────────────────────────────────── */}
⋮----
{/* Level Progress */}
⋮----
{/* Stat Cards - Hidden on Mobile because DashboardHeroMobile already shows this data! */}
⋮----
{/* Weekly Digest - Desktop or Expanded Mobile */}
⋮----
{/* Quick Add Panel - Very important, keep prominent */}
⋮----
onQuickInput=
⋮----
{/* Recent Transactions - Keep prominent */}
⋮----
{/* Mobile "Show More" Button */}
⋮----
onClick=
⋮----
{/* Expanded Mobile / Standard Desktop Widgets */}
⋮----
{/* ── RIGHT COLUMN ── */}
⋮----
{/* Essential right-column items always shown */}
⋮----
{/* Hide the rest of the right column on mobile unless expanded */}
```

## File: src/features/dashboard/DashboardViewMobile.tsx
```typescript
import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, Transaction } from '@/types';
import { FinanceState } from '@/types/state';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { haptic } from '@/core/haptic';
import { useBudgets } from '@/hooks/useBudgets';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { getProactiveNudge } from '@/features/analytics/insights/advisor';
import { useGamification } from '@/features/gamification/hooks/useGamification';
import ProactiveNudge from '@/features/dashboard/components/ProactiveNudge';
⋮----
import { MobileBalanceHero } from './components/MobileBalanceHero';
import { SnapCardRow } from './components/SnapCardRow';
import { MobileRecentTransactions } from './components/MobileRecentTransactions';
⋮----
// Lazy-load heavy components so they don't block initial paint
⋮----
// ─── Types ────────────────────────────────────────────────────────────────────
⋮----
interface DashboardViewMobileProps {
  financeState: FinanceState;
  onAdd: (tx: Transaction) => void;
  currency: string;
  onNavigate: (view: AppView) => void;
  hideBalances?: boolean;
  config: SpendWiseConfig | null;
}
⋮----
// ─── Main component ───────────────────────────────────────────────────────────
⋮----
// Pull data for snap row
⋮----
// ── Render ────────────────────────────────────────────────────────────────
⋮----
{/* ── 1. Balance hero card ───────────────────────────────────────── */}
⋮----
{/* ── 2. Horizontal snap row ─────────────────────────────────────── */}
⋮----
{/* ── 3. Recent Transactions ─────────────────────────────────────── */}
⋮----
{/* ── 4. Gamification progress (lazy) ───────────────────────────── */}
⋮----
{/* ── 5. Quick Add bottom sheet ──────────────────────────────────── */}
⋮----
onClick=
⋮----
{/* Drag handle */}
⋮----
setDashboardInput=
```

## File: src/features/transactions/components/TransactionRow.tsx
```typescript
import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Trash2, X, Tag, Pencil } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Transaction, Category } from '@/types';
import { CategoryDropdown } from '@/components/ui/CategoryDropdown';
import { haptic } from '@/core/haptic';
import { useCategories } from '@/hooks/useCategories';
⋮----
export interface TransactionRowProps {
  tx: Transaction;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onCategoryChange?: (id: string, newCategory: Category) => void;
  onDelete?: (id: string) => void;
  onEdit?: (tx: Transaction) => void;
  currency: string;
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
}
⋮----
// Long press handling for mobile native feel
⋮----
const startPress = () =>
⋮----
const endPress = () =>
⋮----
onClick=
⋮----
haptic.success();
onCategoryChange?.(tx.id, cat);
setShowCategorySwapper(false);
⋮----
{/* Background Actions (Delete on Left drag, Category on Right drag) */}
⋮----
{/* Swiping Right → Reveals Category trigger on the left */}
⋮----
{/* Swiping Left → Reveals Delete trigger on the right */}
⋮----
if (onDelete) onDelete(tx.id);
```

## File: src/features/transactions/HistoryView.tsx
```typescript
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction, Category } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { Virtuoso } from 'react-virtuoso';
import PullToRefresh from '@/components/layout/PullToRefresh';
import { haptic } from '@/core/haptic';
import { useStore } from '@/store';
⋮----
import { TransactionFilters } from '@/features/transactions/components/TransactionFilters';
import { TransactionList } from '@/features/transactions/components/TransactionList';
import BulkActionHeader from '@/features/transactions/components/BulkActionHeader';
import { HistoryToolbar } from '@/features/transactions/components/HistoryToolbar';
import { DeleteConfirmModal } from '@/features/transactions/components/DeleteConfirmModal';
import { EditTransactionModal } from '@/features/transactions/components/EditTransactionModal';
import { useTransactionHistory } from '@/features/transactions/hooks/useTransactionHistory';
import { useIsMobile } from '@/hooks/useMediaQuery';
import HistoryViewMobile from '@/features/transactions/HistoryViewMobile';
⋮----
// Re-export types for consumers that still import from this file
⋮----
interface HistoryViewProps {
  transactions: Transaction[];
  onCategoryChange?: (id: string, newCategory: Category) => void;
  onBulkCategoryChange?: (ids: string[], newCategory: Category) => void;
  onDelete?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onImportClick?: () => void;
  onPDFReport?: () => void;
  currency?: string;
  initialSearchQuery?: string;
}
⋮----
// Create a visible subset of transactions that excludes pending deletes
⋮----
// Auto-commit on unmount
⋮----
const handleInterceptDelete = (id: string) =>
⋮----
const handleUndoDelete = () =>
⋮----
const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) =>
⋮----
const handleEditSave = (id: string, updates: Partial<Omit<Transaction, 'id'>>) =>
⋮----
const handleRefresh = async () =>
⋮----
{/* Page Header */}
⋮----
{/* Table Card */}
⋮----
if (window.confirm(`Delete $
⋮----
{/* Floating Undo Delete Toast Overlay */}
⋮----
{/* Import Toast */}
```

## File: src/hooks/usePWAInstall.ts
```typescript
import { useState, useEffect } from 'react';
import { BeforeInstallPromptEvent } from '@/types/dom';
⋮----
export function usePWAInstall()
⋮----
const handleBeforeInstallPrompt = (e: Event) =>
⋮----
// Prevent the mini-infobar from appearing on mobile
⋮----
// Stash the event so it can be triggered later.
⋮----
const handleAppInstalled = () =>
⋮----
const triggerInstall = async () =>
⋮----
// Show the install prompt
⋮----
// Wait for the user to respond to the prompt
⋮----
// We've used the prompt, and can't use it again, throw it away
```

## File: src/app/MainShell.tsx
```typescript
import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, Transaction } from '@/types';
import { useAuth } from '@/hooks/useAuth';
⋮----
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import type { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { ViewRenderer } from '@/app/ViewRenderer';
import { useAppState } from '@/hooks/useAppState';
import { useAutomations } from '@/features/recurring/hooks/useAutomations';
import { useStore } from '@/store';
import ServiceWorkerToast from '@/components/layout/ServiceWorkerToast';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { haptic } from '@/core/haptic';
import { useUPIReturn } from '@/hooks/useUPIReturn';
import { Shield } from 'lucide-react';
⋮----
import { useAppEnvironment } from '@/app/hooks/useAppEnvironment';
import { usePWAInstall } from '@/app/hooks/usePWAInstall';
import { useAppTheme } from '@/app/hooks/useAppTheme';
import { useAppNavigation } from '@/app/hooks/useAppNavigation';
import { useShakeFeedback } from '@/app/hooks/useShakeFeedback';
⋮----
interface MainShellProps {
  config: SpendWiseConfig | null;
  setConfig: (config: SpendWiseConfig) => void;
  userId: string | null;
  initialView?: AppView;
}
⋮----
// Subscribe to specific store slices — not the full store
⋮----
// ── Global UPI Return Detection ─────────────────────────────────────────
⋮----
// Safety check: ensure tx is a valid transaction object, not a browser event
⋮----
const handleGlobalKeyDown = (e: KeyboardEvent) =>
⋮----
const handleQuickAddEvent = () =>
⋮----
// Handle incoming share target at startup:
⋮----
{/* WCAG: Skip to Content Link */}
⋮----
onContinueAsKid=
⋮----
onOpenQuickAdd=
⋮----
resetData=
⋮----
{/* Floating Action Button handled by Sidebar */}
```

## File: src/hooks/useNotifications.ts
```typescript
import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  AppNotification,
  SpendingAlert,
  RecurringPattern,
  SavingsGoal,
  AlertSeverity,
} from '@/types';
import { sendBrowserNotification } from '@/utils/pushNotification';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
// ─── Icon mapping ──────────────────────────────────────────────────────────────
⋮----
function severityIcon(s: AlertSeverity): string
⋮----
function freqIcon(f: RecurringPattern['frequency']): string
⋮----
// ─── Hook ─────────────────────────────────────────────────────────────────────
⋮----
export function useNotifications(
  alerts: SpendingAlert[],
  recurring: RecurringPattern[],
  goals: SavingsGoal[]
)
⋮----
// ── Build unified notification list ────────────────────────────────────────
⋮----
// 1. Spending alerts
⋮----
// 2. Upcoming recurring charges (due in next 7 days)
⋮----
const in7 = formatLocalYYYYMMDD(new Date(Date.now() + 7 * 86_400_000)); // eslint-disable-line react-hooks/purity
⋮----
timestamp: Date.now(), // eslint-disable-line react-hooks/purity
⋮----
// 3. Goal milestone notifications
⋮----
// 4. Custom transient notifications
⋮----
// Filter out currently snoozed
const now = Date.now(); // eslint-disable-line react-hooks/purity
⋮----
// Sort: unread first, then by timestamp desc
⋮----
// ── Actions ────────────────────────────────────────────────────────────────
⋮----
/** Snooze a notification for `hours` hours (default 1h) */
⋮----
// Also mark as read so it doesn't show on un-snooze in unread bucket
⋮----
/** Permanently dismiss a notification (only for custom ones) */
⋮----
// Also mark snoozed forever
```

## File: src/hooks/useTransactions.ts
```typescript
import { useMemo } from 'react';
import {
  CategorySpend,
  MonthlyStats,
  BalanceDataPoint,
  Category,
  MonthlyHistoryPoint,
} from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
import { FINANCE_DEFAULTS } from '@/constants';
⋮----
export function useTransactions(initialBalance: number = DEFAULT_BALANCE)
⋮----
// BUG-06 fix: compute total so percent is not always 0
⋮----
// Filter transactions for the current calendar month
⋮----
// BUG-11 fix: compute topCategory and categoryDistribution (were always undefined)
⋮----
// Get all unique months from transactions
⋮----
const monthStr = tx.date.substring(0, 7); // YYYY-MM
⋮----
// Sort months and take the last 6
⋮----
// Sort transactions by date once
⋮----
// While the transaction date is after the current day, subtract/add it back from running balance
// BUG-05 fix: was inverted — credits appeared as increases when unwinding (they should decrease the earlier balance)
```

## File: src/types/finance.ts
```typescript
export type DefaultCategory =
  | 'Food'
  | 'Subscriptions'
  | 'Transport'
  | 'Entertainment'
  | 'Shopping'
  | 'Utilities'
  | 'Health'
  | 'Travel'
  | 'Education'
  | 'Business'
  | 'Income';
⋮----
export type Category = DefaultCategory | (string & {});
⋮----
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: Category;
  merchant: string;
  type: 'credit' | 'debit';
  description?: string;
  isNew?: boolean;
  isRecurring?: boolean;
  confidence?: number;
  aiParsed?: boolean;
  tags?: string[];
  originalCategory?: string;
  status?: 'completed' | 'pending_approval';
}
⋮----
export type BudgetPeriod = 'weekly' | 'biweekly' | 'monthly';
⋮----
export interface BudgetConfig {
  period: BudgetPeriod;
  rolloverEnabled: boolean;
}
⋮----
export type BudgetConfidence = 'high' | 'medium' | 'low';
⋮----
export interface CategorySpend {
  name: Category;
  value: number;
  color: string;
  percent: number;
}
⋮----
export interface BalanceDataPoint {
  date: string;
  balance: number;
  projected?: boolean;
}
⋮----
export interface BudgetSuggestion {
  category: Category;
  suggestedLimit: number;
  confidence: BudgetConfidence;
  reasoning: string;
  avgSpend?: number;
}
⋮----
export interface Budget {
  category: Category;
  limit: number;
  baseLimit: number;
  rolloverAmount: number;
  spent: number;
  percent: number;
  remaining: number;
  status: 'safe' | 'warning' | 'danger';
}
⋮----
export interface MonthlyStats {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  netCashFlow: number;
  avgDailySpend: number;
  transactionCount: number;
  topCategory?: string;
  categoryDistribution?: Record<string, number>;
}
⋮----
export interface MonthlyHistoryPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}
⋮----
export interface RecurringPattern {
  merchant: string;
  category: Category;
  avgAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual';
  lastSeen: string;
  nextExpected: string;
  occurrences: number;
  totalSpent: number;
  priceCreep?: boolean;
  isTrial?: boolean;
  trialEndsAt?: string;
}
⋮----
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'annual';
⋮----
export interface RecurringTransaction {
  id: string;
  merchant: string;
  amount: number;
  category: Category;
  frequency: RecurringFrequency;
  lastProcessed: string | null;
  nextOccurrence: string; // ISO date string YYYY-MM-DD
  isTrial?: boolean;
  trialEndsAt?: string;
}
⋮----
nextOccurrence: string; // ISO date string YYYY-MM-DD
⋮----
export type GoalStatus = 'on-track' | 'at-risk' | 'achieved' | 'paused';
⋮----
export interface SavingsGoal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  monthlyContribution: number;
  status: GoalStatus;
  color: string;
  createdAt: string;
}
⋮----
export interface SpendingPersonality {
  archetype: string;
  description: string;
  traits: string[];
  advice: string;
}
```

## File: src/features/ai/components/MagicInput.tsx
```typescript
import React, { useState, useRef, useEffect } from 'react';
import { Wand2, Sparkles, Loader2, Check, X } from 'lucide-react';
import { processNaturalLanguageExpense } from '@/features/ai/parsers/nlp';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, Category } from '@/types';
import { AIInputTools } from '@/features/ai/components/AIInputTools';
import { compressImage } from '@/utils/imageUtils';
import { recognizeReceipt, parseOfflineReceipt } from '@/features/ai/parsers/ocr';
import { parseVoiceLocally } from '@/features/ai/parsers/voice';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { SpeechRecognitionEvent } from '@/types/dom';
import ReceiptScanner from '@/features/ai/components/ReceiptScanner';
import { haptic } from '@/core/haptic';
import { predictCategory } from '@/utils/merchantMapper';
import { useCategories } from '@/hooks/useCategories';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
interface MagicInputProps {
  onAdd: (transaction: Transaction) => void;
  externalInput?: string;
  onInputChange?: (val: string) => void;
  transactions?: Transaction[];
  onFocus?: () => void;
  autoFocus?: boolean;
}
⋮----
const handleProcess = async () =>
⋮----
// Dismiss soft keyboard on mobile devices immediately
⋮----
// Fallback: create a minimal transaction from the raw text
⋮----
// Intelligent Default: If merchant matches history, suggest previous category
⋮----
const updatePrediction = (
    idx: number,
    field: 'merchant' | 'category' | 'amount' | 'type',
    value: string | number
) =>
⋮----
const handleConfirm = () =>
⋮----
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) =>
⋮----
const handleVoiceInput = () =>
⋮----
// fallback to local parsing
⋮----
{/* Scan Status Overlay */}
⋮----

⋮----
{/* Quick Suggestions */}
⋮----
setInput(prompt);
handleProcess();
⋮----
onChange=
⋮----
updatePrediction(idx, 'type', item.type === 'debit' ? 'credit' : 'debit')
```

## File: src/features/profile/ProfileView.tsx
```typescript
import { User, DownloadCloud, CheckCircle2 } from 'lucide-react';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { exportCSV } from '@/utils/export';
import { Transaction, AppView, AppNotification } from '@/types';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useCurrency, CurrencyCode } from '@/contexts/CurrencyContext';
import IOSInstallModal from '@/components/layout/IOSInstallModal';
import Portal from '@/components/ui/Portal';
⋮----
import ProfileForm from '@/features/profile/components/ProfileForm';
import { CurrencySelector } from '@/features/profile/components/CurrencySelector';
import { DataManagement } from '@/features/profile/components/DataManagement';
import SecureExportModal from '@/features/profile/components/SecureExportModal';
import RestoreModal from '@/features/profile/components/RestoreModal';
import ResetConfirmModal from '@/features/profile/components/ResetConfirmModal';
import { AccessibilitySection } from '@/features/profile/components/AccessibilitySection';
import { NotificationsSection } from '@/features/profile/components/NotificationsSection';
import { useProfileView } from '@/features/profile/components/useProfileView';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { FamilySafetySection } from '@/features/profile/components/FamilySafetySection';
⋮----
interface ProfileViewProps {
  config: SpendWiseConfig | null;
  onUpdateConfig: (cfg: SpendWiseConfig) => void;
  onResetData: () => void;
  transactions: Transaction[];
  onNavigate?: (view: AppView) => void;
  addNotification?: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
}
⋮----
import { useIsMobile } from '@/hooks/useMediaQuery';
import ProfileViewMobile from '@/features/profile/ProfileViewMobile';
⋮----
onAvatarClick=
⋮----
onOpenResetConfirm=
onOpenSecureExport=
onOpenRestore=
⋮----
onClose=
⋮----
<ResetConfirmModal onClose=
⋮----
{/* Header */}
⋮----
{/* Avatar Upload */}
⋮----
{/* Profile Form */}
⋮----
{/* Currency Selector */}
⋮----
{/* Data Management */}
⋮----
{/* Accessibility */}
⋮----
{/* Family & Safety */}
⋮----
{/* Notifications */}
⋮----
{/* App Footer */}
⋮----
{/* Modals */}
```

## File: src/features/shared/SharedView.tsx
```typescript
import React, { useState, useMemo, useCallback, Component, ReactNode } from 'react';
import { useSharedWallets } from '@/features/shared/hooks/useSharedWallets';
import { useAuth } from '@/hooks/useAuth';
import { SharedGoal } from '@/features/shared/hooks/useSharedWallets';
⋮----
import { Ico } from '@/components/ui/Icons';
import { Btn } from '@/components/ui/Button';
import { Err } from '@/components/ui/Alert';
import {
  CreateGroupModal,
  InviteModal,
  WalletModal,
  ExpenseModal,
  GoalModal,
  ContribModal,
  GroupQRModal,
} from '@/features/shared/components/SharedModals';
import {
  WalletTab,
  ExpensesTab,
  GoalsTab,
  MembersTab,
  ActivityTab,
} from '@/features/shared/components/SharedTabs';
import { SharedOverview } from '@/features/shared/components/SharedOverview';
import { InviteBanner, EmptyState, GroupSelector } from '@/features/shared/components/SharedGroups';
import { Activity, Share2, Scan, Plus, Users, Target, Wallet } from 'lucide-react';
import { haptic } from '@/core/haptic';
⋮----
type Tab = 'wallet' | 'expenses' | 'goals' | 'members' | 'activity';
⋮----
function ArrowRightLeftIcon(
⋮----
constructor(props:
super(props);
⋮----
if (this.state.error)
⋮----
<EmptyState onCreateGroup=
⋮----
setTab=
⋮----
haptic.light();
setQR(true);
⋮----
haptic.medium();
handleAdd();
⋮----
onSubmit=
await sw.createGroup(n, p, userName, e);
```

## File: src/hooks/useMasterVoice.ts
```typescript
/**
 * useMasterVoice — SpendWise Master Voice Input Hook (Phase 2)
 *
 * Manages the Web Speech API recording lifecycle:
 *  - Streams interim transcript text
 *  - Validates missing entities before execution
 *  - Requires confirmation for large-amount commands (>₹50k)
 *  - Maintains a 10-entry command history with undo support
 *  - Reads back results via TTS (Web Speech Synthesis)
 *  - Enforces 800ms cooldown between activations
 */
⋮----
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  parseVoiceCommand,
  getMissingEntityPrompt,
  requiresConfirmation,
} from '@/core/voiceCommands/commandParser';
import { executeCommand } from '@/core/voiceCommands/commandRouter';
import { VoiceCommand, CommandResult } from '@/core/voiceCommands/types';
import { speak } from '@/core/voiceCommands/tts';
import { haptic } from '@/core/haptic';
import { useStore } from '@/store';
import { formatLocalYYYYMMDD } from '@/utils/date';
import type { SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '@/types/dom';
⋮----
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
  start(): void;
  stop(): void;
  abort(): void;
}
⋮----
start(): void;
stop(): void;
abort(): void;
⋮----
interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}
⋮----
export type MicState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'confirm'
  | 'awaiting'
  | 'success'
  | 'error';
⋮----
export interface HistoryEntry {
  command: VoiceCommand;
  result: CommandResult;
  timestamp: number;
}
⋮----
import { AppView } from '@/types';
⋮----
interface UseMasterVoiceOptions {
  navigate: (view: AppView) => void;
  onExport: () => void;
  toggleTheme: () => void;
  setSearchQuery?: (q: string) => void;
}
⋮----
interface UseMasterVoiceReturn {
  state: MicState;
  transcript: string;
  command: VoiceCommand | null;
  result: CommandResult | null;
  missingPrompt: string | null;
  pendingConfirm: VoiceCommand | null;
  history: HistoryEntry[];
  isSupported: boolean;
  showTextFallback: boolean;
  start: () => void;
  stop: () => void;
  confirm: () => void;
  cancelConfirm: () => void;
  undo: () => void;
  reset: () => void;
  submitTextCommand: (text: string) => Promise<void>;
  dismissTextFallback: () => void;
}
⋮----
// SpeechRecognition types handled via (window as any)
⋮----
export function useMasterVoice({
  navigate,
  onExport,
  toggleTheme,
  setSearchQuery,
}: UseMasterVoiceOptions): UseMasterVoiceReturn
⋮----
// ── Helpers ───────────────────────────────────────────────────────────────
⋮----
// ── Public API ────────────────────────────────────────────────────────────
⋮----
/** Execute a parsed command, handle TTS, history, and auto-reset. */
⋮----
// Handle undo via special NAVIGATE view='UNDO'
⋮----
// Pop the last entry (visual only — store undo is TODO Phase 3)
⋮----
// TTS readback
⋮----
/** Confirm a pending high-value command. */
⋮----
/** Process text through the parse+execute pipeline (shared by voice & text fallback). */
⋮----
/** Submit a typed command (text fallback when speech fails). */
⋮----
/** Undo the most recent successful command (exposed for UI button too). */
⋮----
// Undo the last command by reversing its effect on the store
⋮----
// Check mic permission first
⋮----
// Cooldown guard
⋮----
// Clear previous run
⋮----
// Only store finalized results for the onend check
⋮----
// If onerror already set state, don't override
⋮----
/* already stopped */
```

## File: src/hooks/useAppState.ts
```typescript
import { useCallback, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { useAlerts } from '@/features/budget/hooks/useAlerts';
import { useRecurring } from '@/features/recurring/hooks/useRecurring';
import { useNotifications } from '@/hooks/useNotifications';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { useCategories } from '@/hooks/useCategories';
import { SpendWiseConfig } from '@/features/onboarding/components/OnboardingModal';
import { FINANCE_DEFAULTS } from '@/constants';
import { Budget, BudgetPeriod } from '@/types';
import { useStore } from '@/store';
⋮----
export function useAppState(config: SpendWiseConfig | null)
⋮----
// Exclude pending-approval transactions from balance & budget calculations
⋮----
// Budget derived state & handlers
```

## File: src/hooks/useAuth.tsx
```typescript
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useStore } from '@/store';
import { STORAGE_KEYS } from '@/constants';
import { isSupabaseConfigured, signInWithEmail, signUpWithEmail } from '@/core/api/supabase';
import { db } from '@/db/db';
import { toast } from 'react-hot-toast';
⋮----
export interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}
⋮----
export interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  loading: boolean;
  authReady: boolean;
  mfaRequired: boolean;
  signOut: () => Promise<void>;
  signInAnonymously: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>;
  setupMFA: () => Promise<void>;
  verifyMFA: (code: string) => Promise<boolean>;
}
⋮----
// Only persist user ID, not email — email reconstructed in memory
⋮----
// Do NOT remove spendwise_device_id — keeps data stable
// Do NOT remove transactions — they're in IDB and tied to device
// Do NOT remove CONFIG (spendwise_config_v1) — user prefs/name/currency must survive sign-out
⋮----
// BUG-08 fix: use full-email-based stable id (not just prefix) to avoid collisions
⋮----
// BUG-08 fix: use full-email-based stable id (not just prefix) to avoid collisions
⋮----
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType =>
```

## File: src/hooks/useBudgets.ts
```typescript
import { useMemo } from 'react';
import { useStore } from '@/store';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';
⋮----
export function useBudgets()
⋮----
// Determine the start date of the current period
⋮----
startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
⋮----
startDate.setDate(now.getDate() - 14); // Last 14 days
⋮----
startDate.setDate(1); // Start of month
⋮----
const endDateStr = formatLocalYYYYMMDD(now); // today — never include future dates
⋮----
// Compute period spending per category
⋮----
// Merge explicit store budgets with implicit category limits
```

## File: src/utils/razorpaySync.ts
```typescript
import { Transaction, Category } from '@/types';
import { processNaturalLanguageExpense } from '@/features/ai/parsers/nlp';
import { useStore } from '@/store';
import { inferCategory } from '@/features/ai/parsers/common';
⋮----
// ─── Merchant Memory (Phase 8.3) ────────────────────────────────────────────
export type MerchantMemory = Record<string, { merchant: string; category: string }>;
⋮----
export function loadMerchantMemory(): MerchantMemory
⋮----
/** After AI parse or manual correction — remember this UPI VPA mapping. */
export function rememberMerchant(upiVPA: string, merchant: string, category: string)
⋮----
export function parseUPIDescription(description: string):
⋮----
// PhonePe: "UPI/CR/PhonePe/MERCHANT_NAME/9876543210@ybl"
// GPay:    "UPI-MERCHANTNAME-gpay@okaxis-AXIS..."
// Paytm:   "PAYTM/UPI/merchant@paytm/DESCRIPTION"
// HDFC:    "UPI-CR-MERCHANTNAME-123456@upi"
// NEFT:    "NEFT/IMPS" (not UPI, ignore)
⋮----
const vpaMatch = description.match(/[\w.-]+@[\w]+/); // UPI VPA: name@bank
⋮----
// Extract merchant name — try multiple patterns:
⋮----
/UPI\/(?:CR|DR)\/[^/]+\/([^/]+)\//i, // PhonePe pattern
/UPI-([A-Z0-9\s]+)-[a-z@]/i, // GPay/HDFC pattern
/PAYTM\/UPI\/([^/]+)\//i, // Paytm pattern
/TO\s+([A-Z\s]{3,30})\s+REF/i, // Generic TO NAME REF
⋮----
if (!merchant && upiId) merchant = upiId.split('@')[0]; // Fallback to VPA prefix
⋮----
/**
 * Parse a UPI payment description with Gemini AI.
 * Falls back to simple keyword heuristics if Gemini is unavailable.
 * Uses merchant memory to skip repeat AI calls for known VPAs.
 */
export async function parseUPIPayment(
  description: string,
  upiVPA = ''
): Promise<
⋮----
// 1 — Check merchant memory first (Phase 8.3)
⋮----
aiParsed: false, // from memory — no AI call
⋮----
// 2 — Attempt AI Analysis
⋮----
// 3 — Offline Heuristics Parse (Fallback)
⋮----
export interface RazorpayAuth {
  keyId: string;
  keySecret?: string;
}
⋮----
/**
 * Fetches recent captured payments from Razorpay API via secure backend proxy or mock fallback.
 */
export async function fetchRazorpayTransactions(auth: RazorpayAuth): Promise<Transaction[]>
⋮----
// ⚠️ No proxy URL configured — return empty array instead of silently fabricating transactions
⋮----
interface RazorpayPaymentItem {
  id: string;
  status: string;
  created_at: number;
  amount: number;
  method?: string;
  email?: string;
  contact?: string;
  description?: string;
}
⋮----
function processPaymentsToTransactions(payments: RazorpayPaymentItem[]): Transaction[]
⋮----
// ─── UPI Payment Checkout ───────────────────────────────────────────────────
⋮----
export interface RazorpayPaymentOptions {
  keyId: string;
  amount: number; // in rupees — converted to paise internally
  description: string;
  prefillName?: string;
  prefillEmail?: string;
  prefillContact?: string;
  onSuccess: (details: RazorpayPaymentResult) => void;
  onFailure?: (error: unknown) => void;
}
⋮----
amount: number; // in rupees — converted to paise internally
⋮----
export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  amount: number; // in rupees
  description: string;
  method: string;
}
⋮----
amount: number; // in rupees
⋮----
// Razorpay types are now in src/types/dom.ts
⋮----
/** Opens the Razorpay checkout popup for a UPI payment. */
export async function initiateRazorpayPayment(opts: RazorpayPaymentOptions): Promise<void>
⋮----
amount: Math.round(opts.amount * 100), // convert to paise
```

## File: src/main.tsx
```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
⋮----
import App from '@/app/App';
import { AuthProvider } from '@/hooks/useAuth';
import { CategoryProvider } from '@/hooks/useCategories';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
⋮----
import { registerSW } from 'virtual:pwa-register';
import { runDexieMigration } from '@/db/migration';
⋮----
// Register service worker for PWA (immediate: ensures update on next visit)
⋮----
// Run one-time migration from legacy localStorage → IndexedDB on first load
⋮----
// Preferences are now restored via the encrypted Zustand store inside App.tsx
```

## File: src/store/index.ts
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Transaction, Category } from '@/types';
import { db } from '@/db/db';
import { STORAGE_KEYS } from '@/constants';
import { createFinanceSlice, FinanceSlice } from '@/features/transactions/store/financeSlice';
import { createPortfolioSlice, PortfolioSlice } from '@/features/portfolio/store/portfolioSlice';
import {
  createGamificationSlice,
  GamificationSlice,
} from '@/features/gamification/store/gamificationSlice';
import { createParentalSlice, ParentalSlice } from '@/features/parental/store/parentalSlice';
import { createSecuredSlice, SecuredSlice } from '@/core/store/securedSlice';
⋮----
// Helper functions for base64 conversion
function arrayBufferToBase64(buffer: ArrayBuffer): string
⋮----
function base64ToArrayBuffer(base64: string): ArrayBuffer
⋮----
// Derive Key from Password
async function deriveKey(password: string, salt: Uint8Array<ArrayBufferLike>)
⋮----
async function encryptString(text: string, password: string): Promise<string>
⋮----
async function decryptString(encryptedJson: string, password: string): Promise<string>
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// Encryption key management — security-hardened
// Strategy:
//   • A stable device-specific random UUID (the "seed") is stored in localStorage.
//   • This key protects local database records from being readable off-device,
//     acting as a hardware-bound boundary.
//   • Note: Because it is persisted on disk, it does not fully defend against
//     XSS attacks or malicious browser extensions on this specific device.
// ─────────────────────────────────────────────────────────────────────────────
function getOrCreateSessionSeed(): string
⋮----
// NOTE: This seed lives in localStorage (device-persistent).
// It protects data from being readable without this device's seed,
// but does NOT protect against XSS or malicious extensions on this device.
⋮----
// Compose a stable password from the session seed
// (In a production app you would use OPAQUE or a PIN-derived key here.)
⋮----
// Custom storage for IndexedDB using Dexie
⋮----
// Session seed mismatch — purge stale encrypted data silently
⋮----
export interface ParentalControlState {
  enabled: boolean;
  isTeenMode: boolean;
  ageGroup: 'child' | 'teen' | 'adult';
  parentPinHash: string | null;
  parentId?: string | null;
  monthlyLimit: number | null;
  restrictedCategories: Category[];
  pendingTransactions: Transaction[];
  hideBalances: boolean;
  hideAnalytics: boolean;
  blockAddTransactions: boolean;
  sessionUnlocked: boolean;
  requireApproval: boolean;
  notifyOnAllSpending?: boolean;
  notifyOnLowBalance?: boolean;
  blockAdultContent?: boolean;
  restrictLateNightSpending?: boolean;
  allowanceAmount: number;
  allowanceFrequency: 'weekly' | 'monthly';
  spendingCapWeekly: number | null;
  lastAllowancePayout: string | null;
}
⋮----
export type SpendWiseStore = FinanceSlice &
  PortfolioSlice &
  GamificationSlice &
  ParentalSlice &
  SecuredSlice & {
    resetData: () => void;
    restoreBackup: (data: Partial<SpendWiseStore>) => void;
    privacyEnabled: boolean;
    togglePrivacy: () => void;
  };
⋮----
// ─── Automatic Legacy LocalStorage Migration ──────────────────────────────────
function migrateLegacyLocalStorage(store: SpendWiseStore)
⋮----
// 1. Migrate Savings Goals
⋮----
// 2. Migrate Shared Wallets
⋮----
// 3. Migrate Merchant Memory
⋮----
// 4. Migrate Notifications
⋮----
// 5. Migrate Razorpay Keys
⋮----
// 6. Migrate Round-Up Vault
⋮----
// 7. Migrate User Preferences
⋮----
// legacy migration failed silently
⋮----
// Run the migration immediately
```

## File: src/index.css
```css
/* ── Custom xs breakpoint (480px) for Tailwind v4 ── */
@custom-variant xs (@media (min-width: 480px));
⋮----
/* ── Enable class-based dark mode for Tailwind v4 ── */
⋮----
/* ═══════════════════════════════════════════════
   FINEBANK DESIGN SYSTEM — TOKENS
   Dark sidebar + Light content + Teal accent
═══════════════════════════════════════════════ */
⋮----
@layer base {
⋮----
:root {
⋮----
/* ── Sidebar ── */
⋮----
/* ── Main Content Area ── */
⋮----
/* ── Text ── */
⋮----
/* ── Chart & Graph Tokens ── */
⋮----
/* ── Teal Brand Accent ── */
⋮----
/* ── Semantic Colors (for light BG) ── */
⋮----
/* ── Glassmorphism ── */
⋮----
/* ── Border ── */
⋮----
/* ── Brand Gradient ── */
⋮----
/* ── Card Shadow ── */
⋮----
/* ── Radii ── */
⋮----
/* ── Fonts ── */
⋮----
/* ── Mobile Font Scale ── */
⋮----
/* ── Spacing Scale ── */
⋮----
/* ── Icon Size Tokens ── */
⋮----
:root.dark {
⋮----
/* ── Shadows ── */
⋮----
/* ── Dim semantic colors for darker BG ── */
⋮----
/* ── Recharts Customization ── */
.recharts-cartesian-grid-horizontal line,
⋮----
.recharts-text {
⋮----
.recharts-tooltip-cursor {
⋮----
*,
⋮----
/* Prevent blue tap highlight on mobile/Android */
⋮----
/* Make app feel native by preventing bounce/overscroll */
html,
⋮----
/* Prevent text selection on UI elements */
⋮----
/* Re-enable text selection for actual readable content */
p,
⋮----
/* Prevent double-tap to zoom on interactive elements */
button,
⋮----
/* Only transition specific properties on interaction, not everything globally */
⋮----
/* Don't transition transforms/opacity — that would break animations */
.animate-float,
⋮----
body {
⋮----
/* Smooth momentum scrolling on iOS/Android */
⋮----
.high-contrast {
⋮----
/* ── High Contrast Overrides ── */
⋮----
:root.dark.high-contrast {
⋮----
/* ── Dark High Contrast Overrides ── */
⋮----
/* ═══════════════════════════════════════════════
   LAYOUT — Sidebar + Content Shell
═══════════════════════════════════════════════ */
.app-shell {
⋮----
/* ═══════════════════════════════════════════════
   TYPOGRAPHY UTILITIES
═══════════════════════════════════════════════ */
@layer utilities {
⋮----
.text-display {
⋮----
.btn-tactile {
⋮----
/* Material Ripple Simulation */
.btn-tactile::after {
⋮----
.btn-tactile:active::after {
⋮----
.surface-glass {
⋮----
@apply backdrop-blur-xl;
⋮----
.overscroll-contain {
⋮----
.text-headline {
⋮----
.text-title {
⋮----
.text-body {
⋮----
.text-label {
⋮----
.text-caption {
⋮----
/* ── Card ── */
.card {
⋮----
.glass-card {
⋮----
.glass-panel {
⋮----
/* ── Teal Primary Button ── */
.primary-button {
.primary-button:hover:not(:disabled) {
.primary-button:active:not(:disabled) {
.primary-button:disabled {
⋮----
/* ── Ghost button ── */
.ghost-button {
⋮----
/* Premium Animations */
⋮----
.premium-shimmer {
⋮----
.animate-float {
⋮----
.pulse-teal {
.ghost-button:hover {
⋮----
/* ── Input field ── */
.input-field {
.input-field::placeholder {
.input-field:focus {
⋮----
/* Autofill override */
input:-webkit-autofill,
⋮----
/* ── Badge pill ── */
.badge-pill {
⋮----
/* ── Card hover ── */
.card-hover {
.card-hover:hover {
⋮----
/* ── Teal stat number ── */
.stat-number {
⋮----
/* ── Hide scrollbar utility ── */
.hide-scrollbar {
.hide-scrollbar::-webkit-scrollbar {
⋮----
/* ═══════════════════════════════════════════════
   SCROLLBAR
═══════════════════════════════════════════════ */
* {
::-webkit-scrollbar {
::-webkit-scrollbar-track {
::-webkit-scrollbar-thumb {
::-webkit-scrollbar-thumb:hover {
⋮----
/* ═══════════════════════════════════════════════
   ANIMATIONS
═══════════════════════════════════════════════ */
⋮----
.view-enter {
.tx-enter {
.modal-enter {
.animate-scale-in {
.animate-fade-in-up {
.animate-fade-in {
.animate-slide-in-right {
⋮----
.animate-shimmer {
.animate-pulse-glow {
⋮----
.animate-blink {
⋮----
/* ═══════════════════════════════════════════════
   MOBILE NAV SPACER
═══════════════════════════════════════════════ */
.mobile-nav-spacer {
⋮----
/* numeric alignment */
.tabular-nums {
⋮----
/* ═══════════════════════════════════════════════
   MOBILE DASHBOARD OVERRIDES
   Prevent overflow, scale down heavy components, and optimize GPU
═══════════════════════════════════════════════ */
⋮----
/* Android / Mobile GPU Optimizations */
⋮----
/* Reduce blur intensity on mobile to save GPU cycles on Android */
⋮----
/* Flatter shadows on mobile */
⋮----
/* Disable heavy continuous animations on mobile to save battery and stop lag */
⋮----
/* On very small phones (<480px), hide the hero sparkline */
⋮----
.hero-sparkline {
⋮----
/* Stat card font clamp for narrow phones */
⋮----
.stat-value-text {
⋮----
/* Ensure dashboard never exceeds viewport width */
.dashboard-root {
⋮----
/* Android safe-area bottom padding */
.safe-pb {
⋮----
/* ═══════════════════════════════════════════════
   DASHBOARD LAYOUT — GUARANTEED SINGLE COLUMN
   Hard override for mobile regardless of Tailwind
═══════════════════════════════════════════════ */
⋮----
/* Force the outer two-column container to stack */
.dashboard-cols {
/* Ensure both columns are full width */
.dashboard-cols > * {
/* Stat cards: force 2 columns max on mobile */
.stat-grid {
/* FORCE SINGLE COLUMN END */
⋮----
/* ── Hide scrollbar on snap row (cross-browser) ───────────────────────────── */
.no-scrollbar {
.no-scrollbar::-webkit-scrollbar {
⋮----
/* ── Visual Viewport keyboard inset (fixes FAB hiding behind keyboard) ────── */
⋮----
/* ── Mobile bottom-nav safe-area padding ──────────────────────────────────── */
.pb-safe {
⋮----
/* ── Snap row card hover on desktop ──────────────────────────────────────── */
⋮----
.snap-card-hover:hover {
⋮----
/* ── Dark mode hero glow (§2 Dashboard) ──────────────────────────────────── */
:root.dark .hero-glow-dark {
⋮----
/* ── Skeleton shimmer for charts ─────────────────────────────────────────── */
⋮----
.skeleton-wave {
:root.dark .skeleton-wave {
⋮----
/* ── Danger Zone (§15 Profile / Settings) ────────────────────────────────── */
.danger-zone {
:root.dark .danger-zone {
⋮----
/* ── Amount colour coding (§6 Transactions) ──────────────────────────────── */
.amount-debit {
.amount-credit {
⋮----
/* ── Daily subtotal date header ──────────────────────────────────────────── */
.tx-date-header {
.tx-date-header .subtotal {
⋮----
/* ── Undo toast ──────────────────────────────────────────────────────────── */
.undo-toast {
.undo-toast button {
⋮----
/* ── Goal Hall of Fame section ───────────────────────────────────────────── */
.goals-hof-header {
⋮----
/* ── GoalCard gradient tint ──────────────────────────────────────────────── */
.goal-card-tint {
```
