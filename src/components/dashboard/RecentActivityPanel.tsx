'use client';

import React, { useState } from 'react';
import {
  Activity,
  ShoppingBag,
  Scissors,
  CheckCircle,
  UserPlus,
  CreditCard,
  Box,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { RecentActivityItem, ActivityCategory, ActivityStatusVariant } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RecentActivityPanelProps {
  activities: RecentActivityItem[];
}

const categoryIcons: Record<ActivityCategory, React.ElementType> = {
  order: ShoppingBag,
  stitching: Scissors,
  delivery: CheckCircle,
  customer: UserPlus,
  payment: CreditCard,
  inventory: Box,
};

const badgeStyles: Record<ActivityStatusVariant, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  purple: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  neutral: 'bg-secondary text-muted-foreground border-border',
};

const iconBgStyles: Record<ActivityCategory, string> = {
  order: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  stitching: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  delivery: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  customer: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  payment: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  inventory: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

export default function RecentActivityPanel({ activities }: RecentActivityPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredActivities =
    selectedCategory === 'all'
      ? activities
      : activities.filter((act) => act.category === selectedCategory);

  return (
    <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500" />
            Recent Atelier Activity
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time feed of orders, production updates, deliveries & payments
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'order', label: 'Orders' },
            { id: 'stitching', label: 'Stitching' },
            { id: 'delivery', label: 'Deliveries' },
            { id: 'payment', label: 'Payments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-foreground text-background shadow-xs font-bold'
                  : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline Stream */}
      <div className="relative border-l border-border ml-3 my-4 space-y-4 pb-2">
        {filteredActivities.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-xs -ml-3">
            No recent activities recorded for this category.
          </div>
        ) : (
          filteredActivities.map((act) => {
            const Icon = categoryIcons[act.category] || Activity;
            const iconStyle = iconBgStyles[act.category] || iconBgStyles.order;
            const badgeStyle = badgeStyles[act.statusVariant] || badgeStyles.neutral;

            return (
              <div
                key={act.id}
                className="relative pl-6 sm:pl-7 group transition-colors"
              >
                {/* Timeline Node / Icon */}
                <div className={`absolute -left-[14px] top-1 p-1.5 rounded-lg border ${iconStyle} bg-card group-hover:scale-110 transition-transform duration-150 shadow-xs z-10`}>
                  <Icon className="w-3 h-3" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 p-2.5 -mt-2 rounded-xl hover:bg-secondary/50 transition-colors">
                  {/* Left: Details */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-foreground group-hover:text-amber-500 transition-colors">
                        {act.title}
                      </h4>
                      {act.orderNumber && (
                        <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                          #{act.orderNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {act.description}
                    </p>
                  </div>

                  {/* Right: Timestamp & Colored Status Badge */}
                  <div className="flex items-center gap-2.5 sm:self-start flex-shrink-0 mt-1 sm:mt-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {act.timestamp}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle} capitalize`}
                    >
                      {act.statusText}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer link */}
      <div className="pt-3 border-t border-border flex items-center justify-between text-xs mt-2">
        <span className="text-muted-foreground text-[11px]">
          Showing {filteredActivities.length} of {activities.length} recent activities
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast.info('Navigating to full audit log...')}
          className="text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:bg-amber-500/10 text-xs font-bold cursor-pointer h-7"
        >
          View Full Activity Log <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}
