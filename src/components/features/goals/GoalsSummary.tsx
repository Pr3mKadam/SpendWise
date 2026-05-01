export function GoalsSummary({
  stats,
  currency,
}: {
  stats: {
    activeCount: number; achievedCount: number;
    totalTarget: number; totalSaved: number;
    overallPercent: number; monthlyCommitted: number;
  };
  currency: string;
}) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: 'Active Goals',      value: String(stats.activeCount),                                  color: 'var(--teal)'   },
        { label: 'Achieved',          value: String(stats.achievedCount),                                 color: 'var(--purple)' },
        { label: 'Total Target',      value: `${currency}${stats.totalTarget.toLocaleString()}`,          color: 'var(--blue)'   },
        { label: 'Monthly Committed', value: `${currency}${stats.monthlyCommitted.toLocaleString()}/mo`,  color: 'var(--amber)'  },
      ].map(s => (
        <div key={s.label} className="card px-4 py-3">
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '4px' }}>{s.label}</p>
          <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '18px', fontWeight: 800, color: s.color }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
