import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

// Skeleton for a single stat card
function StatCardSkeleton() {
  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-3.5 w-24 rounded" />
        <Skeleton className="h-7 w-7 rounded-xl" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2 rounded" />
        <Skeleton className="h-3 w-32 rounded" />
      </CardContent>
    </Card>
  );
}

// Skeleton for chart area
function ChartSkeleton() {
  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="pb-4 border-b border-border">
        <Skeleton className="h-5 w-40 mb-1.5 rounded" />
        <Skeleton className="h-3 w-52 rounded" />
      </CardHeader>
      <CardContent className="pt-4">
        <Skeleton className="h-[250px] w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

// Skeleton for a table row
function TableRowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="px-5 py-3.5"><Skeleton className="h-4 w-16 rounded" /></td>
      <td className="px-5 py-3.5">
        <Skeleton className="h-4 w-28 mb-1 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </td>
      <td className="px-5 py-3.5"><Skeleton className="h-4 w-20 rounded" /></td>
      <td className="px-5 py-3.5"><Skeleton className="h-4 w-16 rounded" /></td>
      <td className="px-5 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
    </tr>
  );
}

// Full Admin/Sales Dashboard Skeleton
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Grid – 8 cards (2 rows × 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div>
          <ChartSkeleton />
        </div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <div>
              <Skeleton className="h-5 w-36 mb-1.5 rounded" />
              <Skeleton className="h-3 w-44 rounded" />
            </div>
            <Skeleton className="h-7 w-20 rounded-lg" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    {['Order No', 'Customer', 'Due Date', 'Total', 'Status'].map((col) => (
                      <th key={col} className="px-5 py-3">
                        <Skeleton className="h-3 w-16 rounded" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="border-b border-border pb-4">
            <Skeleton className="h-5 w-36 mb-1.5 rounded" />
            <Skeleton className="h-3 w-44 rounded" />
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Tailor Workspace Skeleton
export function TailorDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
        <Card className="border-border bg-card shadow-xs flex items-center justify-center p-4">
          <Skeleton className="h-11 w-full rounded-xl" />
        </Card>
      </div>

      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="border-b border-border pb-4">
          <Skeleton className="h-5 w-36 mb-1.5 rounded" />
          <Skeleton className="h-3 w-56 rounded" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {['Order No', 'Garment', 'Fabric', 'Due', 'Status'].map((col) => (
                    <th key={col} className="px-5 py-3">
                      <Skeleton className="h-3 w-16 rounded" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
