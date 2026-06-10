import { TaxSlab, calculateTax, calculateCess, calculateSurcharge } from '@/utils/taxConstants';

interface TaxComparisonTableProps {
  oldSlabs: TaxSlab[];
  newSlabs: TaxSlab[];
  oldTaxableIncome: number;
  newTaxableIncome: number;
  currency?: string;
}

export function TaxComparisonTable({
  oldSlabs,
  newSlabs,
  oldTaxableIncome,
  newTaxableIncome,
  currency = '\u20B9',
}: TaxComparisonTableProps) {
  const oldTax = calculateTax(oldSlabs, oldTaxableIncome);
  const newTax = calculateTax(newSlabs, newTaxableIncome);
  const oldCess = calculateCess(oldTax);
  const newCess = calculateCess(newTax);
  const oldSurcharge = calculateSurcharge(oldTaxableIncome, oldTax);
  const newSurcharge = calculateSurcharge(newTaxableIncome, newTax);
  const oldTotal = oldTax + oldCess + oldSurcharge;
  const newTotal = newTax + newCess + newSurcharge;
  const recommended = oldTotal <= newTotal ? 'Old' : 'New';
  const savings = Math.abs(oldTotal - newTotal);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 font-bold text-[var(--text-muted)] uppercase tracking-widest text-[length:var(--fs-overline)]">
                Income Slab
              </th>
              <th className="text-right py-3 px-4 font-bold text-[var(--text-muted)] uppercase tracking-widest text-[length:var(--fs-overline)]">
                Old Regime
              </th>
              <th className="text-right py-3 px-4 font-bold text-[var(--text-muted)] uppercase tracking-widest text-[length:var(--fs-overline)]">
                New Regime
              </th>
            </tr>
          </thead>
          <tbody>
            {oldSlabs.map((slab, i) => {
              return (
                <tr
                  key={i}
                  className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-input)]/30 transition-colors"
                >
                  <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">
                    {slab.label}
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-[var(--text-primary)]">
                    {slab.rate}%
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-[var(--text-primary)]">
                    {i < newSlabs.length ? `${newSlabs[i].rate}%` : '\u2014'}
                  </td>
                </tr>
              );
            })}
            {newSlabs.length > oldSlabs.length &&
              newSlabs.slice(oldSlabs.length).map((slab, i) => (
                <tr
                  key={`extra-${i}`}
                  className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-input)]/30 transition-colors"
                >
                  <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">
                    {slab.label}
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-[var(--text-muted)]">
                    \u2014
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-[var(--text-primary)]">
                    {slab.rate}%
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Old Regime Summary */}
        <div className="rounded-2xl bg-[var(--surface-input)] border border-[var(--border)] p-4 space-y-2">
          <h4 className="font-bold text-[var(--text-primary)] text-sm">Old Regime</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Base Tax</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {currency}
                {oldTax.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Health & Education Cess (4%)</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {currency}
                {oldCess.toLocaleString('en-IN')}
              </span>
            </div>
            {oldSurcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Surcharge</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {currency}
                  {oldSurcharge.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[var(--border)]">
              <span className="font-bold text-[var(--text-primary)]">Total Liability</span>
              <span className="font-bold text-[var(--text-primary)]">
                {currency}
                {oldTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* New Regime Summary */}
        <div className="rounded-2xl bg-[var(--surface-input)] border border-[var(--border)] p-4 space-y-2">
          <h4 className="font-bold text-[var(--text-primary)] text-sm">New Regime</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Base Tax</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {currency}
                {newTax.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Health & Education Cess (4%)</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {currency}
                {newCess.toLocaleString('en-IN')}
              </span>
            </div>
            {newSurcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Surcharge</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {currency}
                  {newSurcharge.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[var(--border)]">
              <span className="font-bold text-[var(--text-primary)]">Total Liability</span>
              <span className="font-bold text-[var(--text-primary)]">
                {currency}
                {newTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <span className="text-lg">\u2714\uFE0F</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-emerald-600 dark:text-emerald-400">
            Recommended: <span className="underline">{recommended} Regime</span>
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            You can save{' '}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {currency}
              {savings.toLocaleString('en-IN')}
            </span>{' '}
            by choosing the {recommended} Regime.
          </p>
        </div>
      </div>
    </div>
  );
}
