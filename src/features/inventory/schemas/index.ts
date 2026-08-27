import { z } from 'zod';

export const fabricSchema = z.object({
  code: z.string().min(3, 'Fabric SKU code must be at least 3 characters'),
  name: z.string().min(2, 'Fabric title must be at least 2 characters'),
  brand: z.string().optional().or(z.literal('')),
  color: z.string().optional().or(z.literal('')),
  pattern: z.string().optional().or(z.literal('')),
  quantity_meters: z.coerce.number().min(0, 'Quantity cannot be negative'),
  min_threshold_meters: z.coerce.number().min(0, 'Warning threshold cannot be negative'),
  price_per_meter: z.coerce.number().positive('Price must be greater than zero'),
  image_url: z.string().optional().or(z.literal('')),
});

export type FabricInput = z.infer<typeof fabricSchema>;
