import { z } from 'zod';

export const customerSchema = z.object({
  customer_id: z.string().optional(),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  father_or_husband_name: z.string().optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  alt_phone: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).default('male'),
  dob: z.string().optional().or(z.literal('')),
  cnic: z.string().optional().or(z.literal('')),
  category: z.enum(['regular', 'vip', 'corporate']).default('regular'),
  occupation: z.string().optional().or(z.literal('')),
  language: z.string().optional().or(z.literal('')),
  nationality: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'vip', 'new']).default('new'),
  is_vip: z.boolean().default(false),
  photo_url: z.string().optional().or(z.literal('')),
});
export type CustomerInput = z.infer<typeof customerSchema>;

export const customerAddressSchema = z.object({
  customer_id: z.string().uuid(),
  country: z.string().default('Pakistan'),
  province: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  area: z.string().optional().or(z.literal('')),
  street_address: z.string().min(2, 'Street address is required'),
  postal_code: z.string().optional().or(z.literal('')),
  google_maps_url: z.string().optional().or(z.literal('')),
  lat: z.number().optional(),
  lng: z.number().optional(),
  is_primary: z.boolean().default(true),
});
export type CustomerAddressInput = z.infer<typeof customerAddressSchema>;

export const customerPreferenceSchema = z.object({
  customer_id: z.string().uuid(),
  contact_method: z.string().default('phone'),
  delivery_preference: z.string().default('pickup'),
  payment_preference: z.string().default('cash'),
  special_preferences: z.string().optional().or(z.literal('')),
});
export type CustomerPreferenceInput = z.infer<typeof customerPreferenceSchema>;

export const customerNoteSchema = z.object({
  customer_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  is_pinned: z.boolean().default(false),
});
export type CustomerNoteInput = z.infer<typeof customerNoteSchema>;
