import { memo } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glass?: boolean;
}

export const Card = memo(function Card({
  children,
  className = '',
  style = {},
  glass = false,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`${glass ? 'glass-card' : 'rounded-2xl shadow-sm border'} ${className}`}
      style={{
        background: glass ? undefined : 'var(--surface-card)',
        borderColor: glass ? undefined : 'var(--border)',
        padding: 'var(--card-padding, 16px)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
});

export default Card;
