'use client';

import React from 'react';
import { useCustomerStore } from '@/store/useCustomerStore';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Users } from 'lucide-react';

export default function CustomerAnalyticsView() {
  const { customers } = useCustomerStore();

  const monthlyNewCustomersData = [
    { month: 'Jan', newCustomers: 12, vipAdded: 3 },
    { month: 'Feb', newCustomers: 18, vipAdded: 5 },
    { month: 'Mar', newCustomers: 24, vipAdded: 4 },
    { month: 'Apr', newCustomers: 22, vipAdded: 6 },
    { month: 'May', newCustomers: 30, vipAdded: 8 },
    { month: 'Jun', newCustomers: 35, vipAdded: 11 },
    { month: 'Jul', newCustomers: 42, vipAdded: 14 },
  ];

  const revenuePerCustomerData = [
    { name: 'Sha Sheikh Tariq', totalSpent: 485000 },
    { name: 'Salman Hashmi', totalSpent: 720000 },
    { name: 'Ayesha Malik', totalSpent: 340000 },
    { name: 'Hamza Bilal', totalSpent: 168000 },
    { name: 'Zayn Raza', totalSpent: 85000 },
  ];

  const customerRetentionData = [
    { name: 'Returning Clients', value: customers.filter((c) => c.totalOrders > 1).length || 4, color: '#f59e0b' },
    { name: 'One-Time Clients', value: customers.filter((c) => c.totalOrders <= 1).length || 1, color: '#3b82f6' },
  ];

  const categoryDistributionData = [
    { category: 'Regular Clients', count: customers.filter((c) => c.category === 'regular').length || 3 },
    { category: 'VIP Members', count: customers.filter((c) => c.category === 'vip' || c.isVip).length || 3 },
    { category: 'Corporate', count: customers.filter((c) => c.category === 'corporate').length || 2 },
  ];

  const orderValueTrendsData = [
    { month: 'Jan', avgOrderValue: 42000, totalOrders: 15 },
    { month: 'Feb', avgOrderValue: 48000, totalOrders: 22 },
    { month: 'Mar', avgOrderValue: 55000, totalOrders: 28 },
    { month: 'Apr', avgOrderValue: 51000, totalOrders: 26 },
    { month: 'May', avgOrderValue: 62000, totalOrders: 34 },
    { month: 'Jun', avgOrderValue: 68000, totalOrders: 40 },
    { month: 'Jul', avgOrderValue: 74000, totalOrders: 48 },
  ];

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground border border-border p-2.5 rounded-xl shadow-xl text-xs">
          <p className="font-semibold text-muted-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="font-bold font-mono" style={{ color: entry.color || entry.fill }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            Customer Analytics & Atelier Intelligence
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visual metrics for client growth, revenue distribution, VIP membership, and average order value.
          </p>
        </div>
      </div>

      {/* Grid Row 1: Monthly Growth & Revenue per Customer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Chart 1: Monthly New Customers */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Monthly New Client Registration & VIP Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyNewCustomersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} opacity={0.4} />
                <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="newCustomers" name="New Clients" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vipAdded" name="VIP Upgrades" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Revenue per Customer */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Top Revenue Contributing Clients ($)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenuePerCustomerData}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} opacity={0.4} />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(' ')[0]} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip content={<CustomChartTooltip />} />
                <Area type="monotone" dataKey="totalSpent" name="Total Spent ($)" stroke="#f59e0b" strokeWidth={2.5} fill="url(#colorSpent)" fillOpacity={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Retention Donut & Category Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Chart 3: Retention Donut */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Returning Client Ratio</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerRetentionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {customerRetentionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Customer Categories */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Client Category Split</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" horizontal={false} opacity={0.4} />
                <XAxis type="number" stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="category" type="category" stroke="currentColor" className="text-muted-foreground" fontSize={10} width={90} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="count" name="Count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Average Order Value Trends */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Avg Order Value (AOV)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={orderValueTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} opacity={0.4} />
                <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip content={<CustomChartTooltip />} />
                <Line type="monotone" dataKey="avgOrderValue" name="AOV ($)" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
