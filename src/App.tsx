import { useState, useEffect } from 'react';
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

function NotFoundScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="text-[var(--teal)] mb-6">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      </div>
      <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>Page Not Found</h1>
      <p className="text-[var(--text-muted)] text-center max-w-md mb-8">
        The page you are looking for doesn't exist. SpendWise is a single-page application.
      </p>
      <button 
        onClick={() => { window.location.href = '/'; }}
        className="px-6 py-3 bg-[var(--teal)] text-white font-bold rounded-xl hover:bg-[#0d9488] transition-colors border-none cursor-pointer"
      >
        Return to Dashboard
      </button>
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
  return <MainShell config={config} setConfig={setConfig} userId={userId} />;
}

export default function App() {
  const { user, authReady } = useAuth();
  
  const [path] = useState(window.location.pathname);
  if (path !== '/' && path !== '/index.html') {
    return <NotFoundScreen />;
  }

  if (!authReady) return <LoadingScreen />;
  if (!user) return <AuthView />;

  return <AppAuthenticated />;
}
