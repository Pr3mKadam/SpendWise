import { useState } from 'react';
import { useProfileSwitcher } from '@/hooks/useProfileSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check } from 'lucide-react';

const PROFILE_ICONS: Record<string, string> = {
  personal: '👤',
  business: '💼',
};

export function ProfileSwitcher() {
  const { currentProfile, profiles, switchProfile } = useProfileSwitcher();
  const [open, setOpen] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'personal' | 'business'>('personal');

  const handleSwitch = (id: string) => {
    setOpen(false);
    if (id !== currentProfile) {
      switchProfile(id);
    }
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    localStorage.setItem(`spendwise_profile_name_${newType}_${Date.now()}`, newName.trim());
    switchProfile(newType);
  };

  const currentLabel = profiles.find(p => p.id === currentProfile)?.label || 'Personal';

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl w-full transition-all"
          style={{
            background: open ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: 'var(--sidebar-text)',
          }}
        >
          <span className="text-lg">{PROFILE_ICONS[currentProfile] || '👤'}</span>
          <span className="text-sm font-semibold truncate">{currentLabel}</span>
        </button>

        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 right-0 mt-1 z-50 rounded-xl overflow-hidden shadow-xl"
                style={{
                  background: 'var(--surface-card)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSwitch(p.id)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')
                    }
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="text-base">{p.icon}</span>
                    <span className="text-sm font-medium flex-1">{p.label}</span>
                    {p.id === currentProfile && (
                      <Check size={14} style={{ color: 'var(--teal)' }} />
                    )}
                  </button>
                ))}
                <div
                  style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '2px 0' }}
                />
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowNew(true);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors"
                  style={{ color: 'var(--teal)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Plus size={16} />
                  <span className="text-sm font-medium">New Profile</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showNew && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowNew(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm rounded-2xl p-6 shadow-2xl"
              style={{ background: 'var(--surface-card)' }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                New Profile
              </h3>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Profile name"
                className="w-full px-4 py-2.5 rounded-xl mb-3 outline-none text-sm"
                style={{
                  background: 'var(--surface-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
              <div className="flex gap-2 mb-4">
                {(['personal', 'business'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all"
                    style={{
                      background: newType === t ? 'var(--teal)' : 'rgba(255,255,255,0.05)',
                      color: newType === t ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {t === 'personal' ? '👤 Personal' : '💼 Business'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNew(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)',
                  }}
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
