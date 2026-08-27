'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from '../schemas';
import type { ActionResponse } from '../types';

function formatAuthError(error: any): string {
  if (!error) return 'An unknown error occurred.';
  const msg = typeof error === 'string' ? error : error.message || '';
  if (
    msg.toLowerCase().includes('fetch failed') ||
    msg.toLowerCase().includes('enotfound') ||
    error?.name === 'AuthRetryableFetchError' ||
    error?.status === 0
  ) {
    return 'Unable to connect to authentication server. Please check your network connection or try again.';
  }
  return msg || 'Authentication failed. Please try again.';
}

export async function signInAction(data: LoginInput): Promise<ActionResponse<{ role: string }>> {
  try {
    // Validate data with Zod
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      const validationErrors: Record<string, string[]> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join('.');
        if (!validationErrors[path]) {
          validationErrors[path] = [];
        }
        validationErrors[path].push(err.message);
      });
      return { success: false, error: 'Validation failed', validationErrors };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { success: false, error: formatAuthError(error) };
    }

    // Fetch the user's role from the profiles table
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: userError ? formatAuthError(userError) : 'User session not found' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return { success: false, error: 'Staff profile not found. Please contact an admin.' };
    }

    revalidatePath('/', 'layout');
    return { success: true, data: { role: profile.role } };
  } catch (err: any) {
    console.error('signInAction error:', err);
    return { success: false, error: formatAuthError(err) };
  }
}

export async function signUpAction(data: SignupInput): Promise<ActionResponse<{ hasSession: boolean }>> {
  try {
    // Validate data with Zod
    const result = signupSchema.safeParse(data);
    if (!result.success) {
      const validationErrors: Record<string, string[]> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join('.');
        if (!validationErrors[path]) {
          validationErrors[path] = [];
        }
        validationErrors[path].push(err.message);
      });
      return { success: false, error: 'Validation failed', validationErrors };
    }

    const supabase = await createClient();

    // Determine the base origin URL for email verification callback
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Call Supabase Auth signUp to register the user and trigger verification email
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          name: data.fullName,
          role: 'customer', // Assign customer role on first time signup
        },
      },
    });

    if (error) {
      return { success: false, error: formatAuthError(error) };
    }

    const user = authData.user;
    if (!user) {
      return { success: false, error: 'Signup failed. Please try again.' };
    }

    // Fallback / Explicit profile creation check to ensure profile exists with 'customer' role
    try {
      const adminClient = createAdminClient();
      const { data: existingProfile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await adminClient
          .from('profiles')
          .insert({
            id: user.id,
            name: data.fullName,
            full_name: data.fullName,
            email: data.email,
            role: 'customer',
            is_active: true,
          });

        if (profileError) {
          console.error('Error inserting fallback customer profile:', profileError);
        }
      }
    } catch (err) {
      console.error('Catch error verifying/inserting fallback profile:', err);
    }

    revalidatePath('/', 'layout');
    return {
      success: true,
      data: {
        hasSession: authData.session !== null,
      },
    };
  } catch (err: any) {
    console.error('signUpAction error:', err);
    return { success: false, error: formatAuthError(err) };
  }
}

export async function signOutAction(): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    return { success: true, data: undefined };
  } catch (err: any) {
    console.error('signOutAction error:', err);
    return { success: false, error: formatAuthError(err) };
  }
}


