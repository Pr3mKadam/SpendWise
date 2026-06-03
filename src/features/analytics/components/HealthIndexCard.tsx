import { motion } from 'framer-motion';
import { ShieldCheck, Info } from 'lucide-react';

interface HealthResult {
  score: number;
  grade: string;
  color: string;
  breakdown: Record<string, number>;
  recommendations: string[];
}

export function HealthIndexCard({ health }: { health: HealthResult }) {
  return (
    <div
      className="card p-0 overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
    >
      <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-8 items-center relative z-10">
        {/* Gauge */}
        <div className="relative w-40 h-40 shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="12"
            />
            <motion.circle
              initial={{ strokeDasharray: '0 440' }}
              animate={{ strokeDasharray: `${(health.score / 100) * 440} 440` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={health.color}
              strokeWidth="12"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-black text-white leading-none">{health.score}</span>
            <span className="text-[length:var(--fs-overline)] font-bold text-gray-400 tracking-widest uppercase mt-1">
              Health Index
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <ShieldCheck className="text-teal-400" size={20} />
            </div>
            <div>
              <h3 className="text-white text-lg font-bold">AI Financial Health: {health.grade}</h3>
              <p className="text-gray-400 text-sm">
                Based on your spending discipline, stability, and savings rate.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(health.breakdown).map(([key, val]) => (
              <div key={key}>
                <div className="flex justify-between text-[length:var(--fs-overline)] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  <span>{key}</span>
                  <span>{val}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500/50 transition-all duration-1000"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
              <Info size={14} className="text-teal-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                {health.recommendations.map((rec, i) => (
                  <p key={i} className="text-xs text-teal-100/90 leading-relaxed font-medium">
                    {rec}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
    </div>
  );
}
