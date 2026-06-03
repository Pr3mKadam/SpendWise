interface OnboardingTooltipProps {
  onDismiss: () => void;
}

export function OnboardingTooltip({ onDismiss }: OnboardingTooltipProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '158px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'min(300px, 80vw)',
        background: 'var(--teal)',
        color: '#fff',
        borderRadius: '16px',
        padding: '14px',
        boxShadow: '0 10px 25px rgba(20, 184, 166, 0.4)',
        animation: 'micFadeUp 0.3s ease',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '12px',
          fontWeight: 700,
          marginBottom: '6px',
        }}
      >
        New: Master Voice Engine 🎙
      </p>
      <p
        style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', lineHeight: 1.5, opacity: 0.9 }}
      >
        Hold Space or tap the mic to track expenses, set budgets, or get reports entirely
        hands-free.
      </p>
      <button
        onClick={onDismiss}
        style={{
          marginTop: '10px',
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '8px',
          padding: '4px 12px',
          color: '#fff',
          fontFamily: 'var(--font-inter)',
          fontSize: '10px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Got it!
      </button>
      {/* Arrow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid var(--teal)',
        }}
      />
    </div>
  );
}
