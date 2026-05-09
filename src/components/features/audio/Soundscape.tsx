import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Pause, Play, SkipForward, Volume2, X, Headphones, Wind, Coffee } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  artist: string;
  url: string;
  icon: React.ReactNode;
}

const TRACKS: Track[] = [
  { 
    id: '1', 
    name: 'Midnight Budget', 
    artist: 'SpendWise Lo-fi', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Sample URL
    icon: <Coffee size={14} />
  },
  { 
    id: '2', 
    name: 'Focus Flow', 
    artist: 'Deep Work', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    icon: <Headphones size={14} />
  },
  { 
    id: '3', 
    name: 'Atmospheric Wealth', 
    artist: 'Ambient Dreams', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    icon: <Wind size={14} />
  }
];

export default function Soundscape() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIdx];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const nextIdx = (currentTrackIdx + 1) % TRACKS.length;
    setCurrentTrackIdx(nextIdx);
    setIsPlaying(true);
    // Audio source update handled by useEffect or re-render
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentTrackIdx]);

  return (
    <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end gap-3">
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        loop 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="card p-4 w-64 shadow-2xl border-[var(--border)] relative overflow-hidden"
            style={{ background: 'var(--surface-card)', backdropFilter: 'blur(20px)' }}
          >
            {/* Visualizer animation (simplified) */}
            {isPlaying && (
              <div className="absolute top-0 left-0 right-0 h-1 flex items-end gap-0.5 px-2">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 12, 4] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 0.5 + Math.random(),
                      ease: "easeInOut" 
                    }}
                    className="flex-1 bg-teal-500/30"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mb-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
                  {currentTrack.icon}
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-[var(--text-primary)] truncate max-w-[120px]">
                    {currentTrack.name}
                  </h4>
                  <p className="text-[9px] text-[var(--text-muted)] font-medium">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/5 text-[var(--text-muted)]"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 mb-4">
              <button 
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>
              <button 
                onClick={nextTrack}
                className="p-2 rounded-full hover:bg-white/5 text-[var(--text-primary)]"
              >
                <SkipForward size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Volume2 size={12} className="text-[var(--text-muted)]" />
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${
          isPlaying 
            ? 'bg-teal-500 text-white ring-4 ring-teal-500/20' 
            : 'bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border)]'
        }`}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0, rotate: -20 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 20 }}
            >
              <Music size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, rotate: -20 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 20 }}
            >
              <Headphones size={20} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {isPlaying && (
          <div className="absolute -top-1 -right-1 flex gap-0.5 items-end h-3">
            <motion.div animate={{ height: [2, 8, 2] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-white" />
            <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 bg-white" />
            <motion.div animate={{ height: [3, 6, 3] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-white" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
