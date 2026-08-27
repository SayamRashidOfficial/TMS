'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { fabricSchema, type FabricInput } from '../schemas';
import type { ActionResponse } from '@/features/auth/types';

export async function fetchFabricsAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inventory_fabrics')
    .select('*')
    .order('code', { ascending: true });

  if (error) {
    return [];
  }
  return data;
}

export async function createFabricAction(data: FabricInput): Promise<ActionResponse<any>> {
  const result = fabricSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: 'Validation failed' };
  }

  const supabase = await createClient();

  const { data: fabric, error } = await supabase
    .from('inventory_fabrics')
    .insert(data)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'A fabric with this SKU code already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/inventory');
  return { success: true, data: fabric };
}

export async function updateFabricAction(id: string, data: FabricInput): Promise<ActionResponse<any>> {
  const result = fabricSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: 'Validation failed' };
  }

  const supabase = await createClient();

  const { data: fabric, error } = await supabase
    .from('inventory_fabrics')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/inventory');
  return { success: true, data: fabric };
}

export async function addStockAction(id: string, additionalMeters: number): Promise<ActionResponse<any>> {
  if (additionalMeters <= 0) {
    return { success: false, error: 'Meters added must be positive value' };
  }

  const supabase = await createClient();

  // Fetch current quantity
  const { data: existing, error: fetchError } = await supabase
    .from('inventory_fabrics')
    .select('quantity_meters')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return { success: false, error: 'Fabric record not found' };
  }

  const newQty = Number(existing.quantity_meters) + additionalMeters;

  const { data: fabric, error } = await supabase
    .from('inventory_fabrics')
    .update({ quantity_meters: newQty })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/inventory');
  return { success: true, data: fabric };
}
