/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useRef, useEffect, ReactNode } from 'react';
import { useBudgets } from '@/hooks/useBudgets';

type BudgetContextType = ReturnType<typeof useBudgets>;

const BudgetContext = createContext<{ current: BudgetContextType } | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const budgetState = useBudgets();
  const ref = useRef(budgetState);

  useEffect(() => {
    ref.current = budgetState;
  });

  return (
    <BudgetContext.Provider value={ref}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgetContext() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudgetContext must be used within BudgetProvider');
  return ctx.current;
}
