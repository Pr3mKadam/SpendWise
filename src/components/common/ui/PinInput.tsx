import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { playPinTap, playPinError } from '../../../utils/soundscape';

function PinDot({ filled }: { filled: boolean }) {
  return (
    <motion.div
      animate={{ 
        scale: filled ? 1.2 : 1,
        backgroundColor: filled ? 'var(--teal)' : 'rgba(0,0,0,0)',
        borderColor: filled ? 'var(--teal)' : 'var(--text-dim)'
      }}
      className="w-4 h-4 rounded-full border-2 transition-colors duration-200"
    />
  );
}

interface PinInputProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  error?: string;
}

export function PinInput({ value, onChange, label, error }: PinInputProps) {
  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
  const controls = useAnimation();

  useEffect(() => {
    if (error) {
      playPinError();
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      });
    }
  }, [error, controls]);

  const press = (d: string) => {
    playPinTap();
    if (d === '⌫') { onChange(value.slice(0, -1)); return; }
    if (value.length < 4) onChange(value + d);
  };

  return (
    <motion.div animate={controls} className="flex flex-col items-center gap-4">
      {label && <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">{label}</p>}
      <div className="flex gap-6 my-2">
        {[0,1,2,3].map(i => <PinDot key={i} filled={i < value.length} />)}
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 font-bold flex items-center gap-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5" /> {error}
        </motion.p>
      )}
      <div className="grid grid-cols-3 gap-3 mt-2">
        {digits.map((d, i) => (
          d === '' ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onClick={() => press(d)}
              className={`w-16 h-16 rounded-2xl text-xl font-bold transition-all duration-150 select-none flex items-center justify-center
                ${d === '⌫'
                  ? 'bg-transparent text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10'
                  : 'bg-[var(--surface-input)] text-[var(--text-primary)] hover:bg-[var(--teal)] hover:text-white active:scale-90 shadow-sm border border-[var(--border)]'
                }`}
            >
              {d}
            </button>
          )
        ))}
      </div>
    </motion.div>
  );
}
