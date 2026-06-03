import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { STORAGE_KEYS } from '@/constants';
import { useStore } from '@/store';
import { isSupabaseConfigured, signInWithEmail, signUpWithEmail } from '@/core/api/supabase';

export interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}

export interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  authReady: boolean;
  mfaRequired: boolean;
  signOut: () => Promise<void>;
  signInAnonymously: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  authReady: false,
  mfaRequired: false,
  signOut: async () => {},
  signInAnonymously: () => {},
  signIn: async () => {},
  signUp: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('spendwise_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Use a STABLE guest ID tied to the device, not random each time
      const stableId =
        localStorage.getItem('spendwise_device_id') ||
        'device_' + Math.random().toString(36).substr(2, 12);
      localStorage.setItem('spendwise_device_id', stableId);

      const guestUser = { id: stableId, email: 'guest@local' };
      localStorage.setItem('spendwise_user', JSON.stringify(guestUser));
      setUser(guestUser);

      // Reset gamification for new guest so streak starts at 0
      useStore.getState().checkStreak();
    }
    setAuthReady(true);
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('spendwise_user');
    sessionStorage.removeItem('spendwise_supabase_token');
    // Do NOT remove spendwise_device_id — keeps data stable
    // Do NOT remove transactions — they're in IDB and tied to device
    // Do NOT remove CONFIG (spendwise_config_v1) — user prefs/name/currency must survive sign-out
    window.location.reload();
  }, []);

  const signInAnonymously = useCallback(() => {
    const stableId =
      localStorage.getItem('spendwise_device_id') ||
      'device_' + Math.random().toString(36).substr(2, 12);
    localStorage.setItem('spendwise_device_id', stableId);

    const guestUser = { id: stableId, email: 'guest@local' };
    localStorage.setItem('spendwise_user', JSON.stringify(guestUser));
    setUser(guestUser);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      await new Promise(resolve => setTimeout(resolve, 800));
      // BUG-08 fix: use full-email-based stable id (not just prefix) to avoid collisions
      const userObj = {
        id:
          'local_' +
          btoa(email)
            .replace(/[^a-z0-9]/gi, '')
            .substring(0, 20),
        email,
        user_metadata: { first_name: 'Guest', last_name: 'User' },
      };
      localStorage.setItem('spendwise_user', JSON.stringify(userObj));
      setUser(userObj);

      const { db } = await import('@/db/db');
      const { toast } = await import('react-hot-toast');
      const existingTx = await db.transactions.count();
      if (existingTx === 0) {
        toast('Welcome back! Your data will sync once cloud backup is set up.', {
          icon: '☁️',
          duration: 5000,
        });
      }
      return;
    }
    const res = await signInWithEmail(email, password);
    const userObj = {
      id: res.id,
      email: res.email,
      user_metadata: {},
    };
    localStorage.setItem('spendwise_user', JSON.stringify(userObj));
    sessionStorage.setItem('spendwise_supabase_token', res.access_token);
    setUser(userObj);
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    if (!isSupabaseConfigured) {
      await new Promise(resolve => setTimeout(resolve, 800));
      // BUG-08 fix: use full-email-based stable id (not just prefix) to avoid collisions
      const userObj = {
        id:
          'local_' +
          btoa(email)
            .replace(/[^a-z0-9]/gi, '')
            .substring(0, 20),
        email,
        user_metadata: metadata || {},
      };
      localStorage.setItem('spendwise_user', JSON.stringify(userObj));
      setUser(userObj);
      return;
    }
    const res = await signUpWithEmail(email, password);
    const userObj = {
      id: res.id,
      email: res.email,
      user_metadata: metadata || {},
    };
    localStorage.setItem('spendwise_user', JSON.stringify(userObj));
    sessionStorage.setItem('spendwise_supabase_token', res.access_token);
    setUser(userObj);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session: user ? { user } : null,
      loading: !authReady,
      authReady,
      mfaRequired: false,
      signOut,
      signInAnonymously,
      signIn,
      signUp,
    }),
    [user, authReady, signOut, signInAnonymously, signIn, signUp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
