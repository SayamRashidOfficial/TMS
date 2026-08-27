import { create } from 'zustand';

export interface CartItem {
  garment_type: string;
  measurement_snapshot: Record<string, number>;
  fabric_source: 'in_store' | 'customer_provided';
  fabric_id?: string;
  fabric_qty_used?: number;
  style_details: Record<string, any>;
  unit_price: number;
}

interface CartState {
  customerId: string;
  customerName: string;
  dueDate: string;
  notes: string;
  items: CartItem[];
  discount: number;
  taxPercent: number;
  downPayment: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_wallet';
  
  setCustomer: (id: string, name: string) => void;
  setDueDate: (date: string) => void;
  setNotes: (notes: string) => void;
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  setDiscount: (discount: number) => void;
  setTaxPercent: (tax: number) => void;
  setDownPayment: (amount: number) => void;
  setPaymentMethod: (method: 'cash' | 'card' | 'bank_transfer' | 'mobile_wallet') => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  customerId: '',
  customerName: '',
  dueDate: '',
  notes: '',
  items: [],
  discount: 0,
  taxPercent: 5, // default 5% tax
  downPayment: 0,
  paymentMethod: 'cash',

  setCustomer: (id, name) => set({ customerId: id, customerName: name }),
  setDueDate: (date) => set({ dueDate: date }),
  setNotes: (notes) => set({ notes }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (index) => set((state) => ({ items: state.items.filter((_, i) => i !== index) })),
  setDiscount: (discount) => set({ discount }),
  setTaxPercent: (taxPercent) => set({ taxPercent }),
  setDownPayment: (downPayment) => set({ downPayment }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  clearCart: () =>
    set({
      customerId: '',
      customerName: '',
      dueDate: '',
      notes: '',
      items: [],
      discount: 0,
      taxPercent: 5,
      downPayment: 0,
      paymentMethod: 'cash',
    }),
}));
