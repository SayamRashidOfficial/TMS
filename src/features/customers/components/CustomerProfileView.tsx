'use client';

import React, { useState } from 'react';
import { useCustomerStore } from '@/store/useCustomerStore';
import {
  Customer,
  MeasurementProfile,
  CustomerImage,
  CustomerNote,
  ClothingImageCategory,
  DesignImageCategory,
  GarmentType,
} from '@/types/customer';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Crown,
  Ruler,
  ShoppingBag,
  Image as ImageIcon,
  FileText,
  Clock,
  Plus,
  Trash2,
  Edit,
  Printer,
  Copy,
  Download,
  Share2,
  MessageSquare,
  Sparkles,
  Search,
  Pin,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  UploadCloud,
  Eye,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CustomerImageLightbox from './CustomerImageLightbox';
import MeasurementPrintModal from './MeasurementPrintModal';
import { toast } from 'sonner';

interface CustomerProfileViewProps {
  customerId: string;
  onEditCustomer: (customer: Customer) => void;
}

export default function CustomerProfileView({
  customerId,
  onEditCustomer,
}: CustomerProfileViewProps) {
  const {
    customers,
    measurementsMap,
    imagesMap,
    notesMap,
    ordersMap,
    timelineMap,
    addMeasurementProfile,
    deleteMeasurementProfile,
    uploadCustomerImage,
    deleteCustomerImage,
    renameCustomerImage,
    addNote,
    deleteNote,
    togglePinNote,
    setViewMode,
  } = useCustomerStore();

  const customer = customers.find((c) => c.id === customerId);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'measurements' | 'orders' | 'design_gallery' | 'clothing_gallery' | 'notes' | 'invoices' | 'timeline'
  >('overview');

  // Modal / Lightbox States
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<CustomerImage | null>(null);
  const [selectedPrintMeasurement, setSelectedPrintMeasurement] = useState<MeasurementProfile | null>(null);

  // New Measurement Profile Form state
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [newMeasurementName, setNewMeasurementName] = useState('');
  const [newGarmentType, setNewGarmentType] = useState<GarmentType>('formal_suit');
  const [newMeasurementValues, setNewMeasurementValues] = useState<Record<string, number>>({
    chest: 42,
    waist: 36,
    shoulder: 18.5,
    sleeve: 25.5,
    neck: 16.5,
    shirtLength: 30,
    trouserLength: 41,
  });

  // Note form state
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notePriority, setNotePriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  // Search/Filter for notes & galleries
  const [noteSearch, setNoteSearch] = useState('');

  if (!customer) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <User className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="font-semibold text-foreground">Customer profile not found.</p>
        <Button onClick={() => setViewMode('list')} className="mt-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold">
          Return to Customer List
        </Button>
      </div>
    );
  }

  const measurements = measurementsMap[customerId] || [];
  const images = imagesMap[customerId] || [];
  const clothingImages = images.filter((img) => img.type === 'clothing');
  const designImages = images.filter((img) => img.type === 'design');
  const notes = notesMap[customerId] || [];
  const orders = ordersMap[customerId] || [];
  const timeline = timelineMap[customerId] || [];

  const handleCreateMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeasurementName.trim()) {
      toast.error('Measurement Profile Name is required');
      return;
    }
    addMeasurementProfile({
      customerId: customer.id,
      name: newMeasurementName.trim(),
      garmentType: newGarmentType,
      measurements: newMeasurementValues,
      unit: 'in',
      version: 1,
      createdBy: 'Master Tailor',
    });
    setShowAddMeasurement(false);
    setNewMeasurementName('');
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) {
      toast.error('Title and content are required');
      return;
    }
    addNote(customer.id, {
      customerId: customer.id,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      createdBy: 'Atelier Staff',
      priority: notePriority,
      tags: ['Client Note'],
      isPinned: false,
    });
    setShowAddNote(false);
    setNoteTitle('');
    setNoteContent('');
  };

  const handleSimulateUpload = (type: 'clothing' | 'design', category: string) => {
    const sampleUrls = [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=600',
    ];
    const randomUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
    uploadCustomerImage(customer.id, {
      url: randomUrl,
      name: `${category.replace('_', ' ').toUpperCase()} Upload #${Date.now().toString().slice(-4)}`,
      category: category as any,
      type,
      sizeBytes: Math.floor(1000000 + Math.random() * 2000000),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner & Quick Profile Card */}
      <div className="rounded-2xl border border-border bg-card text-card-foreground backdrop-blur-md p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Avatar & Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  customer.photoUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'
                }
                alt={customer.fullName}
                className="w-20 h-20 rounded-full object-cover border-2 border-amber-500/40 shadow-xl"
              />
              {customer.isVip && (
                <span className="absolute -top-1 -right-1 p-1 rounded-full bg-amber-500 text-stone-950 shadow-md">
                  <Crown className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-foreground">{customer.fullName}</h1>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {customer.customerId}
                </span>
                {customer.isVip && (
                  <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[10px] uppercase font-bold">
                    VIP Member
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5">
                <span className="capitalize font-semibold text-foreground/80">{customer.category} Client</span>
                <span>•</span>
                <span>{customer.occupation || 'N/A'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  {customer.address?.city || 'Pakistan'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Contact Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`tel:${customer.mobile}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background border border-border text-xs font-semibold text-foreground hover:border-amber-500 transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              Call
            </a>
            <a
              href={`https://wa.me/${customer.whatsApp?.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp
            </a>
            <a
              href={`mailto:${customer.email}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background border border-border text-xs font-semibold text-foreground hover:border-amber-500 transition-colors shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              Email
            </a>
            <Button
              onClick={() => onEditCustomer(customer)}
              variant="outline"
              size="sm"
              className="h-9 px-3.5 rounded-xl bg-background border-border text-foreground hover:bg-secondary text-xs gap-1.5 cursor-pointer shadow-xs"
            >
              <Edit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-border text-xs">
          <div className="p-3 rounded-xl bg-muted/40 border border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Orders</span>
            <div className="text-base font-extrabold text-foreground mt-0.5">{customer.totalOrders}</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Pending</span>
            <div className="text-base font-extrabold text-orange-600 dark:text-orange-400 mt-0.5">{customer.pendingOrders}</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Completed</span>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{customer.completedOrders}</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Sizing Profiles</span>
            <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{measurements.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Spent</span>
            <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              Rs. {customer.totalSpent.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-secondary/70 border border-border rounded-xl text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'overview' ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('measurements')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'measurements' ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          Measurements ({measurements.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'orders' ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('design_gallery')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'design_gallery' ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Design Gallery ({designImages.length})
        </button>
        <button
          onClick={() => setActiveTab('clothing_gallery')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'clothing_gallery' ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Clothing Photos ({clothingImages.length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'notes' ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Notes ({notes.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'invoices' ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Invoices & Payments
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'timeline' ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Activity Timeline
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Left Column: Demographics & Contact */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-card border border-border text-card-foreground shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-amber-600 dark:text-amber-400 border-b border-border pb-2">
                Personal Information
              </h3>
              <div className="space-y-2.5 text-xs text-foreground/90">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Father/Husband:</span>
                  <span className="font-semibold text-foreground">{customer.fatherOrHusbandName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CNIC:</span>
                  <span className="font-mono text-foreground">{customer.cnic || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="capitalize text-foreground">{customer.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language:</span>
                  <span className="text-foreground">{customer.language || 'Urdu'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nationality:</span>
                  <span className="text-foreground">{customer.nationality || 'Pakistani'}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border text-card-foreground shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-amber-600 dark:text-amber-400 border-b border-border pb-2">
                Address & Emergency Contact
              </h3>
              <div className="space-y-2.5 text-xs text-foreground/90">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Street Address:</span>
                  <span className="font-medium text-foreground">
                    {customer.address?.streetAddress}, {customer.address?.area}, {customer.address?.city}
                  </span>
                </div>
                {customer.emergencyContact?.name && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-1">
                      Emergency Contact
                    </span>
                    <div className="font-bold text-foreground">{customer.emergencyContact.name} ({customer.emergencyContact.relationship})</div>
                    <div className="font-mono text-muted-foreground">{customer.emergencyContact.phone}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Column: Sizing & Recent Orders */}
          <div className="space-y-6 lg:col-span-2">
            {/* Sizing Summary */}
            <div className="p-5 rounded-2xl bg-card border border-border text-card-foreground shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-bold text-sm text-amber-600 dark:text-amber-400">Latest Measurement Spec</h3>
                <Button
                  onClick={() => setActiveTab('measurements')}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  View All Profiles ({measurements.length})
                </Button>
              </div>

              {measurements.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">No measurement spec stored.</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span>{measurements[0].name} (v{measurements[0].version})</span>
                    <span className="text-muted-foreground">{new Date(measurements[0].createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {Object.entries(measurements[0].measurements).map(([k, v]) => (
                      <div key={k} className="p-2 rounded-lg bg-muted/40 border border-border text-center">
                        <span className="text-[9px] text-muted-foreground uppercase block truncate">{k}</span>
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{v}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="p-5 rounded-2xl bg-card border border-border text-card-foreground shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-bold text-sm text-amber-600 dark:text-amber-400">Recent Tailoring Orders</h3>
                <Button
                  onClick={() => setActiveTab('orders')}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  View All Orders ({orders.length})
                </Button>
              </div>

              {orders.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">No orders placed yet.</div>
              ) : (
                <div className="space-y-2.5">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-foreground">{ord.orderNumber}</div>
                        <div className="text-[11px] text-muted-foreground">{ord.items.map((i) => i.garmentType).join(', ')}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-amber-600 dark:text-amber-400">Rs. {ord.totalAmount.toLocaleString()}</div>
                        <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[9px] uppercase font-bold mt-0.5">
                          {ord.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEASUREMENTS */}
      {activeTab === 'measurements' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-foreground">Customer Sizing Profiles</h3>
            <Button
              onClick={() => setShowAddMeasurement(!showAddMeasurement)}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs gap-1.5 h-9 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Measurement Profile
            </Button>
          </div>

          {/* Add Measurement Profile Drawer Form */}
          {showAddMeasurement && (
            <form onSubmit={handleCreateMeasurement} className="p-5 rounded-2xl bg-card border border-amber-500/30 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-amber-600 dark:text-amber-400">New Measurement Profile</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Profile Name *</label>
                  <Input
                    placeholder="e.g. Formal Suit 3-Piece"
                    value={newMeasurementName}
                    onChange={(e) => setNewMeasurementName(e.target.value)}
                    className="h-9 bg-background dark:bg-stone-900 border-input text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Garment Type</label>
                  <select
                    value={newGarmentType}
                    onChange={(e) => setNewGarmentType(e.target.value as GarmentType)}
                    className="w-full h-9 px-3 bg-background dark:bg-stone-900 border border-input text-xs text-foreground rounded-xl outline-none"
                  >
                    <option value="formal_suit">Formal Suit</option>
                    <option value="casual_shirt">Casual Shirt</option>
                    <option value="wedding_sherwani">Wedding Sherwani</option>
                    <option value="kurta">Kurta Shalwar</option>
                    <option value="waistcoat">Waistcoat</option>
                    <option value="trouser">Trouser</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Measurement Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
                {['neck', 'shoulder', 'chest', 'waist', 'hip', 'sleeve', 'shirtLength', 'trouserLength', 'thigh', 'knee', 'bottom', 'collar'].map((field) => (
                  <div key={field}>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 truncate">
                      {field}
                    </label>
                    <Input
                      type="number"
                      step="0.25"
                      value={newMeasurementValues[field] || ''}
                      onChange={(e) =>
                        setNewMeasurementValues({
                          ...newMeasurementValues,
                          [field]: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-8 bg-background dark:bg-stone-900 border-input text-xs text-amber-600 dark:text-amber-400 font-mono font-bold"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddMeasurement(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold cursor-pointer">
                  Save Sizing Spec
                </Button>
              </div>
            </form>
          )}

          {/* Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {measurements.map((m) => (
              <div key={m.id} className="p-5 rounded-2xl bg-card border border-border text-card-foreground shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-foreground capitalize">{m.name}</h4>
                    <span className="text-[11px] text-muted-foreground">
                      Version {m.version} • Recorded by {m.createdBy}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => setSelectedPrintMeasurement(m)}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs bg-background border-border text-amber-600 dark:text-amber-400 hover:bg-secondary gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Spec Sheet
                    </Button>
                    <Button
                      onClick={() => deleteMeasurementProfile(customer.id, m.id)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center">
                  {Object.entries(m.measurements).map(([k, v]) => (
                    <div key={k} className="p-2 rounded-xl bg-muted/40 border border-border">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase block truncate">{k}</span>
                      <span className="text-sm font-mono font-extrabold text-amber-600 dark:text-amber-400">{v}"</span>
                    </div>
                  ))}
                </div>

                {m.notes && (
                  <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border">
                    <span className="font-bold text-amber-600 dark:text-amber-400">Notes:</span> {m.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-foreground">Order History ({orders.length})</h3>
            <Button
              onClick={() => {
                window.location.href = `/orders?createFor=${customer.id}`;
              }}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs gap-1.5 h-9 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create New Order
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-muted-foreground font-bold uppercase">
                  <th className="p-3.5">Order No</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Delivery Date</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Assigned Tailor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">{ord.orderNumber}</td>
                    <td className="p-3.5 text-muted-foreground">{ord.date}</td>
                    <td className="p-3.5 font-semibold text-foreground">{ord.items.map((i) => i.garmentType).join(', ')}</td>
                    <td className="p-3.5">
                      <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] uppercase font-bold">
                        {ord.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-muted-foreground">{ord.deliveryDate}</td>
                    <td className="p-3.5 font-mono font-bold text-foreground">Rs. {ord.totalAmount.toLocaleString()}</td>
                    <td className="p-3.5 text-muted-foreground">{ord.assignedTailor || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DESIGN GALLERY */}
      {activeTab === 'design_gallery' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-foreground">Customer Design References & Pinterest Inspiration</h3>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleSimulateUpload('design', 'pinterest')}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs gap-1.5 h-9 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                Upload Design Reference
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {designImages.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedLightboxImage(img)}
                className="group relative rounded-2xl border border-border bg-card overflow-hidden cursor-pointer hover:border-amber-500 transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <img src={img.url} alt={img.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-3 space-y-1">
                  <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    {img.category}
                  </span>
                  <h4 className="font-bold text-xs text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate mt-1">{img.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CLOTHING GALLERY */}
      {activeTab === 'clothing_gallery' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-foreground">Customer Clothing & Fabric Photos</h3>
            <Button
              onClick={() => handleSimulateUpload('clothing', 'before_stitching')}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs gap-1.5 h-9 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Outfit Photo
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {clothingImages.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedLightboxImage(img)}
                className="group relative rounded-2xl border border-border bg-card overflow-hidden cursor-pointer hover:border-amber-500 transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <img src={img.url} alt={img.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-3 space-y-1">
                  <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    {img.category.replace('_', ' ')}
                  </span>
                  <h4 className="font-bold text-xs text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate mt-1">{img.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-foreground">Customer Notes ({notes.length})</h3>
            <Button
              onClick={() => setShowAddNote(!showAddNote)}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs gap-1.5 h-9 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Customer Note
            </Button>
          </div>

          {showAddNote && (
            <form onSubmit={handleCreateNote} className="p-5 rounded-2xl bg-card border border-amber-500/30 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-amber-600 dark:text-amber-400">Record Note</h4>
              <Input
                placeholder="Note Title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="h-9 bg-background dark:bg-stone-900 border-input text-xs text-foreground"
              />
              <Textarea
                rows={3}
                placeholder="Write fitting notes or instructions..."
                value={noteContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNoteContent(e.target.value)}
                className="bg-background dark:bg-stone-900 border-input text-xs text-foreground"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddNote(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold cursor-pointer">
                  Save Note
                </Button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div key={note.id} className="p-5 rounded-2xl bg-card border border-border text-card-foreground shadow-xs space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-600 dark:text-red-400">
                    {note.priority}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => togglePinNote(customer.id, note.id)} className="text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer">
                      <Pin className={`w-4 h-4 ${note.isPinned ? 'text-amber-600 dark:text-amber-400 fill-amber-500' : ''}`} />
                    </button>
                    <button onClick={() => deleteNote(customer.id, note.id)} className="text-muted-foreground hover:text-destructive cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h4 className="font-extrabold text-sm text-foreground">{note.title}</h4>
                <p className="text-xs text-foreground/80 leading-relaxed">{note.content}</p>
                <div className="text-[10px] text-muted-foreground pt-2 border-t border-border">
                  By {note.createdBy} on {new Date(note.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="p-8 text-center text-muted-foreground border border-border rounded-2xl bg-card shadow-xs space-y-3">
          <DollarSign className="w-10 h-10 mx-auto text-amber-500" />
          <h4 className="font-extrabold text-sm text-foreground">Billing History & Outstanding Balances</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Total Account Billed: <span className="font-bold text-amber-600 dark:text-amber-400">Rs. {customer.totalSpent.toLocaleString()}</span>. All invoices are synchronized with the Financials tab.
          </p>
        </div>
      )}

      {/* TAB 8: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h3 className="text-base font-extrabold text-foreground">Customer Activity Audit Trail</h3>
          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {timeline.map((item) => (
              <div key={item.id} className="flex items-start gap-4 relative pl-8">
                <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-background" />
                <div className="p-4 rounded-xl bg-card border border-border text-card-foreground shadow-xs text-xs space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                  <span className="text-[10px] text-muted-foreground/80 block">Actor: {item.actor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals & Lightbox */}
      {selectedLightboxImage && (
        <CustomerImageLightbox
          image={selectedLightboxImage}
          onClose={() => setSelectedLightboxImage(null)}
          onDelete={(id) => deleteCustomerImage(customer.id, id)}
          onRename={(id, name) => renameCustomerImage(customer.id, id, name)}
        />
      )}

      {selectedPrintMeasurement && (
        <MeasurementPrintModal
          customer={customer}
          measurement={selectedPrintMeasurement}
          onClose={() => setSelectedPrintMeasurement(null)}
        />
      )}
    </div>
  );
}
