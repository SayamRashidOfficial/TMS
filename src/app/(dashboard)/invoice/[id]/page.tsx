import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import InvoicePrint from './invoice-print';

export const metadata = {
  title: 'Invoice - Huzaifa',
};

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, customers(*), payments(*), order_items(*)')
    .eq('id', id)
    .single();

  if (error || !order) {
    notFound();
  }

  return <InvoicePrint order={order} />;
}
