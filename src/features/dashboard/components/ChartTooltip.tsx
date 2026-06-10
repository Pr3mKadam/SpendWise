export interface ChartTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
  currency: string;
}

export function ChartTooltip({ active, payload, label, currency }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card !bg-[#1a1d23]/90 !backdrop-blur-xl border-white/10 shadow-2xl p-4 min-w-[140px]">
      <p className="text-[length:var(--fs-overline)] font-bold text-white/40 uppercase tracking-widest mb-3">
        {label}
      </p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-[length:var(--fs-caption)] font-bold text-white/80">
              {p.name}
            </span>
          </div>
          <span className="text-[length:var(--fs-caption)] font-bold text-white tabular-nums">
            {currency}
            {Number(p.value).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
}

export default ChartTooltip;
