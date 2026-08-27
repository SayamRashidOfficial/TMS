'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Edit2,
  AlertTriangle,
  CheckCircle,
  Scissors,
  Loader2,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import FabricForm from './fabric-form';
import { addStockAction } from '../actions';
import { toast } from 'sonner';

interface Fabric {
  id: string;
  code: string;
  name: string;
  brand: string | null;
  color: string | null;
  pattern: string | null;
  quantity_meters: number;
  min_threshold_meters: number;
  price_per_meter: number;
  image_url: string | null;
  created_at: string;
}

interface FabricListProps {
  initialFabrics: Fabric[];
}

export default function FabricList({ initialFabrics }: FabricListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Stock adjustments states
  const [adjustMeters, setAdjustMeters] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);

  const filteredFabrics = initialFabrics.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.code.toLowerCase().includes(search.toLowerCase()) ||
      (f.brand && f.brand.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdjust = (fabric: Fabric) => {
    setSelectedFabric(fabric);
    setAdjustMeters('');
    setShowAdjustModal(true);
  };

  const handleOpenEdit = (fabric: Fabric) => {
    setSelectedFabric(fabric);
    setShowEditModal(true);
  };

  const handleSaveStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFabric) return;

    const meters = parseFloat(adjustMeters);
    if (isNaN(meters) || meters <= 0) {
      toast.error('Please enter a valid positive stock quantity');
      return;
    }

    setAdjustLoading(true);
    try {
      const response = await addStockAction(selectedFabric.id, meters);
      if (response.success) {
        toast.success(`Added ${meters}m stock to ${selectedFabric.code}`);
        router.refresh();
        setShowAdjustModal(false);
      } else {
        toast.error(response.error || 'Failed to adjust stock');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleRefreshData = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search fabrics by code, title, color or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-amber-500/60 rounded-xl text-xs shadow-xs"
          />
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto h-10 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-5 rounded-xl cursor-pointer shadow-sm shadow-amber-500/10 transition-all flex items-center justify-center gap-1.5 text-xs"
        >
          <Plus className="w-4 h-4" />
          Add Fabric SKU
        </Button>
      </div>

      {/* Grid of Materials */}
      {filteredFabrics.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-card/40">
          <Scissors className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-xs font-semibold">No fabrics found in catalog matching search filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFabrics.map((fabric) => {
            const isLowStock = Number(fabric.quantity_meters) <= Number(fabric.min_threshold_meters);
            return (
              <Card
                key={fabric.id}
                className="border-border bg-card text-card-foreground overflow-hidden flex flex-col justify-between group hover:border-amber-500/40 transition-all duration-200 shadow-xs rounded-2xl"
              >
                {/* Visual Pattern Image Header */}
                <div className="h-36 bg-secondary/50 relative overflow-hidden flex items-center justify-center border-b border-border">
                  {fabric.image_url ? (
                    <img
                      src={fabric.image_url}
                      alt={fabric.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-1">
                      <Bookmark className="w-6 h-6 opacity-40" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Fabric Swatch</span>
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-background/90 text-amber-600 dark:text-amber-400 border border-border backdrop-blur-xs shadow-xs">
                      {fabric.code}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border backdrop-blur-xs shadow-xs ${
                      isLowStock
                        ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    }`}>
                      {isLowStock ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {isLowStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-foreground truncate text-sm">{fabric.name}</h3>
                    <p className="text-[11px] text-muted-foreground font-medium truncate">
                      {fabric.brand || 'Unbranded'} • {fabric.color || 'N/A'} {fabric.pattern ? `(${fabric.pattern})` : ''}
                    </p>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-border pt-2.5">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Available</p>
                      <p className={`text-lg font-extrabold font-mono ${isLowStock ? 'text-red-500' : 'text-foreground'}`}>
                        {Number(fabric.quantity_meters).toFixed(2)}m
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Rate</p>
                      <p className="text-xs font-bold text-foreground font-mono">
                        ${Number(fabric.price_per_meter).toFixed(2)}/m
                      </p>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAdjust(fabric)}
                      className="border-border text-foreground hover:bg-secondary text-[11px] font-bold rounded-lg cursor-pointer h-8 transition-colors"
                    >
                      Adjust (+)
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(fabric)}
                      className="text-muted-foreground hover:text-amber-500 hover:bg-secondary text-[11px] font-bold rounded-lg cursor-pointer h-8 transition-colors"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit SKU
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Adjust Stock Modal */}
      <Dialog open={showAdjustModal} onOpenChange={(val) => !val && setShowAdjustModal(false)}>
        <DialogContent className="max-w-sm bg-popover border border-border text-foreground rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              Stock Adjustment
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Increment stock quantity for SKU <span className="font-bold text-foreground">{selectedFabric?.code}</span>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveStockAdjustment} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="adjust_qty" className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                Meters to Add (Length)
              </Label>
              <Input
                id="adjust_qty"
                type="number"
                step="0.01"
                placeholder="e.g. 15.5"
                value={adjustMeters}
                onChange={(e) => setAdjustMeters(e.target.value)}
                disabled={adjustLoading}
                className="bg-background border-border text-foreground h-9"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdjustModal(false)}
                className="cursor-pointer text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={adjustLoading}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-5 cursor-pointer text-xs h-8"
              >
                {adjustLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Adding...
                  </>
                ) : (
                  'Increment Stock'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fabric Add/Edit Modals */}
      <FabricForm
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleRefreshData}
      />

      {selectedFabric && (
        <FabricForm
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleRefreshData}
          fabric={selectedFabric}
        />
      )}
    </div>
  );
}
