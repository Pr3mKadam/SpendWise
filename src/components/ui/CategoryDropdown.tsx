import { useState, useRef, useEffect } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Category } from '@/types';

interface CategoryDropdownProps {
  value: string;
  onChange: (newCategory: string) => void;
  className?: string;
  placeholder?: string;
}

export function CategoryDropdown({
  value,
  onChange,
  className = '',
  placeholder = 'Category...',
}: CategoryDropdownProps) {
  const { allCategories, mergedIcons } = useCategories();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        // Also check if the click is outside the portal dropdown
        if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
          return;
        }
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setOpen(false);
    }
    if (open) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [open]);

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      let left = rect.left;
      if (left + 192 > window.innerWidth) {
        left = window.innerWidth - 192 - 8;
      }
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: Math.max(8, left),
        width: 192, // w-48 = 12rem = 192px
      });
    }
  }, [open]);

  // Use absolute positioning with dynamic top or bottom relying on space
  return (
    <div ref={ref} className={`relative ${className}`} tabIndex={0}>
      <button
        type="button"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className="flex items-center justify-between w-full h-7 rounded-lg px-2 text-xs cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--teal-dim)]"
        style={{ background: 'var(--surface-input)', border: '1px solid transparent' }}
        onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--text-muted)')}
        onMouseOut={e => (e.currentTarget.style.borderColor = 'transparent')}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--teal)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'transparent')}
      >
        <div className="flex items-center gap-1.5 truncate">
          {value ? (
            <>
              <span className="text-sm shrink-0">{mergedIcons[value] || '📦'}</span>
              <span
                className="truncate font-medium"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-inter)' }}
              >
                {value}
              </span>
            </>
          ) : (
            <span className="truncate text-muted">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform shrink-0 ml-1 ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
        />
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={dropdownRef}
            className="z-[9999] rounded-xl shadow-lg border overflow-hidden"
            style={{
              ...dropdownStyle,
              background: 'var(--surface-card)',
              borderColor: 'var(--surface-input)',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <div
              className="py-1 max-h-56 overflow-y-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--text-muted) transparent' }}
            >
              {allCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(cat);
                    setOpen(false);
                  }}
                  onMouseOver={e => {
                    if (value !== cat) e.currentTarget.style.background = 'var(--surface-hover)';
                  }}
                  onMouseOut={e => {
                    if (value !== cat) e.currentTarget.style.background = 'transparent';
                  }}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[12px] font-medium font-inter transition-colors"
                  style={{
                    background: value === cat ? 'var(--teal-dim)' : 'transparent',
                    color: value === cat ? 'var(--teal)' : 'var(--text-primary)',
                  }}
                >
                  <span className="text-sm shrink-0">{mergedIcons[cat as Category] || '📦'}</span>
                  <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
