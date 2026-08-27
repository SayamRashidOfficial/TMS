'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Edit3 } from 'lucide-react';
import { fabricSchema, type FabricInput } from '../schemas';
import { createFabricAction, updateFabricAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface FabricFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fabric?: any; // If provided, edit mode
}

interface FabricFormValues {
  code: string;
  name: string;
  brand?: string;
  color?: string;
  pattern?: string;
  quantity_meters: number;
  min_threshold_meters: number;
  price_per_meter: number;
  image_url?: string;
}

export default function FabricForm({ open, onClose, onSuccess, fabric }: FabricFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FabricFormValues>({
    resolver: zodResolver(fabricSchema) as any,
  });

  // Prefill details if edit mode
  useEffect(() => {
    if (open) {
      if (fabric) {
        reset({
          code: fabric.code || '',
          name: fabric.name || '',
          brand: fabric.brand || '',
          color: fabric.color || '',
          pattern: fabric.pattern || '',
          quantity_meters: fabric.quantity_meters || 0,
          min_threshold_meters: fabric.min_threshold_meters || 5,
          price_per_meter: fabric.price_per_meter || 10,
          image_url: fabric.image_url || '',
        });
      } else {
        reset({
          code: '',
          name: '',
          brand: '',
          color: '',
          pattern: '',
          quantity_meters: 0,
          min_threshold_meters: 5,
          price_per_meter: 10,
          image_url: '',
        });
      }
    }
  }, [open, fabric, reset]);

  const onSubmit = async (data: FabricInput) => {
    setLoading(true);
    try {
      let response;
      if (fabric) {
        response = await updateFabricAction(fabric.id, data);
      } else {
        response = await createFabricAction(data);
      }

      if (response.success) {
        toast.success(fabric ? 'Fabric details updated!' : 'Fabric SKU registered successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error(response.error || 'Operation failed');
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md bg-stone-950 border border-stone-850 text-stone-100 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {fabric ? <Edit3 className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-amber-500" />}
            {fabric ? 'Edit Fabric SKU Details' : 'Register New Fabric Material'}
          </DialogTitle>
          <DialogDescription className="text-stone-400 text-xs">
            {fabric ? 'Modify pricing or stock alarm configurations.' : 'Add fabric items to inventory stock ledger.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                SKU Code *
              </Label>
              <Input
                id="code"
                placeholder="FAB-LINEN-001"
                {...register('code')}
                disabled={loading}
                className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500/60"
              />
              {errors.code && (
                <p className="text-red-400 text-xs mt-1 font-medium">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                Fabric Title *
              </Label>
              <Input
                id="name"
                placeholder="Italian Wool"
                {...register('name')}
                disabled={loading}
                className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500/60"
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="brand" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                Brand
              </Label>
              <Input
                id="brand"
                placeholder="Loro Piana"
                {...register('brand')}
                disabled={loading}
                className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="color" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                Color
              </Label>
              <Input
                id="color"
                placeholder="Navy Blue"
                {...register('color')}
                disabled={loading}
                className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pattern" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                Pattern
              </Label>
              <Input
                id="pattern"
                placeholder="Solid / Stripes"
                {...register('pattern')}
                disabled={loading}
                className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantity_meters" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                Meters Stock *
              </Label>
              <Input
                id="quantity_meters"
                type="number"
                step="0.01"
                placeholder="0.0"
                {...register('quantity_meters')}
                disabled={loading || !!fabric} // Don't let edit initial stock directly, use Stock Adjust instead
                className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500/60"
              />
              {errors.quantity_meters && (
                <p className="text-red-400 text-xs mt-1 font-medium">{errors.quantity_meters.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="min_threshold_meters" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                Low Alarm *
              </Label>
              <Input
                id="min_threshold_meters"
                type="number"
                step="0.01"
                placeholder="5.0"
                {...register('min_threshold_meters')}
                disabled={loading}
                className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500/60"
              />
              {errors.min_threshold_meters && (
                <p className="text-red-400 text-xs mt-1 font-medium">{errors.min_threshold_meters.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price_per_meter" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                Price/Meter *
              </Label>
              <Input
                id="price_per_meter"
                type="number"
                step="0.01"
                placeholder="10.0"
                {...register('price_per_meter')}
                disabled={loading}
                className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500/60"
              />
              {errors.price_per_meter && (
                <p className="text-red-400 text-xs mt-1 font-medium">{errors.price_per_meter.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="image_url" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
              Fabric Image URL
            </Label>
            <Input
              id="image_url"
              placeholder="https://images.unsplash.com/..."
              {...register('image_url')}
              disabled={loading}
              className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500/60"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-stone-900">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="hover:bg-stone-900 text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Fabric'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
