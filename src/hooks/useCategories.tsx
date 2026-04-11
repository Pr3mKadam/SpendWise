import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CustomCategoryDef } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../data/mockData';

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

  const allCategories = useMemo(() => {
    const baseNames = Object.keys(CATEGORY_COLORS);
    const customNames = customCategories.map(c => c.name);
    return [...baseNames, ...customNames];
  }, [customCategories]);

  const mergedColors = useMemo(() => {
    const map = { ...CATEGORY_COLORS } as Record<string, string>;
    customCategories.forEach(c => { map[c.name] = c.color; });
    return map;
  }, [customCategories]);

  const mergedIcons = useMemo(() => {
    const map = { ...CATEGORY_ICONS } as Record<string, string>;
    customCategories.forEach(c => { map[c.name] = c.icon; });
    return map;
  }, [customCategories]);

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
