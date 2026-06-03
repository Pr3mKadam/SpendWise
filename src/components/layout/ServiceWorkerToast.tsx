import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/core/haptic';

export default function ServiceWorkerToast() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (offlineReady || needRefresh) {
      setShow(true);
      haptic.medium();
    }
  }, [offlineReady, needRefresh]);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[500] md:left-auto md:right-8 md:w-80"
        >
          <div className="bg-[#0f172a] border border-[var(--teal)]/30 rounded-2xl p-4 shadow-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--teal-dim)] flex items-center justify-center shrink-0">
              <RefreshCcw size={20} className="text-[var(--teal)]" />
            </div>
            <div className="flex-1">
              <h4 className="text-white text-sm font-bold font-manrope">
                {needRefresh ? 'Update Available' : 'Ready for Offline'}
              </h4>
              <p className="text-white/60 text-[length:var(--fs-overline)] font-inter mt-0.5">
                {needRefresh
                  ? 'A new version of SpendWise is ready. Refresh to update!'
                  : 'App cached successfully. You can use it offline!'}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {needRefresh && (
                <button
                  onClick={() => updateServiceWorker(true)}
                  className="px-3 py-1.5 bg-[var(--teal)] text-white text-[length:var(--fs-overline)] font-bold uppercase rounded-lg active:scale-95 transition-all"
                >
                  Update
                </button>
              )}
              <button
                onClick={close}
                className="p-1.5 text-white/40 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
