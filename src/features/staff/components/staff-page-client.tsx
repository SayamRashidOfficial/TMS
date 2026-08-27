'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  UserPlus,
  Loader2,
  ChevronDown,
  Filter,
  Scissors,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { markPayoutPaidAction, markBulkPayoutsPaidAction, createStaffAccountAction, toggleStaffActiveAction } from '@/features/staff/actions';
import { toast } from 'sonner';

interface StaffProfile {
  id: string;
  name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Payout {
  id: string;
  staff_id: string;
  task_type: 'cutting' | 'stitching';
  amount: number;
  status: 'pending' | 'paid';
  paid_at: string | null;
  created_at: string;
  profiles: { name: string; role: string } | null;
  order_items: {
    garment_type: string;
    orders: { order_number: number } | null;
  } | null;
}

interface StaffPageClientProps {
  staff: StaffProfile[];
  payouts: Payout[];
}

export default function StaffPageClient({ staff, payouts }: StaffPageClientProps) {
  const router = useRouter();

  // Add Staff Dialog state
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'cutter' | 'stitcher' | 'sales'>('stitcher');
  const [addLoading, setAddLoading] = useState(false);

  // Payout selection state
  const [selectedPayoutIds, setSelectedPayoutIds] = useState<Set<string>>(new Set());
  const [bulkPayLoading, setBulkPayLoading] = useState(false);
  const [filterStaffId, setFilterStaffId] = useState('all');

  // Totals
  const pendingPayouts = payouts.filter((p) => p.status === 'pending');
  const paidPayouts = payouts.filter((p) => p.status === 'paid');
  const totalPending = pendingPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = paidPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

  const filteredPayouts = filterStaffId === 'all'
    ? payouts
    : payouts.filter((p) => p.staff_id === filterStaffId);

  // Toggle single payout selection
  const toggleSelect = (id: string) => {
    setSelectedPayoutIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all pending payouts from filtered view
  const selectAllPending = () => {
    const pendingIds = filteredPayouts
      .filter((p) => p.status === 'pending')
      .map((p) => p.id);
    setSelectedPayoutIds(new Set(pendingIds));
  };

  const clearSelection = () => {
    setSelectedPayoutIds(new Set());
  };

  const handleBulkMarkPaid = async () => {
    if (selectedPayoutIds.size === 0) {
      toast.warning('Please select at least one payout to mark as paid.');
      return;
    }

    setBulkPayLoading(true);
    try {
      const response = await markBulkPayoutsPaidAction(Array.from(selectedPayoutIds));
      if (response.success) {
        toast.success(`${response.data?.count} payouts marked as paid successfully!`);
        setSelectedPayoutIds(new Set());
        router.refresh();
      } else {
        toast.error(response.error || 'Failed to process payouts');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setBulkPayLoading(false);
    }
  };

  const handleToggleStaffActive = async (staffId: string, currentlyActive: boolean) => {
    try {
      const response = await toggleStaffActiveAction(staffId, !currentlyActive);
      if (response.success) {
        toast.success(`Staff account ${currentlyActive ? 'deactivated' : 'activated'}`);
        router.refresh();
      } else {
        toast.error(response.error || 'Failed to update staff status');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) {
      toast.error('Please fill all required fields');
      return;
    }

    setAddLoading(true);
    try {
      const response = await createStaffAccountAction(
        newName, newEmail, newPassword, newRole, newPhone
      );
      if (response.success) {
        toast.success(`Staff account created for ${newName}!`);
        setShowAddStaff(false);
        setNewName(''); setNewEmail(''); setNewPassword(''); setNewPhone('');
        router.refresh();
      } else {
        toast.error(response.error || 'Failed to create staff account');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setAddLoading(false);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'sales': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'cutter': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'stitcher': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-stone-500/10 text-stone-400 border-stone-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Payout KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card text-card-foreground shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Payouts</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{pendingPayouts.length} unpaid piece-rate entries</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card text-card-foreground shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Paid Out</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{paidPayouts.length} completed payment records</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card text-card-foreground shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Staff</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
              {staff.filter((s) => s.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">of {staff.length} total registered accounts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payouts" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="bg-secondary/70 border border-border p-1 rounded-xl">
            <TabsTrigger value="payouts" className="rounded-lg text-xs font-semibold cursor-pointer px-4 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">
              <DollarSign className="w-4 h-4 mr-1.5" />
              Payouts Register
            </TabsTrigger>
            <TabsTrigger value="directory" className="rounded-lg text-xs font-semibold cursor-pointer px-4 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">
              <Users className="w-4 h-4 mr-1.5" />
              Staff Directory
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={() => setShowAddStaff(true)}
            className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 h-9 rounded-xl cursor-pointer shadow-sm shadow-amber-500/10 transition-all flex items-center gap-1.5 text-xs"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff Account
          </Button>
        </div>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          {/* Filters & Bulk Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border bg-card shadow-xs">
            <div className="flex items-center gap-2.5">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Staff:</span>
              <Select value={filterStaffId} onValueChange={(val) => val && setFilterStaffId(val)}>
                <SelectTrigger className="bg-background border-border text-foreground h-8 w-48 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="all">All Staff Members</SelectItem>
                  {staff.filter(s => ['cutter', 'stitcher'].includes(s.role)).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2.5">
              {selectedPayoutIds.size > 0 && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-bold font-mono">{selectedPayoutIds.size} selected</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAllPending}
                className="text-muted-foreground hover:text-foreground h-8 text-xs cursor-pointer"
              >
                Select All Pending
              </Button>
              {selectedPayoutIds.size > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="text-muted-foreground hover:text-foreground h-8 text-xs cursor-pointer"
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleBulkMarkPaid}
                    disabled={bulkPayLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 px-3.5 cursor-pointer text-xs rounded-xl"
                  >
                    {bulkPayLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    )}
                    Mark {selectedPayoutIds.size} as Paid
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Payouts Table */}
          <Card className="border-border bg-card text-card-foreground shadow-xs overflow-hidden rounded-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="px-4 py-3 w-10"></th>
                    <th className="px-4 py-3">Staff Member</th>
                    <th className="px-4 py-3">Garment & Order</th>
                    <th className="px-4 py-3">Task Type</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-muted-foreground">
                        No payout records found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((payout) => (
                      <tr
                        key={payout.id}
                        className={`hover:bg-secondary/40 transition-colors ${
                          selectedPayoutIds.has(payout.id) ? 'bg-amber-500/10 dark:bg-amber-500/15' : ''
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          {payout.status === 'pending' && (
                            <Checkbox
                              checked={selectedPayoutIds.has(payout.id)}
                              onCheckedChange={() => toggleSelect(payout.id)}
                              className="border-border data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 cursor-pointer"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7 border border-border bg-secondary">
                              <AvatarFallback className="text-amber-600 dark:text-amber-400 font-bold text-[10px] bg-secondary">
                                {payout.profiles?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground text-xs">{payout.profiles?.name}</p>
                              <p className="text-[10px] text-muted-foreground capitalize">{payout.profiles?.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-foreground text-xs">
                            {payout.order_items?.garment_type}
                          </p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold font-mono">
                            Order #{payout.order_items?.orders?.order_number}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            payout.task_type === 'cutting'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          }`}>
                            <Scissors className="w-3 h-3" />
                            {payout.task_type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-foreground font-mono">
                          ${Number(payout.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            payout.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}>
                            {payout.status === 'paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[11px] text-muted-foreground font-medium">
                          {new Date(payout.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Staff Directory Tab */}
        <TabsContent value="directory">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => {
              const memberPayouts = payouts.filter((p) => p.staff_id === member.id);
              const memberPending = memberPayouts
                .filter((p) => p.status === 'pending')
                .reduce((sum, p) => sum + Number(p.amount), 0);
              const memberEarned = memberPayouts
                .filter((p) => p.status === 'paid')
                .reduce((sum, p) => sum + Number(p.amount), 0);

              const initials = member.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase();

              return (
                <Card
                  key={member.id}
                  className={`border-border bg-card text-card-foreground shadow-xs transition-all duration-200 rounded-2xl ${
                    !member.is_active ? 'opacity-50' : ''
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 space-y-4">
                    {/* Staff Header */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border border-border bg-secondary">
                        <AvatarFallback className="text-amber-600 dark:text-amber-400 font-extrabold text-sm bg-secondary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-foreground truncate text-sm">{member.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border capitalize ${getRoleBadgeStyle(member.role)}`}>
                            {member.role}
                          </span>
                          {!member.is_active && (
                            <span className="text-[10px] text-red-500 font-bold uppercase">Inactive</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Earnings summary */}
                    {['cutter', 'stitcher'].includes(member.role) && (
                      <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
                        <div className="bg-secondary/50 p-2 rounded-xl border border-border text-center">
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Pending</p>
                          <p className="font-bold text-amber-600 dark:text-amber-400 text-xs mt-0.5 font-mono">${memberPending.toFixed(2)}</p>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded-xl border border-border text-center">
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Paid Out</p>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5 font-mono">${memberEarned.toFixed(2)}</p>
                        </div>
                      </div>
                    )}

                    {/* Toggle Active */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStaffActive(member.id, member.is_active)}
                      className={`w-full h-8 text-xs font-bold rounded-xl cursor-pointer border transition-colors ${
                        member.is_active
                          ? 'border-border text-muted-foreground hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10'
                          : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {member.is_active ? 'Deactivate Account' : 'Reactivate Account'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Staff Dialog */}
      <Dialog open={showAddStaff} onOpenChange={(val) => !val && setShowAddStaff(false)}>
        <DialogContent className="max-w-md bg-popover border border-border text-foreground rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-500" />
              Create Staff Account
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Register a new staff member with atelier system access.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddStaff} className="space-y-3.5 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Full Name *</Label>
                <Input
                  placeholder="John Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-background border-border text-foreground h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Phone</Label>
                <Input
                  placeholder="+1 555..."
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="bg-background border-border text-foreground h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Email Address *</Label>
              <Input
                type="email"
                placeholder="staff@huzaifa.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-background border-border text-foreground h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Password *</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-background border-border text-foreground h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Atelier Role *</Label>
                <Select value={newRole} onValueChange={(val: any) => setNewRole(val)}>
                  <SelectTrigger className="bg-background border-border text-foreground h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="stitcher">Stitcher (Tailor)</SelectItem>
                    <SelectItem value="cutter">Cutter (Master Cutter)</SelectItem>
                    <SelectItem value="sales">Sales / Receptionist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAddStaff(false)}
                className="cursor-pointer text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addLoading}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-5 cursor-pointer text-xs h-8"
              >
                {addLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Creating...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
