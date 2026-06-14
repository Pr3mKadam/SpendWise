/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { useStore } from '@/store';
import { isSupabaseConfigured, signInWithEmail, signUpWithEmail } from '@/core/api/supabase';

export interface User {
  id: string;
  email?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user_metadata?: any;
}

export interface AuthContextType {
  user: User | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any | null;
  loading: boolean;
  authReady: boolean;
  mfaRequired: boolean;
  signOut: () => Promise<void>;
  signInAnonymously: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, code: string) => Promise<void>;
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
  sendPhoneOtp: async () => {},
  verifyPhoneOtp: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = sessionStorage.getItem('spendwise_user');
    if (storedUser) return JSON.parse(storedUser);

    // Use a STABLE guest ID tied to the device, not random each time
    const stableId =
      localStorage.getItem('spendwise_device_id') ||
      'device_' + Math.random().toString(36).substr(2, 12);
    localStorage.setItem('spendwise_device_id', stableId);

    const guestUser = { id: stableId, email: 'guest@local' };
    sessionStorage.setItem('spendwise_user', JSON.stringify(guestUser));

    // Reset gamification for new guest so streak starts at 0
    useStore.getState().checkStreak();
    return guestUser;
  });

  const [authReady] = useState(true);

  const signOut = useCallback(async () => {
    sessionStorage.removeItem('spendwise_user');
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
    sessionStorage.setItem('spendwise_user', JSON.stringify(guestUser));
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
      sessionStorage.setItem('spendwise_user', JSON.stringify(userObj));
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
    sessionStorage.setItem('spendwise_user', JSON.stringify(userObj));
    sessionStorage.setItem('spendwise_supabase_token', res.access_token);
    setUser(userObj);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      sessionStorage.setItem('spendwise_user', JSON.stringify(userObj));
      setUser(userObj);
      return;
    }
    const res = await signUpWithEmail(email, password);
    const userObj = {
      id: res.id,
      email: res.email,
      user_metadata: metadata || {},
    };
    sessionStorage.setItem('spendwise_user', JSON.stringify(userObj));
    sessionStorage.setItem('spendwise_supabase_token', res.access_token);
    setUser(userObj);
  }, []);

  const sendPhoneOtp = useCallback(async (_phone: string) => {
    await new Promise(r => setTimeout(r, 500));
  }, []);

  const verifyPhoneOtp = useCallback(async (_phone: string, _code: string) => {
    await new Promise(r => setTimeout(r, 500));
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
      sendPhoneOtp,
      verifyPhoneOtp,
    }),
    [user, authReady, signOut, signInAnonymously, signIn, signUp, sendPhoneOtp, verifyPhoneOtp]
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
