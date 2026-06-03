export function ProgressRing({
  percent,
  color,
  size = 80,
}: {
  percent: number;
  color: string;
  size?: number;
}) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  const center = size / 2;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <defs>
        <filter id={`glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="#f0f2f5"
        strokeWidth={6}
        className="dark:stroke-gray-800"
      />
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke={`url(#gradient-${color})`}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        filter={`url(#glow-${color})`}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </svg>
  );
}
