import { useState, useMemo, useEffect } from 'react';
import { SpendWiseConfig } from './components/features/onboarding/OnboardingModal';
import { useAuth } from './hooks/useAuth';
import AuthView from './components/views/AuthView';
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
  const userId = user ? user.id : "guest";

  const [config, setConfigState] = useState<SpendWiseConfig | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('spendwise_config_v1');
    if (saved) {
      setConfigState(JSON.parse(saved));
    } else {
      setConfigState({
        initialBalance: 5200,
        balanceAnchorNet: 0,
        currency: '₹',
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
      });
    }
  }, []);

  const setConfig = (newConfig: SpendWiseConfig) => {
    localStorage.setItem('spendwise_config_v1', JSON.stringify(newConfig));
    setConfigState(newConfig);
  };

  if (config === null) return <LoadingScreen />;
  return <MainShell config={config} setConfig={setConfig as any} userId={userId} />;
}

export default function App() {
  const { user, authReady } = useAuth();

  if (!authReady) return <LoadingScreen />;
  if (!user) return <AuthView />;

  return <AppAuthenticated />;
}
