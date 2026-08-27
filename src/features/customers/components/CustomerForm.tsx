'use client';

import React, { useState } from 'react';
import { useCustomerStore } from '@/store/useCustomerStore';
import { Customer, CustomerGender, CustomerCategory, ContactMethod, DeliveryPreference, PaymentPreference } from '@/types/customer';
import {
  User,
  Phone,
  MapPin,
  Heart,
  Ruler,
  Camera,
  Save,
  X,
  ShieldAlert,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createCustomerAction, updateCustomerAction, createAddressAction, updatePreferencesAction } from '@/features/customers/actions';
import { toast } from 'sonner';

interface CustomerFormProps {
  initialCustomer?: Customer | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CustomerForm({
  initialCustomer,
  onSuccess,
  onCancel,
}: CustomerFormProps) {
  const { addCustomer, updateCustomer, setViewMode } = useCustomerStore();
  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'address' | 'emergency' | 'preferences'>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<Customer>>({
    fullName: initialCustomer?.fullName || '',
    fatherOrHusbandName: initialCustomer?.fatherOrHusbandName || '',
    gender: initialCustomer?.gender || 'male',
    dob: initialCustomer?.dob || '',
    cnic: initialCustomer?.cnic || '',
    category: initialCustomer?.category || 'regular',
    occupation: initialCustomer?.occupation || '',
    language: initialCustomer?.language || 'Urdu, English',
    nationality: initialCustomer?.nationality || 'Pakistani',
    mobile: initialCustomer?.mobile || '',
    altNumber: initialCustomer?.altNumber || '',
    whatsApp: initialCustomer?.whatsApp || '',
    email: initialCustomer?.email || '',
    website: initialCustomer?.website || '',
    photoUrl: initialCustomer?.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    address: {
      country: initialCustomer?.address?.country || 'Pakistan',
      province: initialCustomer?.address?.province || 'Punjab',
      city: initialCustomer?.address?.city || 'Lahore',
      area: initialCustomer?.address?.area || '',
      streetAddress: initialCustomer?.address?.streetAddress || '',
      postalCode: initialCustomer?.address?.postalCode || '',
      googleMapsUrl: initialCustomer?.address?.googleMapsUrl || '',
    },
    emergencyContact: {
      name: initialCustomer?.emergencyContact?.name || '',
      relationship: initialCustomer?.emergencyContact?.relationship || '',
      phone: initialCustomer?.emergencyContact?.phone || '',
    },
    preferences: {
      contactMethod: initialCustomer?.preferences?.contactMethod || 'whatsapp',
      deliveryPreference: initialCustomer?.preferences?.deliveryPreference || 'pickup',
      paymentPreference: initialCustomer?.preferences?.paymentPreference || 'cash',
      specialPreferences: initialCustomer?.preferences?.specialPreferences || '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName?.trim()) {
      errs.fullName = 'Full Name is required';
    }
    if (!formData.mobile?.trim()) {
      errs.mobile = 'Mobile Number is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      if (errors.fullName) setActiveTab('personal');
      else if (errors.mobile) setActiveTab('contact');
      return;
    }

    setIsSubmitting(true);

    try {
      const customerInput = {
        full_name: formData.fullName || '',
        father_or_husband_name: formData.fatherOrHusbandName || undefined,
        gender: (formData.gender as 'male' | 'female' | 'other') || 'male',
        dob: formData.dob || undefined,
        cnic: formData.cnic || undefined,
        category: (formData.category as 'regular' | 'vip' | 'corporate') || undefined,
        occupation: formData.occupation || undefined,
        language: formData.language || undefined,
        nationality: formData.nationality || undefined,
        phone: formData.mobile || '',
        alt_phone: formData.altNumber || undefined,
        whatsapp: formData.whatsApp || undefined,
        email: formData.email || undefined,
        photo_url: formData.photoUrl || undefined,
        status: 'new' as const,
        is_vip: formData.category === 'vip',
      };

      if (initialCustomer) {
        const res = await updateCustomerAction(initialCustomer.id, customerInput);
        if (!res.success) throw new Error(res.error || 'Failed to update customer');
        
        updateCustomer(initialCustomer.id, formData);
        toast.success('Customer updated in database successfully');
      } else {
        const res = await createCustomerAction(customerInput);
        if (!res.success || !res.data) throw new Error(res.error || 'Failed to create customer');
        
        const customerData = res.data;
        
        if (formData.address) {
          await createAddressAction({
            customer_id: customerData.id,
            country: formData.address.country || 'Pakistan',
            province: formData.address.province || '',
            city: formData.address.city || '',
            area: formData.address.area || '',
            street_address: formData.address.streetAddress || 'Not Provided',
            postal_code: formData.address.postalCode || '',
            google_maps_url: formData.address.googleMapsUrl || '',
            is_primary: true
          });
        }
        
        if (formData.preferences) {
          await updatePreferencesAction({
            customer_id: customerData.id,
            contact_method: formData.preferences.contactMethod || 'whatsapp',
            delivery_preference: formData.preferences.deliveryPreference || 'pickup',
            payment_preference: formData.preferences.paymentPreference || 'cash',
            special_preferences: formData.preferences.specialPreferences || ''
          });
        }
        
        const created = addCustomer(formData);
        updateCustomer(created.id, { id: customerData.id });
        setViewMode('profile', customerData.id);
      }

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-stone-900/80 backdrop-blur-md p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            {initialCustomer ? 'Edit Customer Profile' : 'Add New Customer Profile'}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Fill in customer demographics, contact details, delivery preferences, and location coordinates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs px-5 h-9 rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isSubmitting ? 'Saving...' : initialCustomer ? 'Update Customer' : 'Save Customer Record'}
          </Button>
        </div>
      </div>

      {/* Form Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1 rounded-xl bg-stone-950/80 border border-stone-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'personal'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <User className="w-4 h-4" />
          1. Personal Info {errors.fullName && <span className="text-red-400 font-bold">*</span>}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'contact'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Phone className="w-4 h-4" />
          2. Contact Details {errors.mobile && <span className="text-red-400 font-bold">*</span>}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('address')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'address'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          3. Address & Location
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('emergency')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'emergency'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          4. Emergency Contact
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'preferences'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          5. Customer Preferences
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab 1: Personal Info */}
        {activeTab === 'personal' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Avatar Upload Preview */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-950/60 border border-stone-850">
              <img
                src={formData.photoUrl}
                alt="Avatar Preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/40"
              />
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">Customer Photo URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="h-8 bg-stone-900 border-stone-800 text-xs w-72 text-stone-200"
                  />
                  <Button type="button" size="sm" variant="outline" className="h-8 text-xs border-stone-800">
                    <Camera className="w-3.5 h-3.5 mr-1" />
                    Browse
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <Input
                  placeholder="e.g. Sha Sheikh Tariq"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`h-10 bg-stone-950 border-stone-800 text-xs text-stone-100 ${
                    errors.fullName ? 'border-red-500' : ''
                  }`}
                />
                {errors.fullName && <span className="text-[10px] text-red-400">{errors.fullName}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Father / Husband Name</label>
                <Input
                  placeholder="e.g. Tariq Mehmood"
                  value={formData.fatherOrHusbandName}
                  onChange={(e) => setFormData({ ...formData, fatherOrHusbandName: e.target.value })}
                  className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as CustomerGender })}
                  className="w-full h-10 px-3 bg-stone-950 border border-stone-800 text-xs text-stone-100 rounded-xl outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Date of Birth</label>
                <Input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">CNIC Number</label>
                <Input
                  placeholder="e.g. 42101-9876543-1"
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Customer Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as CustomerCategory })}
                  className="w-full h-10 px-3 bg-stone-950 border border-stone-800 text-xs text-stone-100 rounded-xl outline-none"
                >
                  <option value="regular">Regular Client</option>
                  <option value="vip">VIP Member</option>
                  <option value="corporate">Corporate Account</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Occupation</label>
                <Input
                  placeholder="e.g. Managing Director"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Language</label>
                <Input
                  placeholder="e.g. Urdu, English"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Nationality</label>
                <Input
                  placeholder="e.g. Pakistani"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Contact Info */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">
                Mobile Number <span className="text-amber-400">*</span>
              </label>
              <Input
                placeholder="e.g. +92 300 8291002"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className={`h-10 bg-stone-950 border-stone-800 text-xs text-stone-100 font-mono ${
                  errors.mobile ? 'border-red-500' : ''
                }`}
              />
              {errors.mobile && <span className="text-[10px] text-red-400">{errors.mobile}</span>}
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">Alternative Phone Number</label>
              <Input
                placeholder="e.g. +92 321 4455667"
                value={formData.altNumber}
                onChange={(e) => setFormData({ ...formData, altNumber: e.target.value })}
                className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">WhatsApp Number</label>
              <Input
                placeholder="e.g. +92 300 8291002"
                value={formData.whatsApp}
                onChange={(e) => setFormData({ ...formData, whatsApp: e.target.value })}
                className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">Email Address</label>
              <Input
                type="email"
                placeholder="e.g. tariq.sheikh@enterprise.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">Website / Portfolio</label>
              <Input
                placeholder="e.g. www.sheikhgroup.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Address & Location */}
        {activeTab === 'address' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">Country</label>
              <Input
                value={formData.address?.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address!, country: e.target.value },
                  })
                }
                className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">Province / State</label>
              <Input
                placeholder="e.g. Punjab"
                value={formData.address?.province}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address!, province: e.target.value },
                  })
                }
                className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">City</label>
              <Input
                placeholder="e.g. Lahore"
                value={formData.address?.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address!, city: e.target.value },
                  })
                }
                className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">Area / Sector</label>
              <Input
                placeholder="e.g. Gulberg III"
                value={formData.address?.area}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address!, area: e.target.value },
                  })
                }
                className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">Postal Code</label>
              <Input
                placeholder="e.g. 54000"
                value={formData.address?.postalCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address!, postalCode: e.target.value },
                  })
                }
                className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-bold text-stone-300 block mb-1">Street Address</label>
              <Input
                placeholder="e.g. House 42-B, Block Z, M.M. Alam Road"
                value={formData.address?.streetAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address!, streetAddress: e.target.value },
                  })
                }
                className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-bold text-stone-300 block mb-1">Google Maps Pin URL</label>
              <Input
                placeholder="https://maps.google.com/..."
                value={formData.address?.googleMapsUrl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address!, googleMapsUrl: e.target.value },
                  })
                }
                className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100 font-mono"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Emergency Contact */}
        {activeTab === 'emergency' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">Emergency Contact Name</label>
              <Input
                placeholder="e.g. Farida Sheikh"
                value={formData.emergencyContact?.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact!, name: e.target.value },
                  })
                }
                className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">Relationship</label>
              <Input
                placeholder="e.g. Wife / Brother"
                value={formData.emergencyContact?.relationship}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact!, relationship: e.target.value },
                  })
                }
                className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">Phone Number</label>
              <Input
                placeholder="e.g. +92 301 9988776"
                value={formData.emergencyContact?.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact!, phone: e.target.value },
                  })
                }
                className="h-10 bg-stone-950 border-stone-800 text-xs text-stone-100 font-mono"
              />
            </div>
          </div>
        )}

        {/* Tab 5: Preferences */}
        {activeTab === 'preferences' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Preferred Contact Method</label>
                <select
                  value={formData.preferences?.contactMethod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferences: { ...formData.preferences!, contactMethod: e.target.value as ContactMethod },
                    })
                  }
                  className="w-full h-10 px-3 bg-stone-950 border border-stone-800 text-xs text-stone-100 rounded-xl outline-none"
                >
                  <option value="whatsApp">WhatsApp</option>
                  <option value="phone">Phone Call</option>
                  <option value="sms">SMS Text</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Preferred Delivery</label>
                <select
                  value={formData.preferences?.deliveryPreference}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferences: { ...formData.preferences!, deliveryPreference: e.target.value as DeliveryPreference },
                    })
                  }
                  className="w-full h-10 px-3 bg-stone-950 border border-stone-800 text-xs text-stone-100 rounded-xl outline-none"
                >
                  <option value="pickup">In-Store Pickup</option>
                  <option value="delivery">Atelier Home Delivery</option>
                  <option value="courier">Courier Dispatch</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Preferred Payment Method</label>
                <select
                  value={formData.preferences?.paymentPreference}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferences: { ...formData.preferences!, paymentPreference: e.target.value as PaymentPreference },
                    })
                  }
                  className="w-full h-10 px-3 bg-stone-950 border border-stone-800 text-xs text-stone-100 rounded-xl outline-none"
                >
                  <option value="cash">Cash on Delivery / Pickup</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="online">Online Bank Transfer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">Special Atelier Fitting Notes & Styling Preferences</label>
              <Textarea
                rows={3}
                placeholder="e.g. Prefers Italian Super 150s fabrics, soft shoulder construction, extra waist taper..."
                value={formData.preferences?.specialPreferences}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({
                    ...formData,
                    preferences: { ...formData.preferences!, specialPreferences: e.target.value },
                  })
                }
                className="bg-stone-950 border-stone-800 text-xs text-stone-100"
              />
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-xs text-stone-400">
            {activeTab === 'personal' && 'Step 1 of 5: Demographic details'}
            {activeTab === 'contact' && 'Step 2 of 5: Phone and digital contacts'}
            {activeTab === 'address' && 'Step 3 of 5: Location coordinates'}
            {activeTab === 'emergency' && 'Step 4 of 5: Emergency backup contact'}
            {activeTab === 'preferences' && 'Step 5 of 5: Fitting preferences'}
          </div>

          <div className="flex gap-2">
            {activeTab !== 'personal' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (activeTab === 'contact') setActiveTab('personal');
                  else if (activeTab === 'address') setActiveTab('contact');
                  else if (activeTab === 'emergency') setActiveTab('address');
                  else if (activeTab === 'preferences') setActiveTab('emergency');
                }}
                className="bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800 h-9"
              >
                Previous
              </Button>
            )}

            {activeTab !== 'preferences' ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (activeTab === 'personal') setActiveTab('contact');
                  else if (activeTab === 'contact') setActiveTab('address');
                  else if (activeTab === 'address') setActiveTab('emergency');
                  else if (activeTab === 'emergency') setActiveTab('preferences');
                }}
                className="bg-stone-800 hover:bg-stone-700 text-stone-100 h-9"
              >
                Next Step
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold h-9 px-5 shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-1.5" />
                {isSubmitting ? 'Saving...' : 'Complete Registration'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
