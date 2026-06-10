import { AlertTriangle } from 'lucide-react';
import { DEMO_MODE } from '@/config/env';

export function DemoBanner() {
  if (!DEMO_MODE) return null;

  return (
    <div className="sticky top-0 z-[80] w-full bg-amber-500/90 dark:bg-amber-600/90 text-white text-center py-1.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 shadow-md backdrop-blur-sm">
      <AlertTriangle size={12} className="shrink-0" />
      <span>Demo Mode — data shown is simulated and not real financial information</span>
    </div>
  );
}
