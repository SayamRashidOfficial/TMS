'use client';

import React, { useState } from 'react';
import { useCustomerStore } from '@/store/useCustomerStore';
import CustomerHeader from '@/features/customers/components/CustomerHeader';
import CustomerStatsCards from '@/features/customers/components/CustomerStatsCards';
import CustomerToolbar from '@/features/customers/components/CustomerToolbar';
import CustomerTable from '@/features/customers/components/CustomerTable';
import CustomerForm from '@/features/customers/components/CustomerForm';
import CustomerProfileView from '@/features/customers/components/CustomerProfileView';
import CustomerAnalyticsView from '@/features/customers/components/CustomerAnalyticsView';
import CustomerBulkActionsModal from '@/features/customers/components/CustomerBulkActionsModal';
import CustomerImportExportModal from '@/features/customers/components/CustomerImportExportModal';
import { Customer } from '@/types/customer';
import { fetchCustomersAction } from '@/features/customers/actions';

export default function CustomersPage() {
  const { viewMode, setViewMode, selectedCustomerId, setCustomers } = useCustomerStore();

  // Editing Customer State
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);

  React.useEffect(() => {
    const loadCustomers = async () => {
      try {
        const { data } = await fetchCustomersAction(1, 100);
        if (data && data.length > 0) {
          const mappedCustomers = data.map((c: any) => ({
            id: c.id,
            customerId: c.customer_id || c.id,
            fullName: c.full_name || 'Unknown',
            fatherOrHusbandName: c.father_or_husband_name || '',
            gender: c.gender || 'male',
            dob: c.dob || '',
            cnic: c.cnic || '',
            category: c.category || 'regular',
            occupation: c.occupation || '',
            language: c.language || 'Urdu',
            nationality: c.nationality || 'Pakistani',
            mobile: c.phone || '',
            altNumber: c.alt_phone || '',
            whatsApp: c.whatsapp || '',
            email: c.email || '',
            status: c.status || 'new',
            isVip: c.is_vip || false,
            photoUrl: c.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
            address: {
              country: c.country || 'Pakistan',
              province: c.province || 'Punjab',
              city: c.city || 'Lahore',
              area: c.area || '',
              streetAddress: c.address || '',
              postalCode: c.postal_code || '',
            },
            preferences: {
              contactMethod: c.contact_method || 'phone',
              deliveryPreference: c.delivery_preference || 'pickup',
              paymentPreference: c.payment_preference || 'cash',
              specialPreferences: c.special_preferences || '',
            },
            createdAt: c.created_at || new Date().toISOString(),
            updatedAt: c.updated_at || new Date().toISOString(),
            totalOrders: 0,
            pendingOrders: 0,
            completedOrders: 0,
            totalSpent: 0,
            lastVisit: c.created_at || new Date().toISOString(),
          }));
          setCustomers(mappedCustomers);
        }
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, [setCustomers]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setViewMode('add');
  };

  const handleEditCustomer = (cust: Customer) => {
    setEditingCustomer(cust);
    setViewMode('add');
  };

  const handleOpenMeasurements = (cust: Customer) => {
    setViewMode('profile', cust.id);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Customer Module Top Navigation */}
      <CustomerHeader />

      {/* VIEW MODE 1: ALL CUSTOMERS LIST */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Top 8 Stats Cards */}
          <CustomerStatsCards />

          {/* Search, Filter, Sort, Toolbar */}
          <CustomerToolbar
            onOpenAddModal={handleOpenAddModal}
            onOpenImportExportModal={() => setShowImportExportModal(true)}
            onOpenBulkActionsModal={() => setShowBulkModal(true)}
          />

          {/* Full Customer Data Table */}
          <CustomerTable
            onEditCustomer={handleEditCustomer}
            onOpenMeasurementsModal={handleOpenMeasurements}
          />
        </div>
      )}

      {/* VIEW MODE 2: ADD / EDIT CUSTOMER FORM */}
      {viewMode === 'add' && (
        <CustomerForm
          initialCustomer={editingCustomer}
          onSuccess={() => {
            setEditingCustomer(null);
          }}
          onCancel={() => {
            setEditingCustomer(null);
            setViewMode('list');
          }}
        />
      )}

      {/* VIEW MODE 3: CUSTOMER PROFILE PAGE */}
      {viewMode === 'profile' && selectedCustomerId && (
        <CustomerProfileView
          customerId={selectedCustomerId}
          onEditCustomer={handleEditCustomer}
        />
      )}

      {/* VIEW MODE 4: CUSTOMER ANALYTICS */}
      {viewMode === 'analytics' && <CustomerAnalyticsView />}

      {/* GLOBAL MODALS */}
      {showBulkModal && <CustomerBulkActionsModal onClose={() => setShowBulkModal(false)} />}
      {showImportExportModal && <CustomerImportExportModal onClose={() => setShowImportExportModal(false)} />}
    </div>
  );
}
