export type CustomerGender = 'male' | 'female' | 'other';
export type CustomerCategory = 'regular' | 'vip' | 'corporate';
export type CustomerStatus = 'active' | 'inactive' | 'vip' | 'new';
export type ContactMethod = 'sms' | 'phone' | 'whatsapp' | 'email';
export type DeliveryPreference = 'pickup' | 'delivery' | 'courier';
export type PaymentPreference = 'cash' | 'card' | 'online';

export type ClothingImageCategory = 
  | 'before_stitching' 
  | 'after_stitching' 
  | 'reference_clothes' 
  | 'existing_outfit' 
  | 'fabric_image';

export type DesignImageCategory = 
  | 'pinterest' 
  | 'reference' 
  | 'celebrity' 
  | 'embroidery' 
  | 'neck' 
  | 'sleeve' 
  | 'trouser' 
  | 'sherwani' 
  | 'kurta' 
  | 'blazer' 
  | 'wedding';

export type GarmentType = 'formal_suit' | 'casual_shirt' | 'wedding_sherwani' | 'kurta' | 'waistcoat' | 'trouser' | 'custom';

export interface MeasurementFieldValues {
  neck?: number;
  shoulder?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  sleeve?: number;
  arm?: number;
  wrist?: number;
  shirtLength?: number;
  trouserLength?: number;
  thigh?: number;
  knee?: number;
  bottom?: number;
  inseam?: number;
  collar?: number;
  [key: string]: number | undefined;
}

export interface MeasurementProfile {
  id: string;
  customerId: string;
  name: string; // e.g. "Formal Suit", "Wedding Sherwani"
  garmentType: GarmentType;
  measurements: MeasurementFieldValues;
  unit: 'in' | 'cm';
  version: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerImage {
  id: string;
  customerId: string;
  url: string;
  name: string;
  category: ClothingImageCategory | DesignImageCategory;
  type: 'clothing' | 'design';
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy?: string;
  tags?: string[];
}

export interface CustomerNote {
  id: string;
  customerId: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  isPinned: boolean;
}

export interface CustomerOrderItem {
  id: string;
  garmentType: string;
  fabricName?: string;
  price: number;
}

export interface CustomerOrderHistory {
  id: string;
  orderNumber: string;
  date: string;
  deliveryDate: string;
  items: CustomerOrderItem[];
  status: 'draft' | 'booked' | 'in_cutting' | 'in_stitching' | 'ready_for_trial' | 'ready_for_pickup' | 'completed' | 'cancelled';
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  assignedTailor?: string;
  notes?: string;
}

export interface ActivityTimelineItem {
  id: string;
  customerId: string;
  title: string;
  description: string;
  type: 'created' | 'measurement_updated' | 'order_placed' | 'payment_received' | 'design_uploaded' | 'clothes_uploaded' | 'note_added' | 'order_delivered';
  timestamp: string;
  actor: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface AddressInfo {
  country: string;
  province: string;
  city: string;
  area?: string;
  streetAddress: string;
  postalCode?: string;
  googleMapsUrl?: string;
  lat?: number;
  lng?: number;
}

export interface CustomerPreferences {
  contactMethod: ContactMethod;
  deliveryPreference: DeliveryPreference;
  paymentPreference: PaymentPreference;
  specialPreferences?: string;
}

export interface Customer {
  id: string;
  customerId: string; // Display ID e.g. "CUST-1001"
  photoUrl?: string;
  fullName: string;
  fatherOrHusbandName?: string;
  gender: CustomerGender;
  dob?: string;
  cnic?: string;
  category: CustomerCategory;
  occupation?: string;
  language?: string;
  nationality?: string;
  
  // Contact
  mobile: string;
  altNumber?: string;
  whatsApp?: string;
  email?: string;
  website?: string;

  // Address
  address: AddressInfo;
  
  // Emergency
  emergencyContact?: EmergencyContact;

  // Preferences
  preferences: CustomerPreferences;

  // Stats
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  lastVisit: string;
  status: CustomerStatus;
  isVip: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFilterState {
  search: string;
  gender: string;
  city: string;
  status: string;
  category: string;
  vipOnly: boolean;
  newOnly: boolean;
  activeOnly: boolean;
  dateRange: 'all' | 'today' | 'this_week' | 'this_month' | 'this_year';
  sortBy: 'latest' | 'oldest' | 'most_orders' | 'highest_spending' | 'alphabetical';
}
