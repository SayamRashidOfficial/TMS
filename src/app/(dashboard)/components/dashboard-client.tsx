'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Scissors,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus,
  Compass,
  Trophy,
  Clock,
  Package,
  CheckCircle2,
  Truck,
  CalendarDays,
  UserPlus,
  DollarSign,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardError from './dashboard-error';
import { AdminDashboardSkeleton, TailorDashboardSkeleton } from './dashboard-skeleton';
import StatsGrid from '@/components/dashboard/StatsGrid';
import DashboardAnalyticsGrid from '@/components/dashboard/DashboardAnalyticsGrid';
import RecentActivityPanel from '@/components/dashboard/RecentActivityPanel';
import QuickActionsGrid from '@/components/dashboard/QuickActionsGrid';
import type { DashboardData, StatCardData, RecentActivityItem, QuickActionItem } from '@/types/dashboard';

interface DashboardClientProps {
  role: string;
  name: string;
}

const AUTO_REFRESH_INTERVAL_MS = 30_000; // 30 seconds

export default function DashboardClient({ role, name }: DashboardClientProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDashboardData = useCallback(async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/dashboard/stats', { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Unknown error');
      setData(json.data as DashboardData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + set up auto-refresh interval
  useEffect(() => {
    fetchDashboardData(true);

    intervalRef.current = setInterval(() => {
      fetchDashboardData(false);
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchDashboardData]);

  const handleRetry = () => fetchDashboardData(true);

  const isAdminOrSales = role === 'admin' || role === 'sales';

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return isAdminOrSales ? <AdminDashboardSkeleton /> : <TailorDashboardSkeleton />;
  }

  // ── Error state ────────────────────────────────────────────────
  if (error) {
    return <DashboardError message={error} onRetry={handleRetry} />;
  }

  if (!data) return null;

  const { stats, recentOrders, assignedTasks, revenueChart, volumeChart } = data;

  // ── Overview Stat Cards Data ─────────────────────────────────────
  const overviewStats: StatCardData[] = [
    {
      id: '1',
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      description: 'All time customer bookings',
      iconName: 'ShoppingBag',
      accentColor: 'indigo',
    },
    {
      id: '2',
      title: 'Pending',
      value: stats.pendingOrders.toString(),
      description: 'Draft & booked in queue',
      iconName: 'Clock',
      accentColor: 'amber',
    },
    {
      id: '3',
      title: 'In Progress',
      value: stats.inProgressOrders.toString(),
      description: 'Cutting & stitching line',
      iconName: 'Scissors',
      accentColor: 'blue',
    },
    {
      id: '4',
      title: 'Ready for Pickup',
      value: stats.readyForPickupOrders.toString(),
      description: 'Fitting done & awaiting collection',
      iconName: 'Sparkles',
      accentColor: 'violet',
    },
    {
      id: '5',
      title: 'Delivered',
      value: stats.deliveredOrders.toString(),
      description: 'Fulfilled orders to clients',
      iconName: 'Truck',
      accentColor: 'emerald',
    },
    {
      id: '6',
      title: "Today's Revenue",
      value: `$${stats.todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      description: 'Payments received today',
      iconName: 'DollarSign',
      accentColor: 'teal',
    },
    {
      id: '7',
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      description: "This month's gross receipts",
      iconName: 'TrendingUp',
      accentColor: 'rose',
    },
    {
      id: '8',
      title: 'New Customers',
      value: stats.newCustomers.toString(),
      description: 'Registered this month',
      iconName: 'Users',
      accentColor: 'sky',
    },
  ];

  const quickActions: QuickActionItem[] = [
    {
      id: 'qa1',
      title: 'Add New Order',
      description: 'Book a bespoke tailoring order with itemized styling.',
      iconName: 'PlusCircle',
      href: '/orders?new=true',
      colorVariant: 'amber',
    },
    {
      id: 'qa2',
      title: 'Customer Directory',
      description: 'Manage client sizing records and profiles.',
      iconName: 'Users',
      href: '/customers',
      colorVariant: 'indigo',
    },
    {
      id: 'qa3',
      title: 'Inventory Catalog',
      description: 'Monitor fabric yardage and material thresholds.',
      iconName: 'FileText',
      href: '/inventory',
      colorVariant: 'emerald',
    },
    {
      id: 'qa4',
      title: 'Staff Payouts',
      description: 'Manage piece-rate disbursements and accounts.',
      iconName: 'Ruler',
      href: '/staff',
      colorVariant: 'violet',
    },
  ];

  // Map recent orders to the Activity format
  const recentActivities: RecentActivityItem[] = recentOrders.slice(0, 6).map((ord) => {
    let statusVariant: 'success' | 'warning' | 'info' | 'purple' | 'neutral' = 'neutral';
    if (ord.status === 'completed') statusVariant = 'success';
    else if (ord.status === 'ready_for_pickup') statusVariant = 'purple';
    else if (ord.status === 'in_progress') statusVariant = 'info';
    else if (ord.status === 'pending' || ord.status === 'draft') statusVariant = 'warning';

    return {
      id: ord.id,
      title: `Order #${ord.order_number} ${ord.status.replace(/_/g, ' ')}`,
      description: `Client: ${ord.customer_name} • Total: $${Number(ord.total_amount).toFixed(2)}`,
      timestamp: new Date(ord.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      category: 'order',
      statusText: ord.status.replace(/_/g, ' '),
      statusVariant,
      orderNumber: ord.order_number.toString(),
    };
  });

  // ── Admin / Sales Dashboard ────────────────────────────────────
  if (isAdminOrSales) {
    return (
      <div className="space-y-6 pb-10 animate-in fade-in duration-300">
        <StatsGrid stats={overviewStats} />

        <DashboardAnalyticsGrid
          config={{
            revenueChartTitle: "Revenue Overview",
            revenueChartSubtitle: "Gross atelier receipts across timeframes",
            statusChartTitle: "Order Status Breakdown",
            statusChartSubtitle: "Current workflow volume distribution"
          }}
          stats={stats}
          revenueData={revenueChart}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivityPanel activities={recentActivities} />
          </div>
          <div>
            <QuickActionsGrid actions={quickActions} />
          </div>
        </div>
      </div>
    );
  }

  // ── Tailor (Cutter or Stitcher) Workspace ─────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      {/* Production KPI Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card text-card-foreground shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Assigned Tasks
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground font-mono">
              {assignedTasks.length}
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Pending garments in station queue</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card text-card-foreground shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Completed Tasks
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Trophy className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground font-mono">
              {stats.deliveredOrders}
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Finished garments this month</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card text-card-foreground shadow-xs flex items-center justify-center p-4">
          <Link href="/orders" className="w-full">
            <Button className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10 text-xs">
              Go to Production Queue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Active Work Queue Table */}
      <Card className="border-border bg-card text-card-foreground shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base font-bold tracking-tight">
            Your Active Queue
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Work order items assigned to your tailoring station
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="px-5 py-3">Order No</th>
                  <th className="px-5 py-3">Garment Type</th>
                  <th className="px-5 py-3">Fabric Source</th>
                  <th className="px-5 py-3">Target Due</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {!assignedTasks.length ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted-foreground font-medium">
                      No active tasks currently assigned. Excellent work!
                    </td>
                  </tr>
                ) : (
                  assignedTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-amber-500 font-mono">
                        #{task.order_number}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-foreground">
                        {task.garment_type}
                      </td>
                      <td className="px-5 py-3.5 font-medium capitalize text-muted-foreground">
                        {task.fabric_source.replace(/_/g, ' ')}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-muted-foreground">
                        {new Date(task.due_date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 capitalize">
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
