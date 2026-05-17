import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { SpendWiseConfig } from './components/features/onboarding/OnboardingModal';
import { useAuth } from './hooks/useAuth';
import AuthView from './components/views/AuthView';
import { MainShell } from './components/layout/MainShell';
import { AppView } from './types';
import { STORAGE_KEYS, FINANCE_DEFAULTS } from './constants';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-[var(--teal)] animate-pulse font-medium text-lg">Loading SpendWise...</div>
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

function parseConfig(raw: string | null): SpendWiseConfig {
  const defaultConfig: SpendWiseConfig = {
    initialBalance: FINANCE_DEFAULTS.INITIAL_BALANCE,
    balanceAnchorNet: 0,
    currency: '₹',
    onboardingComplete: false,
    createdAt: new Date().toISOString(),
    userRole: 'professional',
  };

  if (!raw) return defaultConfig;

  try {
    const parsed = JSON.parse(raw);
    return {
      initialBalance: typeof parsed.initialBalance === 'number' ? parsed.initialBalance : defaultConfig.initialBalance,
      balanceAnchorNet: typeof parsed.balanceAnchorNet === 'number' ? parsed.balanceAnchorNet : defaultConfig.balanceAnchorNet,
      currency: typeof parsed.currency === 'string' ? parsed.currency : defaultConfig.currency,
      onboardingComplete: typeof parsed.onboardingComplete === 'boolean' ? parsed.onboardingComplete : defaultConfig.onboardingComplete,
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : defaultConfig.createdAt,
      userRole: (['student', 'professional', 'business'].includes(parsed.userRole)) ? parsed.userRole : defaultConfig.userRole,
    };
  } catch (e) {
    console.error("Failed to parse config from storage", e);
    return defaultConfig;
  }
}

export default function App() {
  const { user, authReady } = useAuth();
  
  const [path] = useState(window.location.pathname);
  const validViews: AppView[] = [
    'dashboard', 'transactions', 'budget', 'analytics', 'history', 
    'settings', 'goals', 'quests', 'inventory', 'shop', 'badges', 
    'shared', 'sync', 'profile', 'parental', 'portfolio', 
    'subscriptions', 'advisor', 'education', 'reports'
  ];
  const currentPath = path.replace('/', '') as AppView;
  const initialView: AppView = validViews.includes(currentPath) ? currentPath : 'dashboard';
  
  if (path !== '/' && path !== '/index.html' && !validViews.includes(currentPath)) {
    return <NotFoundScreen />;
  }

  if (!authReady) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-container">
      {user ? (
        <AppAuthenticated initialView={initialView} />
      ) : (
        <AuthView />
      )}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--surface-card)',
            color: 'var(--text-primary)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            fontSize: '14px',
            fontWeight: 500,
          }
        }}
      />
    </div>
  );
}

function AppAuthenticated({ initialView }: { initialView: AppView }) {
  const { user } = useAuth();
  const userId = user ? user.id : "guest";

  const [config, setConfigState] = useState<SpendWiseConfig | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    setConfigState(parseConfig(saved));
  }, []);

  const setConfig = (newConfig: SpendWiseConfig) => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig));
    setConfigState(newConfig);
    window.dispatchEvent(new Event('spendwise-config-updated'));
  };

  if (config === null) return <LoadingScreen />;
  return <MainShell config={config} setConfig={setConfig} userId={userId} initialView={initialView} />;
}
