import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import MagicInput from '../ai/MagicInput';
import { Transaction } from '../../../types';

interface QuickAddPanelProps {
  onAdd: (transaction: Transaction) => void;
}

export default function QuickAddPanel({ onAdd }: QuickAddPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="card"
      style={{ padding: '20px 24px' }}
    >
      {/* Panel Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <span
          className="flex items-center justify-center w-8 h-8 rounded-xl"
          style={{ background: 'var(--teal-dim)' }}
        >
          <Zap size={16} style={{ color: 'var(--teal)' }} />
        </span>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontWeight: 700,
              fontSize: '14px',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            Quick Add
          </p>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            Describe, scan or speak your expense
          </p>
        </div>
      </div>

      {/* MagicInput handles all 3 modes internally */}
      <MagicInput onAdd={onAdd} />
    </motion.div>
  );
}
