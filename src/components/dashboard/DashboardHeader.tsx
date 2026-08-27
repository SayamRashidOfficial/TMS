'use client';

import React, { useState } from 'react';
import { Calendar, Bell, Scissors, Menu, Clock, CheckCircle2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  onMenuClick?: () => void;
}

export default function DashboardHeader({
  title = 'Dashboard',
  subtitle = "Here's what's happening today.",
  userName = 'Alexander Wright',
  userRole = 'Master Tailor',
  onMenuClick,
}: DashboardHeaderProps) {
  const [hasUnread, setHasUnread] = useState(true);

  const todayDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const handleMarkAllRead = () => {
    setHasUnread(false);
    toast.success('All notifications marked as read');
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-3.5 bg-background/85 backdrop-blur-xl border-b border-border transition-colors duration-200">
      
      {/* Mobile Top Row (Hamburger + Brand Logo + Theme Switcher) */}
      <div className="flex items-center justify-between gap-2 lg:hidden w-full">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-9 w-9 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Scissors className="w-4 h-4 -rotate-45" />
            </div>
            <span className="font-extrabold text-sm tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-200 dark:to-stone-100 bg-clip-text text-transparent">
              HUZAIFA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Page Title & Subtitle */}
      <div className="hidden lg:block">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">
            {title}
          </h1>
          {title === 'Dashboard Overview' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 max-w-xl truncate">
          {subtitle}
        </p>
      </div>

      {/* Right Controls: Search, Date, Theme Switcher, Notifications */}
      <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
        
        {/* Quick Search */}
        <div className="relative group flex-1 sm:w-60 md:w-56 lg:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search orders, clients..." 
            className="w-full h-9 pl-9 pr-9 rounded-xl bg-card/60 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all placeholder:text-muted-foreground text-foreground shadow-xs"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center">
            <kbd className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono text-muted-foreground border border-border">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Date Display Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/60 border border-border text-xs font-semibold text-muted-foreground shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="whitespace-nowrap">{todayDateFormatted}</span>
        </div>

        {/* Theme Toggle (Desktop) */}
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>

        {/* Notification Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="relative rounded-xl border border-border bg-card/60 hover:bg-secondary transition-all cursor-pointer shadow-xs h-9 w-9 flex items-center justify-center flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-card animate-pulse" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 shadow-2xl border-border bg-popover/95 backdrop-blur-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center justify-between font-bold text-xs uppercase tracking-wider text-muted-foreground px-2 py-1.5">
                <span>Notifications</span>
                {hasUnread && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-amber-500 hover:text-amber-400 text-[11px] font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <div className="space-y-1 py-1 max-h-64 overflow-y-auto custom-scrollbar">
                <div className="p-2.5 rounded-xl hover:bg-secondary/70 transition-colors cursor-pointer text-xs group">
                  <p className="font-semibold text-foreground group-hover:text-amber-500 transition-colors">
                    New Order #TMS-1089 Placed
                  </p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Lord Harrington • 2 3-Piece Tuxedos
                  </p>
                  <span className="text-[10px] text-amber-500/80 font-medium mt-1 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> 10 mins ago
                  </span>
                </div>
                <div className="p-2.5 rounded-xl hover:bg-secondary/70 transition-colors cursor-pointer text-xs group">
                  <p className="font-semibold text-foreground group-hover:text-amber-500 transition-colors">
                    Fitting Ready for Order #TMS-1078
                  </p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Quality check passed • Client notified
                  </p>
                  <span className="text-[10px] text-emerald-500/80 font-medium mt-1 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> 1 hour ago
                  </span>
                </div>
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
