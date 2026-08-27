'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Calendar,
  DollarSign,
  User,
  Scissors,
  CheckCircle,
  Printer,
  ChevronRight,
  ShoppingBag,
  Loader2,
  Clock,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  updateOrderStatusAction,
  updateOrderItemStatusAction,
  assignTailorAction,
  fetchOrderDetailsAction
} from '../actions';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: number;
  customer_id: string;
  status: 'draft' | 'booked' | 'in_cutting' | 'in_stitching' | 'ready_for_trial' | 'ready_for_pickup' | 'completed' | 'cancelled';
  order_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  notes: string | null;
  created_at: string;
  customers: {
    name: string;
    phone: string;
  } | null;
}

interface StaffProfile {
  id: string;
  name: string;
  role: 'admin' | 'sales' | 'cutter' | 'stitcher' | 'customer';
}

interface OrderListProps {
  initialOrders: Order[];
  staff: StaffProfile[];
  currentRole: string;
}

export default function OrderList({ initialOrders, staff, currentRole }: OrderListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Drawer detail states
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Assignment Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemName, setSelectedItemName] = useState('');
  const [assignType, setAssignType] = useState<'cutter' | 'stitcher'>('cutter');
  const [assignedTailorId, setAssignedTailorId] = useState('');
  const [payoutRate, setPayoutRate] = useState('10.00');
  const [assignLoading, setAssignLoading] = useState(false);

  // Status transitions loaders
  const [statusLoading, setStatusLoading] = useState(false);

  const cutters = staff.filter((s) => s.role === 'cutter');
  const stitchers = staff.filter((s) => s.role === 'stitcher');

  // Filter orders
  const filteredOrders = initialOrders.filter((o) => {
    const matchesSearch =
      o.order_number.toString().includes(search) ||
      o.customers?.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customers?.phone.includes(search);

    const matchesStatus = activeTab === 'all' || o.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  const handleSelectOrder = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setLoadingDetails(true);
    try {
      const details = await fetchOrderDetailsAction(orderId);
      setOrderDetails(details);
    } catch (err) {
      toast.error('Failed to load order tracking details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRefreshDetails = async () => {
    if (!selectedOrderId) return;
    try {
      const details = await fetchOrderDetailsAction(selectedOrderId);
      setOrderDetails(details);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (status: string) => {
    if (!selectedOrderId) return;
    setStatusLoading(true);
    try {
      const response = await updateOrderStatusAction(selectedOrderId, status);
      if (response.success) {
        toast.success(`Order status updated to: ${status.replace('_', ' ')}`);
        router.refresh();
        handleRefreshDetails();
      } else {
        toast.error(response.error || 'Failed to update order status');
      }
    } catch (err) {
      toast.error('Error occurred');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleUpdateItemStatus = async (itemId: string, status: string) => {
    if (!selectedOrderId) return;
    setStatusLoading(true);
    try {
      const response = await updateOrderItemStatusAction(itemId, selectedOrderId, status);
      if (response.success) {
        toast.success(`Garment item status updated to: ${status.replace('_', ' ')}`);
        router.refresh();
        handleRefreshDetails();
      } else {
        toast.error(response.error || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Error occurred');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleOpenAssign = (itemId: string, itemName: string, type: 'cutter' | 'stitcher') => {
    setSelectedItemId(itemId);
    setSelectedItemName(itemName);
    setAssignType(type);
    
    // Set first staff as default
    const availableStaff = type === 'cutter' ? cutters : stitchers;
    if (availableStaff.length > 0) {
      setAssignedTailorId(availableStaff[0].id);
    } else {
      setAssignedTailorId('');
    }
    
    setPayoutRate(type === 'cutter' ? '5.00' : '15.00'); // default values
    setShowAssignModal(true);
  };

  const handleAssignTailorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !assignedTailorId) return;

    const rate = parseFloat(payoutRate);
    if (isNaN(rate) || rate < 0) {
      toast.error('Please input a valid payout fee amount');
      return;
    }

    setAssignLoading(true);
    try {
      const response = await assignTailorAction(selectedItemId, assignType, assignedTailorId, rate);
      if (response.success) {
        toast.success(`Successfully assigned staff to ${selectedItemName}`);
        setShowAssignModal(false);
        handleRefreshDetails();
      } else {
        toast.error(response.error || 'Failed to assign tailor');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setAssignLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!orderDetails) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocker prevented opening invoice printable window');
      return;
    }

    const itemsRows = orderDetails.order_items.map((item: any) => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px 0; font-weight: bold;">${item.garment_type}</td>
        <td style="padding: 10px 0; color: #555;">${item.fabric_source === 'in_store' ? 'In-Store Stock Fabric' : 'Client Fabric'}</td>
        <td style="padding: 10px 0; text-align: right; font-weight: bold;">$${Number(item.unit_price).toFixed(2)}</td>
      </tr>
    `).join('');

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${orderDetails.order_number}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 40px; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 28px; font-weight: bold; letter-spacing: 2px; }
          .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .details h3 { margin-bottom: 5px; font-size: 14px; text-transform: uppercase; color: #666; }
          .details p { margin: 0; font-size: 14px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { border-bottom: 2px solid #ddd; padding: 10px 0; text-align: left; text-transform: uppercase; font-size: 12px; color: #666; }
          .totals { width: 40%; margin-left: auto; font-size: 14px; }
          .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
          .grand-total { border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; font-weight: bold; font-size: 16px; }
          .footer { margin-top: 80px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">HUZAIFA</div>
            <div style="font-size: 12px; color: #666; uppercase">Atelier & Custom Tailors</div>
          </div>
          <div style="text-align: right">
            <div style="font-size: 20px; font-weight: bold; color: #f59e0b;">INVOICE</div>
            <div style="font-size: 12px;">Order Number: <strong>#${orderDetails.order_number}</strong></div>
          </div>
        </div>

        <div class="details">
          <div>
            <h3>Client</h3>
            <p>${orderDetails.customers?.name}</p>
            <p>${orderDetails.customers?.phone}</p>
            ${orderDetails.customers?.address ? `<p>${orderDetails.customers.address}</p>` : ''}
          </div>
          <div style="text-align: right">
            <h3>Date & Info</h3>
            <p>Booked: ${new Date(orderDetails.order_date).toLocaleDateString()}</p>
            <p>Delivery Due: ${new Date(orderDetails.due_date).toLocaleDateString()}</p>
            <p>Payment: ${orderDetails.payments?.[0]?.payment_method?.replace('_', ' ') || 'Pending'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50%">Garment Details</th>
              <th style="width: 30%">Fabric Source</th>
              <th style="width: 20%; text-align: right;">Cost</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="totals">
          <div>
            <span>Subtotal:</span>
            <span>$${Number(orderDetails.subtotal).toFixed(2)}</span>
          </div>
          <div>
            <span>Discount:</span>
            <span>-$${Number(orderDetails.discount).toFixed(2)}</span>
          </div>
          <div>
            <span>Tax:</span>
            <span>$${Number(orderDetails.tax).toFixed(2)}</span>
          </div>
          <div class="grand-total">
            <span>Total amount:</span>
            <span>$${Number(orderDetails.total_amount).toFixed(2)}</span>
          </div>
          <div style="font-weight: bold; color: #10b981;">
            <span>Deposit Paid:</span>
            <span>$${Number(orderDetails.paid_amount).toFixed(2)}</span>
          </div>
          <div style="font-weight: bold; color: #ef4444; border-top: 1px solid #eee; padding-top: 6px; margin-top: 6px;">
            <span>Outstanding Balance:</span>
            <span>$${(Number(orderDetails.total_amount) - Number(orderDetails.paid_amount)).toFixed(2)}</span>
          </div>
        </div>

        ${orderDetails.notes ? `
          <div style="margin-top: 40px; background: #f9f9f9; padding: 15px; border-radius: 4px; font-size: 13px;">
            <strong>Order Notes:</strong><br>${orderDetails.notes}
          </div>
        ` : ''}

        <div class="footer">
          Thank you for choosing HUZAIFA. Your sizes history log is saved for future bookings.<br>
          For status tracking, please call us with Order Number #${orderDetails.order_number}.
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters panel */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number or client details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-amber-500/60 rounded-xl text-xs shadow-xs"
          />
        </div>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)} className="w-full md:w-auto">
          <TabsList className="bg-secondary/70 border border-border p-1 text-muted-foreground rounded-xl overflow-x-auto flex w-full md:w-auto custom-scrollbar">
            <TabsTrigger value="all" className="rounded-lg text-xs font-semibold cursor-pointer data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">All</TabsTrigger>
            <TabsTrigger value="booked" className="rounded-lg text-xs font-semibold cursor-pointer data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">Booked</TabsTrigger>
            <TabsTrigger value="in_cutting" className="rounded-lg text-xs font-semibold cursor-pointer data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">Cutting</TabsTrigger>
            <TabsTrigger value="in_stitching" className="rounded-lg text-xs font-semibold cursor-pointer data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">Stitching</TabsTrigger>
            <TabsTrigger value="ready_for_trial" className="rounded-lg text-xs font-semibold cursor-pointer data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">Trial</TabsTrigger>
            <TabsTrigger value="ready_for_pickup" className="rounded-lg text-xs font-semibold cursor-pointer data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">Pickup</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg text-xs font-semibold cursor-pointer data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-card/40">
          <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-xs font-semibold">No orders found in workflow queue.</p>
        </div>
      ) : (
        <div className="grid gap-3.5">
          {filteredOrders.map((ord) => {
            const balance = Number(ord.total_amount) - Number(ord.paid_amount);
            return (
              <Card
                key={ord.id}
                onClick={() => handleSelectOrder(ord.id)}
                className="border-border bg-card text-card-foreground shadow-xs hover:border-amber-500/40 transition-all duration-200 cursor-pointer hover:scale-[1.002] rounded-2xl"
              >
                <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 text-base sm:text-lg font-mono">#{ord.order_number}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                        ord.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : ord.status === 'draft'
                          ? 'bg-secondary text-muted-foreground border-border'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-semibold">{ord.customers?.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Due: {new Date(ord.due_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t border-border pt-3 md:border-none md:pt-0">
                    <div className="grid grid-cols-2 gap-x-6 text-right">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Paid</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">${Number(ord.paid_amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Balance</p>
                        <p className={`text-sm font-bold font-mono ${balance > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          ${balance.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-amber-600 dark:text-amber-400 flex items-center font-bold text-xs gap-0.5">
                      <span>Track</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Tracking / Management Drawer Sheet */}
      <Sheet open={selectedOrderId !== null} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <SheetContent className="w-full sm:max-w-xl bg-popover border-l border-border text-foreground overflow-y-auto z-50 custom-scrollbar p-6">
          {loadingDetails ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xs">Fetching order tracking details...</p>
            </div>
          ) : orderDetails && (
            <div className="space-y-5 pt-2">
              <SheetHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-mono">
                      Order #{orderDetails.order_number}
                    </SheetTitle>
                    <SheetDescription className="text-muted-foreground text-xs mt-0.5">
                      Booked on: {new Date(orderDetails.order_date).toLocaleDateString()}
                    </SheetDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={handlePrintInvoice}
                    className="bg-card border border-border hover:bg-secondary text-foreground cursor-pointer h-8 px-3 rounded-lg text-xs shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                    Print Invoice
                  </Button>
                </div>
              </SheetHeader>

              {/* Status Update & Customer Info */}
              <div className="grid md:grid-cols-2 gap-3.5">
                <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Client Profile</p>
                  <p className="font-bold text-foreground text-xs">{orderDetails.customers?.name}</p>
                  <p className="text-[11px] text-muted-foreground">{orderDetails.customers?.phone}</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order Progress</p>
                  <Select
                    value={orderDetails.status}
                    onValueChange={handleUpdateOrderStatus}
                    disabled={statusLoading || (currentRole !== 'admin' && currentRole !== 'sales')}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-foreground">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="in_cutting">In Cutting</SelectItem>
                      <SelectItem value="in_stitching">In Stitching</SelectItem>
                      <SelectItem value="ready_for_trial">Ready for Trial</SelectItem>
                      <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Financial Ledger card */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h4 className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest border-b border-border pb-1.5">
                  Financial Ledger
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-secondary/50 p-2.5 rounded-xl border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total</p>
                    <p className="font-bold text-foreground mt-0.5 font-mono">${Number(orderDetails.total_amount).toFixed(2)}</p>
                  </div>
                  <div className="bg-secondary/50 p-2.5 rounded-xl border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Deposit</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">${Number(orderDetails.paid_amount).toFixed(2)}</p>
                  </div>
                  <div className="bg-secondary/50 p-2.5 rounded-xl border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Outstanding</p>
                    <p className={`font-bold mt-0.5 font-mono ${
                      (Number(orderDetails.total_amount) - Number(orderDetails.paid_amount)) > 0
                        ? 'text-red-500'
                        : 'text-muted-foreground'
                    }`}>
                      ${(Number(orderDetails.total_amount) - Number(orderDetails.paid_amount)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Garment Items List */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-extrabold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border pb-2">
                  <Scissors className="w-3.5 h-3.5 text-amber-500" />
                  Garment Components Workflow
                </h3>

                <div className="space-y-3">
                  {orderDetails.order_items.map((item: any) => {
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-border bg-card p-3.5 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <span className="font-bold text-foreground text-xs">{item.garment_type}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                            Unit Price: ${Number(item.unit_price).toFixed(2)}
                          </span>
                        </div>

                        {/* Styles & Sizes */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-0.5 text-muted-foreground text-[11px]">
                            <p className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider">Garment Style</p>
                            <p>Collar: {item.style_details?.collar || 'Standard'}</p>
                            <p>Cuffs: {item.style_details?.cuffs || 'Standard'}</p>
                            <p>Pockets: {item.style_details?.pockets || '0'}</p>
                            {item.style_details?.notes && <p className="italic text-muted-foreground/80 mt-1">Note: {item.style_details.notes}</p>}
                          </div>
                          <div className="space-y-0.5 text-muted-foreground text-[11px]">
                            <p className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider">Sizes</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(item.measurement_snapshot || {}).map(([k, v]) => (
                                <span key={k} className="bg-secondary border border-border text-[10px] px-1.5 py-0.5 rounded text-foreground font-mono font-bold">
                                  {k}: {String(v)}"
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Staff Assignment details */}
                        {(currentRole === 'admin' || currentRole === 'sales') && (
                          <div className="border-t border-border pt-2.5 grid grid-cols-2 gap-3">
                            {/* Cutter assignment */}
                            <div className="space-y-1">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Cutter Station</p>
                              {item.assigned_cutter ? (
                                <div className="text-xs font-bold text-foreground flex items-center gap-1">
                                  <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                                  {item.assigned_cutter.name}
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenAssign(item.id, item.garment_type, 'cutter')}
                                  className="h-7 text-xs text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 rounded-lg cursor-pointer w-full text-left justify-start"
                                >
                                  + Assign Cutter
                                </Button>
                              )}
                            </div>

                            {/* Stitcher assignment */}
                            <div className="space-y-1">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Stitcher Station</p>
                              {item.assigned_stitcher ? (
                                <div className="text-xs font-bold text-foreground flex items-center gap-1">
                                  <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                                  {item.assigned_stitcher.name}
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenAssign(item.id, item.garment_type, 'stitcher')}
                                  className="h-7 text-xs text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 rounded-lg cursor-pointer w-full text-left justify-start"
                                >
                                  + Assign Stitcher
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Garment Item production status */}
                        <div className="border-t border-border pt-2.5 flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">Production Status</span>
                          <Select
                            value={item.status}
                            onValueChange={(val) => handleUpdateItemStatus(item.id, val)}
                            disabled={statusLoading}
                          >
                            <SelectTrigger className="bg-background border-border text-foreground h-8 w-36 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-foreground">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="cutting">Cutting In-Progress</SelectItem>
                              <SelectItem value="stitching">Stitching In-Progress</SelectItem>
                              <SelectItem value="ready_for_trial">Ready for Trial</SelectItem>
                              <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Staff Assignment Dialog */}
      <Dialog open={showAssignModal} onOpenChange={(val) => !val && setShowAssignModal(false)}>
        <DialogContent className="max-w-sm bg-popover border border-border text-foreground rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Assign {assignType === 'cutter' ? 'Cutter (Master)' : 'Stitcher (Tailor)'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Assign garment item <strong className="text-foreground">{selectedItemName}</strong> to a production tailor.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignTailorSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Select Staff Member</Label>
              <Select value={assignedTailorId} onValueChange={(val) => val && setAssignedTailorId(val)}>
                <SelectTrigger className="bg-background border-border text-foreground h-9">
                  <SelectValue placeholder="Select staff..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  {assignType === 'cutter'
                    ? cutters.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))
                    : stitchers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payout_rate" className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Piece-Rate payout ($)</Label>
              <Input
                id="payout_rate"
                type="number"
                step="0.01"
                value={payoutRate}
                onChange={(e) => setPayoutRate(e.target.value)}
                disabled={assignLoading}
                className="bg-background border-border text-foreground h-9"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAssignModal(false)}
                className="cursor-pointer text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={assignLoading || !assignedTailorId}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-5 cursor-pointer text-xs h-8"
              >
                {assignLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Assigning...
                  </>
                ) : (
                  'Assign Task'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
