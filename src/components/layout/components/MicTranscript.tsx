interface MicTranscriptProps {
  transcript: string;
}

export function MicTranscript({ transcript }: MicTranscriptProps) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '15px',
        fontWeight: 500,
        color: 'var(--text-primary)',
        lineHeight: 1.5,
        marginBottom: '10px',
      }}
    >
      "{transcript}"
    </p>
  );
}
