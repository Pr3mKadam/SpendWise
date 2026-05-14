import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Star, Bug, Zap } from 'lucide-react';
import { haptic } from '../../lib/haptic';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { type: string; message: string; rating: number }) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [type, setType] = useState('feedback');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    haptic.medium();

    // Simulate API call
    setTimeout(() => {
      onSubmit({ type, message, rating });
      setIsSubmitting(false);
      setIsSuccess(true);
      haptic.success();

      setTimeout(() => {
        setIsSuccess(false);
        setMessage('');
        onClose();
      }, 2000);
    }, 1500);
  };

  const types = [
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, color: 'bg-blue-500' },
    { id: 'bug', label: 'Bug Report', icon: Bug, color: 'bg-red-500' },
    { id: 'feature', label: 'Feature', icon: Zap, color: 'bg-amber-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[var(--card-bg)] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden"
          >
            {isSuccess ? (
              <div className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Star size={40} fill="currentColor" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                <p className="text-white/60">Your feedback helps us make SpendWise better for everyone.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Share your thoughts</h2>
                    <p className="text-white/50 text-sm">Detected a shake! Something on your mind?</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  {types.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setType(t.id);
                        haptic.light();
                      }}
                      className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                        type === t.id 
                          ? 'border-[var(--teal)] bg-[var(--teal)]/10 text-[var(--teal)]' 
                          : 'border-white/5 bg-white/5 text-white/40'
                      }`}
                    >
                      <t.icon size={24} className="mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mb-8">
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Rating</label>
                  <div className="flex items-center gap-2 justify-center py-4 bg-white/5 rounded-2xl">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setRating(s);
                          haptic.light();
                        }}
                        className={`p-2 transition-all ${s <= rating ? 'text-amber-400 scale-110' : 'text-white/10'}`}
                      >
                        <Star size={32} fill={s <= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Your Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us more..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--teal)]/50 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--teal)] to-emerald-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <span>Send Feedback</span>
                      <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
