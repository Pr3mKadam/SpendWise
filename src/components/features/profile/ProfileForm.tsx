import { useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ProfileFormField {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}

interface ProfileFormProps {
  fields: ProfileFormField[];
  currency: string;
  onSave: () => void;
  showSavedMsg: boolean;
}

function FormField({ label, value, onChange, placeholder, type = 'text' }: ProfileFormField) {
  const isPhone = label === 'Mobile Number';

  return (
    <div>
      <label className="block font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full font-inter text-sm px-4 py-3 rounded-xl focus:outline-none transition-colors"
          style={{ background: 'var(--surface-input)', color: 'var(--text-primary)', border: '2px solid transparent' }}
          onFocus={e => (e.target.style.borderColor = 'var(--teal)')}
          onBlur={e => (e.target.style.borderColor = 'transparent')}
        />
        {isPhone && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            Unverified
          </span>
        )}
      </div>
      {isPhone && (
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Phone verification coming soon. Number stored locally only.
        </p>
      )}
    </div>
  );
}

export function ProfileForm({ fields, currency, onSave, showSavedMsg }: ProfileFormProps) {
  return (
    <div className="card">
      <div className="px-6 py-5" style={{ borderBottom: '1.5px solid var(--border)' }}>
        <h3 className="font-manrope font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
          Personal Information
        </h3>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-2xl">
          {fields.map(f => (
            <FormField key={f.label} {...f} />
          ))}
        </div>
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={onSave}
            className="px-6 py-3 rounded-xl font-inter font-bold text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'var(--teal)', boxShadow: '0 4px 12px rgba(20,184,166,0.3)', border: 'none', cursor: 'pointer' }}
          >
            Save Changes
          </button>
          {showSavedMsg && (
            <span className="flex items-center gap-1.5 font-inter text-sm font-semibold animate-fade-in" style={{ color: 'var(--teal)' }}>
              <CheckCircle2 size={16} /> Changes saved!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileForm;
