interface ResultMessageProps {
  result: { success: boolean; message: string };
}

export function ResultMessage({ result }: ResultMessageProps) {
  return (
    <div
      style={{
        marginTop: '8px',
        padding: '12px 14px',
        borderRadius: '12px',
        background: result.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${result.success ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '13px',
          fontWeight: 600,
          color: result.success ? '#22c55e' : '#ef4444',
          lineHeight: 1.5,
        }}
      >
        {result.message}
      </p>
    </div>
  );
}
