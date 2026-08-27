'use client';

import React, { useState } from 'react';
import { Plus, List } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import OrderList from '@/features/orders/components/order-list';
import OrderBuilder from '@/features/orders/components/order-builder';

interface OrdersPageClientProps {
  orders: any[];
  customers: any[];
  fabrics: any[];
  templates: any[];
  staff: any[];
  currentRole: string;
}

export default function OrdersPageClient({
  orders,
  customers,
  fabrics,
  templates,
  staff,
  currentRole,
}: OrdersPageClientProps) {
  const canBook = currentRole === 'admin' || currentRole === 'sales';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {canBook ? (
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="bg-secondary/70 border border-border p-1 rounded-xl">
            <TabsTrigger
              value="list"
              className="rounded-lg flex items-center gap-2 px-4 py-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              <List className="w-4 h-4" />
              Bookings Register
            </TabsTrigger>
            <TabsTrigger
              value="new"
              className="rounded-lg flex items-center gap-2 px-4 py-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-amber-500 data-[state=active]:text-stone-950 font-bold"
            >
              <Plus className="w-4 h-4" />
              New Order Checkout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <OrderList
              initialOrders={orders}
              staff={staff}
              currentRole={currentRole}
            />
          </TabsContent>

          <TabsContent value="new">
            <OrderBuilder
              customers={customers}
              fabrics={fabrics}
              templates={templates}
            />
          </TabsContent>
        </Tabs>
      ) : (
        /* Cutters / Stitchers only see the list / queue view */
        <OrderList
          initialOrders={orders}
          staff={staff}
          currentRole={currentRole}
        />
      )}
    </div>
  );
}
