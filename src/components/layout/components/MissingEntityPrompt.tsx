interface MissingEntityPromptProps {
  prompt: string;
}

export function MissingEntityPrompt({ prompt }: MissingEntityPromptProps) {
  return (
    <div style={{
      padding: '12px 14px', borderRadius: '12px',
      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
      marginTop: '6px',
    }}>
      <p style={{
        fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600,
        color: '#818cf8', lineHeight: 1.5,
      }}>
        🎙 {prompt}
      </p>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
        Tap the mic and say the missing information.
      </p>
    </div>
  );
}
