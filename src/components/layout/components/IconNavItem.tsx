import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IconNavItemProps {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}

export function IconNavItem({ id, label, icon: Icon, isActive, badge, onClick }: IconNavItemProps) {
  const [showTip, setShowTip] = useState(false);
  const [tipTop, setTipTop] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tipTimer = useRef<any>(null);

  const handleEnter = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTipTop(rect.top + rect.height / 2);
    }
    tipTimer.current = setTimeout(() => setShowTip(true), 120);
  };
  const handleLeave = () => {
    clearTimeout(tipTimer.current);
    setShowTip(false);
  };

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        ref={buttonRef}
        onClick={onClick}
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)]"
        style={{
          background: isActive
            ? 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)'
            : 'transparent',
          color: isActive ? '#ffffff' : 'var(--sidebar-text)',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--sidebar-hover)';
            (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--sidebar-text)';
          }
        }}
      >
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        {!!badge && badge > 0 && (
          <span
            className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold px-0.5"
            style={{ background: 'var(--red, #ef4444)', color: '#fff' }}
          >
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="fixed z-[100] pointer-events-none whitespace-nowrap"
            style={{ left: '68px', top: `${tipTop}px`, transform: 'translateY(-50%)' }}
          >
            <div
              className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold shadow-2xl relative"
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow:
                  '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              <div
                className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45"
                style={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              />
              <span className="relative z-10">{label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sep({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="w-7 h-px mx-auto" style={{ background: 'rgba(255,255,255,0.08)', ...style }} />
  );
}
