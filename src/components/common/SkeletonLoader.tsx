import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-2">
          <div className="h-2 w-24 bg-white/5 rounded" />
          <div className="h-8 w-48 bg-white/10 rounded-lg" />
        </div>
        <div className="h-6 w-32 bg-white/5 rounded-full" />
      </div>

      {/* Main Card Skeleton */}
      <div className="h-32 w-full bg-white/5 rounded-2xl border border-white/5" />

      {/* Grid Skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/5" />
        ))}
      </div>

      {/* Large Content Area Skeleton */}
      <div className="h-64 w-full bg-white/5 rounded-2xl border border-white/5 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 bg-white/10 rounded" />
          <div className="flex gap-2">
            <div className="h-4 w-12 bg-white/5 rounded" />
            <div className="h-4 w-12 bg-white/5 rounded" />
          </div>
        </div>
        <div className="h-full w-full bg-white/5 rounded-lg opacity-50" />
      </div>
    </div>
  );
};
