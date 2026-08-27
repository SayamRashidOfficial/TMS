import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { fetchOrdersAction } from '@/features/orders/actions';
import { fetchCustomersAction, fetchMeasurementTemplatesAction } from '@/features/customers/actions';
import { fetchFabricsAction } from '@/features/inventory/actions';
import OrdersPageClient from './orders-client';

export const metadata = {
  title: 'Orders - Huzaifa',
  description: 'Book and track all active tailoring orders and garment workflows.',
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Fetch all data server-side
  const [orders, customersRes, fabrics, templates, staffList] = await Promise.all([
    fetchOrdersAction(),
    fetchCustomersAction(1, 200),
    fetchFabricsAction(),
    fetchMeasurementTemplatesAction(),
    supabase.from('profiles')
      .select('id, name, role')
      .in('role', ['cutter', 'stitcher'])
      .eq('is_active', true)
      .then(({ data }) => data || []),
  ]);

  const formattedTemplates = templates.map((t) => ({
    id: t.id,
    name: t.name,
    fields: Array.isArray(t.fields) ? t.fields : [],
  }));

  return (
    <OrdersPageClient
      orders={orders}
      customers={customersRes.data || []}
      fabrics={fabrics}
      templates={formattedTemplates}
      staff={staffList}
      currentRole={profile?.role || 'sales'}
    />
  );
}
