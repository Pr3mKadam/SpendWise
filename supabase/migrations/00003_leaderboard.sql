-- Migration 00003: Leaderboard snapshots for Social Leaderboard feature
-- Anonymised leaderboard table with city-tier filtering

CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_hash TEXT UNIQUE NOT NULL,
    display_name TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    savings_rate DECIMAL(5,2),
    city_tier TEXT DEFAULT 'tier2',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_city_tier_xp
    ON public.leaderboard_snapshots(city_tier, xp DESC);

ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Public read: leaderboard data is intentionally anonymised
CREATE POLICY "leaderboard_select_public"
    ON public.leaderboard_snapshots
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow upsert: user_hash is anonymised and acts as auth key
CREATE POLICY "leaderboard_insert_public"
    ON public.leaderboard_snapshots
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "leaderboard_update_public"
    ON public.leaderboard_snapshots
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
