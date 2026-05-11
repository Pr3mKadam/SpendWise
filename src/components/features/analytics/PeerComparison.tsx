import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Users } from 'lucide-react';
import { CategorySpend } from '../../../types';

export function PeerComparison({ categorySpending, currency = '$' }: { categorySpending: CategorySpend[], currency?: string }) {
  // Generate mock peer data based on user spending
  const data = categorySpending.slice(0, 5).map(cat => ({
    category: cat.name,
    you: cat.value,
    peer: cat.value * (0.8 + Math.random() * 0.5), // +/- ~20-30%
  }));

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="card px-4 sm:px-6 py-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
          <Users size={18} className="text-blue-500" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-manrope font-bold text-base text-[var(--text-primary)]">Peer Comparison</h3>
          <p className="truncate hidden sm:block font-inter text-xs text-[var(--text-muted)]">How your spending compares to similar users</p>
        </div>
      </div>
      
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barSize={16}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f2f5" />
            <XAxis type="number" hide />
            <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }} width={80} />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="card px-4 py-3 shadow-lg">
                    <p className="font-inter text-xs text-[var(--text-muted)] font-semibold mb-2">{payload[0].payload.category}</p>
                    <div className="flex justify-between gap-6 mb-1">
                      <span className="text-xs font-inter text-[var(--teal)] font-bold">You</span>
                      <span className="text-sm font-manrope font-bold text-[var(--text-primary)]">{currency}{Number(payload[0]?.value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-xs font-inter text-blue-500 font-bold">Peers</span>
                      <span className="text-sm font-manrope font-bold text-[var(--text-primary)]">{currency}{Number(payload[1]?.value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'var(--font-inter)' }} />
            <Bar dataKey="you" name="You" fill="var(--teal)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="peer" name="Similar Users" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
