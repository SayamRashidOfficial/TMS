import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDashboardOverviewData } from '@/features/dashboard/services/dashboard.service';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized user session' },
        { status: 401 }
      );
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    const dashboardData = await getDashboardOverviewData(supabase, profile.id, profile.role);

    return NextResponse.json({
      success: true,
      data: dashboardData
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error: any) {
    console.error('Error in /api/dashboard/stats:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error fetching dashboard stats' },
      { status: 500 }
    );
  }
}
