import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const langs = LANGUAGES.map(l => l.code);
    const current = i18n.language;
    const idx = langs.indexOf(current);
    const next = langs[(idx + 1) % langs.length] || 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('spendwise_lang', next);
  };

  const currentLabel = LANGUAGES.find(l => i18n.language.startsWith(l.code))?.label || 'English';

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-[var(--surface-input)] text-[var(--text-secondary)] border-none cursor-pointer hover:bg-[var(--surface-hover)] transition-colors"
      title="Switch language / भाषा बदलें / மொழியை மாற்றவும்"
    >
      <Languages size={12} />
      <span>{currentLabel}</span>
    </button>
  );
}
