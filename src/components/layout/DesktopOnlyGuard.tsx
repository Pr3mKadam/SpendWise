import React from 'react';
import { Monitor } from 'lucide-react';
import { AppView } from '@/types';

interface DesktopOnlyGuardProps {
  viewLabel: string;
  onNavigate: (view: AppView) => void;
  children: React.ReactNode;
}

/**
 * Wraps desktop-only views. On mobile screens it shows a friendly
 * "best on desktop" banner instead of the view. On desktop it renders
 * children as-is.
 */
export function DesktopOnlyGuard({ viewLabel, onNavigate, children }: DesktopOnlyGuardProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!isMobile) return <>{children}</>;

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-8 text-center"
      style={{ minHeight: '60vh' }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
        style={{
          background:
            'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(13,148,136,0.1) 100%)',
          border: '1.5px solid rgba(20,184,166,0.25)',
        }}
      >
        <Monitor size={36} style={{ color: 'var(--teal)' }} />
      </div>

      {/* Heading */}
      <h2
        style={{
          fontFamily: 'var(--font-manrope)',
          fontWeight: 700,
          fontSize: '20px',
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}
      >
        Better on Desktop
      </h2>

      {/* Sub-text */}
      <p
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '14px',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          maxWidth: '280px',
          marginBottom: '28px',
        }}
      >
        <strong style={{ color: 'var(--text-secondary)' }}>{viewLabel}</strong> contains detailed
        charts and tables that need a bigger screen to shine. Open SpendWise on your laptop or PC
        for the full experience.
      </p>

      {/* CTA */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all active:scale-95"
        style={{
          background: 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)',
          color: '#fff',
          fontFamily: 'var(--font-inter)',
          fontSize: '14px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(20,184,166,0.35)',
        }}
      >
        Back to Overview
      </button>
    </div>
  );
}
