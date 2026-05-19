import { motion } from 'framer-motion';

interface PremiumCardProps {
  currentBalance: number;
  currency: string;
}

export default function PremiumCard({ currentBalance, currency }: PremiumCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, rotateY: 5, rotateX: -5 }}
      className="w-[85vw] sm:w-[320px] xl:w-full shrink-0 snap-center cursor-pointer" 
      style={{
        borderRadius: 24,
        padding: '28px 24px',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(99,102,241,0.3)',
        perspective: '1000px'
      }}
    >
      {/* Decorative shimmer */}
      <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none" />
      
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ position: 'absolute', bottom: -40, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-[length:var(--fs-overline)] font-bold text-white/50 uppercase tracking-widest mb-1">Vault Balance</p>
            <p className="text-3xl font-black font-manrope letter-tight tracking-tighter">
              {currency}{Math.abs(currentBalance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="glass-panel px-3 py-1.5 rounded-lg border-white/20">
            <span className="text-[length:var(--fs-overline)] font-bold italic tracking-widest text-white/90">SPENDWISE</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="space-y-4">
            <p className="text-sm font-medium tracking-[0.25em] text-white/80 font-mono">•••• •••• •••• 8842</p>
            <div>
              <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Premium Member</p>
              <p className="text-xs font-bold uppercase tracking-wider">SpendWise Pro</p>
            </div>
          </div>
          <div className="w-12 h-8 rounded-md bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
            <div className="flex -space-x-2">
              <div className="w-5 h-5 rounded-full bg-red-500/80" />
              <div className="w-5 h-5 rounded-full bg-yellow-500/80" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
