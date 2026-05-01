import { ChevronDown, CheckCircle2 } from 'lucide-react';

export function CategorySelect({
  category,
  setCategory,
  allCategories,
  mergedIcons,
  pasteOpen,
  setPasteOpen,
}: {
  category: string;
  setCategory: (val: string) => void;
  allCategories: string[];
  mergedIcons: Record<string, string>;
  pasteOpen: boolean;
  setPasteOpen: (val: boolean) => void;
}) {
  return (
    <div className="mb-3">
      <label
        htmlFor="tx-category"
        style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}
      >
        Category
      </label>
      <div className="relative">
        <button
          type="button"
          id="tx-category"
          onClick={() => {
            // Ensure we close paste if it's open so things don't overlap too much
            if (pasteOpen) setPasteOpen(false);
            document.getElementById('category-dropdown-menu')?.classList.toggle('hidden');
          }}
          onBlur={() => {
            // Use a slight timeout to allow click events on options to fire first
            setTimeout(() => {
              const menu = document.getElementById('category-dropdown-menu');
              if (menu && !menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
              }
            }, 150);
          }}
          className="w-full flex items-center justify-between rounded-xl text-sm text-left focus:outline-none transition-all"
          style={{
            background: '#f8fafc',
            border:     '2px solid transparent',
            padding:    '12px 14px',
            fontFamily: 'var(--font-inter)',
            color:      'var(--text-primary)',
          }}
          onFocus={e => { e.currentTarget.style.border = '2px solid var(--teal)'; }}
        >
          <span>{(mergedIcons[category] ? `${mergedIcons[category]} ` : '') + category}</span>
          <ChevronDown size={16} className="text-[var(--text-muted)]" />
        </button>

        <div
          id="category-dropdown-menu"
          className="hidden absolute top-full left-0 w-full mt-2 py-2 rounded-xl shadow-xl z-50 animate-scale-in"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            maxHeight: '350px',
            overflowY: 'auto'
          }}
        >
          {allCategories.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCategory(c);
                document.getElementById('category-dropdown-menu')?.classList.add('hidden');
              }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--surface-input)] flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-inter)',
                color: category === c ? 'var(--teal)' : 'var(--text-primary)',
                fontWeight: category === c ? 600 : 400,
                background: category === c ? 'var(--teal-dim)' : 'transparent',
              }}
            >
              <span>{(mergedIcons[c] ? `${mergedIcons[c]}` : '')}</span>
              <span>{c}</span>
              {category === c && <CheckCircle2 size={14} className="ml-auto" style={{ color: 'var(--teal)' }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
