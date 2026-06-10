import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGUAGES.find(l => i18n.language.startsWith(l.code)) || LANGUAGES[0];

  const switchLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('spendwise_lang', code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-[var(--surface-input)] text-[var(--text-secondary)] border-none cursor-pointer hover:bg-[var(--surface-hover)] transition-colors"
        title="Switch language"
      >
        <Languages size={12} />
        <span>{current.label}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-lg bg-[var(--surface-card)] border border-[var(--border-color)] shadow-lg overflow-hidden">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => switchLang(lang.code)}
              className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors border-none cursor-pointer ${
                lang.code === current.code
                  ? 'bg-[var(--accent)] bg-opacity-10 text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
