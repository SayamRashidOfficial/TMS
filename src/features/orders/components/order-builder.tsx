'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore, type CartItem } from '../store/useCartStore';
import { placeOrderAction } from '../actions';
import { fetchCustomerMeasurementsAction } from '@/features/customers/actions';
import {
  ShoppingBag,
  User,
  Calendar,
  Plus,
  Trash2,
  Ruler,
  Scissors,
  CheckCircle,
  FileText,
  DollarSign,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Fabric {
  id: string;
  code: string;
  name: string;
  quantity_meters: number;
  price_per_meter: number;
}

interface OrderBuilderProps {
  customers: Customer[];
  fabrics: Fabric[];
  templates: any[];
}

export default function OrderBuilder({ customers, fabrics, templates }: OrderBuilderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cart = useCartStore();

  const [loading, setLoading] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  // Form states for adding a cart item
  const [garmentType, setGarmentType] = useState('');
  const [fabricSource, setFabricSource] = useState<'in_store' | 'customer_provided'>('customer_provided');
  const [selectedFabricId, setSelectedFabricId] = useState('');
  const [fabricQty, setFabricQty] = useState('2.5');
  const [stitchingPrice, setStitchingPrice] = useState('45.00');
  const [collarStyle, setCollarStyle] = useState('Spread');
  const [cuffStyle, setCuffStyle] = useState('Rounded');
  const [pocketCount, setPocketCount] = useState('1');
  const [customStyleNotes, setCustomStyleNotes] = useState('');
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  
  const [loadingSizes, setLoadingSizes] = useState(false);

  // Check if customer query parameter is set to auto-select
  useEffect(() => {
    const custIdParam = searchParams.get('customer');
    if (custIdParam) {
      const match = customers.find((c) => c.id === custIdParam);
      if (match) {
        cart.setCustomer(match.id, match.name);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, customers]);

  // Set default garment type and size fields
  useEffect(() => {
    if (templates.length > 0 && !garmentType) {
      setGarmentType(templates[0].name);
    }
  }, [templates, garmentType]);

  // Load customer size records when choosing garment type to pre-fill
  useEffect(() => {
    if (!cart.customerId || !garmentType || !showItemModal) return;

    const loadLatestSizes = async () => {
      setLoadingSizes(true);
      try {
        const matchTemplate = templates.find((t) => t.name === garmentType);
        if (!matchTemplate) return;

        const history = await fetchCustomerMeasurementsAction(cart.customerId);
        const matchSizes = history.find((m) => m.template_id === matchTemplate.id);

        if (matchSizes && typeof matchSizes.measurements === 'object') {
          const loaded: Record<string, string> = {};
          Object.entries(matchSizes.measurements as Record<string, number>).forEach(([k, v]) => {
            loaded[k] = v.toString();
          });
          setMeasurements(loaded);
          toast.info(`Preloaded measurements from version ${matchSizes.version}`);
        } else {
          // Initialize empty
          const empty: Record<string, string> = {};
          matchTemplate.fields.forEach((f: any) => {
            empty[f.name] = '';
          });
          setMeasurements(empty);
        }
      } catch (err) {
        console.error('Failed to load pre-fill sizes', err);
      } finally {
        setLoadingSizes(false);
      }
    };

    loadLatestSizes();
  }, [cart.customerId, garmentType, showItemModal, templates]);

  const handleOpenAddItem = () => {
    if (!cart.customerId) {
      toast.warning('Please select a customer first.');
      return;
    }
    setMeasurements({});
    setSelectedFabricId('');
    setCustomStyleNotes('');
    setShowItemModal(true);
  };

  const handleAddToCart = () => {
    const template = templates.find((t) => t.name === garmentType);
    if (!template) return;

    // Validate size parameters
    const parsedSizes: Record<string, number> = {};
    let errorField = '';
    template.fields.forEach((field: any) => {
      const val = measurements[field.name];
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) {
        errorField = field.label;
      } else {
        parsedSizes[field.name] = num;
      }
    });

    if (errorField) {
      toast.error(`Please input valid size measurement for: ${errorField}`);
      return;
    }

    // Fabric verification
    let unitPriceVal = parseFloat(stitchingPrice);
    if (isNaN(unitPriceVal) || unitPriceVal <= 0) {
      toast.error('Please input valid stitching price.');
      return;
    }

    const selectedFabric = fabrics.find((f) => f.id === selectedFabricId);
    const qtyMeters = parseFloat(fabricQty);

    if (fabricSource === 'in_store') {
      if (!selectedFabric) {
        toast.error('Please select a fabric SKU.');
        return;
      }
      if (isNaN(qtyMeters) || qtyMeters <= 0) {
        toast.error('Please input fabric quantity.');
        return;
      }
      if (selectedFabric.quantity_meters < qtyMeters) {
        toast.error(`Insufficient fabric stock. Only ${selectedFabric.quantity_meters}m available.`);
        return;
      }
      // Add fabric cost to unit price
      unitPriceVal += selectedFabric.price_per_meter * qtyMeters;
    }

    const newItem: CartItem = {
      garment_type: garmentType,
      measurement_snapshot: parsedSizes,
      fabric_source: fabricSource,
      fabric_id: fabricSource === 'in_store' ? selectedFabricId : undefined,
      fabric_qty_used: fabricSource === 'in_store' ? qtyMeters : undefined,
      style_details: {
        collar: collarStyle,
        cuffs: cuffStyle,
        pockets: pocketCount,
        notes: customStyleNotes,
      },
      unit_price: unitPriceVal,
    };

    cart.addItem(newItem);
    toast.success(`${garmentType} added to booking cart`);
    setShowItemModal(false);
  };

  // Sum calculations
  const subtotal = cart.items.reduce((sum, item) => sum + item.unit_price, 0);
  const discountVal = cart.discount;
  const taxVal = Number(((subtotal - discountVal) * (cart.taxPercent / 100)).toFixed(2));
  const totalAmount = Math.max(0, subtotal - discountVal + taxVal);

  const handleSubmitOrder = async () => {
    if (!cart.customerId) {
      toast.error('Please select a customer.');
      return;
    }
    if (cart.items.length === 0) {
      toast.error('Please add at least one clothing item to the order.');
      return;
    }
    if (!cart.dueDate) {
      toast.error('Please pick a target due date.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerId: cart.customerId,
        dueDate: cart.dueDate,
        subtotal,
        discount: discountVal,
        tax: taxVal,
        totalAmount,
        paidAmount: cart.downPayment,
        paymentMethod: cart.paymentMethod,
        notes: cart.notes,
        items: cart.items.map((item) => ({
          garment_type: item.garment_type,
          measurement_snapshot: item.measurement_snapshot,
          fabric_source: item.fabric_source,
          fabric_id: item.fabric_id,
          fabric_qty_used: item.fabric_qty_used,
          style_details: item.style_details,
          unit_price: item.unit_price,
        })),
      };

      const response = await placeOrderAction(payload);
      if (response.success) {
        toast.success('Order booked successfully!');
        cart.clearCart();
        router.push('/orders');
      } else {
        toast.error(response.error || 'Failed to place order');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.name === garmentType);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Checkout details Left */}
      <div className="lg:col-span-2 space-y-6">
        {/* Customer & Due Date selector */}
        <Card className="border-border bg-card text-card-foreground backdrop-blur-sm shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-wide">Client & Delivery Settings</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Specify order details and dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Customer Selector */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Select Customer</Label>
                <Select
                  value={cart.customerId}
                  onValueChange={(val) => {
                    const match = customers.find((c) => c.id === val);
                    if (match) cart.setCustomer(match.id, match.name);
                  }}
                >
                  <SelectTrigger className="bg-background dark:bg-stone-900 border-input text-foreground h-11 rounded-xl focus:border-amber-500/60">
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Delivery Due Date */}
              <div className="space-y-1.5">
                <Label htmlFor="due_date" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Delivery Due Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="due_date"
                    type="date"
                    value={cart.dueDate}
                    onChange={(e) => cart.setDueDate(e.target.value)}
                    className="pl-10 h-11 bg-background dark:bg-stone-900 border-input text-foreground focus:border-amber-500/60 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order_notes" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">General Booking Notes</Label>
              <textarea
                id="order_notes"
                rows={2}
                placeholder="Specific instructions for entire order, package deals..."
                value={cart.notes}
                onChange={(e) => cart.setNotes(e.target.value)}
                className="w-full rounded-xl border border-input bg-background dark:bg-stone-900 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clothing Items list in cart */}
        <Card className="border-border bg-card text-card-foreground backdrop-blur-sm shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold tracking-wide">Garment Bookings</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">List of clothes being tailored under this order</CardDescription>
            </div>
            <Button
              onClick={handleOpenAddItem}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Garment
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.items.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-muted/30 text-muted-foreground text-sm">
                <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
                No garments added yet. Click "Add Garment" to start.
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border bg-secondary/30 dark:bg-stone-950/20 gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground text-base">{item.garment_type}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded border border-border bg-muted text-muted-foreground font-bold capitalize">
                          {item.fabric_source.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 max-w-md">
                        Style: Collar: {item.style_details.collar}, Cuff: {item.style_details.cuffs}, Pockets: {item.style_details.pockets}
                        {item.style_details.notes && ` | Notes: ${item.style_details.notes}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                        ${item.unit_price.toFixed(2)}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => cart.removeItem(idx)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pricing Summary Side Panel */}
      <div className="space-y-6">
        <Card className="border-border bg-card text-card-foreground backdrop-blur-sm shadow-xs sticky top-6">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg font-bold tracking-wide">Ledger Booking Summary</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Total pricing calculations</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Price lines */}
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal (Garments)</span>
                <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Discount ($)</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={cart.discount || ''}
                  onChange={(e) => cart.setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-24 text-right bg-background dark:bg-stone-900 border-input h-8 text-foreground"
                />
              </div>

              {/* Tax Output */}
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Tax ({cart.taxPercent}%)</span>
                <span className="font-semibold text-foreground">${taxVal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4 text-base font-extrabold text-foreground">
                <span>Total Charge</span>
                <span className="text-amber-600 dark:text-amber-400 text-lg">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payments input */}
            <div className="space-y-4 border-t border-border pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="down_payment" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Advance Payment Received</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="down_payment"
                    type="number"
                    placeholder="0.00"
                    value={cart.downPayment || ''}
                    onChange={(e) => cart.setDownPayment(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="pl-9 h-11 bg-background dark:bg-stone-900 border-input text-foreground focus:border-amber-500/60 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Payment Method</Label>
                <Select
                  value={cart.paymentMethod}
                  onValueChange={(val: any) => cart.setPaymentMethod(val)}
                >
                  <SelectTrigger className="bg-background dark:bg-stone-900 border-input text-foreground h-11 rounded-xl focus:border-amber-500/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_wallet">Mobile Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSubmitOrder}
              disabled={loading || cart.items.length === 0}
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-sm tracking-wide rounded-xl cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-stone-950" />
                  Booking Order...
                </>
              ) : (
                'Place Order & Print Receipt'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add Cart Item Dialog popup */}
      <Dialog open={showItemModal} onOpenChange={(val) => !val && setShowItemModal(false)}>
        <DialogContent className="max-w-xl bg-background border border-border text-foreground rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Ruler className="w-5 h-5 text-amber-500" />
              Add Garment Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Configure clothing measurements, fabric and styles.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Garment Selector */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Garment Template</Label>
                <Select value={garmentType} onValueChange={(val) => val && setGarmentType(val)}>
                  <SelectTrigger className="bg-background dark:bg-stone-900 border-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stitching Cost */}
              <div className="space-y-1.5">
                <Label htmlFor="stitching_price" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Stitching Price ($)</Label>
                <Input
                  id="stitching_price"
                  type="number"
                  value={stitchingPrice}
                  onChange={(e) => setStitchingPrice(e.target.value)}
                  className="bg-background dark:bg-stone-900 border-input text-foreground"
                />
              </div>
            </div>

            {/* Fabric Source configuration */}
            <div className="space-y-4 border-t border-border pt-3.5">
              <h4 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Fabric Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Source</Label>
                  <Select
                    value={fabricSource}
                    onValueChange={(val: any) => setFabricSource(val)}
                  >
                    <SelectTrigger className="bg-background dark:bg-stone-900 border-input text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="customer_provided">Customer Provided Fabric</SelectItem>
                      <SelectItem value="in_store">In-Store Stock Fabric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {fabricSource === 'in_store' && (
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Available Catalog SKU</Label>
                    <Select value={selectedFabricId} onValueChange={(val) => val && setSelectedFabricId(val)}>
                      <SelectTrigger className="bg-background dark:bg-stone-900 border-input text-foreground">
                        <SelectValue placeholder="Choose a fabric..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        {fabrics.map((f) => (
                          <SelectItem key={f.id} value={f.id} disabled={f.quantity_meters <= 0}>
                            {f.code} - {f.name} ({f.quantity_meters.toFixed(2)}m)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {fabricSource === 'in_store' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fabric_qty" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Meters Consumed</Label>
                    <Input
                      id="fabric_qty"
                      type="number"
                      step="0.1"
                      value={fabricQty}
                      onChange={(e) => setFabricQty(e.target.value)}
                      className="bg-background dark:bg-stone-900 border-input text-foreground"
                    />
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground pt-6">
                    {(() => {
                      const f = fabrics.find((x) => x.id === selectedFabricId);
                      if (f) {
                        return (
                          <span>
                            Cost: ${f.price_per_meter.toFixed(2)}/m × {fabricQty}m =
                            <strong className="text-foreground ml-1">
                              ${(f.price_per_meter * parseFloat(fabricQty) || 0).toFixed(2)}
                            </strong>
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Styling options */}
            <div className="space-y-4 border-t border-border pt-3.5">
              <h4 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest font-bold">Garment Styling</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="collar_style" className="text-muted-foreground text-xs font-medium">Collar Style</Label>
                  <Input
                    id="collar_style"
                    value={collarStyle}
                    onChange={(e) => setCollarStyle(e.target.value)}
                    className="bg-background dark:bg-stone-900 border-input text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cuff_style" className="text-muted-foreground text-xs font-medium">Cuffs Style</Label>
                  <Input
                    id="cuff_style"
                    value={cuffStyle}
                    onChange={(e) => setCuffStyle(e.target.value)}
                    className="bg-background dark:bg-stone-900 border-input text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pocket_count" className="text-muted-foreground text-xs font-medium">Pockets Count</Label>
                  <Input
                    id="pocket_count"
                    type="number"
                    value={pocketCount}
                    onChange={(e) => setPocketCount(e.target.value)}
                    className="bg-background dark:bg-stone-900 border-input text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="custom_style_notes" className="text-muted-foreground text-xs font-medium">Custom Styling Details</Label>
                <textarea
                  id="custom_style_notes"
                  rows={2}
                  placeholder="Double button cuffs, secret pockets, colored lining threads..."
                  value={customStyleNotes}
                  onChange={(e) => setCustomStyleNotes(e.target.value)}
                  className="w-full rounded-md border border-input bg-background dark:bg-stone-900 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>

            {/* Custom Sizing Parameters */}
            <div className="space-y-4 border-t border-border pt-3.5">
              <h4 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center justify-between">
                <span>Garment Sizes Snapshot (Inches)</span>
                {loadingSizes && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
              </h4>

              {selectedTemplate ? (
                <div className="grid grid-cols-3 gap-3">
                  {selectedTemplate.fields.map((field: any) => (
                    <div key={field.name} className="space-y-1">
                      <Label htmlFor={`snapshot-${field.name}`} className="text-muted-foreground text-[10px] font-semibold uppercase">
                        {field.label}
                      </Label>
                      <Input
                        id={`snapshot-${field.name}`}
                        type="number"
                        step="0.01"
                        placeholder="0.0"
                        value={measurements[field.name] || ''}
                        onChange={(e) =>
                          setMeasurements((prev) => ({
                            ...prev,
                            [field.name]: e.target.value,
                          }))
                        }
                        className="bg-background dark:bg-stone-900 border-input h-9 text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Select a template to configure sizing parameters.</p>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowItemModal(false)}
                className="hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddToCart}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 cursor-pointer text-xs"
              >
                Add Item to Cart
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
