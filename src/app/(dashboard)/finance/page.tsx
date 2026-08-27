import React from 'react';
import { createClient } from '@/lib/supabase/server';
import FinancePageClient from './finance-client';

export const metadata = {
  title: 'Financial Reports - Huzaifa',
  description: 'Revenue analytics, outstanding balances, and financial summary reports.',
};

export default async function FinancePage() {
  const supabase = await createClient();

  // Fetch payments with order and customer details
  const { data: payments } = await supabase
    .from('payments')
    .select('*, orders(order_number, total_amount, paid_amount, status, due_date, customers(name, phone))')
    .order('created_at', { ascending: false });

  // Fetch all orders for outstanding balance calculation
  const { data: orders } = await supabase
    .from('orders')
    .select('*, customers(name, phone)')
    .not('status', 'in', '("cancelled")')
    .order('due_date', { ascending: true });

  // Fetch all payouts for staff expense summary
  const { data: payouts } = await supabase
    .from('staff_payouts')
    .select('amount, status, task_type, created_at');

  // Calculate aggregate financials
  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const totalPending = orders?.reduce((sum, o) => {
    const balance = Number(o.total_amount) - Number(o.paid_amount);
    return balance > 0 ? sum + balance : sum;
  }, 0) || 0;

  const totalStaffCosts = payouts?.filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const overdueOrders = orders?.filter((o) => {
    const dueDate = new Date(o.due_date);
    const today = new Date();
    return dueDate < today && !['completed', 'cancelled', 'ready_for_pickup'].includes(o.status);
  }) || [];

  return (
    <FinancePageClient
      payments={payments || []}
      orders={orders || []}
      overdueOrders={overdueOrders}
      totalRevenue={totalRevenue}
      totalPending={totalPending}
      totalStaffCosts={totalStaffCosts}
    />
  );
}
