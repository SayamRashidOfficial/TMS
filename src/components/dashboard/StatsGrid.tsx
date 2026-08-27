'use client';

import React from 'react';
import StatCard from './StatCard';
import { StatCardData } from '@/types/dashboard';
import { Layers } from 'lucide-react';

interface StatsGridProps {
  stats: StatCardData[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          Key Business Metrics
        </h2>
        <span className="text-[11px] text-muted-foreground font-medium">
          Showing {stats.length} summary metrics
        </span>
      </div>

      {/* Grid: 1 col on mobile, 2 cols on tablet, 4 cols on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {stats.map((card) => (
          <StatCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
