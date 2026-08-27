import React from 'react';
import { fetchStaffAction, fetchStaffPayoutsAction } from '@/features/staff/actions';
import StaffPageClient from '@/features/staff/components/staff-page-client';

export const metadata = {
  title: 'Staff & Payouts - Huzaifa',
  description: 'Manage atelier staff accounts and piece-rate payout settlements.',
};

export default async function StaffPage() {
  const [staff, payouts] = await Promise.all([
    fetchStaffAction(),
    fetchStaffPayoutsAction(),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Staff & Payouts
        </h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Manage tailor accounts, production assignments, and piece-rate compensation settlements.
        </p>
      </div>

      <StaffPageClient staff={staff} payouts={payouts} />
    </div>
  );
}
