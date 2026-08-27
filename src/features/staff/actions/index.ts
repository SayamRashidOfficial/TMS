'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import type { ActionResponse } from '@/features/auth/types';

export async function fetchStaffAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'sales', 'cutter', 'stitcher'])
    .order('name', { ascending: true });

  if (error) return [];
  return data;
}

export async function fetchStaffPayoutsAction(staffId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('staff_payouts')
    .select('*, profiles(name, role), order_items(garment_type, order_id, orders(order_number))')
    .order('created_at', { ascending: false });

  if (staffId) {
    query = query.eq('staff_id', staffId);
  }

  const { data, error } = await query;
  if (error) return [];
  return data;
}

export async function markPayoutPaidAction(
  payoutId: string
): Promise<ActionResponse<any>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('staff_payouts')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', payoutId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/staff');
  return { success: true, data };
}

export async function markBulkPayoutsPaidAction(
  payoutIds: string[]
): Promise<ActionResponse<{ count: number }>> {
  if (!payoutIds.length) {
    return { success: false, error: 'No payout IDs selected' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('staff_payouts')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .in('id', payoutIds)
    .select();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/staff');
  return { success: true, data: { count: data?.length || 0 } };
}

export async function createStaffAccountAction(
  name: string,
  email: string,
  password: string,
  role: 'cutter' | 'stitcher' | 'sales' | 'admin',
  phone?: string
): Promise<ActionResponse<any>> {
  // auth.admin.createUser requires the service role key — use the admin client
  const adminClient = createAdminClient();

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role,
    },
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  // Update profiles table with extra fields (use regular client — RLS applies here)
  if (phone && authData.user) {
    const supabase = await createClient();
    await supabase
      .from('profiles')
      .update({ phone })
      .eq('id', authData.user.id);
  }

  revalidatePath('/staff');
  return { success: true, data: authData.user };
}

export async function toggleStaffActiveAction(
  staffId: string,
  isActive: boolean
): Promise<ActionResponse<any>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', staffId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/staff');
  return { success: true, data };
}
