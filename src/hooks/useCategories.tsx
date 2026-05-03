import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CustomCategoryDef } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../data/mockData';
import { useStore } from '../store';

const STORAGE_KEY = 'spendwise_custom_categories_v1';

interface CategoryContextType {
  customCategories: CustomCategoryDef[];
  allCategories: string[];
  mergedColors: Record<string, string>;
  mergedIcons: Record<string, string>;
  addCustomCategory: (def: Omit<CustomCategoryDef, 'id'>) => void;
  updateCustomCategory: (id: string, def: Partial<CustomCategoryDef>) => void;
  deleteCustomCategory: (id: string) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [customCategories, setCustomCategories] = useState<CustomCategoryDef[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories));
  }, [customCategories]);

  const addCustomCategory = useCallback((def: Omit<CustomCategoryDef, 'id'>) => {
    const newCat = { ...def, id: `cat-${Date.now()}` };
    setCustomCategories(prev => [...prev, newCat]);
  }, []);

  const updateCustomCategory = useCallback((id: string, def: Partial<CustomCategoryDef>) => {
    setCustomCategories(prev => prev.map(c => c.id === id ? { ...c, ...def } : c));
  }, []);

  const deleteCustomCategory = useCallback((id: string) => {
    setCustomCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const transactions = useStore(state => state.transactions);

  const dynamicCategories = useMemo(() => {
    const dynamicNames = new Set<string>();
    transactions.forEach(t => {
      if (!CATEGORY_COLORS[t.category] && !customCategories.find(c => c.name === t.category)) {
        dynamicNames.add(t.category);
      }
    });
    return Array.from(dynamicNames);
  }, [transactions, customCategories]);

  const allCategories = useMemo(() => {
    const baseNames = Object.keys(CATEGORY_COLORS);
    const customNames = customCategories.map(c => c.name);
    return [...baseNames, ...customNames, ...dynamicCategories];
  }, [customCategories, dynamicCategories]);

  const mergedColors = useMemo(() => {
    const map = { ...CATEGORY_COLORS } as Record<string, string>;
    customCategories.forEach(c => { map[c.name] = c.color; });
    
    const hashStr = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
      return hash;
    };
    const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];
    
    dynamicCategories.forEach(c => {
      map[c] = COLORS[Math.abs(hashStr(c)) % COLORS.length];
    });
    return map;
  }, [customCategories, dynamicCategories]);

  const mergedIcons = useMemo(() => {
    const map = { ...CATEGORY_ICONS } as Record<string, string>;
    customCategories.forEach(c => { map[c.name] = c.icon; });
    dynamicCategories.forEach(c => { map[c] = '🏷️'; });
    return map;
  }, [customCategories, dynamicCategories]);

  return (
    <CategoryContext.Provider value={{
      customCategories, allCategories, mergedColors, mergedIcons,
      addCustomCategory, updateCustomCategory, deleteCustomCategory
    }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) throw new Error('useCategories must be used within a CategoryProvider');
  return context;
}
