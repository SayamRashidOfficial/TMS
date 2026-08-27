'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActionResponse } from '@/features/auth/types';

interface PlaceOrderInput {
  customerId: string;
  dueDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_wallet';
  notes: string;
  items: any[];
}

export async function placeOrderAction(data: PlaceOrderInput): Promise<ActionResponse<string>> {
  if (!data.customerId || data.items.length === 0 || !data.dueDate) {
    return { success: false, error: 'Incomplete booking details' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized user session' };
  }

  // Call the postgres transaction function (RPC)
  const { data: orderId, error } = await supabase.rpc('place_order_transaction', {
    p_customer_id: data.customerId,
    p_due_date: new Date(data.dueDate).toISOString(),
    p_subtotal: data.subtotal,
    p_discount: data.discount,
    p_tax: data.tax,
    p_total_amount: data.totalAmount,
    p_paid_amount: data.paidAmount,
    p_payment_method: data.paymentMethod,
    p_notes: data.notes,
    p_created_by: user.id,
    p_items: data.items,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/orders');
  revalidatePath('/');
  return { success: true, data: orderId };
}

export async function fetchOrdersAction(searchQuery?: string, filterStatus?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('orders')
    .select('*, customers(name, phone), order_items(*)');

  if (filterStatus && filterStatus !== 'all') {
    query = query.eq('status', filterStatus);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  // If search query exists, filter client name/phone/order numbers on client side or via SQL
  if (searchQuery && data) {
    const q = searchQuery.toLowerCase();
    return data.filter((o) =>
      o.order_number.toString().includes(q) ||
      o.customers?.name?.toLowerCase().includes(q) ||
      o.customers?.phone?.includes(q)
    );
  }

  return data || [];
}

export async function fetchOrderDetailsAction(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(*), payments(*), order_items(*, assigned_cutter:profiles!order_items_assigned_cutter_id_fkey(name), assigned_stitcher:profiles!order_items_assigned_stitcher_id_fkey(name))')
    .eq('id', orderId)
    .single();

  if (error) {
    return null;
  }
  return data;
}

export async function updateOrderStatusAction(orderId: string, status: string): Promise<ActionResponse<any>> {
  const supabase = await createClient();

  const updateData: any = { status };
  if (status === 'completed') {
    updateData.actual_delivery_date = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/orders');
  return { success: true, data };
}

export async function updateOrderItemStatusAction(
  itemId: string,
  orderId: string,
  status: string
): Promise<ActionResponse<any>> {
  const supabase = await createClient();

  const updateData: any = { status };
  const now = new Date().toISOString();
  if (status === 'cutting') {
    // start cutting
  } else if (status === 'stitching') {
    updateData.cutting_completed_at = now;
  } else if (status === 'ready_for_trial') {
    updateData.stitching_completed_at = now;
  }

  const { data: item, error: itemError } = await supabase
    .from('order_items')
    .update(updateData)
    .eq('id', itemId)
    .select()
    .single();

  if (itemError) {
    return { success: false, error: itemError.message };
  }

  // Smart workflow check: If all items in this order are ready_for_trial or ready_for_pickup or completed,
  // update the main order status to 'ready_for_trial' or 'ready_for_pickup' automatically!
  const { data: allItems } = await supabase
    .from('order_items')
    .select('status')
    .eq('order_id', orderId);

  if (allItems) {
    const statuses = allItems.map((i) => i.status);
    let targetOrderStatus = 'booked';

    if (statuses.every((s) => s === 'completed')) {
      targetOrderStatus = 'completed';
    } else if (statuses.every((s) => s === 'ready_for_pickup' || s === 'completed')) {
      targetOrderStatus = 'ready_for_pickup';
    } else if (statuses.every((s) => ['ready_for_trial', 'ready_for_pickup', 'completed'].includes(s))) {
      targetOrderStatus = 'ready_for_trial';
    } else if (statuses.some((s) => s === 'stitching')) {
      targetOrderStatus = 'in_stitching';
    } else if (statuses.some((s) => s === 'cutting')) {
      targetOrderStatus = 'in_cutting';
    }

    await supabase
      .from('orders')
      .update({ status: targetOrderStatus })
      .eq('id', orderId);
  }

  revalidatePath('/orders');
  return { success: true, data: item };
}

export async function assignTailorAction(
  itemId: string,
  taskType: 'cutter' | 'stitcher',
  tailorId: string,
  payoutAmount: number
): Promise<ActionResponse<any>> {
  const supabase = await createClient();

  const updateField = taskType === 'cutter' ? 'assigned_cutter_id' : 'assigned_stitcher_id';

  // 1. Assign tailor in order_items table
  const { data: item, error: updateError } = await supabase
    .from('order_items')
    .update({ [updateField]: tailorId })
    .eq('id', itemId)
    .select()
    .single();

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // 2. Insert payout record in staff_payouts table (piece-rate)
  const { error: payoutError } = await supabase
    .from('staff_payouts')
    .upsert({
      staff_id: tailorId,
      order_item_id: itemId,
      task_type: taskType === 'cutter' ? 'cutting' : 'stitching',
      amount: payoutAmount,
      status: 'pending',
    }, {
      onConflict: 'staff_id,order_item_id,task_type'
    });

  if (payoutError) {
    return { success: false, error: payoutError.message };
  }

  revalidatePath('/orders');
  revalidatePath('/staff');
  return { success: true, data: item };
}
