import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;      // legacy alias for !authReady
  authReady: boolean;
  mfaRequired: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  authReady: false,
  mfaRequired: false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    const checkMFA = async (s: Session | null) => {
      if (!s) { setMfaRequired(false); return; }
      try {
        const { data, error } = await supabase!.auth.mfa.getAuthenticatorAssuranceLevel();
        setMfaRequired(!error && data?.nextLevel === 'aal2' && data?.currentLevel === 'aal1');
      } catch { /* ignore */ }
    };

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setAuthReady(true);
      void checkMFA(s);
    }).catch(() => setAuthReady(true));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      void checkMFA(s);
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    session,
    loading: !authReady,
    authReady,
    mfaRequired,
    signOut,
  }), [user, session, authReady, mfaRequired, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
