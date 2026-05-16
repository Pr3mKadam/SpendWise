import React from 'react';
import { motion } from 'framer-motion';
import { Home, Building2, Landmark, TreePine, Construction, Sparkles } from 'lucide-react';
import { useStore } from '../../../store';
import { haptic } from '../../../lib/haptic';
import { useEffect, useRef } from 'react';

export default function WealthCity() {
  const level = useStore(state => state.level);
  const totalAssets = useStore(state => state.assets.reduce((s, a) => s + a.balance, 0));
  const lastLevel = useRef(level);

  useEffect(() => {
    if (level > lastLevel.current) {
      haptic.success();
      lastLevel.current = level;
    }
  }, [level]);

  // Determine city stage
  const stage = level >= 20 ? 5 : level >= 10 ? 4 : level >= 5 ? 3 : level >= 2 ? 2 : 1;

  const buildings = [
    { id: 1, icon: <Home />, minLvl: 1, name: 'Cottage', pos: 'bottom-2 left-4' },
    { id: 2, icon: <TreePine />, minLvl: 2, name: 'Greenery', pos: 'bottom-6 right-10' },
    { id: 3, icon: <Building2 />, minLvl: 5, name: 'Tower', pos: 'bottom-12 left-12' },
    { id: 4, icon: <Landmark />, minLvl: 10, name: 'Bank', pos: 'bottom-8 right-24' },
    { id: 5, icon: <Sparkles />, minLvl: 20, name: 'Citadel', pos: 'top-6 left-1/2 -translate-x-1/2' },
  ];

  return (
    <div className="card h-[140px] sm:h-[160px] relative overflow-hidden bg-gradient-to-b from-[var(--surface-0)] to-[var(--surface-card)] border border-[var(--border)] shadow-inner">
      {/* Dynamic Sky */}
      <div className={`absolute inset-0 transition-all duration-1000 ${stage >= 4 ? 'bg-indigo-900/10' : stage >= 3 ? 'bg-blue-400/10' : 'bg-transparent'}`} />

      {/* Grid Pattern */}
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* City Title */}
      <div className="absolute top-6 left-6 z-10">
        <h3 className="font-manrope font-black text-base sm:text-xl text-[var(--text-primary)] tracking-tight flex items-center gap-2">
          Your Financial Kingdom
          {stage >= 5 && <Sparkles size={16} className="text-amber-500 animate-pulse" />}
        </h3>
        <p className="font-inter text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
          {stage === 1 ? 'Foundations' : stage === 2 ? 'Growing Town' : stage === 3 ? 'Emerging City' : stage === 4 ? 'Metropolis' : 'Infinite Empire'}
        </p>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-[var(--surface-input)] border-t border-[var(--border)]" />

      {/* Buildings */}
      <div className="absolute inset-0 flex items-end justify-center pb-8">
        {buildings.map((b) => (
          <motion.div
            key={b.id}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ 
              scale: level >= b.minLvl ? 1 : 0.4, 
              opacity: level >= b.minLvl ? 1 : 0.2,
              y: level >= b.minLvl ? 0 : 20
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (level >= b.minLvl) {
                haptic.light();
              }
            }}
            className={`absolute ${b.pos} p-4 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md`}
            style={{ 
              background: level >= b.minLvl ? 'var(--surface-card)' : 'transparent',
              border: level >= b.minLvl ? '1px solid var(--border)' : '1px dashed var(--border)',
              color: level >= b.minLvl ? 'var(--teal)' : 'var(--text-dim)'
            }}
          >
            {level >= b.minLvl ? (
               <div className="flex flex-col items-center">
                  {b.icon}
                  <span className="text-[8px] font-black uppercase tracking-tighter mt-1">{b.name}</span>
               </div>
            ) : (
              <Construction size={16} className="animate-pulse" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Floating Stats */}
      <div className="absolute bottom-6 right-6 flex gap-3">
        <div className="px-3 py-1.5 rounded-lg bg-[var(--surface-card)]/80 backdrop-blur shadow-sm border border-[var(--border)] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-manrope font-bold text-xs text-[var(--text-primary)]">Wealth: {totalAssets > 0 ? 'Flourishing' : 'Stable'}</span>
        </div>
      </div>
    </div>
  );
}
