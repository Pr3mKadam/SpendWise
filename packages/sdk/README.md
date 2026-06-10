# @spendwise/analytics-sdk

White-label SpendWise analytics for partner apps.

## Installation

```bash
npm install @spendwise/analytics-sdk
```

## Usage

```tsx
import { SpendWiseAnalytics } from '@spendwise/analytics-sdk';

function BankDashboard() {
  return (
    <SpendWiseAnalytics
      transactions={transactions}
      currency="₹"
      theme="bank-default"
      onBudgetAlert={(alert) => console.log(alert)}
    />
  );
}
```

## Features
- Spending breakdown by category
- Budget tracking and alerts
- Savings goal visualisation
- Multi-currency support
- White-label theming
