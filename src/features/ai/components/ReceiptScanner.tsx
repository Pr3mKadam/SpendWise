import React, { useState, useRef, useEffect } from 'react';
import { processReceipt } from '@/services/OCRService';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { formatLocalYYYYMMDD } from '@/utils/date';

interface ReceiptScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onExtracted: (data: { merchant: string; amount: number; date: string }) => void;
}

export default function ReceiptScanner({ isOpen, onClose, onExtracted }: ReceiptScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [isProcessingCrop, setIsProcessingCrop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  // Cropping & Resizing State (percentages)
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; initCrop: typeof crop }>({ startX: 0, startY: 0, initCrop: { x: 10, y: 10, width: 80, height: 80 } });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setCrop({ x: 10, y: 10, width: 80, height: 80 });
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Custom pointer down handler for drag and resize
  const handlePointerDown = (e: React.TouchEvent | React.MouseEvent, action: string) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initCrop: { ...crop }
    };
    setActiveAction(action);
  };

  // Global pointer move and up handlers for smooth touch/mouse resizing
  useEffect(() => {
    if (!activeAction) return;

    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!containerRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((clientX - dragRef.current.startX) / rect.width) * 100;
      const dy = ((clientY - dragRef.current.startY) / rect.height) * 100;

      const { initCrop } = dragRef.current;
      let newX = initCrop.x;
      let newY = initCrop.y;
      let newW = initCrop.width;
      let newH = initCrop.height;

      if (activeAction === 'move') {
        newX = Math.max(0, Math.min(100 - newW, initCrop.x + dx));
        newY = Math.max(0, Math.min(100 - newH, initCrop.y + dy));
      } else if (activeAction === 'nw') {
        const maxDx = initCrop.width - 20; // min width 20%
        const maxDy = initCrop.height - 20; // min height 20%
        const clampedDx = Math.max(-initCrop.x, Math.min(maxDx, dx));
        const clampedDy = Math.max(-initCrop.y, Math.min(maxDy, dy));

        newX = initCrop.x + clampedDx;
        newY = initCrop.y + clampedDy;
        newW = initCrop.width - clampedDx;
        newH = initCrop.height - clampedDy;
      } else if (activeAction === 'ne') {
        const maxDx = 100 - (initCrop.x + initCrop.width);
        const minDx = -(initCrop.width - 20);
        const maxDy = initCrop.height - 20;
        const clampedDx = Math.max(minDx, Math.min(maxDx, dx));
        const clampedDy = Math.max(-initCrop.y, Math.min(maxDy, dy));

        newY = initCrop.y + clampedDy;
        newW = initCrop.width + clampedDx;
        newH = initCrop.height - clampedDy;
      } else if (activeAction === 'sw') {
        const maxDx = initCrop.width - 20;
        const maxDy = 100 - (initCrop.y + initCrop.height);
        const minDy = -(initCrop.height - 20);
        const clampedDx = Math.max(-initCrop.x, Math.min(maxDx, dx));
        const clampedDy = Math.max(minDy, Math.min(maxDy, dy));

        newX = initCrop.x + clampedDx;
        newW = initCrop.width - clampedDx;
        newH = initCrop.height + clampedDy;
      } else if (activeAction === 'se') {
        const maxDx = 100 - (initCrop.x + initCrop.width);
        const minDx = -(initCrop.width - 20);
        const maxDy = 100 - (initCrop.y + initCrop.height);
        const minDy = -(initCrop.height - 20);
        const clampedDx = Math.max(minDx, Math.min(maxDx, dx));
        const clampedDy = Math.max(minDy, Math.min(maxDy, dy));

        newW = initCrop.width + clampedDx;
        newH = initCrop.height + clampedDy;
      }

      setCrop({ x: newX, y: newY, width: newW, height: newH });
    };

    const handleUp = () => {
      setActiveAction(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [activeAction]);

  // Helper to draw cropped image to canvas and export new File
  const cropImageToFile = async (dataUrl: string, cropArea: { x: number; y: number; width: number; height: number }, originalFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const sx = (cropArea.x / 100) * img.width;
        const sy = (cropArea.y / 100) * img.height;
        const sWidth = (cropArea.width / 100) * img.width;
        const sHeight = (cropArea.height / 100) * img.height;

        canvas.width = sWidth;
        canvas.height = sHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(originalFile);
          return;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(originalFile);
            return;
          }
          const croppedFile = new File([blob], originalFile.name, { type: originalFile.type || 'image/jpeg' });
          resolve(croppedFile);
        }, originalFile.type || 'image/jpeg', 0.95);
      };
      img.onerror = () => resolve(originalFile);
      img.src = dataUrl;
    });
  };

  const processImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
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
        date: result.date || formatLocalYYYYMMDD(new Date())
      });
      
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (err: any) {
      console.error(err);
      setError(
        err.message?.includes('API key')
          ? '🔑 Gemini API key not configured. Using local OCR instead — tap "Start Analysis" again.'
          : '⚠️ Could not read receipt. Try a clearer, well-lit photo.'
      );
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
                  <p className="text-[length:var(--fs-overline)] text-teal-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={10} className="fill-current" /> Powered by Gemini AI
                  </p>
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
                  {isCropping ? (
                    <div className="space-y-4">
                      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-dashed border-teal-500/50 bg-black/20 select-none" ref={containerRef}>
                        <img src={image} alt="Crop Preview" className="w-full h-full object-contain opacity-50 pointer-events-none" />
                        
                        {/* Flawless Interactive Crop Box Overlay */}
                        <div 
                          className="absolute border-2 border-teal-400 bg-teal-500/10 backdrop-blur-[1px] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] select-none"
                          style={{
                            left: `${crop.x}%`,
                            top: `${crop.y}%`,
                            width: `${crop.width}%`,
                            height: `${crop.height}%`,
                            touchAction: 'none',
                          }}
                        >
                          {/* Center Drag Area */}
                          <div 
                            onTouchStart={(e) => handlePointerDown(e, 'move')}
                            onMouseDown={(e) => handlePointerDown(e, 'move')}
                            className="absolute inset-0 w-full h-full cursor-move flex items-center justify-center group"
                          >
                            <span className="bg-black/70 text-white text-[length:var(--fs-caption)] px-3 py-1.5 rounded-lg font-bold opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                              {activeAction === 'move' ? 'Moving...' : activeAction ? 'Resizing...' : 'Drag center to move, corners to resize'}
                            </span>
                          </div>

                          {/* Top-Left Corner Handle */}
                          <div 
                            onTouchStart={(e) => handlePointerDown(e, 'nw')}
                            onMouseDown={(e) => handlePointerDown(e, 'nw')}
                            className="absolute -top-6 -left-6 w-12 h-12 flex items-center justify-center cursor-nwse-resize z-50 group"
                          >
                            <div className={`w-5 h-5 bg-teal-500 border-2 border-white rounded-full shadow-lg transition-transform ${activeAction === 'nw' ? 'scale-125 bg-teal-400' : 'group-hover:scale-110'}`} />
                          </div>

                          {/* Top-Right Corner Handle */}
                          <div 
                            onTouchStart={(e) => handlePointerDown(e, 'ne')}
                            onMouseDown={(e) => handlePointerDown(e, 'ne')}
                            className="absolute -top-6 -right-6 w-12 h-12 flex items-center justify-center cursor-nesw-resize z-50 group"
                          >
                            <div className={`w-5 h-5 bg-teal-500 border-2 border-white rounded-full shadow-lg transition-transform ${activeAction === 'ne' ? 'scale-125 bg-teal-400' : 'group-hover:scale-110'}`} />
                          </div>

                          {/* Bottom-Left Corner Handle */}
                          <div 
                            onTouchStart={(e) => handlePointerDown(e, 'sw')}
                            onMouseDown={(e) => handlePointerDown(e, 'sw')}
                            className="absolute -bottom-6 -left-6 w-12 h-12 flex items-center justify-center cursor-nesw-resize z-50 group"
                          >
                            <div className={`w-5 h-5 bg-teal-500 border-2 border-white rounded-full shadow-lg transition-transform ${activeAction === 'sw' ? 'scale-125 bg-teal-400' : 'group-hover:scale-110'}`} />
                          </div>

                          {/* Bottom-Right Corner Handle */}
                          <div 
                            onTouchStart={(e) => handlePointerDown(e, 'se')}
                            onMouseDown={(e) => handlePointerDown(e, 'se')}
                            className="absolute -bottom-6 -right-6 w-12 h-12 flex items-center justify-center cursor-nwse-resize z-50 group"
                          >
                            <div className={`w-5 h-5 bg-teal-500 border-2 border-white rounded-full shadow-lg transition-transform ${activeAction === 'se' ? 'scale-125 bg-teal-400' : 'group-hover:scale-110'}`} />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          onClick={() => { setImage(null); setIsCropping(false); }}
                          className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-xs"
                        >
                          Retake
                        </button>
                        <button 
                          onClick={async () => {
                            if (!image || !file) return;
                            setIsProcessingCrop(true);
                            try {
                              const croppedFile = await cropImageToFile(image, crop, file);
                              setFile(croppedFile);
                              const reader = new FileReader();
                              reader.onload = () => {
                                setImage(reader.result as string);
                                setIsCropping(false);
                                setIsProcessingCrop(false);
                              };
                              reader.readAsDataURL(croppedFile);
                            } catch (e) {
                              setIsCropping(false);
                              setIsProcessingCrop(false);
                            }
                          }}
                          disabled={isProcessingCrop}
                          className="flex-1 py-3 rounded-xl bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isProcessingCrop ? <Loader2 size={14} className="animate-spin" /> : null}
                          Confirm Crop
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-[var(--border)] bg-black">
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
                          <p className="text-[length:var(--fs-overline)] text-center text-[var(--text-muted)] italic">
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
              )}
            </div>
            
            <div className="px-8 pb-8 flex items-center gap-3 text-[length:var(--fs-overline)] text-[var(--text-muted)]">
              <CheckCircle2 size={12} className="text-teal-500" />
              <span>Processed securely via SpendWise Cloud (Gemini 1.5)</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
