import { useState, useRef, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Category } from '../types';

interface CategoryDropdownProps {
  value: string;
  onChange: (newCategory: string) => void;
  className?: string;
  placeholder?: string;
}

export function CategoryDropdown({ value, onChange, className = '', placeholder = 'Category...' }: CategoryDropdownProps) {
  const { allCategories, mergedIcons } = useCategories();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Use absolute positioning with dynamic top or bottom relying on space
  return (
    <div ref={ref} className={`relative ${className}`} tabIndex={0}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className="flex items-center justify-between w-full h-7 bg-[#f5f7fa] dark:bg-[#273043] border border-transparent hover:border-[#cbd5e1] dark:hover:border-[#475569] rounded-lg px-2 text-xs cursor-pointer transition-colors focus:outline-none focus:border-[var(--teal)] focus:ring-1 focus:ring-[var(--teal-dim)]"
      >
        <div className="flex items-center gap-1.5 truncate">
          {value ? (
            <>
              <span className="text-sm shrink-0">{mergedIcons[value] || '📦'}</span>
              <span className="truncate font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}>{value}</span>
            </>
          ) : (
             <span className="truncate text-muted">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform shrink-0 ml-1 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div 
          className="absolute z-50 right-0 top-full mt-1 w-48 bg-white dark:bg-[#1e2536] rounded-xl shadow-lg border border-[#f0f2f5] dark:border-[#334155] py-1.5 max-h-56 overflow-y-auto"
          style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
        >
          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(cat);
                setOpen(false);
              }}
              className={`flex items-center gap-2.5 w-full text-left px-3 py-2 text-[12px] font-medium font-inter transition-colors hover:bg-[#f8fafc] dark:hover:bg-[#232c40] ${
                value === cat 
                  ? 'bg-[#f0fdf4] dark:bg-[rgba(16,185,129,0.1)] text-[var(--teal)]' 
                  : 'text-[var(--text-primary)]'
              }`}
            >
              <span className="text-sm shrink-0">{mergedIcons[cat as Category] || '📦'}</span>
              <span className="truncate">{cat}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
