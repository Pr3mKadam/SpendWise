---
phase: upi-sync
plan: 2
wave: 2
---

# Plan 2: Razorpay UPI Payment Checkout + Auto-Capture to Dashboard

## Objective
Add a "Make UPI Payment" feature using Razorpay's JavaScript SDK (test mode, free).
When a user completes a payment, the transaction details are automatically captured and added to the SpendWise dashboard as a new expense transaction.

## Architecture Decision
Razorpay checkout requires a server-side `order_id`. Since SpendWise is a pure frontend app with no backend server, we use a **simulated order approach**:
- Use Razorpay's standard JS SDK loaded via CDN script tag
- For hackathon/test mode: Use `rzp_test_*` keys directly in frontend (acceptable for demos)
- On payment `handler` callback success → parse Razorpay `response` object → create SpendWise transaction
- Real production would need a backend to create orders; we document this clearly in the UI

## Context
- src/components/BankSyncView.tsx — add "Make UPI Payment" button + modal trigger
- src/components/UPISyncPaymentModal.tsx — NEW file: Razorpay checkout launcher modal
- src/utils/razorpaySync.ts — add `initiateRazorpayPayment()` helper
- index.html — add Razorpay script tag

## Tasks

<task type="auto">
  <name>Add Razorpay SDK script and payment utility</name>
  <files>index.html, src/utils/razorpaySync.ts</files>
  <action>
    1. In index.html, add before closing `</body>`:
       `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`
    
    2. In src/utils/razorpaySync.ts, add a new export function `initiateRazorpayPayment`:
    ```ts
    export interface RazorpayPaymentOptions {
      keyId: string;
      amount: number;       // in rupees (will be converted to paise internally)
      description: string;
      prefillName?: string;
      prefillEmail?: string;
      prefillContact?: string;
      onSuccess: (details: RazorpayPaymentResult) => void;
      onFailure?: (error: any) => void;
    }

    export interface RazorpayPaymentResult {
      razorpay_payment_id: string;
      amount: number;  // in rupees
      description: string;
      method: string;
    }

    export function initiateRazorpayPayment(opts: RazorpayPaymentOptions): void {
      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        alert('Razorpay SDK not loaded. Please check your internet connection.');
        return;
      }

      const rzp = new Razorpay({
        key: opts.keyId,
        amount: Math.round(opts.amount * 100), // paise
        currency: 'INR',
        name: 'SpendWise',
        description: opts.description,
        prefill: {
          name: opts.prefillName || '',
          email: opts.prefillEmail || '',
          contact: opts.prefillContact || '',
        },
        theme: { color: '#14b8a6' },
        handler: function(response: any) {
          opts.onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            amount: opts.amount,
            description: opts.description,
            method: 'upi',
          });
        },
        modal: {
          ondismiss: () => opts.onFailure?.({ message: 'Payment cancelled' }),
        },
      });
      rzp.open();
    }
    ```
  </action>
  <verify>npm run build — no TypeScript errors on razorpaySync.ts</verify>
  <done>initiateRazorpayPayment exported; Razorpay SDK script tag in index.html</done>
</task>

<task type="auto">
  <name>Build UPISyncPaymentModal component</name>
  <files>src/components/UPISyncPaymentModal.tsx (NEW)</files>
  <action>
    Create a new modal component with these features:
    
    1. Form fields:
       - Amount (₹) — number input
       - Description / Merchant name — text input
       - UPI ID to pay — text input (prefilled from localStorage saved key or empty)
    
    2. A disclaimer banner: "Test Mode: Use UPI ID 'success@razorpay' to simulate a successful payment"
    
    3. On "Pay via UPI" button click:
       - Load keyId from localStorage ('spendwise_rzp_key')
       - If no key saved, show inline message: "Please connect your Razorpay API key first in the UPI Sync settings"
       - Otherwise call `initiateRazorpayPayment()` from utils/razorpaySync.ts
    
    4. On success callback (handler):
       - Create a SpendWise Transaction object:
         ```ts
         {
           id: `rzp_pay_${result.razorpay_payment_id}`,
           date: new Date().toISOString(),
           amount: result.amount,
           type: 'debit',
           category: 'Transfer',
           merchant: description || 'UPI Payment',
           description: `Razorpay UPI · ${result.razorpay_payment_id}`,
           isNew: true,
           confidence: 1.0,
           aiParsed: false,
           tags: ['upi', 'razorpay'],
         }
         ```
       - Call `onPaymentComplete(transaction)` prop
       - Show success toast/message inside modal before closing
    
    5. Style to match SpendWise design system (use var(--teal), card classes, etc.)
    
    Props interface:
    ```ts
    interface UPISyncPaymentModalProps {
      isOpen: boolean;
      onClose: () => void;
      onPaymentComplete: (tx: Transaction) => void;
    }
    ```
  </action>
  <verify>npm run build — no errors</verify>
  <done>Modal renders, form accepts input, calls Razorpay checkout on submit, creates transaction on success</done>
</task>

<task type="auto">
  <name>Integrate payment modal into BankSyncView and wire to dashboard</name>
  <files>src/components/BankSyncView.tsx, src/components/layout/MainShell.tsx</files>
  <action>
    1. In BankSyncView.tsx:
       - Import UPISyncPaymentModal
       - Add state: `const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)`
       - Add a prominent "Make UPI Payment" button in the header action buttons row (primary teal button with CreditCard icon)
       - Add `<UPISyncPaymentModal>` at the bottom with `onPaymentComplete` that calls `onAutoAddTransactions([tx])`
    
    2. The MainShell already passes `onAutoAddTransactions={txs => txs.forEach(onAdd)}` to BankSyncView — no changes needed there since onAdd handles both local state + cloud sync.
    
    3. Add a "Recent UPI Payments" section below Connected Accounts in BankSyncView:
       - Add prop `recentTransactions?: Transaction[]` to BankSyncViewProps
       - Show last 5 transactions that have tag 'razorpay' or 'upi-sync'
       - Each row: merchant name, amount (red for debit, green for credit), date
    
    4. In MainShell.tsx, pass `recentTransactions={transactions.filter(t => t.tags?.includes('razorpay') || t.tags?.includes('upi-sync'))}` to BankSyncView.
  </action>
  <verify>npm run build — zero errors; npm run dev — clicking "Make UPI Payment" opens Razorpay checkout</verify>
  <done>
    - "Make UPI Payment" button visible in UPI Sync view
    - Clicking it opens Razorpay checkout modal
    - After successful test payment (success@razorpay), new transaction appears in dashboard immediately
    - Recent UPI payments section shows filtered transactions
  </done>
</task>

## Success Criteria
- [ ] Razorpay JS SDK loaded in index.html
- [ ] "Make UPI Payment" button visible in UPI Sync view
- [ ] Clicking it shows amount/description form then launches Razorpay checkout
- [ ] Successful payment creates a new debit transaction in dashboard with tags ['upi', 'razorpay']
- [ ] Transaction visible immediately in Overview and History views
- [ ] Recent UPI Payments section shows past UPI transactions in UPI Sync view
- [ ] Build passes, no TypeScript errors
