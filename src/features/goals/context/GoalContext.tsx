/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useRef, useEffect, ReactNode } from 'react';
import { useGoals } from '@/hooks/useGoals';

type GoalContextType = ReturnType<typeof useGoals>;

const GoalContext = createContext<{ current: GoalContextType } | null>(null);

export function GoalProvider({ children }: { children: ReactNode }) {
  const goalsState = useGoals();
  const ref = useRef(goalsState);

  useEffect(() => {
    ref.current = goalsState;
  });

  return (
    <GoalContext.Provider value={ref}>
      {children}
    </GoalContext.Provider>
  );
}

export function useGoalContext() {
  const ctx = useContext(GoalContext);
  if (!ctx) throw new Error('useGoalContext must be used within GoalProvider');
  return ctx.current;
}
