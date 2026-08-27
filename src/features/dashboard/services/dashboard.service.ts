import { SupabaseClient } from '@supabase/supabase-js';
import { DashboardData, DashboardStats, RecentOrder, AssignedTask, RevenueChartPoint, RevenueChartData, VolumeChartPoint } from '@/types/dashboard';

export async function getDashboardOverviewData(
  supabase: SupabaseClient,
  profileId: string,
  userRole: string
): Promise<DashboardData> {
  // Compute start of current day and month in ISO string format
  const now = new Date();
  
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTodayISO = startOfToday.toISOString();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfMonthISO = startOfMonth.toISOString();

  // Helper safe wrapper to prevent query failures from breaking dashboard
  const safeQuery = async <T>(promise: PromiseLike<{ data: T | null; error: any; count?: number | null }>, defaultValue: T, extractCount = false): Promise<{ data: T; count: number }> => {
    try {
      const result = await promise;
      if (result.error) {
        console.error('Supabase query error in dashboard service:', result.error);
        return { data: defaultValue, count: result.count ?? 0 };
      }
      return { data: result.data ?? defaultValue, count: result.count ?? 0 };
    } catch (err) {
      console.error('Unhandled exception in safeQuery:', err);
      return { data: defaultValue, count: 0 };
    }
  };

  const isTailor = userRole === 'cutter' || userRole === 'stitcher';

  // Execute all efficient database queries in parallel
  const [
    totalOrdersRes,
    pendingOrdersRes,
    inProgressOrdersRes,
    readyForPickupOrdersRes,
    deliveredOrdersRes,
    todayPaymentsRes,
    monthlyPaymentsRes,
    newCustomersRes,
    lowStockRes,
    pendingTasksRes,
    recentOrdersRes,
    assignedTasksRes,
    allPaymentsRes,
    recentOrdersForVolumeRes
  ] = await Promise.all([
    // 1. Total Orders Count
    safeQuery(
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      null,
      true
    ),
    // 2. Pending Orders Count (draft, booked)
    safeQuery(
      supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['draft', 'booked']),
      null,
      true
    ),
    // 3. In Progress Orders Count (in_cutting, in_stitching, ready_for_trial)
    safeQuery(
      supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['in_cutting', 'in_stitching', 'ready_for_trial']),
      null,
      true
    ),
    // 4. Ready for Pickup Count
    safeQuery(
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'ready_for_pickup'),
      null,
      true
    ),
    // 5. Delivered Orders Count (completed)
    safeQuery(
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      null,
      true
    ),
    // 6. Today's Payments (Revenue)
    safeQuery(
      supabase.from('payments').select('amount').gte('created_at', startOfTodayISO),
      []
    ),
    // 7. Monthly Payments (Revenue)
    safeQuery(
      supabase.from('payments').select('amount').gte('created_at', startOfMonthISO),
      []
    ),
    // 8. New Customers Count (registered this month)
    safeQuery(
      supabase.from('customers').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonthISO),
      null,
      true
    ),
    // 9. Low Stock Inventory Count
    safeQuery(
      supabase.from('inventory_fabrics').select('*', { count: 'exact', head: true }).filter('quantity_meters', 'lte', 'min_threshold_meters'),
      null,
      true
    ),
    // 10. Pending Production Tasks Count
    safeQuery(
      supabase.from('order_items').select('*', { count: 'exact', head: true }).in('status', ['pending', 'cutting', 'stitching']),
      null,
      true
    ),
    // 11. Recent Orders List
    safeQuery(
      supabase
        .from('orders')
        .select('id, order_number, due_date, total_amount, status, customers(name, phone)')
        .order('created_at', { ascending: false })
        .limit(5),
      []
    ),
    // 12. Tailor Assigned Tasks List
    safeQuery(
      isTailor
        ? supabase
            .from('order_items')
            .select('id, garment_type, fabric_source, status, orders(order_number, due_date)')
            .eq(userRole === 'cutter' ? 'assigned_cutter_id' : 'assigned_stitcher_id', profileId)
            .not('status', 'in', '("ready_for_trial","ready_for_pickup","completed")')
            .order('created_at', { ascending: true })
            .limit(6)
        : Promise.resolve({ data: [], error: null }),
      []
    ),
    // 13. Payments for Revenue Chart (last 6 months)
    safeQuery(
      supabase.from('payments').select('amount, created_at').order('created_at', { ascending: true }),
      []
    ),
    // 14. Volume count grouped by recent order dates
    safeQuery(
      supabase.from('orders').select('created_at').order('created_at', { ascending: false }).limit(100),
      []
    )
  ]);

  // Calculate sum of revenues
  const todayRevenue = (todayPaymentsRes.data as Array<{ amount: number }>).reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );
  const monthlyRevenue = (monthlyPaymentsRes.data as Array<{ amount: number }>).reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const stats: DashboardStats = {
    totalOrders: totalOrdersRes.count,
    pendingOrders: pendingOrdersRes.count,
    inProgressOrders: inProgressOrdersRes.count,
    readyForPickupOrders: readyForPickupOrdersRes.count,
    deliveredOrders: deliveredOrdersRes.count,
    todayRevenue,
    monthlyRevenue,
    newCustomers: newCustomersRes.count,
    lowStockFabrics: lowStockRes.count,
    pendingTasksCount: pendingTasksRes.count
  };

  // Process Recent Orders
  const recentOrders: RecentOrder[] = ((recentOrdersRes.data as any[]) || []).map((ord) => ({
    id: ord.id,
    order_number: ord.order_number,
    customer_name: ord.customers?.name || 'Walk-in Customer',
    customer_phone: ord.customers?.phone || 'N/A',
    due_date: ord.due_date,
    total_amount: Number(ord.total_amount || 0),
    status: ord.status || 'draft'
  }));

  // Process Assigned Tasks
  const assignedTasks: AssignedTask[] = ((assignedTasksRes.data as any[]) || []).map((task) => ({
    id: task.id,
    order_number: task.orders?.order_number || 0,
    garment_type: task.garment_type || 'Garment',
    fabric_source: task.fabric_source || 'customer_provided',
    due_date: task.orders?.due_date || new Date().toISOString(),
    status: task.status || 'pending'
  }));

  // Process Revenue Chart Data for multiple timeframes
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const generateMonthlyData = (monthsCount: number) => {
    const totals: Record<string, number> = {};
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      totals[`${monthNames[d.getMonth()]} ${d.getFullYear()}`] = 0;
    }
    return totals;
  };

  const generateDailyData = (daysCount: number) => {
    const totals: Record<string, number> = {};
    // Ensure we start from 'today' and go backwards properly aligned to midnight
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStr = `${d.getMonth() + 1}/${d.getDate()}`;
      totals[dayStr] = 0;
    }
    return totals;
  };

  const data7d = generateDailyData(7);
  const data30d = generateDailyData(30);
  const data6m = generateMonthlyData(6);
  const data1y = generateMonthlyData(12);

  ((allPaymentsRes.data as any[]) || []).forEach((p) => {
    if (!p.created_at) return;
    const dt = new Date(p.created_at);
    const amount = Number(p.amount || 0);
    
    const dayStr = `${dt.getMonth() + 1}/${dt.getDate()}`;
    const monthStr = `${monthNames[dt.getMonth()]} ${dt.getFullYear()}`;
    
    // Date diff in days (approximate for easy bucketing)
    const diffTime = now.getTime() - dt.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (dayStr in data7d && diffDays <= 7) {
      data7d[dayStr] += amount;
    }
    
    if (dayStr in data30d && diffDays <= 30) {
      data30d[dayStr] += amount;
    }

    if (monthStr in data6m) {
      data6m[monthStr] += amount;
    }
    if (monthStr in data1y) {
      data1y[monthStr] += amount;
    }
  });

  const revenueChart: RevenueChartData = {
    '7d': Object.entries(data7d).map(([label, amount]) => ({ label, amount })),
    '30d': Object.entries(data30d).map(([label, amount]) => ({ label, amount })),
    '6m': Object.entries(data6m).map(([label, amount]) => ({ label: label.split(' ')[0], amount })),
    '1y': Object.entries(data1y).map(([label, amount]) => ({ label, amount }))
  };

  // Process Volume Chart Data (Group by Day of Week)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts: Record<string, number> = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0
  };

  ((recentOrdersForVolumeRes.data as any[]) || []).forEach((ord) => {
    if (ord.created_at) {
      const dayName = dayNames[new Date(ord.created_at).getDay()];
      if (dayName in dayCounts) {
        dayCounts[dayName] += 1;
      }
    }
  });

  const volumeChart: VolumeChartPoint[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
    day,
    count: dayCounts[day] || 0
  }));

  return {
    stats,
    revenueChart,
    volumeChart,
    recentOrders,
    assignedTasks
  };
}
