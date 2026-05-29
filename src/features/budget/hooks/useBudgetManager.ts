import { useState, useMemo } from 'react';
import { Category, Transaction, Budget, BudgetSuggestion } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { generateBudgetSuggestions } from '@/features/budget/insights/budgetSuggestions';

interface UseBudgetManagerOptions {
  budgets:       Budget[];
  transactions:  Transaction[];
  onUpdateLimit: (category: Category, limit: number) => void;
}

export function useBudgetManager({ budgets, transactions, onUpdateLimit }: UseBudgetManagerOptions) {
  // UI state
  const [showTip,            setShowTip]            = useState(true);
  const [showAddForm,        setShowAddForm]         = useState(false);
  const [addCategory,        setAddCategory]         = useState<Category | ''>('');
  const [addLimit,           setAddLimit]            = useState('');
  const [showSuggestions,    setShowSuggestions]     = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  // Derived data
  const { allCategories } = useCategories();
  const existingCategories    = new Set(budgets.map(b => b.category));
  const availableCategories   = allCategories.filter((c: string) => !existingCategories.has(c as Category));
  const suggestions           = useMemo(() => generateBudgetSuggestions(transactions), [transactions]);
  const unappliedSuggestions  = suggestions.filter((s: BudgetSuggestion) => !existingCategories.has(s.category as Category));

  // Handlers
  function handleApplySuggestion(category: string, limit: number) {
    onUpdateLimit(category as Category, limit);
    setAppliedSuggestions(prev => new Set([...prev, category]));
  }

  function handleApplyAll() {
    unappliedSuggestions.forEach((s: BudgetSuggestion) => onUpdateLimit(s.category as Category, s.suggestedLimit));
    setAppliedSuggestions(new Set(unappliedSuggestions.map((s: BudgetSuggestion) => s.category)));
    setShowSuggestions(false);
  }

  function handleAddBudget() {
    const parsed = parseFloat(addLimit);
    if (addCategory && !isNaN(parsed) && parsed > 0) {
      onUpdateLimit(addCategory as Category, parsed);
      setAddCategory('');
      setAddLimit('');
      setShowAddForm(false);
    }
  }

  const CONFIDENCE_COLOR = { high: '#14b8a6', medium: '#f59e0b', low: '#94a3b8' } as const;
  const CONFIDENCE_LABEL = { high: 'Strong match', medium: 'Good estimate', low: 'Limited data' } as const;

  return {
    // state
    showTip, setShowTip,
    showAddForm, setShowAddForm,
    addCategory, setAddCategory,
    addLimit, setAddLimit,
    showSuggestions, setShowSuggestions,
    appliedSuggestions,
    // derived
    availableCategories,
    suggestions,
    unappliedSuggestions,
    // handlers
    handleApplySuggestion,
    handleApplyAll,
    handleAddBudget,
    // constants
    CONFIDENCE_COLOR,
    CONFIDENCE_LABEL,
  };
}
