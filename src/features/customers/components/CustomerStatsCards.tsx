'use client';

import React from 'react';
import { useCustomerStore } from '@/store/useCustomerStore';
import {
  Users,
  UserPlus,
  UserCheck,
  Crown,
  ShoppingBag,
  CheckCircle2,
  DollarSign,
  Repeat,
  TrendingUp,
} from 'lucide-react';

export default function CustomerStatsCards() {
  const { customers } = useCustomerStore();

  const totalCustomers = customers.length;
  const newThisMonth = customers.filter(
    (c) => new Date(c.createdAt).getMonth() === new Date().getMonth() || c.status === 'new'
  ).length;
  const activeCustomers = customers.filter((c) => c.status === 'active' || c.status === 'vip').length;
  const vipCustomers = customers.filter((c) => c.isVip || c.category === 'vip').length;

  let totalPendingOrders = 0;
  let totalCompletedOrders = 0;
  let totalRevenue = 0;

  customers.forEach((c) => {
    totalPendingOrders += c.pendingOrders || 0;
    totalCompletedOrders += c.completedOrders || 0;
    totalRevenue += c.totalSpent || 0;
  });

  const returningCustomers = customers.filter((c) => c.totalOrders > 1).length;

  const stats = [
    {
      title: 'Total Customers',
      value: totalCustomers.toString(),
      change: '+14.2%',
      isPositive: true,
      icon: Users,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    {
      title: 'New This Month',
      value: newThisMonth.toString(),
      change: '+8.5%',
      isPositive: true,
      icon: UserPlus,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    {
      title: 'Active Clients',
      value: activeCustomers.toString(),
      change: '+5.1%',
      isPositive: true,
      icon: UserCheck,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'VIP Members',
      value: vipCustomers.toString(),
      change: '+12.0%',
      isPositive: true,
      icon: Crown,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
    {
      title: 'Pending Orders',
      value: totalPendingOrders.toString(),
      change: 'Active',
      isPositive: true,
      icon: ShoppingBag,
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    },
    {
      title: 'Completed Orders',
      value: totalCompletedOrders.toString(),
      change: 'Delivered',
      isPositive: true,
      icon: CheckCircle2,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: '+22.4%',
      isPositive: true,
      icon: DollarSign,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    {
      title: 'Returning Rate',
      value: totalCustomers ? `${Math.round((returningCustomers / totalCustomers) * 100)}%` : '0%',
      change: 'Retention',
      isPositive: true,
      icon: Repeat,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-card text-card-foreground border border-border shadow-xs hover:border-amber-500/40 transition-all duration-200 group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">{stat.title}</span>
              <div className={`p-2 rounded-xl border ${stat.color} shadow-xs`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline justify-between gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-foreground group-hover:text-amber-500 transition-colors font-mono">
                {stat.value}
              </span>
              <span className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                {stat.change}
              </span>
            </div>

            {/* Sparkline Simulation */}
            <div className="mt-2.5 flex items-end gap-1 h-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="flex-1 bg-secondary rounded-t h-[40%] group-hover:bg-amber-500/40 transition-all" />
              <div className="flex-1 bg-secondary rounded-t h-[65%] group-hover:bg-amber-500/60 transition-all" />
              <div className="flex-1 bg-secondary rounded-t h-[30%] group-hover:bg-amber-500/30 transition-all" />
              <div className="flex-1 bg-secondary rounded-t h-[80%] group-hover:bg-amber-500/80 transition-all" />
              <div className="flex-1 bg-secondary rounded-t h-[100%] group-hover:bg-amber-500 transition-all" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
