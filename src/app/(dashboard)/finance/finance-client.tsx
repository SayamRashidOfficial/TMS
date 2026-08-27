'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Clock,
  Calendar,
  User,
  ArrowUpRight,
  Scissors
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface FinancePageClientProps {
  payments: any[];
  orders: any[];
  overdueOrders: any[];
  totalRevenue: number;
  totalPending: number;
  totalStaffCosts: number;
}

export default function FinancePageClient({
  payments,
  orders,
  overdueOrders,
  totalRevenue,
  totalPending,
  totalStaffCosts,
}: FinancePageClientProps) {

  // Build monthly revenue chart data from payments
  const monthlyData: Record<string, number> = {};
  payments.forEach((p) => {
    const month = new Date(p.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
    monthlyData[month] = (monthlyData[month] || 0) + Number(p.amount);
  });

  const revenueChartData = Object.entries(monthlyData)
    .map(([month, amount]) => ({ month, amount }))
    .slice(-8); // Last 8 months

  // Pie chart for payment methods distribution
  const paymentMethodData: Record<string, number> = {};
  payments.forEach((p) => {
    const method = p.payment_method?.replace('_', ' ') || 'Unknown';
    paymentMethodData[method] = (paymentMethodData[method] || 0) + Number(p.amount);
  });
  const pieData = Object.entries(paymentMethodData).map(([name, value]) => ({ name, value }));

  const COLORS = ['#f59e0b', '#8b5cf6', '#3b82f6', '#10b981'];

  // Outstanding balances from orders
  const outstandingOrders = orders
    .filter((o) => (Number(o.total_amount) - Number(o.paid_amount)) > 0)
    .sort((a, b) => (Number(b.total_amount) - Number(b.paid_amount)) - (Number(a.total_amount) - Number(a.paid_amount)));

  const netProfit = totalRevenue - totalStaffCosts;

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground border border-border p-2.5 rounded-xl shadow-xl text-xs">
          <p className="font-semibold text-muted-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="font-bold font-mono" style={{ color: entry.color || entry.fill }}>
              {entry.name || 'Amount'}: ${typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8">
      {/* Overdue Alert Banner */}
      {overdueOrders.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 shadow-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold text-xs sm:text-sm">
              {overdueOrders.length} order{overdueOrders.length > 1 ? 's' : ''} past delivery deadline!
            </p>
            <p className="text-[11px] text-red-600/80 dark:text-red-400/80 mt-0.5">
              These require immediate attention: {overdueOrders.slice(0, 3).map(o => `#${o.order_number}`).join(', ')}
              {overdueOrders.length > 3 ? ` and ${overdueOrders.length - 3} more.` : ''}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-3.5 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card text-card-foreground border-border shadow-xs rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gross Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total collected payments</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-xs rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Outstanding Due</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400 font-mono">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Balance owed by clients</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-xs rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Staff Costs</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Scissors className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">${totalStaffCosts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Paid piece-rate settlements</p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-xs rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Net Profit</span>
            <div className={`p-2 rounded-xl border ${
              netProfit >= 0
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
            }`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              ${netProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Revenue minus staff payouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <Card className="lg:col-span-2 bg-card text-card-foreground border-border shadow-xs rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold">Monthly Revenue Trend</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Payments collected across recent months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} opacity={0.4} />
                  <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Pie */}
        <Card className="bg-card text-card-foreground border-border shadow-xs rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold">Payment Methods</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Distribution by payment type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground capitalize">{value}</span>
                      )}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                  No payment data recorded yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="outstanding" className="space-y-6">
        <TabsList className="bg-secondary/70 border border-border p-1 rounded-xl">
          <TabsTrigger value="outstanding" className="rounded-lg text-xs font-semibold cursor-pointer px-4 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">
            Outstanding Balances
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg text-xs font-semibold cursor-pointer px-4 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">
            Payment History
          </TabsTrigger>
          <TabsTrigger value="overdue" className="rounded-lg text-xs font-semibold cursor-pointer px-4 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">
            Overdue Orders {overdueOrders.length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {overdueOrders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Outstanding Balances Tab */}
        <TabsContent value="outstanding">
          <Card className="bg-card text-card-foreground border-border shadow-xs overflow-hidden rounded-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="px-5 py-3">Order #</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Due Date</th>
                    <th className="px-5 py-3">Order Total</th>
                    <th className="px-5 py-3">Paid</th>
                    <th className="px-5 py-3">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {outstandingOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-muted-foreground">
                        No outstanding balances. All orders are fully settled!
                      </td>
                    </tr>
                  ) : (
                    outstandingOrders.map((ord) => {
                      const balance = Number(ord.total_amount) - Number(ord.paid_amount);
                      const isOverdue = new Date(ord.due_date) < new Date();
                      return (
                        <tr key={ord.id} className="hover:bg-secondary/40 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-amber-600 dark:text-amber-400 font-mono">#{ord.order_number}</td>
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-foreground text-xs">{ord.customers?.name}</p>
                            <p className="text-[11px] text-muted-foreground">{ord.customers?.phone}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                              <span className={`text-xs font-semibold ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {new Date(ord.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-foreground font-mono">
                            ${Number(ord.total_amount).toFixed(2)}
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                            ${Number(ord.paid_amount).toFixed(2)}
                          </td>
                          <td className="px-5 py-3.5 font-extrabold text-red-500 font-mono">
                            ${balance.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payments">
          <Card className="bg-card text-card-foreground border-border shadow-xs overflow-hidden rounded-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="px-5 py-3">Order #</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-muted-foreground">
                        No payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-amber-600 dark:text-amber-400 font-mono">
                          #{(p.orders as any)?.order_number}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-foreground text-xs">
                            {(p.orders as any)?.customers?.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {(p.orders as any)?.customers?.phone}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary border border-border text-foreground capitalize">
                            {p.payment_method?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                          ${Number(p.amount).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-[11px] text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Overdue Orders Tab */}
        <TabsContent value="overdue">
          <Card className="bg-card text-card-foreground border-border shadow-xs overflow-hidden rounded-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="px-5 py-3">Order #</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Due Date</th>
                    <th className="px-5 py-3">Days Overdue</th>
                    <th className="px-5 py-3">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {overdueOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-muted-foreground">
                        No overdue orders. Excellent delivery performance!
                      </td>
                    </tr>
                  ) : (
                    overdueOrders.map((ord) => {
                      const daysOverdue = Math.floor(
                        (new Date().getTime() - new Date(ord.due_date).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      const balance = Number(ord.total_amount) - Number(ord.paid_amount);
                      return (
                        <tr key={ord.id} className="hover:bg-red-500/10 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-amber-600 dark:text-amber-400 font-mono">#{ord.order_number}</td>
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-foreground text-xs">{ord.customers?.name}</p>
                            <p className="text-[11px] text-muted-foreground">{ord.customers?.phone}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 capitalize">
                              {ord.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-red-500 text-xs font-semibold">
                            {new Date(ord.due_date).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-extrabold text-red-500 text-xs font-mono">
                              {daysOverdue}d late
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-foreground font-mono">
                            ${balance.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
