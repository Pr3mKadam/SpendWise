/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useRef, useEffect, ReactNode } from 'react';
import { useTransactions } from '@/hooks/useTransactions';

type TransactionContextType = ReturnType<typeof useTransactions>;

const TransactionContext = createContext<{ current: TransactionContextType } | null>(null);

export function TransactionProvider({
  children,
  initialBalance,
}: {
  children: ReactNode;
  initialBalance?: number;
}) {
  const transactionState = useTransactions(initialBalance);
  const ref = useRef(transactionState);

  useEffect(() => {
    ref.current = transactionState;
  });

  return (
    <TransactionContext.Provider value={ref}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionContext() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactionContext must be used within TransactionProvider');
  return ctx.current;
}
