'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Edit2 } from 'lucide-react';
import { customerSchema, type CustomerInput } from '../schemas';
import { createCustomerAction, updateCustomerAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: any; // If provided, we are in edit mode
}

export default function CustomerForm({ open, onClose, onSuccess, customer }: CustomerFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
  });

  // Reset form when opening/changing customer
  useEffect(() => {
    if (open) {
      if (customer) {
        reset({
          name: customer.name || '',
          phone: customer.phone || '',
          email: customer.email || '',
          whatsapp: customer.whatsapp || '',
          address: customer.address || '',
          notes: customer.notes || '',
        });
      } else {
        reset({
          name: '',
          phone: '',
          email: '',
          whatsapp: '',
          address: '',
          notes: '',
        });
      }
    }
  }, [open, customer, reset]);

  const onSubmit = async (data: CustomerInput) => {
    setLoading(true);
    try {
      let response;
      if (customer) {
        response = await updateCustomerAction(customer.id, data);
      } else {
        response = await createCustomerAction(data);
      }

      if (response.success) {
        toast.success(customer ? 'Customer details updated!' : 'New customer registered!');
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
            {customer ? <Edit2 className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-amber-500" />}
            {customer ? 'Edit Customer Details' : 'Register New Customer'}
          </DialogTitle>
          <DialogDescription className="text-stone-400 text-xs">
            {customer ? 'Update contact settings for the customer profile.' : 'Add a new client profile before saving measurements.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
              Full Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g. John Doe"
              {...register('name')}
              disabled={loading}
              className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500/60"
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
              Phone Number *
            </Label>
            <Input
              id="phone"
              placeholder="e.g. +1 555 12345"
              {...register('phone')}
              disabled={loading}
              className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500/60"
            />
            {errors.phone && (
              <p className="text-red-400 text-xs mt-1 font-medium">{errors.phone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                disabled={loading}
                className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500/60"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                WhatsApp Phone
              </Label>
              <Input
                id="whatsapp"
                placeholder="same or distinct number"
                {...register('whatsapp')}
                disabled={loading}
                className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500/60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
              Physical Address
            </Label>
            <Input
              id="address"
              placeholder="Street and City location details"
              {...register('address')}
              disabled={loading}
              className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500/60"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
              Styling Notes / Preferences
            </Label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Fittings, specific fabric sensitivity or cuts..."
              {...register('notes')}
              disabled={loading}
              className="w-full rounded-md border border-stone-800 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
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
                'Save Customer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
