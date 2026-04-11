import { useState } from 'react';
import { RotateCcw, Check, X, Bell, Zap } from 'lucide-react';

interface HeaderProps {
  onReset:           () => void;
  unreadCount:       number;
  onToggleNotifications: () => void;
}

export default function Header({ onReset, unreadCount, onToggleNotifications }: HeaderProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmReset = () => {
    onReset();
    setShowConfirm(false); // Auto-close after reset
  };

  return (
    <header className="sticky top-0 z-50 px-4 pt-5 pb-2 sm:px-6 lg:px-8 bg-[#060b13]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between">

        {/* Left: SpendWise Branding */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/20">
            <Zap className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-tight text-white leading-none">
              Spend<span className="text-blue-400">Wise</span>
            </h1>
            <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest mt-0.5">
              Personal finance
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Reset */}
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center justify-center h-9 w-9 rounded-xl border border-slate-800/80 bg-slate-900/50 text-slate-500 transition-all hover:bg-slate-800 hover:text-white hover:border-slate-700"
              title="Reset Data"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1 animate-scale-in rounded-xl bg-slate-900 border border-slate-700/60 p-1">
              <span className="px-2 text-[9px] font-bold text-red-400 uppercase tracking-wider">Reset?</span>
              <button
                onClick={handleConfirmReset}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20 text-red-400 transition-colors hover:bg-red-500 hover:text-white"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-500 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Notification bell — wired */}
          <button
            onClick={onToggleNotifications}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800/80 bg-slate-900/50 text-slate-500 transition-all hover:bg-slate-800 hover:text-white hover:border-slate-700"
            title="Notifications"
          >
            <Bell className="h-3.5 w-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-lg shadow-rose-500/40 badge-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
