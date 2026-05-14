import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';
import { haptic } from '../../lib/haptic';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const controls = useAnimation();

  const PULL_THRESHOLD = 80;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].pageY;
      } else {
        startY.current = -1;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === -1 || isRefreshing) return;

      const currentY = e.touches[0].pageY;
      const diff = currentY - startY.current;

      if (diff > 0) {
        // Linear dampening
        const d = Math.min(diff * 0.5, PULL_THRESHOLD + 20);
        setPullDistance(d);
        
        // Haptic feedback when crossing threshold
        if (d >= PULL_THRESHOLD && pullDistance < PULL_THRESHOLD) {
          haptic.light();
        }

        if (diff > 20) {
          // Prevent scroll
          if (e.cancelable) e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (startY.current === -1 || isRefreshing) return;

      if (pullDistance >= PULL_THRESHOLD) {
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);
        haptic.medium();
        
        await onRefresh();
        
        haptic.success();
        setIsRefreshing(false);
      }
      
      setPullDistance(0);
      startY.current = -1;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

  return (
    <div className="relative overflow-hidden">
      {/* Refresh Indicator */}
      <motion.div
        style={{ 
          y: pullDistance - 40,
          opacity: pullDistance / PULL_THRESHOLD,
          rotate: pullDistance * 2
        }}
        className="absolute top-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
      >
        <div className="w-10 h-10 rounded-full bg-[var(--surface-card)] shadow-xl border border-[var(--border)] flex items-center justify-center text-[var(--teal)]">
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
          >
            <RefreshCcw size={18} />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: isRefreshing ? 40 : 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
