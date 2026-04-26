---
phase: upi-sync
plan: 1
wave: 1
---

# Plan 1: Rename Bank Sync → UPI Sync & Remove Mock Placeholders

## Objective
Rename "Bank & UPI Sync" to "UPI Sync" throughout the app, remove the two hardcoded mock accounts (GPay + PhonePe), and clean up the sidebar/nav label so it reads "UPI Sync" consistently.

## Context
- src/components/BankSyncView.tsx — main view (rename heading, remove mock accounts array)
- src/components/Sidebar.tsx — nav label "Bank Sync" → "UPI Sync"
- src/types.ts — check if AppView type needs updating

## Tasks

<task type="auto">
  <name>Remove mock accounts and rename view heading</name>
  <files>src/components/BankSyncView.tsx</files>
  <action>
    1. Change `useState<UPIAccount[]>([...])` initial value from the two hardcoded mock entries (mock-1 phonepe, mock-2 gpay) to an empty array `[]`.
    2. Change heading text "Bank & UPI Sync" to "UPI Sync" (line ~144).
    3. Change subtitle copy to: "Connect your Razorpay account to automatically import UPI payment transactions, or upload a CSV statement."
    4. Remove the "How to get your statement" guide list items for Google Pay and PhonePe — keep only "HDFC Bank" or replace with a generic "Any Bank CSV" guide.
    5. Keep all functional code (handleSyncAccount, handleRazorpayConnect, etc.) intact.
  </action>
  <verify>npm run build — no TypeScript errors</verify>
  <done>BankSyncView renders with empty accounts by default; heading says "UPI Sync"; no mock GPay/PhonePe entries appear on first load</done>
</task>

<task type="auto">
  <name>Update sidebar nav label</name>
  <files>src/components/Sidebar.tsx</files>
  <action>
    Find the nav item that links to the 'sync' AppView. Change its label from "Bank Sync" to "UPI Sync". Keep the icon (Landmark or similar) unchanged.
  </action>
  <verify>npm run build — zero errors</verify>
  <done>Sidebar shows "UPI Sync" label for the sync nav item</done>
</task>

## Success Criteria
- [ ] No mock PhonePe/GPay accounts shown on fresh load
- [ ] Heading in view reads "UPI Sync"
- [ ] Sidebar nav item reads "UPI Sync"
- [ ] Build passes with zero errors
