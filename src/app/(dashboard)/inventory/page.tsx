import React from 'react';
import { fetchFabricsAction } from '@/features/inventory/actions';
import FabricList from '@/features/inventory/components/fabric-list';

export const metadata = {
  title: 'Inventory - Huzaifa',
  description: 'Manage fabric materials and accessories catalogs.',
};

export default async function InventoryPage() {
  const fabrics = await fetchFabricsAction();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Inventory Ledger
        </h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Catalog and track active stocks of tailoring fabrics, warning thresholds, and unit pricing.
        </p>
      </div>

      <FabricList initialFabrics={fabrics} />
    </div>
  );
}
