export type ActionResponse<T = any> =
  | { success: true; data: T }
  | { success: false; error: string; validationErrors?: Record<string, string[]> };

export interface UserProfile {
  id: string;
  name: string;
  full_name?: string | null;
  email?: string | null;
  phone: string | null;
  role: 'admin' | 'sales' | 'cutter' | 'stitcher' | 'customer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
