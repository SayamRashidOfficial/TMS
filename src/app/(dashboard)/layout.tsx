import { createClient } from '@/lib/supabase/server';
import DashboardLayoutClient from './layout-client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let activeProfile = {
    id: 'mock-admin-id',
    name: 'Alexander Wright',
    phone: '+1 (555) 234-5678',
    role: 'admin' as const,
  };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        activeProfile = profile;
      }
    }
  } catch (error) {
    // Graceful fallback to mock profile if Supabase is offline or unconfigured
  }

  return (
    <DashboardLayoutClient profile={activeProfile}>
      {children}
    </DashboardLayoutClient>
  );
}
