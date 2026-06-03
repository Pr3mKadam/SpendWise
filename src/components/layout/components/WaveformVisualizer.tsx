interface WaveformVisualizerProps {
  barCount?: number;
}

export function WaveformVisualizer({ barCount = 22 }: WaveformVisualizerProps) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '30px', margin: '8px 0' }}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderRadius: '3px',
            background: 'var(--teal)',
            opacity: 0.75,
            animation: `voiceBar ${0.38 + (i % 5) * 0.11}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.035}s`,
          }}
        />
      ))}
    </div>
  );
}
