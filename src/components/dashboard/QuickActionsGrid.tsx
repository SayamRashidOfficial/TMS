'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, Users, FileText, Ruler, ArrowRight, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { QuickActionItem, QuickActionIconName, QuickActionColorVariant } from '@/types/dashboard';
import { toast } from 'sonner';

interface QuickActionsGridProps {
  actions: QuickActionItem[];
}

const iconMap: Record<QuickActionIconName, LucideIcon> = {
  PlusCircle,
  Users,
  FileText,
  Ruler,
};

const variantStyles: Record<
  QuickActionColorVariant,
  {
    bgIcon: string;
    textIcon: string;
    borderIcon: string;
    hoverBorder: string;
    arrowHover: string;
    accentGlow: string;
  }
> = {
  indigo: {
    bgIcon: 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    textIcon: 'text-indigo-600 dark:text-indigo-400',
    borderIcon: 'border-indigo-500/20',
    hoverBorder: 'hover:border-indigo-500/40',
    arrowHover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    accentGlow: 'bg-indigo-500/5',
  },
  amber: {
    bgIcon: 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400',
    textIcon: 'text-amber-600 dark:text-amber-400',
    borderIcon: 'border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/40',
    arrowHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    accentGlow: 'bg-amber-500/5',
  },
  emerald: {
    bgIcon: 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    textIcon: 'text-emerald-600 dark:text-emerald-400',
    borderIcon: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/40',
    arrowHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    accentGlow: 'bg-emerald-500/5',
  },
  violet: {
    bgIcon: 'bg-violet-500/10 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400',
    textIcon: 'text-violet-600 dark:text-violet-400',
    borderIcon: 'border-violet-500/20',
    hoverBorder: 'hover:border-violet-500/40',
    arrowHover: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
    accentGlow: 'bg-violet-500/5',
  },
};

export default function QuickActionsGrid({ actions }: QuickActionsGridProps) {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Quick Actions & Operations
        </h2>
        <span className="text-[11px] text-muted-foreground font-medium">
          Fast-track atelier shortcuts
        </span>
      </div>

      {/* Grid: 1 col on mobile, 2 cols on tablet, 4 cols on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {actions.map((action) => {
          const Icon: LucideIcon = iconMap[action.iconName] ?? PlusCircle;
          const style = variantStyles[action.colorVariant] ?? variantStyles.amber;

          return (
            <Link
              key={action.id}
              href={action.href}
              className={`group relative bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer ${style.hoverBorder}`}
            >
              {/* Top row: Icon & Optional Badge */}
              <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
                <div
                  className={`p-2.5 rounded-xl border ${style.bgIcon} ${style.borderIcon} transition-transform duration-200 group-hover:scale-105 shadow-xs`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {action.badgeText && (
                  <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                    {action.badgeText}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div className="relative z-10 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold group-hover:text-amber-500 transition-colors">
                    {action.title}
                  </h3>
                  <ArrowRight
                    className={`w-3.5 h-3.5 text-muted-foreground ${style.arrowHover} group-hover:translate-x-0.5 transition-transform duration-150`}
                  />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
