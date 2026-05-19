import { Sun, Moon, Type, Smartphone } from 'lucide-react';
import type { FontSizeKey } from '@/components/features/profile/useProfileView';

const TOGGLE_CLASS = "w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all";

function ToggleRow({ label, desc, checked, onChange, icon }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-input)]">
      <div className="flex items-center gap-3">
        {icon && <span>{icon}</span>}
        <div>
          <h4 className="font-inter font-bold text-sm text-[var(--text-primary)]">{label}</h4>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={`${TOGGLE_CLASS} peer-checked:bg-[var(--teal)]`} />
      </label>
    </div>
  );
}

interface AccessibilitySectionProps {
  darkMode:         boolean; onDarkMode:         (v: boolean) => void;
  highContrast:     boolean; onHighContrast:     (v: boolean) => void;
  hapticsEnabled:   boolean; onHaptics:          (v: boolean) => void;
  shakeEnabled:     boolean; onShake:            (v: boolean) => void;
  fontSize:    FontSizeKey;  FONT_SIZES:  readonly FontSizeKey[];
  FONT_LABELS: Record<FontSizeKey, string>; onFontSize: (s: FontSizeKey) => void;
}

export function AccessibilitySection({
  darkMode, onDarkMode, highContrast, onHighContrast,
  hapticsEnabled, onHaptics, shakeEnabled, onShake,
  fontSize, FONT_SIZES, FONT_LABELS, onFontSize,
}: AccessibilitySectionProps) {
  return (
    <div className="card border border-[var(--teal)]/20 shadow-sm shadow-[var(--teal)]/5">
      <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">Accessibility</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Customize your viewing experience.</p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {/* Dark Mode */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-input)]">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={18} style={{ color: '#8b5cf6' }} /> : <Sun size={18} style={{ color: '#f59e0b' }} />}
            <div>
              <h4 className="font-inter font-bold text-sm text-[var(--text-primary)]">Dark Mode</h4>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Switch between light and dark themes.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={e => onDarkMode(e.target.checked)} />
            <div className={`${TOGGLE_CLASS} peer-checked:bg-[#8b5cf6]`} />
          </label>
        </div>

        {/* Font Size */}
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-input)]">
          <div className="flex items-center gap-2 mb-3">
            <Type size={16} style={{ color: 'var(--teal)' }} />
            <h4 className="font-inter font-bold text-sm text-[var(--text-primary)]">Font Size</h4>
          </div>
          <div className="flex gap-2 flex-wrap">
            {FONT_SIZES.map(s => (
              <button key={s} onClick={() => onFontSize(s)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{
                  background: fontSize === s ? 'var(--teal)' : 'var(--surface-card)',
                  color:      fontSize === s ? '#fff' : 'var(--text-muted)',
                  border:     fontSize === s ? 'none' : '1px solid var(--border)',
                  cursor: 'pointer', fontFamily: 'var(--font-inter)',
                }}
              >{FONT_LABELS[s]}</button>
            ))}
          </div>
        </div>

        <ToggleRow label="High Contrast Mode" desc="Increase visual contrast across the app." checked={highContrast} onChange={onHighContrast} />
        <ToggleRow label="Touch Feedback" desc="Vibrate device on interaction." checked={hapticsEnabled} onChange={onHaptics} />
        <ToggleRow label="Shake-to-Feedback" desc="Share thoughts by shaking your device." checked={shakeEnabled} onChange={onShake}
          icon={<Smartphone size={18} className="text-amber-500" />} />
      </div>
    </div>
  );
}
