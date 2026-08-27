'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';
import { signOutAction } from '@/features/auth/actions';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import {
  LayoutDashboard,
  Users,
  Scissors,
  Box,
  UserCheck,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface LayoutClientProps {
  children: React.ReactNode;
  profile: {
    id: string;
    name: string;
    phone: string | null;
    role: 'admin' | 'sales' | 'cutter' | 'stitcher' | 'customer';
  };
}

export default function DashboardLayoutClient({ children, profile }: LayoutClientProps) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  let pageTitle = 'Dashboard Overview';
  let pageSubtitle = "Real-time overview of your atelier's orders, revenue, and production pipeline.";

  if (pathname.startsWith('/customers')) {
    pageTitle = 'Customer Directory';
    pageSubtitle = 'Manage your client database profiles, styling notes, and versioned sizing records.';
  } else if (pathname.startsWith('/orders')) {
    pageTitle = 'Orders & Workflow';
    pageSubtitle = 'Track, assign, and manage the full tailoring production pipeline.';
  } else if (pathname.startsWith('/inventory')) {
    pageTitle = 'Inventory & Fabrics';
    pageSubtitle = 'Catalog and track active stocks of tailoring fabrics, warning thresholds, and unit pricing.';
  } else if (pathname.startsWith('/staff')) {
    pageTitle = 'Staff & Payouts';
    pageSubtitle = 'Manage your atelier workforce, job allocations, and piece-rate payments.';
  } else if (pathname.startsWith('/finance')) {
    pageTitle = 'Financial Reports';
    pageSubtitle = 'Revenue tracking, outstanding balances, and atelier profitability insights.';
  }

  const handleLogout = async () => {
    try {
      const response = await signOutAction();
      if (response && response.success) {
        toast.success('Logged out successfully');
        window.location.href = '/login';
      } else {
        toast.error(response?.error || 'Failed to log out');
      }
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  // Nav item sections configuration
  const navSections = [
    {
      label: 'MAIN MENU',
      items: [
        {
          name: 'Dashboard',
          href: '/',
          icon: LayoutDashboard,
          roles: ['admin', 'sales', 'cutter', 'stitcher', 'customer'],
        },
        {
          name: 'Orders & Queue',
          href: '/orders',
          icon: ShoppingBag,
          roles: ['admin', 'sales', 'cutter', 'stitcher', 'customer'],
        },
      ],
    },
    {
      label: 'MANAGEMENT',
      items: [
        {
          name: 'Customers',
          href: '/customers',
          icon: Users,
          roles: ['admin', 'sales'],
        },
        {
          name: 'Inventory & Materials',
          href: '/inventory',
          icon: Box,
          roles: ['admin', 'sales'],
        },
        {
          name: 'Staff & Payouts',
          href: '/staff',
          icon: UserCheck,
          roles: ['admin', 'sales'],
        },
      ],
    },
    {
      label: 'FINANCIALS',
      items: [
        {
          name: 'Financial Reports',
          href: '/finance',
          icon: TrendingUp,
          roles: ['admin'],
        },
      ],
    },
  ];

  const userInitials = profile.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div className="space-y-6 px-3 py-4">
      {navSections.map((section, idx) => {
        const filteredItems = section.items.filter((item) =>
          item.roles.includes(profile.role)
        );

        if (filteredItems.length === 0) return null;

        return (
          <div key={idx} className="space-y-1.5">
            {sidebarOpen && (
              <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
                {section.label}
              </p>
            )}
            <nav className="space-y-1">
              {filteredItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClick}
                    title={!sidebarOpen ? item.name : undefined}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-l-2 border-amber-500 font-bold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                    } ${!sidebarOpen ? 'justify-center px-2' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-transform ${
                        isActive
                          ? 'text-amber-500 scale-110'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    />
                    <span className={`${sidebarOpen ? 'block' : 'lg:hidden'} truncate`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      {/* 1. Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border bg-sidebar transition-all duration-300 select-none ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex-shrink-0 shadow-xs">
              <Scissors className="w-4 h-4 -rotate-45" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-sm tracking-widest bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 dark:from-amber-200 dark:to-stone-100 bg-clip-text text-transparent">
                  HUZAIFA
                </span>
                <span className="text-[9px] font-bold text-muted-foreground tracking-wider uppercase mt-0.5">
                  Atelier & Bespoke
                </span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <NavLinks />
        </div>

        {/* User Card & Logout in Footer */}
        <div className="p-3 border-t border-border bg-sidebar/50">
          {sidebarOpen ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-card/60 border border-border">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-xs">
                    <AvatarFallback className="font-extrabold text-xs bg-transparent text-stone-950">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate leading-tight">
                    {profile.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold capitalize truncate mt-0.5">
                    {profile.role}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Log out"
                className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer flex-shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-xs">
                <AvatarFallback className="font-extrabold text-xs bg-transparent text-stone-950">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Log out"
                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Global Top Navigation */}
        <DashboardHeader
          title={pageTitle}
          subtitle={pageSubtitle}
          userName={profile.name}
          userRole={profile.role}
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Mobile Navigation Drawer */}
        <div
          className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
            mobileOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
              mobileOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer panel */}
          <div
            className={`absolute top-0 bottom-0 left-0 w-72 bg-sidebar border-r border-border flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <Scissors className="w-4 h-4 -rotate-45" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-extrabold text-sm tracking-widest bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-200 dark:to-stone-100 bg-clip-text text-transparent">
                    HUZAIFA
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground tracking-wider uppercase mt-0.5">
                    Atelier & Bespoke
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <NavLinks onClick={() => setMobileOpen(false)} />
            </div>
            <div className="p-4 border-t border-border bg-sidebar/50">
              <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950">
                    <AvatarFallback className="font-extrabold text-xs bg-transparent text-stone-950">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {profile.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-semibold capitalize">
                      {profile.role}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Page Content Area */}
        <main
          className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-6 relative custom-scrollbar"
          id="dashboard-main-scroll"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
