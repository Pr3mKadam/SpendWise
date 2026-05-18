# SpendWise — Complete QA Testing Prompt
**Give this entire file to your AI coding assistant (Antigravity / Claude / Gemini).**  
It will start the project, test every feature systematically, and generate a full review report.

---

## SYSTEM CONTEXT FOR THE AI

You are a senior QA engineer performing a complete end-to-end audit of **SpendWise**, a React 19 + TypeScript personal finance PWA. Your job is to:

1. Start the development server
2. Open and interact with the running app
3. Test **every single feature** using the test cases below
4. Record pass ✅ / fail ❌ / partial ⚠️ for each test
5. Document the exact error, wrong behaviour, or missing element for every failure
6. Generate a structured review report at the end

**Be precise. Do not skip steps. Do not assume something works — verify it by interacting with the UI.**

---

## STEP 0 — START THE PROJECT

```bash
# Navigate to the project directory
cd SpendWise   # or wherever the project is

# Install dependencies if node_modules missing
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).  
Open it in the browser. Wait for full load (no spinner). Then begin tests.

**Before starting tests — open DevTools (F12) and:**
- Go to Console tab → note any errors on startup
- Go to Application → IndexedDB → verify `spendwise-db` exists
- Go to Application → Service Workers → verify SW is registered
- Set network to "Slow 3G" for one pass, then "No throttling" for the main pass

---

## STEP 1 — FIRST LAUNCH & ONBOARDING

### Test Group 1.1 — Fresh Start
> **Setup:** Clear all app data first: DevTools → Application → Clear Site Data → Clear All → Reload

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1.1.1 | Onboarding appears on fresh start | Load app with cleared data | 3-step onboarding modal appears, NOT the dashboard |
| 1.1.2 | Step 1 — Personal info fields | Enter: Name = "Imanshu", Occupation = "Student", Location = "Akola", Monthly Goal = "7000" | All fields accept input, Next button activates |
| 1.1.3 | Step 1 — Validation | Click Next with empty Name field | Error message shown, cannot proceed |
| 1.1.4 | Step 2 — Currency selection | Click each currency: $, €, £, ₹, ¥ | Currency symbol updates in preview |
| 1.1.5 | Step 2 — Indian Rupee default | Check which currency is pre-selected on step 2 | ₹ (Rupee) should be selected by default |
| 1.1.6 | Step 2 — userRole selection | Select "Student", "Professional", "Business" in turn | Selection highlights correctly |
| 1.1.7 | Step 3 — Initial balance | Enter 5000 in the balance field | Balance field accepts numeric input |
| 1.1.8 | Step 3 — Complete onboarding | Click "Start SpendWise" or equivalent final button | Dashboard loads with correct name greeting, currency, and balance |
| 1.1.9 | Onboarding data persists | Close tab → reopen → go to Profile | Name, currency, occupation, location all saved correctly |
| 1.1.10 | Second launch skips onboarding | Reload page without clearing data | Goes directly to Dashboard, no onboarding |

---

## STEP 2 — AUTHENTICATION

### Test Group 2.1 — Guest / Local Mode
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 2.1.1 | Auto guest session | After onboarding, check if logged in | User is logged in as guest — no sign-in required to use app |
| 2.1.2 | Device ID persistence | Note the guest ID in DevTools localStorage key `spendwise_device_id`. Reload page | Same device_id persists — data not lost |
| 2.1.3 | Guest data survives reload | Add one transaction. Reload. | Transaction still present |

### Test Group 2.2 — Sign In / Sign Up
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 2.2.1 | AuthView renders | Navigate to Profile → Sign Out | Auth view appears with Email + Password fields |
| 2.2.2 | Sign Up new account | Enter email: `test@spendwise.com`, password: `Test@1234`, click Sign Up | Either: logs in locally (no Supabase) OR creates Supabase account |
| 2.2.3 | Sign Up — empty fields | Click Sign Up with empty fields | Validation error shown |
| 2.2.4 | Sign Up — invalid email | Enter `notanemail`, click Sign Up | "Enter valid email" error shown |
| 2.2.5 | Sign In existing account | Enter same email + password, click Sign In | Logs in, reaches dashboard |
| 2.2.6 | Sign In — wrong password | Enter correct email, wrong password | Error shown, not logged in |
| 2.2.7 | Sign Out | Profile → Sign Out button | Returns to Auth screen OR fresh guest session |
| 2.2.8 | Data after sign out and back in | Add 2 transactions → Sign Out → Sign In with same email | Transactions should still exist (device-local) |

---

## STEP 3 — DASHBOARD

### Test Group 3.1 — Desktop Dashboard (width > 1280px)
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 3.1.1 | Icon sidebar renders | View dashboard on desktop | 56px wide icon sidebar visible on left |
| 3.1.2 | Sidebar tooltips | Hover over each sidebar icon | Tooltip with label appears within ~150ms |
| 3.1.3 | Sidebar groupings | Inspect sidebar visually | 3 groups separated by thin dividers: Core / Wealth / Tools |
| 3.1.4 | Active state | Click "Budget" in sidebar | Budget icon gets teal highlight, tooltip says "Budget" |
| 3.1.5 | Balance hero card | View dashboard | Balance shows correctly with currency symbol |
| 3.1.6 | Income + Spent cards | Check stat cards | Income and Spent show correct month totals |
| 3.1.7 | Recent transactions | Dashboard shows recent tx | Last 5 transactions listed with merchant, category, amount |
| 3.1.8 | Budget summary panel | Dashboard right column | Category budget bars visible with percentages |
| 3.1.9 | Goals panel | Dashboard | Goals count or "No goals yet" message |
| 3.1.10 | AI insight strip | Dashboard | One contextual insight sentence visible |
| 3.1.11 | Privacy + streak in topbar | Check topbar | Streak count pill and Privacy toggle button visible |

### Test Group 3.2 — Mobile Dashboard (width < 768px)
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 3.2.1 | Balance hero | Mobile view | Large balance numeral, Income/Spent chips below |
| 3.2.2 | Horizontal snap row | Scroll horizontally below balance | 4 mini-cards: Budget%, Goals, Savings rate, Subscriptions |
| 3.2.3 | Snap cards tap | Tap each snap card | Navigates to corresponding view |
| 3.2.4 | Recent transactions section | 3rd section | Transaction rows with emoji, merchant, amount |
| 3.2.5 | Empty state | With no transactions | EmptyState shows icon + "Record your first transaction" + Add button |
| 3.2.6 | Level progress | Below transactions | XP bar and level name visible |
| 3.2.7 | Bottom nav — 4 items + FAB | Bottom of screen | Home · History · [+FAB] · Stats · More |
| 3.2.8 | FAB taps QuickAdd | Tap center + FAB | Quick Add bottom sheet slides up |
| 3.2.9 | FAB above keyboard | Tap any text input, keyboard opens | FAB moves up to stay above keyboard |
| 3.2.10 | More drawer | Tap "More" | Bottom sheet slides up with all remaining features in 2-col grid |
| 3.2.11 | More drawer — all features visible | Inspect drawer | Reports, Subscriptions, Shared, Education, Quests, AI Advisor, Portfolio, UPI Sync, Family all visible |
| 3.2.12 | Privacy mode | Toggle privacy from header | All balances blur across dashboard |

---

## STEP 4 — ADDING TRANSACTIONS

### Test Group 4.1 — Quick Add / Magic Input
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 4.1.1 | Open Quick Add | Click + FAB (mobile) or type in dashboard input (desktop) | Quick Add panel / modal opens |
| 4.1.2 | Natural language — expense | Type: `"spent 350 on food at swiggy"` → hit parse/submit | AI prediction shows: merchant=Swiggy, category=Food, amount=350, type=DEBIT, currency=₹ |
| 4.1.3 | Natural language — income | Type: `"received 5000 salary"` | Prediction shows: amount=5000, type=CREDIT, category=Income |
| 4.1.4 | Indian RS format | Type: `"spent 500rs on transport"` | Amount=500 correctly parsed (not 0) |
| 4.1.5 | Multiple items | Type: `"500 on food 700 on travel"` | Two separate predictions returned |
| 4.1.6 | Currency symbol in input | Check prediction card currency symbol | Shows ₹ not $ |
| 4.1.7 | Confirm Add | Click "Confirm Add" | Transaction added, balance updates, toast shown |
| 4.1.8 | Cancel | Click Cancel / close | No transaction added |
| 4.1.9 | Category selection | Before confirming, tap a different category chip | Category updates in prediction |
| 4.1.10 | Add via category tab | Click "Food" chip directly | Opens input for Food category transaction |
| 4.1.11 | Transaction appears in history | After adding | Transaction visible in History view |
| 4.1.12 | Balance updates | After adding debit | Balance decreases by transaction amount |

### Test Group 4.2 — Receipt Scanner (Snap Receipt)
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 4.2.1 | Open scanner | Click "Snap Receipt" button | Camera permission dialog OR file upload dialog appears |
| 4.2.2 | Upload a receipt image | Select any clear receipt photo | Image previews in scanner |
| 4.2.3 | Gemini OCR (if API key set) | Wait for processing | Merchant, amount, date extracted and shown |
| 4.2.4 | Tesseract fallback (no API key) | Remove API key from env, try scan | Tesseract.js runs locally, still extracts amount from receipt |
| 4.2.5 | Error message — unclear image | Upload a solid-color image | Error message says "ensure image is clear" not "Failed to parse with Gemini" |
| 4.2.6 | Confirm scanned receipt | After extraction, click Confirm | Transaction added with extracted data |
| 4.2.7 | XP reward for scanning | After confirming receipt | +15 XP notification or indicator |

### Test Group 4.3 — Voice Command (Magic Mic)
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 4.3.1 | Open mic | Click mic button | Permission dialog appears (first time) OR mic activates directly |
| 4.3.2 | Permission request | Allow microphone | Mic enters listening state — visual indicator shown |
| 4.3.3 | Desktop — no "no speech" immediately | On laptop: click mic, wait 2 seconds silently | Does NOT immediately say "No speech detected" (2.5s guard) |
| 4.3.4 | Voice transaction | Say: `"spent 200 on food"` clearly | Transaction parsed: amount=200, category=Food, type=debit |
| 4.3.5 | Voice income | Say: `"received 1000 from Rahul"` | amount=1000, type=credit, category=Income |
| 4.3.6 | Voice navigation | Say: `"go to budget"` | Navigates to Budget view |
| 4.3.7 | Voice query | Say: `"what did I spend this month"` | Response with monthly spending total |
| 4.3.8 | Voice category accuracy | Say: `"Netflix subscription 649"` | Category=Subscriptions (not "Bills" or wrong category) |
| 4.3.9 | Denied mic on desktop | In browser settings block mic, try voice | Error message: "Mic permission denied. Enable in browser settings" |
| 4.3.10 | Microphone disabled error | Say nothing, let recognition end | If transcript empty, shows helpful "No speech detected" after 2.5s |

---

## STEP 5 — TRANSACTION HISTORY

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 5.1 | History view loads | Navigate to History | All transactions listed in reverse-chronological order |
| 5.2 | Search | Type "Swiggy" in search bar | Only Swiggy transactions shown |
| 5.3 | Category filter | Select "Food" filter chip | Only Food transactions shown |
| 5.4 | Type filter | Select "Income" filter | Only credit transactions shown |
| 5.5 | Date range filter | Set date range to current month | Only this month's transactions shown |
| 5.6 | Clear filters | Click "Clear" or remove filters | All transactions return |
| 5.7 | Edit transaction | Tap a transaction → Edit | Edit modal opens with existing data pre-filled |
| 5.8 | Edit — change amount | Change amount from 350 to 400 → Save | Transaction updates, balance recalculates |
| 5.9 | Delete transaction | Long-press or tap delete icon → Confirm | Transaction removed, balance updates |
| 5.10 | Bulk select | Tap checkbox / bulk select mode | Multiple transactions selectable |
| 5.11 | Bulk delete | Select 2 transactions → Delete | Both removed, confirmation shown |
| 5.12 | Sort by amount | Sort option → By Amount | Highest amount first |
| 5.13 | Virtual scroll | With 50+ transactions | List scrolls smoothly, no blank rows |
| 5.14 | Mobile history | On mobile | Swipe-to-delete gesture works |
| 5.15 | Category emoji | Each transaction row | Correct emoji for category (🍔 Food, 🚗 Transport, etc.) |

---

## STEP 6 — BUDGET MANAGER

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 6.1 | Budget view loads | Navigate to Budget | Budget Manager renders with empty state or existing budgets |
| 6.2 | Add budget | Click "+ Add Budget" → Select "Food" → Enter limit 3000 → Save | Food budget appears with ₹0/₹3000 (0% used) |
| 6.3 | Budget reflects transactions | Add a ₹350 Food transaction | Food budget shows ₹350/₹3000 (12%) |
| 6.4 | Budget bar visual | View budget bars | Colour: green <80%, amber 80-99%, red ≥100% |
| 6.5 | Over-budget alert | Spend more than budget limit | Toast warning: "You've exceeded your Food budget" |
| 6.6 | Budget badge in sidebar | Set one category over budget | Red badge number appears on Budget icon in sidebar/nav |
| 6.7 | Smart suggestions | Click "Smart Suggestions" | AI suggests budget limits based on past spending |
| 6.8 | Edit budget | Tap edit icon on budget row | Edit modal with current limit pre-filled |
| 6.9 | Edit — touch target | On mobile, tap edit/trash icons | Buttons should be easily tappable (≥44px) — no mis-taps |
| 6.10 | Delete budget | Tap trash icon → Confirm | Budget removed from list |
| 6.11 | Reset limits | Find "Reset Limits" option | All budgets reset to 0 (no crash) |
| 6.12 | Rollover toggle | Toggle rollover setting | Budget rolls over unspent amount next month |
| 6.13 | Period selector | Switch Weekly / Biweekly / Monthly | Budget period changes, spending recalculates for period |
| 6.14 | Overall budget bar | Top of budget view | Shows total budgeted vs total spent % |
| 6.15 | Mobile budget | On mobile | Same features accessible, cards fit screen |

---

## STEP 7 — SAVINGS GOALS

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 7.1 | Goals view loads | Navigate to Goals | "No goals yet" empty state OR existing goals |
| 7.2 | Create goal | Click "+ New Goal" → Enter: Name="MacBook", Target=₹80000, Monthly=₹5000, Date=1 year from now, Emoji=💻 | Goal card appears with progress ring at 0% |
| 7.3 | Goal card data | View goal card | Shows target amount, saved amount, monthly contribution, target date, status |
| 7.4 | Goal status | New goal with valid contribution | Status = "On Track" |
| 7.5 | Add contribution | Click "Add Contribution" → Enter ₹5000 | Saved amount increases, progress ring updates |
| 7.6 | Multiple contributions | Add 3 contributions | Total saved = sum of all contributions |
| 7.7 | Goal completion | Add enough to reach target | Status changes to "Achieved", celebration animation |
| 7.8 | At-risk goal | Set monthly contribution too low for target date | Status = "At Risk" |
| 7.9 | Edit goal | Click edit on goal card | Edit modal with existing values pre-filled |
| 7.10 | Delete goal | Delete goal → Confirm | Goal removed |
| 7.11 | Goals in encrypted store | Check DevTools → Application → IndexedDB → spendwise-db | Goals data visible in encrypted form (not plaintext) |
| 7.12 | Goals persist after reload | Add goal → Reload page | Goal still present |
| 7.13 | Snap row — Goals count | Mobile snap row | Shows correct number of active goals |
| 7.14 | Goals in dashboard | Dashboard goals panel | Active goals listed with progress |

---

## STEP 8 — ANALYTICS & STATISTICS

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 8.1 | Analytics view loads | Navigate to Analytics/Statistics | Charts render (not blank, not loading spinner stuck) |
| 8.2 | Balance trend chart | View balance chart | Line goes in correct direction (spending goes down, income goes up) |
| 8.3 | Balance trend direction | Add ₹1000 credit then ₹500 debit | Chart shows +1000 then -500, not reversed |
| 8.4 | Spending donut | View category breakdown | Donut chart shows slices for each category |
| 8.5 | Donut percentages | Hover/tap a slice | Tooltip shows correct percentage (not always 0%) |
| 8.6 | Cash flow waterfall | View income vs expense chart | Bars correctly show income green, expense red |
| 8.7 | Spending heatmap | View heatmap | Calendar grid with spend intensity per day |
| 8.8 | Health score | View financial health | Score 0-100 with breakdown components |
| 8.9 | Anomaly detection | View anomalies panel | Shows unusual transactions OR "no anomalies" message |
| 8.10 | Peer comparison | View peer comparison | Shows category benchmarks |
| 8.11 | Tax predictor | View tax predictor | Shows estimated tax based on income |
| 8.12 | Top merchants | View top merchants list | Sorted by spend amount |
| 8.13 | Month selector | Switch to previous month | All charts update for selected month |
| 8.14 | Mobile analytics | On mobile | Charts fit screen, no horizontal overflow |
| 8.15 | Predictive forecast | View forecast | Shows projected end-of-month spending with confidence |
| 8.16 | Forecast early month | Test on 1st–4th of month | Shows "low confidence" message, not inflated number |

---

## STEP 9 — AI ADVISOR

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 9.1 | Advisor view loads | Navigate to AI Advisor | Chat interface renders |
| 9.2 | With Gemini key — AI response | (API key in .env.local) Ask: "How am I spending this month?" | Gemini returns personalised markdown response |
| 9.3 | Without Gemini key — local fallback | Remove VITE_GEMINI_API_KEY, restart, ask same question | Local rule-based engine responds (not a crash or blank) |
| 9.4 | API key notice | Without key | Yellow notice: "Using local engine — add Gemini key for AI advice" |
| 9.5 | Action buttons in response | Response contains [ACTION:CREATE_BUDGET] | Clickable "Create Budget" button appears in response |
| 9.6 | Ask about savings | Ask: "How can I save more?" | Advice references actual savings rate |
| 9.7 | Ask about top category | Ask: "What's my biggest expense?" | Names the actual top category from transactions |
| 9.8 | No transactions state | Ask with zero transactions | Returns "Add transactions to unlock advice" message, no crash |
| 9.9 | Loading state | Send a question | Loading indicator shown while waiting |
| 9.10 | Error recovery | With broken API key, ask question | Falls back to local engine, shows advice (not blank) |
| 9.11 | Mobile advisor | On mobile | Chat interface fits screen, keyboard doesn't obscure input |

---

## STEP 10 — REPORTS

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 10.1 | Reports view loads | Navigate to Reports | Report generation interface renders |
| 10.2 | Monthly report | Select current month → Generate | Report with income, expenses, savings rate, category breakdown |
| 10.3 | PDF export | Click "Export PDF" or "Download" | PDF file downloads OR in-browser preview shown |
| 10.4 | CSV export | Click "Export CSV" | CSV file downloads with transaction columns |
| 10.5 | Date range report | Set custom date range → Generate | Report covers only selected range |
| 10.6 | Report with no data | Generate for month with no transactions | "No data for this period" message, no crash |

---

## STEP 11 — RECURRING TRANSACTIONS

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 11.1 | Recurring view loads | Navigate to Recurring | Recurring transactions list OR empty state |
| 11.2 | Add recurring | Click "+", enter: "Netflix", ₹649, Monthly, next: 1st of next month | Recurring entry created |
| 11.3 | Recurring details | View recurring card | Shows name, amount, frequency, next due date |
| 11.4 | Auto-apply toggle | Toggle auto-apply ON | Recurring transactions auto-added on due date |
| 11.5 | Edit recurring | Edit amount | Updated amount saved |
| 11.6 | Delete recurring | Delete → Confirm | Removed from list |
| 11.7 | Frequency options | Check dropdown | Daily, Weekly, Monthly, Annual options available |

---

## STEP 12 — SUBSCRIPTIONS

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 12.1 | Subscriptions view loads | Navigate to Subscriptions | Subscription manager renders |
| 12.2 | Auto-detected subs | After adding Netflix/Spotify transactions | These appear in subscriptions automatically |
| 12.3 | Manual add | Click "+ Add Subscription" | Can manually add subscription |
| 12.4 | Monthly total | View subscriptions header | Total monthly subscription cost shown |
| 12.5 | Price creep alert | If a subscription price changed | Alert shown: "Price increased X%" |
| 12.6 | Upcoming renewal | View renewal dates | Next renewal date per subscription |

---

## STEP 13 — PORTFOLIO / NET WORTH

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 13.1 | Portfolio view loads | Navigate to Net Worth/Portfolio | Portfolio dashboard renders |
| 13.2 | Add asset | Click "+ Asset" → Type: "Savings Account", Value: ₹50000 | Asset card appears |
| 13.3 | Add liability | Click "+ Liability" → Type: "Personal Loan", Value: ₹20000 | Liability card appears |
| 13.4 | Net worth calculation | After adding asset + liability | Net Worth = 50000 - 20000 = ₹30000 |
| 13.5 | Net worth chart | View net worth over time | Line chart shows net worth trend |
| 13.6 | Asset allocation donut | View allocation | Donut shows asset category breakdown |
| 13.7 | Edit asset | Edit value | Net worth recalculates |
| 13.8 | Delete entry | Delete → Confirm | Removed, net worth updates |
| 13.9 | Debt planner | View Debt Planner section | Avalanche/snowball payoff schedule |
| 13.10 | Mobile portfolio | On mobile | All sections accessible, no overflow |

---

## STEP 14 — SHARED WALLETS

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 14.1 | Shared view loads | Navigate to Shared | Shared wallets interface renders |
| 14.2 | Create group | Click "+ Create Group" → Name: "Roommates", Purpose: "Rent + Bills" | Group created, appears in list |
| 14.3 | Invite member via email | Click "+ Invite" → Enter email: `friend@gmail.com` | Invite stored locally + mailto: email client opens with pre-filled invite |
| 14.4 | Copy invite link | Click "Copy Invite Link" | Clipboard contains the join link |
| 14.5 | Add wallet entry | In a group, click "+ Add Entry" → ₹5000 Rent | Entry appears in group wallet |
| 14.6 | Add shared expense | Click "+ Add Expense" → ₹1200 Groceries → Split equally | Each member sees their share (₹600 if 2 members) |
| 14.7 | Share QR — group | Click "Share QR" on a group | QR code renders (not blank div) |
| 14.8 | QR code content | Inspect QR | QR encodes valid JSON with group data |
| 14.9 | Activity feed | View group activity | Timestamped log of all actions |
| 14.10 | Shared goal | Create group goal: "Goa Trip ₹30000" | Goal with member contribution tracking |
| 14.11 | Settlement tracking | After shared expenses | "You owe" / "You're owed" summary shown |
| 14.12 | Shared data encrypted | Check DevTools IndexedDB | sharedData in encrypted format |

---

## STEP 15 — BANK SYNC & UPI

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 15.1 | Bank Sync view loads | Navigate to UPI Sync / Bank Sync | Sync interface renders |
| 15.2 | UPI provider selection | Click PhonePe, GPay, Paytm buttons | Provider selected with visual highlight |
| 15.3 | Mock UPI import | Click "Import" / "Sync" for a provider | Mock UPI transactions generated and shown for review |
| 15.4 | Transaction review table | After mock import | Table shows merchant, amount, category, date — all editable |
| 15.5 | Category correction | Change a category in review table | Category updates before confirming |
| 15.6 | Confirm import | Click "Import X Transactions" | Transactions added to history, balance updates |
| 15.7 | Razorpay section | View Razorpay config section | Key input fields present |
| 15.8 | Razorpay key storage | Enter API key → Save | Key stored in encrypted IDB (verify: NOT in localStorage plaintext) |
| 15.9 | CSV import | Click "Import CSV" → Upload sample bank statement | CSV parsed and transactions shown |
| 15.10 | UPI string parsing | Test parsing: `"UPI/CR/PhonePe/SWIGGY/payment@okicici"` | Merchant extracted as "Swiggy", category auto-set to Food |

---

## STEP 16 — GAMIFICATION

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 16.1 | Gamification view loads | Navigate to Quests/Gamification | Gamification dashboard renders |
| 16.2 | XP display | View XP counter | Shows current XP / XP needed for next level |
| 16.3 | XP gain on transaction | Add a new transaction | +10 XP notification or counter increments |
| 16.4 | Level progress bar | View level section | Progress bar from current level to next |
| 16.5 | Level up | Gain enough XP to level up | Level-up modal with confetti animation |
| 16.6 | Daily streak — day 1 | Fresh login (new day) | Streak shows "1 day" |
| 16.7 | Streak no false day-2 | Login same day twice | Streak does NOT jump to day 2 |
| 16.8 | Streak persists next day | Set system clock to tomorrow (if possible) OR check streak logic | Streak increments by 1 |
| 16.9 | Quests panel | View Quests | 3-4 active quests with descriptions, XP rewards, progress |
| 16.10 | Quest progress | Complete quest condition (e.g. add Food transaction <₹200) | Quest progress bar updates |
| 16.11 | Quest completion | Fully complete a quest | "Quest Complete!" overlay + XP reward |
| 16.12 | Badge gallery | View badges | Collection of locked/unlocked badges |
| 16.13 | Round-Up Vault | View Round-Up Vault | Shows vault total, transaction count |
| 16.14 | Round-up on transaction | Add transaction ₹347 | ₹3 round-up added to vault (rounds to ₹350) |
| 16.15 | Wealth City | View Wealth City | City visual that grows with savings |
| 16.16 | Savings challenges | View challenges | 52-week challenge or other challenges listed |
| 16.17 | Social leaderboard | View leaderboard | Peer comparison via P2P (may show offline state if no peers) |

---

## STEP 17 — FINANCIAL EDUCATION

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 17.1 | Education view loads | Navigate to Learn | Lesson categories and cards render |
| 17.2 | Lesson list | View lessons | Multiple lessons with titles, difficulty, duration |
| 17.3 | Open a lesson | Tap a lesson card | Lesson modal opens with full content |
| 17.4 | Lesson interaction | Click through lesson pages | Content advances correctly |
| 17.5 | Complete lesson | Finish a lesson | Completion state shown |
| 17.6 | Student role filter | Profile set to "Student" → view education | Relevant lessons for students shown (not business lessons) |
| 17.7 | Search/filter lessons | Filter by category | Only matching lessons shown |

---

## STEP 18 — PARENTAL CONTROLS

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 18.1 | Parental view loads | Navigate to Family/Parental | Setup flow OR dashboard renders |
| 18.2 | Setup PIN | Click "Set Up Parental Controls" → Enter PIN: 1234 → Confirm 1234 | PIN set, parental dashboard unlocked |
| 18.3 | Wrong PIN on lock | Lock session → Enter wrong PIN | Error: "Wrong PIN", not unlocked |
| 18.4 | Correct PIN unlock | Enter correct PIN | Session unlocked, dashboard visible |
| 18.5 | Monthly limit | Set limit: ₹3000 | Limit saved and applied |
| 18.6 | Category restrictions | Restrict "Entertainment" | Entertainment transactions require approval |
| 18.7 | Pending approval queue | Add Entertainment transaction while restricted | Transaction appears in Pending Approvals |
| 18.8 | Approve transaction | Click Approve on pending transaction | Transaction added to history |
| 18.9 | Reject transaction | Click Reject on pending transaction | Transaction discarded |
| 18.10 | Show Linking QR | Click "Show Linking QR" / "Link Child Device" | QR code renders with parent ID encoded |
| 18.11 | QR content | Inspect QR data | Valid JSON: `{ type: "spendwise_child_link", parentId: "...", timestamp: ... }` |
| 18.12 | QR on slow load | Click QR button immediately on page load | QR renders (retries until qrcode.js loads, shows fallback if >3s) |
| 18.13 | Kid mode toggle | Enable Teen Mode | Analytics hidden, restricted interface shown |
| 18.14 | Chore verification | View Chore section | Chores listed with "Verify Done" button |
| 18.15 | Lock session | Click "Lock Session" | Returns to PIN lock screen |
| 18.16 | Remove PIN | Click "Remove Parental Controls" → Enter current PIN | Controls removed, view resets to setup |

---

## STEP 19 — PROFILE & SETTINGS

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 19.1 | Profile view loads | Navigate to Profile | All profile sections render |
| 19.2 | Edit display name | Change name → Save | Name updated in header greeting |
| 19.3 | Edit occupation | Change occupation → Save | Saved correctly |
| 19.4 | Edit location | Change location → Save | Saved |
| 19.5 | Phone number field | Phone field visible | "Unverified" badge shown next to field |
| 19.6 | Monthly income goal | Change to 10000 → Save | Saved |
| 19.7 | Currency change | Switch from ₹ to $ → Save | All displayed amounts change to $ |
| 19.8 | Avatar | Click avatar / camera icon | Can set emoji or upload photo |
| 19.9 | Dark mode toggle | Toggle dark mode | UI switches to dark theme |
| 19.10 | Light mode toggle | Toggle back to light | UI returns to light theme |
| 19.11 | Theme persists | Toggle dark → reload | Dark mode still active |
| 19.12 | Font size | Change font size setting | Text size changes across app |
| 19.13 | High contrast | Enable high contrast | High contrast CSS active |
| 19.14 | Haptics toggle | Toggle haptics off | Vibration stops on button presses (mobile) |
| 19.15 | Shake to feedback | Toggle shake → shake device | Feedback modal appears |
| 19.16 | Biometric lock | Enable biometric | App prompts for biometric on next load |
| 19.17 | Push notifications | Click "Enable Notifications" | Browser permission dialog appears |
| 19.18 | Export backup | Click "Export / Backup" | `.swb` file downloads |
| 19.19 | Import backup | Click "Import" → upload previous .swb | Data restored |
| 19.20 | Reset all data | Click "Reset Data" → Confirm | All transactions, budgets, goals cleared |
| 19.21 | After reset | Check dashboard | Balance = ₹0, no transactions, goals cleared |
| 19.22 | Custom categories | Add custom category: "Pets 🐾" | Appears in category list when adding transactions |
| 19.23 | Delete custom category | Delete "Pets" | Removed from list |
| 19.24 | Mobile profile | On mobile | All sections scrollable, no overflow |

---

## STEP 20 — PRIVACY MODE

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 20.1 | Privacy toggle visible | Check mobile header | Eye icon visible in top-right header row |
| 20.2 | Enable privacy | Tap eye icon | All balances blur (₹5,000 → ••••••) |
| 20.3 | Privacy on dashboard | Check balance hero, stat cards, transaction amounts | All amounts blurred |
| 20.4 | Privacy on history | Navigate to History with privacy on | Transaction amounts blurred |
| 20.5 | Privacy on analytics | Navigate to Analytics with privacy on | Chart values hidden OR blurred |
| 20.6 | Disable privacy | Tap eye icon again | All amounts visible again |
| 20.7 | Privacy persists | Enable privacy → navigate to different view | Privacy stays on across navigation |
| 20.8 | Privacy toggle sync | Enable privacy → check parentalState.hideBalances in DevTools | Both `privacyEnabled` AND `hideBalances` are `true` simultaneously |

---

## STEP 21 — PWA & OFFLINE

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 21.1 | Service worker registered | DevTools → Application → Service Workers | "finance-manager" SW active and running |
| 21.2 | PWA installable | Check for install prompt in address bar | Install button visible (Chrome on Android) |
| 21.3 | iOS meta tags | View source (Ctrl+U) | `apple-mobile-web-app-capable`, `apple-touch-icon`, `apple-mobile-web-app-status-bar-style` present |
| 21.4 | Manifest valid | DevTools → Application → Manifest | Name, theme_color (#14b8a6), icons all present, no errors |
| 21.5 | Maskable icon | Check manifest icons | At least one icon with `"purpose": "maskable"` |
| 21.6 | Offline — dashboard | DevTools → Network → Offline → Reload | App loads from cache (no "no internet" white screen) |
| 21.7 | Offline — add transaction | Offline mode → Add transaction | Transaction added locally, offline indicator shown |
| 21.8 | Back online | Re-enable network | Offline indicator hides |
| 21.9 | Share target | Share a photo from gallery to SpendWise | App opens with receipt scanner pre-loaded |
| 21.10 | Keyboard shortcut | Press Ctrl+K (desktop) | Command palette opens |

---

## STEP 22 — NOTIFICATIONS

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 22.1 | Notification bell | Check header | Bell icon visible, badge shows unread count |
| 22.2 | Notification center opens | Click bell | Notification panel slides in |
| 22.3 | Budget alert generated | Spend 90% of a budget | Budget alert notification appears in center |
| 22.4 | Mark as read | Click on notification | Marked read, badge count decreases |
| 22.5 | Browser push notification | Enable notifications in Profile → trigger budget alert | OS-level notification appears |
| 22.6 | Snooze notification | Snooze a notification | Disappears, reappears after snooze period |
| 22.7 | Notifications encrypted | Check DevTools → IndexedDB → securedSlice | Read notification IDs in encrypted store (NOT in localStorage) |

---

## STEP 23 — BUG REGRESSION CHECKS

> These are specific bugs that were fixed. Verify the fix holds.

| # | Bug ID | Regression Test | Expected |
|---|--------|----------------|----------|
| 23.1 | BUG-05 | Add ₹1000 income then ₹200 food. View balance chart | Chart shows balance going UP by 1000 then DOWN by 200 |
| 23.2 | BUG-06 | Open Analytics → Spending Donut | Percentages in tooltip are NOT all 0%. Food shows its correct % |
| 23.3 | BUG-08 | Sign out → Sign in same email → Check transactions | Previous transactions still visible |
| 23.4 | BUG-10 | Open app fresh (same day as previous login) | Streak does NOT jump multiple days; shows 1 if first login |
| 23.5 | BUG-11 | On laptop: click mic, wait 2.5s silently | Does NOT say "No speech detected" immediately |
| 23.6 | BUG-M03 | Open app on the 1st–4th of month, view Forecast | Shows "Low confidence — early in month" not an inflated number |
| 23.7 | NEW-BUG-01 | Enable privacy (eye icon) → balance blurs → check DevTools store | Both `store.privacyEnabled` AND `store.parentalState.hideBalances` are `true` |
| 23.8 | NEW-BUG-04 | Type "paid via transfer" in Quick Add | Category NOT set to "Transfer" — maps to another valid category |
| 23.9 | NEW-BUG-05 | On mobile, check for duplicate FAB | Only ONE + FAB visible (from Sidebar, not MainShell) |
| 23.10 | REMAINING-02 | Click "Show Linking QR" immediately on page load | QR code renders within 3 seconds (retry logic active) |
| 23.11 | Android back gesture | On Android: swipe from RIGHT edge | Android back gesture fires (not SpendWise Notifications) |
| 23.12 | Shake battery drain | Open DevTools → Performance → Record 10s idle | No `devicemotion` events firing when shake is disabled in settings |

---

## STEP 24 — EDGE CASES & STRESS TESTS

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 24.1 | Very large transaction | Add transaction of ₹99,99,999 | Stored correctly, formatted with Indian number system |
| 24.2 | Zero amount | Try to add transaction with amount 0 | Validation error: "Amount must be greater than 0" |
| 24.3 | Negative amount | Enter -500 in amount field | Either rejected OR treated as positive |
| 24.4 | Long merchant name | Enter 200-character merchant name | Truncated in display, full name in edit |
| 24.5 | Special characters | Merchant name with emoji: "Café ☕" | Stored and displayed correctly |
| 24.6 | 100+ transactions | Add 100 transactions (use browser console to bulk-add) | History virtualises, no lag, no blank rows |
| 24.7 | Multiple currencies | Change to $ → add transaction → change to ₹ | Historical transactions preserve their original currency context |
| 24.8 | All categories | Add one transaction per category (14 categories) | All 14 appear correctly in history, analytics |
| 24.9 | Future date | Add transaction with date 1 year from now | Accepted, appears in history with correct date |
| 24.10 | Past date | Add transaction 1 year ago | Accepted, sorted correctly in history |
| 24.11 | Data export integrity | Export → import | All transactions, budgets, goals restored exactly |
| 24.12 | Concurrent adds | Rapidly click "Confirm Add" 3 times | Only 1 transaction added (no duplicate) |
| 24.13 | Offline add + online sync | Add transaction offline → go online | Transaction persists (local-first architecture) |

---

## STEP 25 — CROSS-PLATFORM CHECKS

| # | Test | Device/Condition | Expected |
|---|------|-----------------|----------|
| 25.1 | Desktop Chrome (1440px) | Full-width desktop | Icon sidebar, 3-column dashboard layout |
| 25.2 | Desktop Safari | macOS Safari | All features work, no layout breaks |
| 25.3 | Mobile Chrome (375px) | iPhone width simulation | Mobile layouts active, bottom nav visible |
| 25.4 | Mobile — short phone | 667px height (iPhone SE) | FAB above keyboard, modal not cut off |
| 25.5 | Tablet (768px) | iPad simulation | Either mobile OR desktop layout (check which breakpoint triggers) |
| 25.6 | High DPI screen | 2x pixel ratio | Icons crisp, no blurry assets |
| 25.7 | Reduced motion | DevTools → Rendering → Emulate prefers-reduced-motion | Animations disabled or reduced |
| 25.8 | Dark mode OS | OS dark mode enabled | App matches dark theme |
| 25.9 | Light mode OS | OS light mode | App matches light theme |
| 25.10 | Zoom — 150% | Browser zoom 150% | Layout doesn't break, no overflow |

---

## HOW TO GENERATE THE REVIEW REPORT

After testing all sections, compile a report in this exact format:

---

```markdown
# SpendWise QA Review Report
**Date:** [DATE]
**Tester:** [AI / Name]
**Build:** npm run dev — localhost:5173
**Device:** [Primary test device/browser]
**Duration:** [Time taken]

---

## Summary Score

| Category | Tests | Passed | Failed | Partial |
|----------|-------|--------|--------|---------|
| Onboarding | 10 | X | X | X |
| Authentication | 8 | X | X | X |
| Dashboard | 22 | X | X | X |
| Transactions | 15 | X | X | X |
| Budget | 15 | X | X | X |
| Goals | 14 | X | X | X |
| Analytics | 16 | X | X | X |
| AI Advisor | 11 | X | X | X |
| Reports | 6 | X | X | X |
| Recurring | 7 | X | X | X |
| Subscriptions | 6 | X | X | X |
| Portfolio | 10 | X | X | X |
| Shared Wallets | 12 | X | X | X |
| Bank Sync | 10 | X | X | X |
| Gamification | 17 | X | X | X |
| Education | 7 | X | X | X |
| Parental Controls | 16 | X | X | X |
| Profile & Settings | 24 | X | X | X |
| Privacy Mode | 8 | X | X | X |
| PWA & Offline | 10 | X | X | X |
| Notifications | 7 | X | X | X |
| Bug Regressions | 12 | X | X | X |
| Edge Cases | 13 | X | X | X |
| Cross-Platform | 10 | X | X | X |
| **TOTAL** | **296** | **X** | **X** | **X** |

**Overall Pass Rate:** X%

---

## Critical Failures (P0 — Breaks Core Usage)
> List every ❌ test that completely blocks the user

| Test # | Feature | What Happened | Expected | Console Error? |
|--------|---------|---------------|----------|----------------|
| X.X | Feature name | Exact description of what went wrong | What should have happened | Yes/No |

---

## Medium Failures (P1 — Wrong But Workaround Exists)

| Test # | Feature | What Happened | Expected |
|--------|---------|---------------|----------|
| X.X | Feature name | Description | Expected |

---

## Partial / Cosmetic Issues (P2 — Minor)

| Test # | Feature | Issue | Impact |
|--------|---------|-------|--------|
| X.X | Feature name | Description | Low/Medium |

---

## Passed ✅ (All working correctly)
List all test IDs that fully passed: 1.1.1, 1.1.2, 1.1.3 ... etc.

---

## Console Errors Found
> Paste any console.error / console.warn messages found during testing

```
[ERROR] at Component.tsx:45 — TypeError: cannot read properties of undefined
[WARN] [SpendWise Store] Session seed mismatch
```

---

## Performance Observations
- Initial page load: Xms (target: <2000ms)
- Dashboard render with 50 transactions: Xms
- Analytics charts render: Xms
- Voice command response: Xms
- Any jank observed: Yes/No — where?

---

## Security Observations
- [ ] API key visible in browser Sources tab?
- [ ] Sensitive data in plaintext localStorage? (check for spendwise_goals_v1, spendwise_rzp_secret, etc.)
- [ ] Console.log showing user data in production build?

---

## Top 5 Issues to Fix First
1. **[Test X.X]** — Issue description — Fix: specific fix
2. **[Test X.X]** — Issue description — Fix: specific fix
3. **[Test X.X]** — Issue description — Fix: specific fix
4. **[Test X.X]** — Issue description — Fix: specific fix
5. **[Test X.X]** — Issue description — Fix: specific fix

---

## What's Working Great ✅
- List features that impressed you with quality/smoothness
- Note any UX that is particularly well done
```

---

---

## IMPORTANT NOTES FOR THE AI TESTER

1. **Test in order.** Each section builds on the previous (you need transactions to test analytics).

2. **For tests requiring a browser action** (click, type, navigate): describe exactly what you see on screen, not what you expect. If it doesn't match expected — mark it FAIL.

3. **DevTools usage:**
   - Console: Check for red errors after every major action
   - Network: Verify Gemini API calls fire when key is set
   - Application → IndexedDB → `spendwise-db` → `keyval`: all stored data should be encrypted JSON strings, not plaintext

4. **For voice and camera tests:** if running in a VM or headless environment, mark these as "ENVIRONMENT SKIP" and note that they need physical device testing.

5. **Before marking a test FAIL**, try it twice. Some UI delays (animations, lazy loading) may cause timing issues on first attempt.

6. **Mark tests with these exactly:**
   - `✅ PASS` — Works exactly as expected
   - `❌ FAIL` — Wrong behaviour, crash, blank, or missing
   - `⚠️ PARTIAL` — Works but with minor issue (wrong label, slow, cosmetic)
   - `🔵 SKIP` — Cannot test in current environment (needs physical device/camera/mic)
   - `📝 NOTE` — Works but worth flagging for improvement

7. **The report MUST include console errors.** Open DevTools before starting and keep it open throughout. Every red error must be documented with the test that triggered it.
