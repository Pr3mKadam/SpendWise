import { Globe } from 'lucide-react';
import { useCurrency, CurrencyCode } from '@/contexts/CurrencyContext';
import { COMMON_CURRENCIES } from '@/data/currencies';

interface CurrencySelectorProps {
  activeCurrency: string;
  baseCurrency: string;
  onSelect: (code: string) => void;
}

export function CurrencySelector({
  activeCurrency,
  baseCurrency,
  onSelect,
}: CurrencySelectorProps) {
  const { rates } = useCurrency();

  return (
    <div className="max-w-md">
      <label
        className="flex items-center gap-1.5 font-inter text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: 'var(--text-muted)' }}
      >
        <Globe size={13} /> Global Display Currency
      </label>
      <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mb-4 font-inter leading-relaxed italic">
        SpendWise uses real-time simulated rates to convert your base currency ({baseCurrency}) to
        your preferred display currency.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {COMMON_CURRENCIES.map(c => {
          const isSelected = activeCurrency === c.code;
          const rate = (
            rates[c.code as CurrencyCode] / rates[baseCurrency as CurrencyCode]
          ).toFixed(2);
          return (
            <button
              key={c.code}
              onClick={() => onSelect(c.code)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group"
              style={{
                background: isSelected ? 'var(--teal-dim)' : 'var(--surface-input)',
                border: `2px solid ${isSelected ? 'var(--teal)' : 'transparent'}`,
                cursor: 'pointer',
              }}
            >
              <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                {c.flag}
              </span>
              <div className="min-w-0">
                <p
                  className="font-inter font-bold text-sm"
                  style={{ color: isSelected ? 'var(--teal)' : 'var(--text-primary)' }}
                >
                  {c.code}
                </p>
                <p
                  className="font-inter text-[length:var(--fs-overline)] truncate opacity-60"
                  style={{ color: 'var(--text-muted)' }}
                >
                  1 {baseCurrency} ≈ {rate} {c.code}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CurrencySelector;
