import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  authReady: boolean;
  isCloud: boolean;
  mfaRequired: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; needsEmailConfirm?: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isCloud = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!isCloud);
  const [mfaRequired, setMfaRequired] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      setSession(null);
      return;
    }

    let cancelled = false;

    const checkMFA = async (s: Session | null) => {
      if (!s) {
        if (!cancelled) setMfaRequired(false);
        return;
      }
      try {
        const { data, error } = await supabase!.auth.mfa.getAuthenticatorAssuranceLevel();
        if (!error && data && data.nextLevel === 'aal2' && data.currentLevel === 'aal1') {
          if (!cancelled) setMfaRequired(true);
        } else {
          if (!cancelled) setMfaRequired(false);
        }
      } catch (err) {
        console.error('MFA Check error', err);
      }
    };

    supabase.auth.getSession().then(({ data, error }) => {
      if (cancelled) return;
      if (error) console.error('Error getting session:', error.message);
      const s = data?.session ?? null;
      setSession(s);
      setAuthReady(true);
      void checkMFA(s);
    }).catch(err => {
      if (cancelled) return;
      console.error('Unexpected error in getSession:', err);
      setAuthReady(true);
    });

    const { data: authChangeData } = supabase.auth.onAuthStateChange((_event, s) => {
      if (cancelled) return;
      setSession(s);
      void checkMFA(s);
    });

    const subscription = authChangeData?.subscription;

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [isCloud]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) return { error: new Error(error.message) };
    const needsEmailConfirm = !data.session;
    return { error: null, needsEmailConfirm };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      authReady,
      isCloud,
      mfaRequired,
      signIn,
      signUp,
      signOut,
    }),
    [session, authReady, isCloud, mfaRequired, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
