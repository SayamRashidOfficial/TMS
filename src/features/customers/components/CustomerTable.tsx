'use client';

import React, { useState } from 'react';
import { useCustomerStore } from '@/store/useCustomerStore';
import { Customer } from '@/types/customer';
import {
  Eye,
  Edit,
  Trash2,
  PlusCircle,
  Ruler,
  Phone,
  Mail,
  MapPin,
  Crown,
  Calendar,
  MoreVertical,
  CheckSquare,
  Square,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CustomerTableProps {
  onEditCustomer: (customer: Customer) => void;
  onOpenMeasurementsModal: (customer: Customer) => void;
}

export default function CustomerTable({
  onEditCustomer,
  onOpenMeasurementsModal,
}: CustomerTableProps) {
  const {
    customers,
    filters,
    selectedCustomerIds,
    toggleSelectCustomer,
    selectAllCustomers,
    deleteCustomer,
    setViewMode,
  } = useCustomerStore();

  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  // Apply Search, Filters, and Sorting
  const filteredCustomers = customers
    .filter((c) => {
      // Search term
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = c.fullName?.toLowerCase().includes(q);
        const matchPhone = c.mobile?.includes(q);
        const matchEmail = c.email?.toLowerCase().includes(q);
        const matchId = c.customerId?.toLowerCase().includes(q);
        const matchCnic = c.cnic?.includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchId && !matchCnic) {
          return false;
        }
      }

      // Gender
      if (filters.gender !== 'all' && c.gender !== filters.gender) return false;

      // Status
      if (filters.status !== 'all' && c.status !== filters.status) return false;

      // Category
      if (filters.category !== 'all' && c.category !== filters.category) return false;

      // City
      if (filters.city !== 'all' && c.address?.city?.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (filters.sortBy === 'most_orders') {
        return b.totalOrders - a.totalOrders;
      }
      if (filters.sortBy === 'highest_spending') {
        return b.totalSpent - a.totalSpent;
      }
      if (filters.sortBy === 'alphabetical') {
        return a.fullName.localeCompare(b.fullName);
      }
      // default: latest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const allSelected =
    filteredCustomers.length > 0 &&
    filteredCustomers.every((c) => selectedCustomerIds.includes(c.id));

  const handleRowClick = (customer: Customer) => {
    setViewMode('profile', customer.id);
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/50 text-muted-foreground font-bold uppercase tracking-wider">
              <th className="p-3.5 w-10 text-center">
                <button
                  onClick={() => selectAllCustomers(!allSelected)}
                  className="text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Contact</th>
              <th className="p-3.5">Gender / Location</th>
              <th className="p-3.5 text-center">Orders (P / C)</th>
              <th className="p-3.5">Total Spent</th>
              <th className="p-3.5">Last Visit</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-muted-foreground">
                  <User className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-semibold text-foreground">No customers found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your search query or filters.
                  </p>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomerIds.includes(cust.id);
                return (
                  <tr
                    key={cust.id}
                    className={`group hover:bg-secondary/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-amber-500/10 dark:bg-amber-500/15' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleSelectCustomer(cust.id)}
                        className="text-muted-foreground hover:text-amber-500 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Customer Photo, Name, ID, Category */}
                    <td className="p-3.5" onClick={() => handleRowClick(cust)}>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={
                              cust.photoUrl ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'
                            }
                            alt={cust.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-border group-hover:border-amber-500 transition-colors"
                          />
                          {cust.isVip && (
                            <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-500 text-stone-950 shadow-xs">
                              <Crown className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-foreground group-hover:text-amber-500 transition-colors flex items-center gap-1.5">
                            {cust.fullName}
                            <span className="text-[10px] font-mono text-muted-foreground">({cust.customerId})</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                            <span className="capitalize">{cust.category}</span>
                            {cust.occupation && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[120px]">{cust.occupation}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact (Phone & Email) */}
                    <td className="p-3.5" onClick={() => handleRowClick(cust)}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-foreground font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-amber-500" />
                          <span>{cust.mobile}</span>
                        </div>
                        {cust.email && (
                          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] truncate max-w-[160px]">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span>{cust.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Gender & City */}
                    <td className="p-3.5" onClick={() => handleRowClick(cust)}>
                      <div>
                        <span className="capitalize text-foreground font-medium">{cust.gender}</span>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span>{cust.address?.city || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Orders (Total / Pending / Completed) */}
                    <td className="p-3.5 text-center" onClick={() => handleRowClick(cust)}>
                      <div className="font-bold text-foreground font-mono">{cust.totalOrders} orders</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        <span className="text-orange-500 font-bold">{cust.pendingOrders} pend</span> /{' '}
                        <span className="text-emerald-500 font-bold">{cust.completedOrders} comp</span>
                      </div>
                    </td>

                    {/* Total Spent */}
                    <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400 font-mono" onClick={() => handleRowClick(cust)}>
                      ${cust.totalSpent.toLocaleString()}
                    </td>

                    {/* Last Visit */}
                    <td className="p-3.5 text-muted-foreground" onClick={() => handleRowClick(cust)}>
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span>
                          {cust.lastVisit ? new Date(cust.lastVisit).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5" onClick={() => handleRowClick(cust)}>
                      {cust.status === 'vip' || cust.isVip ? (
                        <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] uppercase tracking-wider font-bold">
                          VIP
                        </Badge>
                      ) : cust.status === 'active' ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] uppercase tracking-wider font-bold">
                          Active
                        </Badge>
                      ) : cust.status === 'new' ? (
                        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] uppercase tracking-wider font-bold">
                          New
                        </Badge>
                      ) : (
                        <Badge className="bg-secondary text-muted-foreground border-border text-[10px] uppercase tracking-wider font-bold">
                          Inactive
                        </Badge>
                      )}
                    </td>

                    {/* Row Action Dropdown */}
                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg cursor-pointer flex items-center justify-center transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 bg-popover border-border text-foreground rounded-xl p-1.5 shadow-xl"
                        >
                          <DropdownMenuItem
                            onClick={() => setViewMode('profile', cust.id)}
                            className="flex items-center gap-2 text-xs hover:bg-secondary cursor-pointer rounded-lg px-2.5 py-2 text-amber-500 font-semibold"
                          >
                            <Eye className="w-4 h-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onOpenMeasurementsModal(cust)}
                            className="flex items-center gap-2 text-xs hover:bg-secondary cursor-pointer rounded-lg px-2.5 py-2"
                          >
                            <Ruler className="w-4 h-4 text-emerald-500" />
                            View Measurements
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditCustomer(cust)}
                            className="flex items-center gap-2 text-xs hover:bg-secondary cursor-pointer rounded-lg px-2.5 py-2"
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              window.location.href = `/orders?createFor=${cust.id}`;
                            }}
                            className="flex items-center gap-2 text-xs hover:bg-secondary cursor-pointer rounded-lg px-2.5 py-2"
                          >
                            <PlusCircle className="w-4 h-4 text-purple-500" />
                            Create Order
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(cust)}
                            className="flex items-center gap-2 text-xs hover:bg-red-500/10 text-red-500 cursor-pointer rounded-lg px-2.5 py-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl bg-popover border border-border text-foreground shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-red-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Customer Profile
            </h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete client{' '}
              <strong className="text-foreground">{deleteTarget.fullName}</strong> ({deleteTarget.customerId})?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  deleteCustomer(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
              >
                Delete Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
