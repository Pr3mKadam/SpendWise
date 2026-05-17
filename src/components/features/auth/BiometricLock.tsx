import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Fingerprint, CheckCircle2, AlertCircle } from 'lucide-react';
import { haptic } from '../../../lib/haptic';

interface BiometricLockProps {
  onUnlocked: () => void;
  appName?: string;
}

export const BiometricLock: React.FC<BiometricLockProps> = ({ 
  onUnlocked, 
  appName = "SpendWise" 
}) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Auto-start scanning on mount
    const timer = setTimeout(() => {
      startScan();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const startScan = () => {
    setStatus('scanning');
    haptic.medium();

    // Simulate network/hardware delay
    setTimeout(() => {
      // 90% success rate for simulation
      const isSuccess = Math.random() > 0.1 || attempts > 1;
      
      if (isSuccess) {
        setStatus('success');
        haptic.success();
        setTimeout(onUnlocked, 1000);
      } else {
        setStatus('error');
        setAttempts(prev => prev + 1);
        haptic.error();
        // Allow retry after a delay
        setTimeout(() => setStatus('idle'), 2000);
      }
    }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#0f172a] text-white p-6"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-xs">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 mb-4 mx-auto">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-manrope font-bold tracking-tight">{appName}</h1>
          <p className="text-white/50 text-sm mt-1">Premium Financial Suite</p>
        </motion.div>

        <div className="relative w-40 h-40 flex items-center justify-center mb-12">
          {/* Animated Rings */}
          <AnimatePresence>
            {status === 'scanning' && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 border-2 border-teal-500/30 rounded-full"
                />
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 0.5 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute inset-0 border-2 border-teal-400/20 rounded-full"
                />
              </>
            )}
          </AnimatePresence>

          <motion.div
            animate={status === 'scanning' ? { 
              scale: [1, 1.05, 1],
              opacity: [1, 0.7, 1]
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className={`w-28 h-28 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-xl border-2 transition-colors duration-500 ${
              status === 'success' ? 'border-emerald-500 bg-emerald-500/10' : 
              status === 'error' ? 'border-red-500 bg-red-500/10' : 
              'border-white/10'
            }`}
          >
            {status === 'success' ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle2 size={48} className="text-emerald-500" />
              </motion.div>
            ) : status === 'error' ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <AlertCircle size={48} className="text-red-500" />
              </motion.div>
            ) : (
              <Fingerprint 
                size={48} 
                className={`transition-colors duration-500 ${status === 'scanning' ? 'text-teal-400' : 'text-white/30'}`} 
              />
            )}
          </motion.div>

          {/* Scanner Line */}
          <AnimatePresence>
            {status === 'scanning' && (
              <motion.div
                initial={{ top: '20%', opacity: 0 }}
                animate={{ top: '80%', opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="absolute left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_rgba(45,212,191,0.8)] z-20"
              />
            )}
          </AnimatePresence>
        </div>

        <div className="h-12">
          <AnimatePresence mode="wait">
            <motion.p
              key={status}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className={`text-sm font-medium tracking-wide ${
                status === 'error' ? 'text-red-400' : 
                status === 'success' ? 'text-emerald-400' : 
                'text-white/70'
              }`}
            >
              {status === 'idle' && "Tap to authenticate"}
              {status === 'scanning' && "Verifying identity..."}
              {status === 'success' && "Access Granted"}
              {status === 'error' && "Not Recognized"}
            </motion.p>
          </AnimatePresence>
        </div>

        {status === 'idle' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={startScan}
            className="mt-8 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            Retry Biometrics
          </motion.button>
        )}
      </div>

      <div className="absolute bottom-12 left-0 right-0 text-center">
        <p className="text-[length:var(--fs-overline)] text-white/20 uppercase tracking-[0.2em]">Secure Session Encrypted</p>
      </div>
    </motion.div>
  );
};
