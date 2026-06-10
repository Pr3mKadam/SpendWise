# Database Review Report

## Supabase Schema (PostgreSQL)

### Tables

| Table                   | Columns | Indexes | RLS              | Audit   | Soft Delete              |
| ----------------------- | ------- | ------- | ---------------- | ------- | ------------------------ |
| `transactions`          | 14      | 8       | Yes (4 policies) | Trigger | `deleted_at TIMESTAMPTZ` |
| `gamification`          | 10      | 1       | Yes (3 policies) | Trigger | `deleted_at TIMESTAMPTZ` |
| `shared_wallets`        | 8       | 1       | Yes (4 policies) | Trigger | `deleted_at TIMESTAMPTZ` |
| `wallet_members`        | 6       | 2       | Yes (3 policies) | —       | `deleted_at TIMESTAMPTZ` |
| `shared_wallet_entries` | 10      | 2       | Yes (2 policies) | Trigger | `deleted_at TIMESTAMPTZ` |
| `shared_expenses`       | 11      | 1       | Yes (2 policies) | Trigger | `deleted_at TIMESTAMPTZ` |
| `audit_log`             | 8       | 3       | Service-only     | —       | —                        |

### Foreign Keys

- All user-scoped tables reference `auth.users(id) ON DELETE CASCADE`
- Wallet tables use proper FK chains (`wallet_members.wallet_id → shared_wallets.id`, etc.)
- `audit_log.user_id REFERENCES auth.users(id) ON DELETE SET NULL`

### Indexes

- `transactions`: user_id, date DESC, category, type, merchant, GIN(tags), partial (active only), sync order
- `gamification`: user_id
- `shared_*`: wallet_id + date DESC, member_id, user_id
- `audit_log`: table_name+operation+created_at, user_id+created_at, record_id+table_name

### RLS Policies

- **SELECT**: All tables filter `deleted_at IS NULL` to exclude soft-deleted records
- **INSERT**: User-scoped via `auth.uid()` check
- **UPDATE**: User-scoped with `auth.uid()`, also applies RLS re-check
- **DELETE**: Owner-only for transactions/shared_wallets
- **Shared tables**: Membership check via EXISTS subquery on `wallet_members`

### Audit Triggers

- Every INSERT/UPDATE/DELETE on transaction tables writes to `audit_log`
- `trigger_set_updated_at()` auto-updates `updated_at` on every UPDATE
- User identity extracted from `request.jwt.claims`

### Data Integrity

- `CHECK (amount > 0)` on all monetary columns
- `CHECK (type IN ('credit', 'debit'))`, `CHECK (kind IN (...))`, `CHECK (role IN (...))`
- `CHECK (total_xp >= 0, level >= 1, streak >= 0)` on gamification
- `UNIQUE (wallet_id, user_id)` on wallet_members
- `UNIQUE (user_id)` on gamification
- Cascade deletes: CASCADE when parent deleted, SET NULL on audit

### Soft Delete

- All user-data tables have `deleted_at TIMESTAMPTZ`
- SELECT policies filter `deleted_at IS NULL`
- Partial indexes on active records only
- User deletion trigger soft-deletes all user data
- `purgeDeletedTransactions()` allows hard cleanup after 30-day retention

## Dexie Schema (IndexedDB)

### Tables (v2, updated)

| Table                 | Indexes                                         | New v2 Indexes       |
| --------------------- | ----------------------------------------------- | -------------------- |
| `transactions`        | id, date, category, type, isRecurring           | createdAt, deletedAt |
| `customCategories`    | id, name                                        | createdAt, deletedAt |
| `budgets`             | category                                        | createdAt, deletedAt |
| `goals`               | id, status, targetDate                          | createdAt, deletedAt |
| `sharedWalletEntries` | id, date, memberId                              | createdAt, deletedAt |
| `sharedExpenses`      | id, date, paidByMemberId                        | createdAt, deletedAt |
| `householdSettings`   | name                                            | createdAt, deletedAt |
| `assets`              | id, type                                        | createdAt, deletedAt |
| `liabilities`         | id, type                                        | createdAt, deletedAt |
| `config`              | id                                              | createdAt, deletedAt |
| `keyval`              | key                                             | createdAt, deletedAt |
| `auditLog` (new)      | ++id, tableName, operation, recordId, createdAt | —                    |

### New Utility Functions

- `applyAuditMeta()` — Sets `createdAt`, `updatedAt`
- `markDeleted()` — Sets `deletedAt`, `updatedAt`
- `isActive()` — Checks `!deletedAt`
- `activeFilter()` — Filters array for active records
- `softDeleteRecord()` — Marks a record deleted by ID
- `writeAuditLog()` — Writes to local audit log table

---

## Query Optimization Report

### N+1 Query Analysis

1. **Shared wallet membership checks** — `EXISTS` subquery in RLS policies is efficient (executed once per row, no JOIN)
2. **Sync queries** — `user_id=eq.X&deleted_at=is.null` is covered by the partial index `idx_transactions_active`
3. **Category/monthly breakdown** — `reindex()` runs in-memory (30-100ms for typical dataset); no server impact

### Query Patterns

| Pattern                                    | Table                 | Index                              | Type           |
| ------------------------------------------ | --------------------- | ---------------------------------- | -------------- |
| User's transactions (active, recent first) | transactions          | `idx_transactions_active`          | Partial BTREE  |
| Transactions by category                   | transactions          | `idx_transactions_category`        | BTREE          |
| Transactions by type                       | transactions          | `idx_transactions_type`            | BTREE          |
| Transactions by merchant                   | transactions          | `idx_transactions_merchant`        | BTREE          |
| Transactions with tag filter               | transactions          | `idx_transactions_tags`            | GIN            |
| Sync delta (updated since X)               | transactions          | `idx_transactions_sync`            | BTREE          |
| Gamification lookup                        | gamification          | `idx_gamification_user`            | BTREE (unique) |
| Wallet entries by wallet+date              | shared_wallet_entries | `idx_shared_wallet_entries_wallet` | BTREE          |
| Audit log by table+op                      | audit_log             | `idx_audit_log_table_op`           | BTREE          |
| Audit log by user                          | audit_log             | `idx_audit_log_user`               | BTREE          |

### Identified Slow Queries

None in the current access patterns. All queries:

- Use indexed columns in WHERE clauses
- Have LIMIT constraints (gamification: `limit=1`)
- Are paginated (transactions sync: ordered, date-filtered)
- Use partial indexes for active-only scans

### Recommendations

1. **Add composite index** `(user_id, category, date DESC)` if analytics queries become frequent — currently category+user_id + date are separate indexes
2. **Monitor GIN index** `idx_transactions_tags` for write-heavy workloads — GIN is write-expensive; if tags are rarely queried, consider removing
3. **Set `fillfactor = 90`** on `transactions` for HOT updates (soft deletes are UPDATE not DELETE)

---

## Security Improvements

1. **RLS on every table** — No table is accessible without authentication
2. **Service-only audit log** — `audit_log` accessible only by `service_role`
3. **Soft delete** — Data is never permanently lost on accidental delete (30-day retention window)
4. **Cascading user deletion** — `handle_user_deletion()` trigger soft-deletes all data when user is removed
5. **Input sanitization** — `sanitizeParam()` prevents injection in REST query strings
6. **Zod validation** — Every API boundary validates payload shape
7. **JWT user extraction** — Audit logs use `auth.uid()` via `request.jwt.claims`
8. **Backup scheduler** — 24h auto-backup with 7-day rotation, audited

---

## Migration Scripts

### Supabase (PostgreSQL)

- **File**: `supabase/migrations/00001_initial_schema.sql`
- **Contents**: Full schema with all tables, indexes, RLS, triggers, functions
- **Run**: Execute in Supabase SQL editor or via `supabase db push`

### Dexie (IndexedDB)

- **Automatic**: Dexie version 2 schema migration runs on app startup
- **Data migration**: Existing v1 data is preserved; only indexes are upgraded
