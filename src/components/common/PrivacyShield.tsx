import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';

interface PrivacyShieldProps {
  onUnlock?: () => void;
  isLocked?: boolean;
}

export default function PrivacyShield({ onUnlock, isLocked: controlledLocked }: PrivacyShieldProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  const lock = useCallback(() => setIsLocked(true), []);
  const unlock = useCallback(() => {
    setIsLocked(false);
    onUnlock?.();
  }, [onUnlock]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lock();
      }
    };

    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    const checkInactivity = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        lock();
      }
    }, 30000); // Check every 30s

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearInterval(checkInactivity);
    };
  }, [lastActivity, lock]);

  const effectiveLocked = controlledLocked !== undefined ? controlledLocked : isLocked;

  return (
    <AnimatePresence>
      {effectiveLocked && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 text-center"
          style={{ background: 'rgba(255, 255, 255, 0.4)' }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="privacy-shield-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="card max-w-sm w-full p-8 flex flex-col items-center gap-6"
            style={{ boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(255,255,255,0.8)' }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[var(--teal-dim)] text-[var(--teal)]">
              <Lock size={40} />
            </div>
            
            <div className="space-y-2">
              <h2 id="privacy-shield-title" className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Privacy Shield Active
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Your financial data is hidden for your privacy. Click below to continue.
              </p>
            </div>

            <button
              onClick={unlock}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-4 px-6 text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ 
                background: 'var(--teal)', 
                color: '#fff', 
                boxShadow: '0 8px 16px -4px rgba(20, 184, 166, 0.3)',
                cursor: 'pointer'
              }}
            >
              <Unlock size={18} />
              Resume Session
            </button>

            <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-dim)]">
              Securely protected by SpendWise
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
