'use client';

import React, { useState } from 'react';
import { useCustomerStore } from '@/store/useCustomerStore';
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CustomerToolbarProps {
  onOpenAddModal: () => void;
  onOpenImportExportModal: () => void;
  onOpenBulkActionsModal: () => void;
}

export default function CustomerToolbar({
  onOpenAddModal,
  onOpenImportExportModal,
  onOpenBulkActionsModal,
}: CustomerToolbarProps) {
  const { filters, setSearch, setFilter, resetFilters, selectedCustomerIds } = useCustomerStore();
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    filters.gender !== 'all' ||
    filters.city !== 'all' ||
    filters.status !== 'all' ||
    filters.category !== 'all' ||
    filters.dateRange !== 'all';

  return (
    <div className="flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-xs">
      {/* Primary Toolbar Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name, phone, email, or ID (e.g. CUST-8001)..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9.5 pr-8 h-9.5 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-amber-500/60 rounded-xl text-xs shadow-xs"
          />
          {filters.search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Toggle & Quick Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-9 px-3 rounded-xl border text-xs gap-1.5 transition-all cursor-pointer ${
              showFilters || hasActiveFilters
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                : 'bg-background border-border text-foreground hover:bg-secondary'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </Button>

          {/* Sort Selector */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilter('sortBy', e.target.value as any)}
            className="h-9 px-2.5 rounded-xl bg-background border border-border text-foreground text-xs focus:border-amber-500/60 outline-none cursor-pointer shadow-xs"
          >
            <option value="latest">Sort: Latest Added</option>
            <option value="oldest">Sort: Oldest Added</option>
            <option value="most_orders">Sort: Most Orders</option>
            <option value="highest_spending">Sort: Highest Spending</option>
            <option value="alphabetical">Sort: Alphabetical (A-Z)</option>
          </select>

          {/* Bulk Actions Button (visible when rows selected) */}
          {selectedCustomerIds.length > 0 && (
            <Button
              onClick={onOpenBulkActionsModal}
              className="h-9 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-purple-600/20 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              Bulk Actions ({selectedCustomerIds.length})
            </Button>
          )}

          {/* Import / Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenImportExportModal}
            className="h-9 px-3 rounded-xl bg-background border-border text-foreground hover:bg-secondary text-xs gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            Import / Export
          </Button>

          {/* Add Customer Primary Button */}
          <Button
            onClick={onOpenAddModal}
            className="h-9 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs gap-1.5 shadow-sm shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Expandable Advanced Filters Panel */}
      {showFilters && (
        <div className="pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 animate-in fade-in duration-200">
          {/* Gender Filter */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Gender</label>
            <select
              value={filters.gender}
              onChange={(e) => setFilter('gender', e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-foreground text-xs outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-foreground text-xs outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="vip">VIP</option>
              <option value="new">New</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-foreground text-xs outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="regular">Regular</option>
              <option value="vip">VIP</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">City</label>
            <select
              value={filters.city}
              onChange={(e) => setFilter('city', e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-foreground text-xs outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Cities</option>
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Faisalabad">Faisalabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Date Joined</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilter('dateRange', e.target.value as any)}
              className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-foreground text-xs outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="w-full h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
