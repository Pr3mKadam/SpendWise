import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { STORAGE_KEYS } from '../constants';

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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  authReady: false,
  mfaRequired: false,
  signOut: async () => {},
  signInAnonymously: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('spendwise_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // For hackathon: Auto-login as a guest if no user exists
      const guestUser = { id: 'guest_' + Math.random().toString(36).substr(2, 9), email: 'guest@example.com' };
      localStorage.setItem('spendwise_user', JSON.stringify(guestUser));
      setUser(guestUser);
    }
    setAuthReady(true);
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('spendwise_user');
    localStorage.removeItem('spendwise_transactions_v2');
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    window.location.reload();
  }, []);

  const signInAnonymously = useCallback(() => {
    const guestUser = { id: 'guest_' + Math.random().toString(36).substr(2, 9), email: 'guest@example.com' };
    localStorage.setItem('spendwise_user', JSON.stringify(guestUser));
    setUser(guestUser);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    session: user ? { user } : null,
    loading: !authReady,
    authReady,
    mfaRequired: false,
    signOut,
    signInAnonymously,
  }), [user, authReady, signOut, signInAnonymously]);

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
