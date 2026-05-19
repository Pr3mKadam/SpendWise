/** Shared chart tooltip for bar/line charts */
export function ChartTooltip({ active, payload, label, currency = '$' }: {
  active?: boolean; payload?: any[]; label?: string; currency?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-4 py-3 shadow-lg">
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-8 mb-1">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {currency}{Number(p.value).toLocaleString('en-US')}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Savings-specific tooltip */
export function SavingsTooltip({ active, payload, label, currency = '$' }: {
  active?: boolean; payload?: any[]; label?: string; currency?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="card px-4 py-3 shadow-lg">
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '18px', fontWeight: 800, color: val >= 0 ? 'var(--teal)' : 'var(--red)' }}>
        {val >= 0 ? '+' : ''}{currency}{Number(val).toLocaleString('en-US')}
      </p>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)' }}>Net savings</p>
    </div>
  );
}

/** Mini KPI card */
export function StatCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub: string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="card px-4 sm:px-5 py-4 transition-shadow hover:shadow-md flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="truncate pr-2" style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }} className="tabular-nums truncate">{value}</p>
        <p className="truncate" style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</p>
      </div>
    </div>
  );
}
