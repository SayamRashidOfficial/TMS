'use client';

import React from 'react';
import {
  ShoppingBag,
  Clock,
  Scissors,
  Sparkles,
  Truck,
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import { StatCardData, AccentColor, StatCardIconName } from '@/types/dashboard';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<StatCardIconName, LucideIcon> = {
  ShoppingBag,
  Clock,
  Scissors,
  Sparkles,
  Truck,
  DollarSign,
  TrendingUp,
  Users,
};

const accentStyles: Record<
  AccentColor,
  {
    bgIcon: string;
    textIcon: string;
    borderIcon: string;
    badgeBg: string;
    badgeText: string;
    hoverBorder: string;
  }
> = {
  indigo: {
    bgIcon: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    textIcon: 'text-indigo-600 dark:text-indigo-400',
    borderIcon: 'border-indigo-500/20',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    hoverBorder: 'hover:border-indigo-500/40',
  },
  amber: {
    bgIcon: 'bg-amber-500/10 dark:bg-amber-500/15',
    textIcon: 'text-amber-600 dark:text-amber-400',
    borderIcon: 'border-amber-500/20',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-700 dark:text-amber-300',
    hoverBorder: 'hover:border-amber-500/40',
  },
  violet: {
    bgIcon: 'bg-violet-500/10 dark:bg-violet-500/15',
    textIcon: 'text-violet-600 dark:text-violet-400',
    borderIcon: 'border-violet-500/20',
    badgeBg: 'bg-violet-500/10',
    badgeText: 'text-violet-700 dark:text-violet-300',
    hoverBorder: 'hover:border-violet-500/40',
  },
  emerald: {
    bgIcon: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    textIcon: 'text-emerald-600 dark:text-emerald-400',
    borderIcon: 'border-emerald-500/20',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    hoverBorder: 'hover:border-emerald-500/40',
  },
  teal: {
    bgIcon: 'bg-teal-500/10 dark:bg-teal-500/15',
    textIcon: 'text-teal-600 dark:text-teal-400',
    borderIcon: 'border-teal-500/20',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-700 dark:text-teal-300',
    hoverBorder: 'hover:border-teal-500/40',
  },
  blue: {
    bgIcon: 'bg-blue-500/10 dark:bg-blue-500/15',
    textIcon: 'text-blue-600 dark:text-blue-400',
    borderIcon: 'border-blue-500/20',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-700 dark:text-blue-300',
    hoverBorder: 'hover:border-blue-500/40',
  },
  rose: {
    bgIcon: 'bg-rose-500/10 dark:bg-rose-500/15',
    textIcon: 'text-rose-600 dark:text-rose-400',
    borderIcon: 'border-rose-500/20',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-700 dark:text-rose-300',
    hoverBorder: 'hover:border-rose-500/40',
  },
  sky: {
    bgIcon: 'bg-sky-500/10 dark:bg-sky-500/15',
    textIcon: 'text-sky-600 dark:text-sky-400',
    borderIcon: 'border-sky-500/20',
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-700 dark:text-sky-300',
    hoverBorder: 'hover:border-sky-500/40',
  },
};

interface StatCardProps {
  card: StatCardData;
}

export default function StatCard({ card }: StatCardProps) {
  const IconComponent: LucideIcon = iconMap[card.iconName] ?? ShoppingBag;
  const style = accentStyles[card.accentColor] ?? accentStyles.indigo;

  return (
    <div
      className={`group relative bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden ${style.hoverBorder}`}
    >
      {/* Top row: Icon and Trend/Badge */}
      <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
        <div
          className={`p-2.5 rounded-xl border ${style.bgIcon} ${style.textIcon} ${style.borderIcon} transition-transform duration-200 group-hover:scale-105 shadow-xs`}
        >
          <IconComponent className="w-4 h-4" />
        </div>

        {card.change && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border border-border ${style.badgeBg} ${style.badgeText}`}
          >
            <ArrowUpRight className="w-3 h-3" />
            {card.change}
          </span>
        )}
      </div>

      {/* Title & Value */}
      <div className="relative z-10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
          {card.title}
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight group-hover:text-amber-500 transition-colors font-mono">
          {card.value}
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-medium line-clamp-1">
          {card.description}
        </p>
      </div>
    </div>
  );
}
