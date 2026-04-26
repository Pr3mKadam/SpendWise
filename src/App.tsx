import { useState, useEffect } from 'react';
import { loadConfig, SpendWiseConfig } from './components/OnboardingModal';
import { supabase } from './services/supabaseClient';
import { fetchProfile, profileRowToConfig } from './lib/supabaseData';
import { useAuth } from './hooks/useAuth';
import AuthView from './components/AuthView';
import { MainShell } from './components/layout/MainShell';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-[var(--accent)] animate-pulse font-medium text-lg">Loading SpendWise...</div>
    </div>
  );
}

function AppAuthenticated() {
  const { user } = useAuth();
  const userId = user ? user.id : null;

  const [config, setConfig] = useState<SpendWiseConfig | null>(() => (userId ? null : loadConfig()));
  const [profileLoading, setProfileLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setConfig(loadConfig());
      setProfileLoading(false);
      return;
    }

    let cancelled = false;
    setProfileLoading(true);
    fetchProfile(userId)
      .then(row => {
        if (cancelled) return;
        const local: Partial<SpendWiseConfig> = loadConfig() || {};
        if (!local.name && user?.user_metadata?.first_name) local.name = user.user_metadata.first_name;
        if (!local.phone && user?.user_metadata?.phone)     local.phone = user.user_metadata.phone;

        const mergedConfig = row
          ? { ...local, ...profileRowToConfig(row) } as SpendWiseConfig
          : { initialBalance: 5200, balanceAnchorNet: 0, currency: '₹', onboardingComplete: false, createdAt: new Date().toISOString(), ...local } as SpendWiseConfig;

        setConfig(mergedConfig);
      })
      .catch(() => {
        if (cancelled) return;
        const local: Partial<SpendWiseConfig> = loadConfig() || {};
        if (!local.name && user?.user_metadata?.first_name) local.name = user.user_metadata.first_name;
        if (!local.phone && user?.user_metadata?.phone)     local.phone = user.user_metadata.phone;
        setConfig({ initialBalance: 5200, balanceAnchorNet: 0, currency: '₹', onboardingComplete: false, createdAt: new Date().toISOString(), ...local } as SpendWiseConfig);
      })
      .finally(() => { if (!cancelled) setProfileLoading(false); });

    return () => { cancelled = true; };
  }, [userId, user]);

  if (profileLoading) return <LoadingScreen />;
  return <MainShell config={config} setConfig={setConfig} userId={userId} />;
}

/** Runs without any backend — uses localStorage only */
function AppLocalMode() {
  const [config, setConfig] = useState<SpendWiseConfig | null>(() => {
    const saved = loadConfig();
    if (saved) return saved;
    return {
      initialBalance: 5200,
      balanceAnchorNet: 0,
      currency: '₹',
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
    } as SpendWiseConfig;
  });
  return <MainShell config={config} setConfig={setConfig} userId={null} />;
}

export default function App() {
  const { session, authReady, mfaRequired } = useAuth();
  const [supabaseReachable, setSupabaseReachable] = useState<boolean | null>(null);

  // Probe Supabase reachability on startup (4s timeout)
  useEffect(() => {
    if (!supabase) { setSupabaseReachable(false); return; }
    const controller = new AbortController();
    const timer = setTimeout(() => { controller.abort(); setSupabaseReachable(false); }, 4000);
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/health`, { signal: controller.signal })
      .then(r => setSupabaseReachable(r.ok || r.status < 500))
      .catch(() => setSupabaseReachable(false))
      .finally(() => clearTimeout(timer));
    return () => { controller.abort(); clearTimeout(timer); };
  }, []);

  // Still probing or auth resolving
  if (supabaseReachable === null || !authReady) return <LoadingScreen />;

  // Supabase unreachable → bypass auth, run locally
  if (!supabaseReachable) return <AppLocalMode />;

  // Supabase is live → require auth
  if (!session || mfaRequired) return <AuthView mfaRequired={mfaRequired} />;
  return <AppAuthenticated />;
}
