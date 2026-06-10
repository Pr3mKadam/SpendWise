/**
 * SpendWise — Shared Framer Motion tokens
 * Import these presets in any animated component to ensure consistent timing.
 */

import type { Transition, Variants } from 'framer-motion';

// ─── Spring presets ────────────────────────────────────────────────────────────
export const spring = {
  /** Crisp, snappy response — best for navigation & view transitions */
  snappy: {
    type: 'spring',
    stiffness: 420,
    damping: 38,
  } satisfies Transition,

  /** Gentle, bouncy — best for cards, FABs, badge pops */
  bouncy: {
    type: 'spring',
    stiffness: 280,
    damping: 22,
  } satisfies Transition,

  /** Smooth, heavy response — best for bottom sheets & modals */
  smooth: {
    type: 'spring',
    stiffness: 180,
    damping: 28,
    mass: 0.8,
  } satisfies Transition,
} as const;

// ─── Tween presets ────────────────────────────────────────────────────────────
export const tween = {
  /** Subtle micro-animation for stat counter reveals */
  subtle: {
    type: 'tween',
    duration: 0.18,
    ease: 'easeOut',
  } satisfies Transition,

  /** Reveal-style — best for card mount, fade-ups */
  reveal: {
    type: 'tween',
    duration: 0.28,
    ease: [0.16, 1, 0.3, 1],
  } satisfies Transition,

  /** Slow, emphasis — best for hero numbers */
  emphasis: {
    type: 'tween',
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1],
  } satisfies Transition,
} as const;

// ─── Shared variant factories ─────────────────────────────────────────────────

/** Fade up from bottom — use for list items with a `delay` override */
export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: tween.reveal },
};

/** Scale in from 95% — use for modals and cards */
export const scaleInVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: spring.smooth },
  exit: { opacity: 0, scale: 0.95, transition: tween.subtle },
};

/** Slide in from right — use for view transitions */
export const slideRightVariant: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: spring.snappy },
  exit: { opacity: 0, x: -20, transition: tween.subtle },
};

/** Staggered children container */
export const staggerContainer = (staggerChildren = 0.05): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren, delayChildren: 0.08 },
  },
});
