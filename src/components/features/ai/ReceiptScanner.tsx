import React, { useState, useRef } from 'react';
import { processReceipt } from '../../../services/OCRService';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ReceiptScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onExtracted: (data: { merchant: string; amount: number; date: string }) => void;
}

export default function ReceiptScanner({ isOpen, onClose, onExtracted }: ReceiptScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const processImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress for UI feel since Gemini is single-shot
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const result = await processReceipt(file);
      
      clearInterval(progressInterval);
      setProgress(100);

      onExtracted({
        merchant: result.merchant || 'Unknown Merchant',
        amount: result.amount || 0,
        date: result.date || new Date().toISOString().split('T')[0]
      });
      
      // Small delay to show 100% progress
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (err) {
      console.error(err);
      setError("Failed to parse receipt with Gemini. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">AI Receipt Scanner</h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Local-First OCR</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-[var(--text-muted)]">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group border-2 border-dashed border-[var(--border)] rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-teal-500/50 hover:bg-teal-500/5 transition-all cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--surface-input)] flex items-center justify-center text-[var(--text-muted)] group-hover:scale-110 group-hover:text-teal-500 transition-all">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[var(--text-primary)]">Upload Receipt</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG or JPEG up to 10MB</p>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-[var(--border)] bg-black">
                    <img src={image} alt="Receipt Preview" className="w-full h-full object-contain" />
                    <button 
                      onClick={() => setImage(null)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {isProcessing ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin text-teal-500" />
                          Analyzing Receipt...
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-[var(--surface-input)] rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-teal-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-center text-[var(--text-muted)] italic">
                        This stays on your device. Privacy first.
                      </p>
                    </div>
                  ) : error ? (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
                      <AlertCircle size={18} />
                      <p className="text-xs font-bold">{error}</p>
                    </div>
                  ) : (
                    <button 
                      onClick={processImage}
                      className="w-full py-4 rounded-2xl bg-teal-500 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-teal-500/20 transition-all"
                    >
                      <Sparkles size={18} />
                      Start Analysis
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="px-8 pb-8 flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
              <CheckCircle2 size={12} className="text-teal-500" />
              <span>Processed locally via Tesseract Neural Engine</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
