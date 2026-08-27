'use client';

import React, { useState } from 'react';
import { BarChart3, PieChart, RefreshCw, Layers } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardStats, RevenueChartData, AnalyticsPlaceholderConfig } from '@/types/dashboard';

interface DashboardAnalyticsGridProps {
  config: AnalyticsPlaceholderConfig;
  stats: DashboardStats;
  revenueData: RevenueChartData;
}

export default function DashboardAnalyticsGrid({ config, stats, revenueData }: DashboardAnalyticsGridProps) {
  const [revenueTimeframe, setRevenueTimeframe] = useState<'7d' | '30d' | '6m' | '1y'>('6m');

  const chartData = revenueData[revenueTimeframe] || [];

  const orderStatusData = [
    { name: 'Pending', value: stats.pendingOrders, color: '#f59e0b' }, // amber-500
    { name: 'In Progress', value: stats.inProgressOrders, color: '#3b82f6' }, // blue-500
    { name: 'Ready for Pickup', value: stats.readyForPickupOrders, color: '#8b5cf6' }, // violet-500
    { name: 'Delivered', value: stats.deliveredOrders, color: '#10b981' }, // emerald-500
  ].filter(item => item.value > 0);

  const totalWorkflowItems = stats.pendingOrders + stats.inProgressOrders + stats.readyForPickupOrders + stats.deliveredOrders;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground border border-border p-3 rounded-xl shadow-xl">
          <p className="text-xs text-muted-foreground font-semibold mb-1">{label}</p>
          <p className="text-amber-500 font-extrabold text-sm font-mono">
            ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover text-popover-foreground border border-border p-2.5 rounded-xl shadow-xl flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="text-xs text-muted-foreground font-semibold">{data.name}:</span>
          <span className="text-xs font-bold text-foreground font-mono">{data.value} orders</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
          Dashboard Analytics
        </h2>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live System Data
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Revenue Area Chart */}
        <div className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
            <div>
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                {config.revenueChartTitle}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {config.revenueChartSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto border border-border">
              {(['7d', '30d', '6m', '1y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setRevenueTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer uppercase text-[11px] font-bold ${
                    revenueTimeframe === tf
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="my-5 h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} opacity={0.4} />
                <XAxis dataKey="label" stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border mt-auto font-medium">
            <span>Resolution: {['7d', '30d'].includes(revenueTimeframe) ? 'Daily' : 'Monthly'} aggregation</span>
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-amber-500 animate-spin-slow" /> Auto-sync enabled
            </span>
          </div>
        </div>

        {/* Card 2: Order Status Pie Chart */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-500" />
                {config.statusChartTitle}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {config.statusChartSubtitle}
              </p>
            </div>
          </div>

          <div className="my-5 h-[210px] w-full flex flex-col items-center justify-center relative">
            {orderStatusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                
                {/* Center text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-foreground font-mono leading-none">{totalWorkflowItems}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Active</span>
                </div>
              </>
            ) : (
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-secondary text-muted-foreground">
                  <Layers className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground">No active orders</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold pt-3 border-t border-border mt-auto">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-muted-foreground truncate">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} /> 
                <span className="truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
