import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from its previous value to the new target value.
 * Uses requestAnimationFrame for smooth, performant animation.
 *
 * @param target   The destination number to animate to
 * @param duration Animation duration in ms (default: 600)
 * @returns        The current animated display value
 */
export function useCountUp(target: number, duration = 600): number {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;

    // Cancel any in-progress animation
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
    }

    // No animation needed if value unchanged
    if (from === to) return;

    function step(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic: decelerates as it approaches target
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + (to - from) * eased;

      setDisplay(Math.round(value * 100) / 100);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(to);
        prevRef.current = to;
        rafRef.current = null;
        startRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration]);

  return display;
}
