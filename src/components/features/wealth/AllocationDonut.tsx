import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ASSET_TYPES } from '@/data/portfolioConfig';

export interface AllocationDonutProps {
  allocationByType: any[];
  total: number;
  currency: string;
}

function fmt(n: number, currency: string) {
  return `${currency}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function AllocationDonut({ allocationByType, total, currency }: AllocationDonutProps) {
  if (total === 0 || allocationByType.length === 0) return null;

  const data = allocationByType.map(a => ({
    name: ASSET_TYPES.find(t => t.value === a.type)?.label || a.type,
    value: a.value,
    color: ASSET_TYPES.find(t => t.value === a.type)?.color || '#64748b'
  }));

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 h-[180px]">
      <div className="w-full sm:w-[200px] h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
              formatter={(val: any) => fmt(Number(val), currency)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-3 flex-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
            <div>
              <p className="font-inter text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
              <p className="font-manrope text-[length:var(--fs-caption)] font-bold" style={{ color: 'var(--text-muted)' }}>
                {((d.value / total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllocationDonut;
