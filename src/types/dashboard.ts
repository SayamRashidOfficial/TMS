// ─── Existing types (preserved for backward compat) ──────────────────────────

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  readyForPickupOrders: number;
  deliveredOrders: number;
  todayRevenue: number;
  monthlyRevenue: number;
  newCustomers: number;
  lowStockFabrics: number;
  pendingTasksCount: number;
}

export interface RevenueChartPoint {
  label: string;
  amount: number;
}

export interface RevenueChartData {
  '7d': RevenueChartPoint[];
  '30d': RevenueChartPoint[];
  '6m': RevenueChartPoint[];
  '1y': RevenueChartPoint[];
}

export interface VolumeChartPoint {
  day: string;
  count: number;
}

export interface RecentOrder {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  due_date: string;
  total_amount: number;
  status: string;
}

export interface AssignedTask {
  id: string;
  order_number: number;
  garment_type: string;
  fabric_source: string;
  due_date: string;
  status: string;
}

export interface DashboardData {
  stats: DashboardStats;
  revenueChart: RevenueChartData;
  volumeChart: VolumeChartPoint[];
  recentOrders: RecentOrder[];
  assignedTasks: AssignedTask[];
}

// ─── New Dashboard Overview types ────────────────────────────────────────────

export type AccentColor =
  | 'indigo'
  | 'amber'
  | 'violet'
  | 'emerald'
  | 'teal'
  | 'blue'
  | 'rose'
  | 'sky';

export type StatCardIconName =
  | 'ShoppingBag'
  | 'Clock'
  | 'Scissors'
  | 'Sparkles'
  | 'Truck'
  | 'DollarSign'
  | 'TrendingUp'
  | 'Users';

export interface StatCardData {
  id: string;
  title: string;
  value: string;
  description: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  iconName: StatCardIconName;
  accentColor: AccentColor;
}

export type ActivityCategory =
  | 'order'
  | 'stitching'
  | 'delivery'
  | 'customer'
  | 'payment'
  | 'inventory';

export type ActivityStatusVariant =
  | 'success'
  | 'warning'
  | 'info'
  | 'purple'
  | 'neutral';

export interface RecentActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: ActivityCategory;
  statusText: string;
  statusVariant: ActivityStatusVariant;
  clientName?: string;
  orderNumber?: string;
  amount?: string;
}

export type QuickActionIconName = 'PlusCircle' | 'Users' | 'FileText' | 'Ruler';
export type QuickActionColorVariant = 'indigo' | 'amber' | 'emerald' | 'violet';

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  iconName: QuickActionIconName;
  href: string;
  badgeText?: string;
  colorVariant: QuickActionColorVariant;
}

export interface AnalyticsPlaceholderConfig {
  revenueChartTitle: string;
  revenueChartSubtitle: string;
  statusChartTitle: string;
  statusChartSubtitle: string;
}

export interface DashboardOverviewData {
  stats: StatCardData[];
  recentActivities: RecentActivityItem[];
  quickActions: QuickActionItem[];
  analyticsConfig: AnalyticsPlaceholderConfig;
}
