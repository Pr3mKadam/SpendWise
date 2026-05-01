export function ProgressRing({
  percent,
  color,
  size = 80,
}: {
  percent: number;
  color:   string;
  size?:   number;
}) {
  const r          = (size - 10) / 2;
  const circ       = 2 * Math.PI * r;
  const offset     = circ - (Math.min(percent, 100) / 100) * circ;
  const center     = size / 2;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={center} cy={center} r={r} fill="none" stroke="#f0f2f5" strokeWidth={6} />
      <circle
        cx={center} cy={center} r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
      />
    </svg>
  );
}
