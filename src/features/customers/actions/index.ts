'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { 
  customerSchema, 
  customerAddressSchema,
  customerPreferenceSchema,
  customerNoteSchema,
  type CustomerInput,
  type CustomerAddressInput,
  type CustomerPreferenceInput,
  type CustomerNoteInput
} from '../schemas';
import type { ActionResponse } from '@/features/auth/types';

type AllowedRoles = 'admin' | 'manager' | 'receptionist' | 'tailor' | 'sales' | 'cutter' | 'stitcher';

async function requireAuth(allowedRoles?: AllowedRoles[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    throw new Error('Profile not found');
  }

  if (allowedRoles && !allowedRoles.includes(profile.role as AllowedRoles)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return { user, profile, supabase };
}

async function logActivity(
  supabase: any,
  customer_id: string,
  actor_id: string,
  action_type: string,
  description: string,
  metadata?: any
) {
  await supabase.from('customer_activity_logs').insert({
    customer_id,
    actor_id,
    action_type,
    description,
    metadata
  });
}

// ------------------------------------------------------------------
// CUSTOMERS
// ------------------------------------------------------------------

// Helper to gracefully handle schema mismatches without crashing
async function executeWithSchemaFallback(
  queryFn: (payload: any) => Promise<any>,
  initialPayload: any,
  maxRetries = 15
) {
  const currentPayload = { ...initialPayload };
  
  for (let i = 0; i < maxRetries; i++) {
    const { data, error } = await queryFn(currentPayload);
    
    // If we hit a schema cache missing column error, strip that column and retry
    if (error && error.message && error.message.includes('in the schema cache')) {
      const match = error.message.match(/Could not find the '([^']+)' column/);
      if (match && match[1]) {
        const missingColumn = match[1];
        console.warn(`[Schema Fallback] Column '${missingColumn}' missing in DB. Removing from payload.`);
        delete currentPayload[missingColumn];
        continue;
      }
    }
    
    return { data, error };
  }
  return await queryFn(currentPayload);
}

export async function createCustomerAction(data: CustomerInput): Promise<ActionResponse<any>> {
  try {
    const { profile, supabase } = await requireAuth(['admin', 'manager', 'receptionist', 'sales']);
    const result = customerSchema.safeParse(data);
    
    if (!result.success) {
      return { success: false, error: 'Validation failed' };
    }

    // Filter out empty string/null values for optional fields to avoid schema cache missing column errors
    const cleanedData = Object.fromEntries(
      Object.entries(result.data).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    ) as Record<string, any>;

    // Ensure we cover both 'name' and 'full_name' depending on what the user's DB schema uses
    if (cleanedData.full_name) cleanedData.name = cleanedData.full_name;
    if (cleanedData.phone) cleanedData.mobile = cleanedData.phone;

    const { data: customer, error } = await executeWithSchemaFallback(
      (payload) => supabase.from('customers').insert(payload).select().single(),
      { ...cleanedData, created_by: profile.id }
    );

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'A customer with this phone number already exists' };
      }
      return { success: false, error: error.message };
    }

    await logActivity(supabase, customer.id, profile.id, 'created', 'Customer profile created');

    revalidatePath('/customers');
    return { success: true, data: customer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCustomerAction(id: string, data: CustomerInput): Promise<ActionResponse<any>> {
  try {
    const { profile, supabase } = await requireAuth(['admin', 'manager', 'receptionist', 'sales']);
    const result = customerSchema.safeParse(data);
    
    if (!result.success) {
      return { success: false, error: 'Validation failed' };
    }

    const cleanedData = Object.fromEntries(
      Object.entries(result.data).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    ) as Record<string, any>;

    if (cleanedData.full_name) cleanedData.name = cleanedData.full_name;
    if (cleanedData.phone) cleanedData.mobile = cleanedData.phone;

    const { data: customer, error } = await executeWithSchemaFallback(
      (payload) => supabase.from('customers').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
      cleanedData
    );

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'A customer with this phone number already exists' };
      }
      return { success: false, error: error.message };
    }

    await logActivity(supabase, id, profile.id, 'updated', 'Customer profile updated');

    revalidatePath('/customers');
    return { success: true, data: customer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionResponse<any>> {
  try {
    const { profile, supabase } = await requireAuth(['admin', 'manager']); // Only higher roles can delete
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/customers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchCustomersAction(
  page: number = 1,
  limit: number = 10,
  search?: string,
  filters?: { gender?: string; city?: string; is_vip?: boolean; status?: string }
) {
  const supabase = await createClient();
  let query = supabase.from('customers').select('*', { count: 'exact' });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  if (filters?.gender) query = query.eq('gender', filters.gender);
  if (filters?.is_vip !== undefined) query = query.eq('is_vip', filters.is_vip);
  if (filters?.status) query = query.eq('status', filters.status);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return { data: [], count: 0 };
  return { data, count };
}

// ------------------------------------------------------------------
// ADDRESSES
// ------------------------------------------------------------------

export async function createAddressAction(data: CustomerAddressInput): Promise<ActionResponse<any>> {
  try {
    const { profile, supabase } = await requireAuth(['admin', 'manager', 'receptionist', 'sales']);
    const result = customerAddressSchema.safeParse(data);
    if (!result.success) return { success: false, error: 'Validation failed' };

    const { data: address, error } = await supabase
      .from('customer_addresses')
      .insert(result.data)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await logActivity(supabase, result.data.customer_id, profile.id, 'updated', 'Added new address');
    revalidatePath('/customers');
    return { success: true, data: address };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ------------------------------------------------------------------
// PREFERENCES
// ------------------------------------------------------------------

export async function updatePreferencesAction(data: CustomerPreferenceInput): Promise<ActionResponse<any>> {
  try {
    const { profile, supabase } = await requireAuth(['admin', 'manager', 'receptionist', 'sales']);
    const result = customerPreferenceSchema.safeParse(data);
    if (!result.success) return { success: false, error: 'Validation failed' };

    const { data: pref, error } = await supabase
      .from('customer_preferences')
      .upsert(result.data, { onConflict: 'customer_id' })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await logActivity(supabase, result.data.customer_id, profile.id, 'updated', 'Updated preferences');
    revalidatePath('/customers');
    return { success: true, data: pref };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ------------------------------------------------------------------
// NOTES
// ------------------------------------------------------------------

export async function createNoteAction(data: CustomerNoteInput): Promise<ActionResponse<any>> {
  try {
    const { profile, supabase } = await requireAuth(['admin', 'manager', 'receptionist', 'sales']);
    const result = customerNoteSchema.safeParse(data);
    if (!result.success) return { success: false, error: 'Validation failed' };

    const { data: note, error } = await supabase
      .from('customer_notes')
      .insert({
        ...result.data,
        created_by: profile.id,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await logActivity(supabase, result.data.customer_id, profile.id, 'note_added', 'Added a note: ' + result.data.title);
    revalidatePath('/customers');
    return { success: true, data: note };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ------------------------------------------------------------------
// MEASUREMENTS (Existing adapted to normalized)
// ------------------------------------------------------------------

export async function fetchCustomerMeasurementsAction(customerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customer_measurements')
    .select('*, measurement_templates(name)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function fetchMeasurementTemplatesAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('measurement_templates')
    .select('*')
    .order('name', { ascending: true });

  if (error) return [];
  return data;
}

export async function saveCustomerMeasurementsAction(
  customerId: string,
  templateId: string,
  measurements: Record<string, number>,
  notes?: string
): Promise<ActionResponse<any>> {
  try {
    const { profile, supabase } = await requireAuth(['admin', 'manager', 'receptionist', 'tailor', 'sales', 'cutter', 'stitcher']);

    const { data: existing } = await supabase
      .from('customer_measurements')
      .select('version')
      .eq('customer_id', customerId)
      .eq('template_id', templateId)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1;

    const { data, error } = await supabase
      .from('customer_measurements')
      .insert({
        customer_id: customerId,
        template_id: templateId,
        measurements,
        version: nextVersion,
        notes,
        recorded_by: profile.id,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await logActivity(supabase, customerId, profile.id, 'measurement_updated', 'Updated measurements to v' + nextVersion);

    revalidatePath('/customers');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ------------------------------------------------------------------
// IMAGES
// ------------------------------------------------------------------

export async function saveImageMetadataAction(
  customerId: string,
  url: string,
  name: string,
  imageType: 'clothing' | 'design',
  category: string,
  sizeBytes: number
): Promise<ActionResponse<any>> {
  try {
    const { profile, supabase } = await requireAuth(['admin', 'manager', 'receptionist', 'tailor', 'sales', 'cutter', 'stitcher']);

    const { data: image, error } = await supabase
      .from('customer_images')
      .insert({
        customer_id: customerId,
        url,
        name,
        image_type: imageType,
        category,
        size_bytes: sizeBytes,
        uploaded_by: profile.id
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    const actionType = imageType === 'design' ? 'design_uploaded' : 'clothes_uploaded';
    await logActivity(supabase, customerId, profile.id, actionType, 'Uploaded ' + imageType + ' image');

    revalidatePath('/customers');
    return { success: true, data: image };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ------------------------------------------------------------------
// TAGS
// ------------------------------------------------------------------

export async function linkTagToCustomerAction(customerId: string, tagId: string): Promise<ActionResponse<any>> {
  try {
    const { profile, supabase } = await requireAuth(['admin', 'manager', 'receptionist', 'sales']);

    const { error } = await supabase
      .from('customer_tags')
      .insert({ customer_id: customerId, tag_id: tagId });

    if (error) return { success: false, error: error.message };

    await logActivity(supabase, customerId, profile.id, 'updated', 'Added a tag');
    revalidatePath('/customers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
