import React from 'react';
import { AlertTriangle } from 'lucide-react';

function PinDot({ filled }: { filled: boolean }) {
  return (
    <div
      className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
        filled
          ? 'bg-[var(--teal)] border-[var(--teal)] scale-110'
          : 'border-[var(--text-dim)]'
      }`}
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

  const press = (d: string) => {
    if (d === '⌫') { onChange(value.slice(0, -1)); return; }
    if (value.length < 4) onChange(value + d);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {label && <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>}
      <div className="flex gap-4 my-1">
        {[0,1,2,3].map(i => <PinDot key={i} filled={i < value.length} />)}
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 -mt-1">
          <AlertTriangle className="w-3 h-3" /> {error}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2 mt-1">
        {digits.map((d, i) => (
          d === '' ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onClick={() => press(d)}
              className={`w-14 h-14 rounded-2xl text-lg font-semibold transition-all duration-150 select-none
                ${d === '⌫'
                  ? 'bg-transparent text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10'
                  : 'bg-[var(--surface-input)] text-[var(--text-primary)] hover:bg-[var(--teal-dim)] hover:text-[var(--teal)] active:scale-95 shadow-sm'
                }`}
            >
              {d}
            </button>
          )
        ))}
      </div>
    </div>
  );
}
