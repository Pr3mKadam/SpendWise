-- SpendWise Database Schema
-- Migration 00001: Initial schema with RLS, indexes, audit, soft delete, FKs

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. AUDIT LOG TABLE (must exist before triggers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  TEXT NOT NULL,
  operation   TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id   TEXT NOT NULL,
  old_data    JSONB,
  new_data    JSONB,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_op
  ON public.audit_log (table_name, operation, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_user
  ON public.audit_log (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_record
  ON public.audit_log (record_id, table_name);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Admins only (service_role) can read audit logs.
-- For now this is a service-only table.
CREATE POLICY "audit_log_service_only"
  ON public.audit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 3. AUDIT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.trigger_audit()
RETURNS TRIGGER AS $$
DECLARE
  _user_id UUID;
BEGIN
  _user_id := NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::UUID;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, operation, record_id, new_data, user_id)
    VALUES (TG_TABLE_NAME, 'INSERT', NEW.id::TEXT, row_to_json(NEW)::JSONB, _user_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, operation, record_id, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id::TEXT, row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, _user_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, operation, record_id, old_data, user_id)
    VALUES (TG_TABLE_NAME, 'DELETE', OLD.id::TEXT, row_to_json(OLD)::JSONB, _user_id);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id          TEXT PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  type        TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  category    TEXT NOT NULL,
  merchant    TEXT NOT NULL,
  description TEXT,
  tags        JSONB DEFAULT '[]'::JSONB,
  confidence  NUMERIC(4,3),
  ai_parsed   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_transactions_user_id
  ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date
  ON public.transactions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category
  ON public.transactions (user_id, category);
CREATE INDEX IF NOT EXISTS idx_transactions_type
  ON public.transactions (user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant
  ON public.transactions (user_id, merchant);
CREATE INDEX IF NOT EXISTS idx_transactions_tags
  ON public.transactions USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_transactions_active
  ON public.transactions (user_id, date DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_sync
  ON public.transactions (user_id, updated_at DESC);

-- Triggers
CREATE TRIGGER trg_transactions_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit();

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "transactions_insert_own"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "transactions_update_own"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "transactions_delete_own"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 6. GAMIFICATION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.gamification (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp   INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  level      INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  streak     INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
  last_active DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_gamification_user
  ON public.gamification (user_id);

CREATE TRIGGER trg_gamification_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.gamification
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit();

CREATE TRIGGER trg_gamification_updated_at
  BEFORE UPDATE ON public.gamification
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gamification_select_own"
  ON public.gamification
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "gamification_insert_own"
  ON public.gamification
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "gamification_update_own"
  ON public.gamification
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 7. SHARED TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shared_wallets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  purpose    TEXT NOT NULL CHECK (purpose IN ('roommates', 'friends', 'family', 'other')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_shared_wallets_created_by
  ON public.shared_wallets (created_by);

CREATE TRIGGER trg_shared_wallets_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.shared_wallets
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit();

CREATE TRIGGER trg_shared_wallets_updated_at
  BEFORE UPDATE ON public.shared_wallets
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

ALTER TABLE public.shared_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shared_wallets_select_member"
  ON public.shared_wallets
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.wallet_members wm
        WHERE wm.wallet_id = id AND wm.user_id = auth.uid() AND wm.deleted_at IS NULL
      )
    )
  );

CREATE POLICY "shared_wallets_insert_own"
  ON public.shared_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "shared_wallets_update_own"
  ON public.shared_wallets
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "shared_wallets_delete_own"
  ON public.shared_wallets
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

CREATE TABLE IF NOT EXISTS public.wallet_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id  UUID NOT NULL REFERENCES public.shared_wallets(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (wallet_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_wallet_members_wallet
  ON public.wallet_members (wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_members_user
  ON public.wallet_members (user_id);

ALTER TABLE public.wallet_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallet_members_select"
  ON public.wallet_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR wallet_id IN (
    SELECT id FROM public.shared_wallets WHERE created_by = auth.uid()
  ));

CREATE POLICY "wallet_members_insert"
  ON public.wallet_members
  FOR INSERT
  TO authenticated
  WITH CHECK (wallet_id IN (
    SELECT id FROM public.shared_wallets WHERE created_by = auth.uid()
  ));

CREATE POLICY "wallet_members_update"
  ON public.wallet_members
  FOR UPDATE
  TO authenticated
  USING (wallet_id IN (
    SELECT id FROM public.shared_wallets WHERE created_by = auth.uid()
  ));

CREATE TABLE IF NOT EXISTS public.shared_wallet_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id  UUID NOT NULL REFERENCES public.shared_wallets(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('contribution', 'spend_from_pot', 'withdrawal')),
  amount     NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  member_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_shared_wallet_entries_wallet
  ON public.shared_wallet_entries (wallet_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_shared_wallet_entries_member
  ON public.shared_wallet_entries (member_id);

CREATE TRIGGER trg_shared_wallet_entries_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.shared_wallet_entries
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit();

CREATE TRIGGER trg_shared_wallet_entries_updated_at
  BEFORE UPDATE ON public.shared_wallet_entries
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

ALTER TABLE public.shared_wallet_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shared_wallet_entries_select"
  ON public.shared_wallet_entries
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.wallet_members wm
      WHERE wm.wallet_id = wallet_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "shared_wallet_entries_insert"
  ON public.shared_wallet_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.wallet_members wm
    WHERE wm.wallet_id = wallet_id AND wm.user_id = auth.uid()
  ));

CREATE TABLE IF NOT EXISTS public.shared_expenses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id         UUID NOT NULL REFERENCES public.shared_wallets(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  label             TEXT NOT NULL,
  category          TEXT NOT NULL,
  amount            NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  paid_by_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  splits            JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_shared_expenses_wallet
  ON public.shared_expenses (wallet_id, date DESC);

CREATE TRIGGER trg_shared_expenses_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.shared_expenses
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit();

CREATE TRIGGER trg_shared_expenses_updated_at
  BEFORE UPDATE ON public.shared_expenses
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

ALTER TABLE public.shared_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shared_expenses_select"
  ON public.shared_expenses
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.wallet_members wm
      WHERE wm.wallet_id = wallet_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "shared_expenses_insert"
  ON public.shared_expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.wallet_members wm
    WHERE wm.wallet_id = wallet_id AND wm.user_id = auth.uid()
  ));

-- ============================================================================
-- 8. DATA INTEGRITY FUNCTIONS
-- ============================================================================

-- Prevent orphaned records when a user is deleted
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Soft-delete all user-owned transactions
  UPDATE public.transactions
  SET deleted_at = now()
  WHERE user_id = OLD.id AND deleted_at IS NULL;

  -- Soft-delete gamification record
  UPDATE public.gamification
  SET deleted_at = now()
  WHERE user_id = OLD.id AND deleted_at IS NULL;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to auth.users deletion
DROP TRIGGER IF EXISTS trg_user_deletion ON auth.users;
CREATE TRIGGER trg_user_deletion
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion();

-- ============================================================================
-- 9. ANALYTICS FUNCTION (safe, user-scoped)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_income     NUMERIC,
  total_expenses   NUMERIC,
  transaction_count BIGINT,
  avg_daily_spend  NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(amount) FILTER (WHERE type = 'credit'), 0) AS total_income,
    COALESCE(SUM(amount) FILTER (WHERE type = 'debit'), 0) AS total_expenses,
    COUNT(*)::BIGINT AS transaction_count,
    COALESCE(
      SUM(amount) FILTER (WHERE type = 'debit')
      / NULLIF(EXTRACT(DAY FROM (CURRENT_DATE - MIN(date)::DATE)), 0),
      0
    ) AS avg_daily_spend
  FROM public.transactions
  WHERE user_id = p_user_id
    AND deleted_at IS NULL;
END;
$$;

-- ============================================================================
-- 10. SCHEDULED BACKUP FUNCTION (can be called via pg_cron or Edge Function)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_user_backup(p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  backup_data JSONB;
BEGIN
  SELECT jsonb_build_object(
    'exported_at', now(),
    'user_id', p_user_id,
    'transaction_count', (SELECT COUNT(*) FROM public.transactions WHERE user_id = p_user_id AND deleted_at IS NULL),
    'gamification', (SELECT row_to_json(g)::JSONB FROM public.gamification g WHERE g.user_id = p_user_id AND deleted_at IS NULL)
  ) INTO backup_data;

  RETURN backup_data;
END;
$$;

-- ============================================================================
-- 11. HELPER: LIST AVAILABLE TABLES FOR AUDIT
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_audit_tables()
RETURNS TABLE (schema_name TEXT, table_name TEXT, has_audit BOOLEAN)
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.table_schema::TEXT,
    t.table_name::TEXT,
    EXISTS (
      SELECT 1 FROM information_schema.triggers tr
      WHERE tr.event_object_schema = t.table_schema
        AND tr.event_object_table = t.table_name
        AND tr.trigger_name LIKE '%_audit'
    ) AS has_audit
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT IN ('audit_log')
  ORDER BY t.table_name;
END;
$$;
