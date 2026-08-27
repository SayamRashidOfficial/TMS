'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronRight,
  FileText,
  Ruler,
  Edit,
  ShoppingBag,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import CustomerForm from './customer-form';
import MeasurementForm from './measurement-form';
import { fetchCustomerMeasurementsAction } from '../actions';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

interface CustomerListProps {
  initialCustomers: Customer[];
  templates: any[];
}

export default function CustomerList({ initialCustomers, templates }: CustomerListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [measurementsHistory, setMeasurementsHistory] = useState<any[]>([]);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);

  // Filter customers based on search query
  const filteredCustomers = initialCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  // Fetch measurements when opening a customer detail panel
  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setLoadingMeasurements(true);
    try {
      const history = await fetchCustomerMeasurementsAction(customer.id);
      setMeasurementsHistory(history);
    } catch (err) {
      toast.error('Failed to load past measurements');
    } finally {
      setLoadingMeasurements(false);
    }
  };

  const handleRefreshMeasurements = async () => {
    if (!selectedCustomer) return;
    try {
      const history = await fetchCustomerMeasurementsAction(selectedCustomer.id);
      setMeasurementsHistory(history);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshPageData = () => {
    router.refresh();
    if (selectedCustomer) {
      // Re-fetch in case details updated
      const updated = initialCustomers.find((c) => c.id === selectedCustomer.id);
      if (updated) {
        setSelectedCustomer(updated);
      }
      handleRefreshMeasurements();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Register Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-stone-500" />
          <Input
            placeholder="Search by client name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-11 bg-stone-900 border-stone-800 text-stone-200 placeholder-stone-600 focus:border-amber-500/60"
          />
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto h-11 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 rounded-xl cursor-pointer shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Customer Profile
        </Button>
      </div>

      {/* Customers Cards Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="py-16 text-center text-stone-500 border border-dashed border-stone-900 rounded-2xl bg-black/20">
          <User className="w-8 h-8 mx-auto text-stone-700 mb-2" />
          <p className="text-sm">No customers matched your search query.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((cust) => (
            <Card
              key={cust.id}
              onClick={() => handleSelectCustomer(cust)}
              className="border-stone-900 hover:border-stone-850 bg-black/40 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.01]"
            >
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div>
                  <h3 className="font-bold text-stone-100 text-lg group-hover:text-amber-500 truncate">
                    {cust.name}
                  </h3>
                  <div className="flex items-center gap-2 text-stone-400 text-xs font-semibold mt-2">
                    <Phone className="w-3.5 h-3.5 text-amber-500/80" />
                    <span>{cust.phone}</span>
                  </div>
                  {cust.email && (
                    <div className="flex items-center gap-2 text-stone-500 text-xs mt-1 truncate">
                      <Mail className="w-3.5 h-3.5 text-stone-600" />
                      <span>{cust.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-900/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Added: {new Date(cust.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex items-center text-amber-500 text-xs font-bold gap-0.5">
                    <span>View Profile</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Customer Detail Drawer Panel */}
      <Sheet open={selectedCustomer !== null} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <SheetContent className="w-full sm:max-w-lg bg-stone-950 border-l border-stone-900 text-stone-100 overflow-y-auto z-50">
          {selectedCustomer && (
            <div className="space-y-6 pt-4">
              <SheetHeader className="border-b border-stone-900 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-2xl font-extrabold text-stone-100 tracking-tight">
                      {selectedCustomer.name}
                    </SheetTitle>
                    <SheetDescription className="text-amber-500 text-xs font-medium tracking-wider uppercase mt-1">
                      Client Profile
                    </SheetDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowEditModal(true)}
                      className="text-stone-400 hover:text-stone-100 hover:bg-stone-900 border border-stone-900 rounded-lg cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              {/* Core Information Section */}
              <div className="space-y-4 rounded-xl border border-stone-900 bg-stone-950/40 p-4">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4.5 h-4.5 text-amber-500/80 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Mobile Phone</p>
                    <p className="font-semibold text-stone-200">{selectedCustomer.phone}</p>
                  </div>
                </div>

                {selectedCustomer.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4.5 h-4.5 text-stone-500 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Email Address</p>
                      <p className="font-semibold text-stone-300">{selectedCustomer.email}</p>
                    </div>
                  </div>
                )}

                {selectedCustomer.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4.5 h-4.5 text-stone-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Physical Address</p>
                      <p className="font-semibold text-stone-300 leading-snug">{selectedCustomer.address}</p>
                    </div>
                  </div>
                )}

                {selectedCustomer.notes && (
                  <div className="flex items-start gap-3 text-sm border-t border-stone-900 pt-3 mt-3">
                    <FileText className="w-4.5 h-4.5 text-stone-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Special Preferences</p>
                      <p className="text-xs text-stone-400 italic leading-relaxed">{selectedCustomer.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Operations Panel */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setShowMeasurementModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl h-11 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Ruler className="w-4.5 h-4.5" />
                  New Measurement
                </Button>
                <Button
                  onClick={() => router.push(`/orders?customer=${selectedCustomer.id}`)}
                  className="bg-stone-900 hover:bg-stone-850 text-stone-100 font-semibold border border-stone-800 rounded-xl h-11 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-4.5 h-4.5 text-amber-500" />
                  Book Order
                </Button>
              </div>

              {/* Size Logs History */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-stone-300 uppercase tracking-widest flex items-center gap-2 border-b border-stone-900 pb-2">
                  <Ruler className="w-4 h-4 text-amber-500" />
                  Sizes History Log
                </h3>

                {loadingMeasurements ? (
                  <div className="py-8 flex justify-center text-stone-500 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                    <span className="text-xs">Fetching history...</span>
                  </div>
                ) : measurementsHistory.length === 0 ? (
                  <div className="text-center py-8 text-stone-500 text-xs border border-dashed border-stone-900 rounded-xl bg-black/20">
                    No measurements recorded yet for this client.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {measurementsHistory.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-xl border border-stone-900 bg-stone-950/20 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-stone-900 pb-2">
                          <div>
                            <span className="font-extrabold text-sm text-amber-500">
                              {(m.measurement_templates as any)?.name || 'Garment'}
                            </span>
                            <span className="ml-2 text-[10px] bg-stone-900 px-2 py-0.5 rounded text-stone-400 font-bold border border-stone-850">
                              v{m.version}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-500 flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3" />
                            {new Date(m.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Measurement Parameters Grid */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {Object.entries(m.measurements as Record<string, number>).map(([key, val]) => (
                            <div key={key} className="bg-stone-900/40 p-2 rounded border border-stone-900/50">
                              <p className="text-[10px] text-stone-500 capitalize">{key.replace('_', ' ')}</p>
                              <p className="font-bold text-stone-200 mt-0.5">{val}"</p>
                            </div>
                          ))}
                        </div>

                        {m.notes && (
                          <div className="text-[11px] text-stone-400 italic bg-stone-900/30 p-2 rounded border border-stone-900/30">
                            Notes: {m.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Customer Form modals */}
      <CustomerForm
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refreshPageData}
      />

      {selectedCustomer && (
        <>
          <CustomerForm
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={refreshPageData}
            customer={selectedCustomer}
          />
          <MeasurementForm
            open={showMeasurementModal}
            onClose={() => setShowMeasurementModal(false)}
            onSuccess={refreshPageData}
            customerId={selectedCustomer.id}
            customerName={selectedCustomer.name}
            templates={templates}
          />
        </>
      )}
    </div>
  );
}
