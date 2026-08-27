'use client';

import React from 'react';
import { useCustomerStore } from '@/store/useCustomerStore';
import {
  Users,
  UserPlus,
  BarChart3,
  UserCheck,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CustomerHeader() {
  const { viewMode, setViewMode, selectedCustomerId, customers } = useCustomerStore();

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="flex flex-col gap-3.5 border-b border-border pb-4">
      {/* Top Breadcrumb & Quick Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            onClick={() => {
              window.location.href = '/';
            }}
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-muted-foreground" />
            Dashboard
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span
            onClick={() => setViewMode('list')}
            className={`cursor-pointer hover:text-foreground transition-colors ${
              viewMode === 'list' ? 'text-amber-600 dark:text-amber-400 font-bold' : ''
            }`}
          >
            Customer Directory
          </span>
          {viewMode === 'profile' && selectedCustomer && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-amber-600 dark:text-amber-400 font-bold truncate max-w-[150px] sm:max-w-none">
                {selectedCustomer.fullName} ({selectedCustomer.customerId})
              </span>
            </>
          )}
          {viewMode === 'add' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-amber-600 dark:text-amber-400 font-bold">Add New Customer</span>
            </>
          )}
          {viewMode === 'analytics' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-amber-600 dark:text-amber-400 font-bold">Customer Analytics</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
            <Sparkles className="w-3 h-3" />
            Atelier CRM v2.4
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="h-7 px-2.5 text-[11px] rounded-lg gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-muted-foreground" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Sub-Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-secondary/70 border border-border rounded-xl">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            All Customers
          </button>
          <button
            onClick={() => setViewMode('add')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              viewMode === 'add'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Customer
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              viewMode === 'analytics'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>

          {viewMode === 'profile' && selectedCustomer && (
            <button
              onClick={() => setViewMode('profile')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 shadow-xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Profile: {selectedCustomer.fullName.split(' ')[0]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
