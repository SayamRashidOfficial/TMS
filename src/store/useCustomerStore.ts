import { create } from 'zustand';
import {
  Customer,
  CustomerFilterState,
  MeasurementProfile,
  CustomerImage,
  CustomerNote,
  CustomerOrderHistory,
  ActivityTimelineItem,
  ClothingImageCategory,
  DesignImageCategory,
} from '@/types/customer';
import {
  INITIAL_CUSTOMERS,
  INITIAL_MEASUREMENTS,
  INITIAL_IMAGES,
  INITIAL_NOTES,
  INITIAL_ORDERS,
  INITIAL_TIMELINE,
} from '@/features/customers/data/mockCustomers';
import { toast } from 'sonner';

export type CustomerViewMode = 'list' | 'add' | 'profile' | 'analytics';

interface CustomerStoreState {
  // Navigation & View
  viewMode: CustomerViewMode;
  selectedCustomerId: string | null;
  
  // Datasets
  customers: Customer[];
  measurementsMap: Record<string, MeasurementProfile[]>;
  imagesMap: Record<string, CustomerImage[]>;
  notesMap: Record<string, CustomerNote[]>;
  ordersMap: Record<string, CustomerOrderHistory[]>;
  timelineMap: Record<string, ActivityTimelineItem[]>;

  // Selection & Bulk Actions
  selectedCustomerIds: string[];

  // Filters & Sorting
  filters: CustomerFilterState;

  // Actions - View Management
  setViewMode: (mode: CustomerViewMode, customerId?: string | null) => void;

  // Actions - Customer CRUD
  addCustomer: (customerData: Partial<Customer>) => Customer;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  bulkDeleteCustomers: () => void;
  bulkAssignCategory: (category: 'regular' | 'vip' | 'corporate') => void;
  bulkAddTags: (tag: string) => void;

  // Actions - Selection
  toggleSelectCustomer: (id: string) => void;
  selectAllCustomers: (select: boolean) => void;
  clearSelection: () => void;
  setCustomers: (customers: Customer[]) => void;

  // Actions - Filters
  setSearch: (search: string) => void;
  setFilter: <K extends keyof CustomerFilterState>(key: K, value: CustomerFilterState[K]) => void;
  resetFilters: () => void;

  // Actions - Measurements
  addMeasurementProfile: (profile: Omit<MeasurementProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMeasurementProfile: (id: string, measurements: MeasurementProfile['measurements'], notes?: string) => void;
  deleteMeasurementProfile: (customerId: string, profileId: string) => void;

  // Actions - Images
  uploadCustomerImage: (
    customerId: string,
    file: { url: string; name: string; category: ClothingImageCategory | DesignImageCategory; type: 'clothing' | 'design'; sizeBytes?: number }
  ) => void;
  deleteCustomerImage: (customerId: string, imageId: string) => void;
  renameCustomerImage: (customerId: string, imageId: string, newName: string) => void;

  // Actions - Notes
  addNote: (customerId: string, note: Omit<CustomerNote, 'id' | 'createdAt'>) => void;
  updateNote: (customerId: string, noteId: string, data: Partial<CustomerNote>) => void;
  deleteNote: (customerId: string, noteId: string) => void;
  togglePinNote: (customerId: string, noteId: string) => void;

  // Actions - Import / Export
  importCustomers: (importedList: Partial<Customer>[]) => void;
}

const defaultFilters: CustomerFilterState = {
  search: '',
  gender: 'all',
  city: 'all',
  status: 'all',
  category: 'all',
  vipOnly: false,
  newOnly: false,
  activeOnly: false,
  dateRange: 'all',
  sortBy: 'latest',
};

export const useCustomerStore = create<CustomerStoreState>((set, get) => ({
  viewMode: 'list',
  selectedCustomerId: null,

  customers: INITIAL_CUSTOMERS,
  measurementsMap: INITIAL_MEASUREMENTS,
  imagesMap: INITIAL_IMAGES,
  notesMap: INITIAL_NOTES,
  ordersMap: INITIAL_ORDERS,
  timelineMap: INITIAL_TIMELINE,

  selectedCustomerIds: [],
  filters: defaultFilters,

  // View Mode
  setViewMode: (mode, customerId = null) => {
    set({
      viewMode: mode,
      selectedCustomerId: customerId !== undefined ? customerId : get().selectedCustomerId,
    });
  },

  // Customer CRUD
  addCustomer: (data) => {
    const nextId = `c-${Date.now()}`;
    const nextCustNum = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newCustomer: Customer = {
      id: nextId,
      customerId: nextCustNum,
      fullName: data.fullName || 'Unnamed Customer',
      fatherOrHusbandName: data.fatherOrHusbandName || '',
      gender: data.gender || 'male',
      dob: data.dob,
      cnic: data.cnic,
      category: data.category || 'regular',
      occupation: data.occupation || '',
      language: data.language || 'Urdu, English',
      nationality: data.nationality || 'Pakistani',
      mobile: data.mobile || '+92 300 0000000',
      altNumber: data.altNumber,
      whatsApp: data.whatsApp || data.mobile,
      email: data.email,
      website: data.website,
      address: data.address || {
        country: 'Pakistan',
        province: 'Punjab',
        city: 'Lahore',
        streetAddress: 'Main Boulevard',
      },
      emergencyContact: data.emergencyContact,
      preferences: data.preferences || {
        contactMethod: 'whatsapp',
        deliveryPreference: 'pickup',
        paymentPreference: 'cash',
      },
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalSpent: 0,
      lastVisit: now,
      status: 'new',
      isVip: data.category === 'vip',
      createdAt: now,
      updatedAt: now,
      photoUrl: data.photoUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
    };

    const newTimelineItem: ActivityTimelineItem = {
      id: `act-${Date.now()}`,
      customerId: nextId,
      title: 'Customer Profile Created',
      description: `Registered new client profile ${newCustomer.fullName}.`,
      type: 'created',
      timestamp: now,
      actor: 'Admin Staff',
    };

    set((state) => ({
      customers: [newCustomer, ...state.customers],
      timelineMap: {
        ...state.timelineMap,
        [nextId]: [newTimelineItem],
      },
    }));

    toast.success(`Customer ${newCustomer.fullName} registered successfully!`);
    return newCustomer;
  },

  updateCustomer: (id, data) => {
    const now = new Date().toISOString();
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id
          ? {
              ...c,
              ...data,
              isVip: data.category ? data.category === 'vip' : c.isVip,
              updatedAt: now,
            }
          : c
      ),
    }));
    toast.success('Customer profile updated');
  },

  deleteCustomer: (id) => {
    const target = get().customers.find((c) => c.id === id);
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
      selectedCustomerIds: state.selectedCustomerIds.filter((sid) => sid !== id),
      selectedCustomerId: state.selectedCustomerId === id ? null : state.selectedCustomerId,
      viewMode: state.selectedCustomerId === id ? 'list' : state.viewMode,
    }));
    toast.success(`Customer ${target?.fullName || ''} deleted`);
  },

  bulkDeleteCustomers: () => {
    const count = get().selectedCustomerIds.length;
    if (!count) return;
    set((state) => ({
      customers: state.customers.filter((c) => !state.selectedCustomerIds.includes(c.id)),
      selectedCustomerIds: [],
    }));
    toast.success(`Deleted ${count} customer records`);
  },

  bulkAssignCategory: (category) => {
    const ids = get().selectedCustomerIds;
    if (!ids.length) return;
    set((state) => ({
      customers: state.customers.map((c) =>
        ids.includes(c.id) ? { ...c, category, isVip: category === 'vip' } : c
      ),
      selectedCustomerIds: [],
    }));
    toast.success(`Updated category for ${ids.length} customers`);
  },

  bulkAddTags: (tag) => {
    toast.success(`Tag "${tag}" added to selected records`);
    set({ selectedCustomerIds: [] });
  },

  // Selection
  toggleSelectCustomer: (id) => {
    set((state) => {
      const exists = state.selectedCustomerIds.includes(id);
      return {
        selectedCustomerIds: exists
          ? state.selectedCustomerIds.filter((i) => i !== id)
          : [...state.selectedCustomerIds, id],
      };
    });
  },

  selectAllCustomers: (select) => {
    set((state) => ({
      selectedCustomerIds: select ? state.customers.map((c) => c.id) : [],
    }));
  },

  clearSelection: () => set({ selectedCustomerIds: [] }),
  setCustomers: (customers) => set({ customers }),

  // Filters
  setSearch: (search) => {
    set((state) => ({
      filters: { ...state.filters, search },
    }));
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
  },

  resetFilters: () => set({ filters: defaultFilters }),

  // Measurements
  addMeasurementProfile: (profileData) => {
    const now = new Date().toISOString();
    const newProfile: MeasurementProfile = {
      ...profileData,
      id: `m-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    const cId = profileData.customerId;
    const existing = get().measurementsMap[cId] || [];

    const timelineItem: ActivityTimelineItem = {
      id: `act-${Date.now()}`,
      customerId: cId,
      title: `Added Measurement Profile: ${newProfile.name}`,
      description: `Version ${newProfile.version} recorded for ${newProfile.garmentType}.`,
      type: 'measurement_updated',
      timestamp: now,
      actor: profileData.createdBy || 'Master Tailor',
    };

    set((state) => ({
      measurementsMap: {
        ...state.measurementsMap,
        [cId]: [newProfile, ...existing],
      },
      timelineMap: {
        ...state.timelineMap,
        [cId]: [timelineItem, ...(state.timelineMap[cId] || [])],
      },
    }));

    toast.success(`Measurement profile "${newProfile.name}" created!`);
  },

  updateMeasurementProfile: (id, measurements, notes) => {
    const now = new Date().toISOString();
    const cId = get().selectedCustomerId;
    if (!cId) return;

    set((state) => ({
      measurementsMap: {
        ...state.measurementsMap,
        [cId]: (state.measurementsMap[cId] || []).map((m) =>
          m.id === id
            ? {
                ...m,
                measurements,
                notes: notes !== undefined ? notes : m.notes,
                version: m.version + 1,
                updatedAt: now,
              }
            : m
        ),
      },
    }));
    toast.success('Measurement profile updated to new version');
  },

  deleteMeasurementProfile: (customerId, profileId) => {
    set((state) => ({
      measurementsMap: {
        ...state.measurementsMap,
        [customerId]: (state.measurementsMap[customerId] || []).filter((m) => m.id !== profileId),
      },
    }));
    toast.success('Measurement profile deleted');
  },

  // Images
  uploadCustomerImage: (customerId, fileData) => {
    const now = new Date().toISOString();
    const newImg: CustomerImage = {
      id: `img-${Date.now()}`,
      customerId,
      url: fileData.url,
      name: fileData.name,
      category: fileData.category,
      type: fileData.type,
      sizeBytes: fileData.sizeBytes || 1500000,
      uploadedAt: now,
      uploadedBy: 'Tailor Staff',
      tags: [fileData.category],
    };

    const existing = get().imagesMap[customerId] || [];
    const timelineItem: ActivityTimelineItem = {
      id: `act-${Date.now()}`,
      customerId,
      title: `${fileData.type === 'clothing' ? 'Clothing Photo' : 'Design Reference'} Uploaded`,
      description: `Added "${fileData.name}" under ${fileData.category}.`,
      type: fileData.type === 'clothing' ? 'clothes_uploaded' : 'design_uploaded',
      timestamp: now,
      actor: 'Atelier Staff',
    };

    set((state) => ({
      imagesMap: {
        ...state.imagesMap,
        [customerId]: [newImg, ...existing],
      },
      timelineMap: {
        ...state.timelineMap,
        [customerId]: [timelineItem, ...(state.timelineMap[customerId] || [])],
      },
    }));

    toast.success(`Image "${fileData.name}" uploaded successfully`);
  },

  deleteCustomerImage: (customerId, imageId) => {
    set((state) => ({
      imagesMap: {
        ...state.imagesMap,
        [customerId]: (state.imagesMap[customerId] || []).filter((img) => img.id !== imageId),
      },
    }));
    toast.success('Image removed');
  },

  renameCustomerImage: (customerId, imageId, newName) => {
    set((state) => ({
      imagesMap: {
        ...state.imagesMap,
        [customerId]: (state.imagesMap[customerId] || []).map((img) =>
          img.id === imageId ? { ...img, name: newName } : img
        ),
      },
    }));
    toast.success('Image renamed');
  },

  // Notes
  addNote: (customerId, noteData) => {
    const now = new Date().toISOString();
    const newNote: CustomerNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: now,
    };

    const existing = get().notesMap[customerId] || [];
    const timelineItem: ActivityTimelineItem = {
      id: `act-${Date.now()}`,
      customerId,
      title: `Note Added: ${newNote.title}`,
      description: newNote.content.substring(0, 60) + '...',
      type: 'note_added',
      timestamp: now,
      actor: noteData.createdBy || 'Staff',
    };

    set((state) => ({
      notesMap: {
        ...state.notesMap,
        [customerId]: [newNote, ...existing],
      },
      timelineMap: {
        ...state.timelineMap,
        [customerId]: [timelineItem, ...(state.timelineMap[customerId] || [])],
      },
    }));

    toast.success('Customer note recorded');
  },

  updateNote: (customerId, noteId, data) => {
    set((state) => ({
      notesMap: {
        ...state.notesMap,
        [customerId]: (state.notesMap[customerId] || []).map((n) =>
          n.id === noteId ? { ...n, ...data, updatedAt: new Date().toISOString() } : n
        ),
      },
    }));
    toast.success('Note updated');
  },

  deleteNote: (customerId, noteId) => {
    set((state) => ({
      notesMap: {
        ...state.notesMap,
        [customerId]: (state.notesMap[customerId] || []).filter((n) => n.id !== noteId),
      },
    }));
    toast.success('Note deleted');
  },

  togglePinNote: (customerId, noteId) => {
    set((state) => ({
      notesMap: {
        ...state.notesMap,
        [customerId]: (state.notesMap[customerId] || []).map((n) =>
          n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
        ),
      },
    }));
  },

  // Import Customers
  importCustomers: (importedList) => {
    const created: Customer[] = importedList.map((item, idx) => ({
      id: `c-imp-${Date.now()}-${idx}`,
      customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: item.fullName || 'Imported Customer',
      mobile: item.mobile || '+92 300 0000000',
      email: item.email || '',
      gender: item.gender || 'male',
      category: item.category || 'regular',
      address: item.address || {
        country: 'Pakistan',
        province: 'Punjab',
        city: 'Lahore',
        streetAddress: 'Imported Address',
      },
      preferences: {
        contactMethod: 'whatsapp',
        deliveryPreference: 'pickup',
        paymentPreference: 'cash',
      },
      totalOrders: item.totalOrders || 0,
      pendingOrders: 0,
      completedOrders: item.totalOrders || 0,
      totalSpent: item.totalSpent || 0,
      lastVisit: new Date().toISOString(),
      status: 'active',
      isVip: item.category === 'vip',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
    }));

    set((state) => ({
      customers: [...created, ...state.customers],
    }));

    toast.success(`Successfully imported ${created.length} customers!`);
  },
}));
