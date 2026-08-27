'use client';

import React from 'react';
import { Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  garment_type: string;
  fabric_source: string;
  style_details: Record<string, string>;
  unit_price: number;
  status: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
}

interface Order {
  id: string;
  order_number: number;
  order_date: string;
  due_date: string;
  actual_delivery_date?: string | null;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  paid_amount: number;
  notes?: string | null;
  customers: Customer;
  order_items: OrderItem[];
  payments: Payment[];
}

const STATUS_COLORS: Record<string, string> = {
  booked: '#d97706',
  in_cutting: '#3b82f6',
  in_stitching: '#8b5cf6',
  ready_for_trial: '#f59e0b',
  ready_for_pickup: '#10b981',
  completed: '#22c55e',
  cancelled: '#ef4444',
  draft: '#6b7280',
};

export default function InvoicePrint({ order }: { order: Order }) {
  const router = useRouter();
  const balance = Number(order.total_amount) - Number(order.paid_amount);
  const statusColor = STATUS_COLORS[order.status] || '#6b7280';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Screen-only toolbar */}
      <div className="print:hidden flex items-center gap-3 p-4 border-b border-stone-900 bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-stone-400 hover:text-stone-100 hover:bg-stone-900 cursor-pointer"
        >
          ← Back
        </Button>
        <div className="flex-1" />
        <Button
          onClick={handlePrint}
          className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 h-10 rounded-xl cursor-pointer shadow-lg shadow-amber-500/10"
        >
          🖨️ Print Invoice
        </Button>
      </div>

      {/* Invoice Paper */}
      <div className="max-w-[210mm] mx-auto my-8 print:my-0 bg-white text-stone-900 shadow-2xl print:shadow-none"
           style={{ minHeight: '297mm', padding: '20mm' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm', borderBottom: '2px solid #d97706', paddingBottom: '6mm' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ padding: '6px', background: '#fef3c7', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/>
                  <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'serif', fontSize: '24px', fontWeight: '900', letterSpacing: '4px', color: '#1c1917' }}>HUZAIFA</span>
            </div>
            <p style={{ fontSize: '11px', color: '#78716c', margin: 0 }}>Premium Bespoke Tailoring Atelier</p>
            <p style={{ fontSize: '10px', color: '#a8a29e', margin: '2px 0 0 0' }}>admin@huzaifa.com</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#1c1917', letterSpacing: '-1px' }}>INVOICE</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#d97706', marginTop: '2px' }}>#{order.order_number.toString().padStart(4, '0')}</div>
            <div style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginTop: '6px',
              background: `${statusColor}20`,
              color: statusColor,
              border: `1px solid ${statusColor}40`,
            }}>
              {order.status.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {/* Bill To & Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8mm', marginBottom: '8mm' }}>
          <div>
            <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#a8a29e', marginBottom: '4px' }}>Bill To</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#1c1917' }}>{order.customers.name}</div>
            <div style={{ fontSize: '11px', color: '#57534e', marginTop: '2px' }}>📞 {order.customers.phone}</div>
            {order.customers.email && (
              <div style={{ fontSize: '11px', color: '#57534e' }}>✉️ {order.customers.email}</div>
            )}
            {order.customers.address && (
              <div style={{ fontSize: '11px', color: '#57534e', marginTop: '2px' }}>{order.customers.address}</div>
            )}
          </div>
          <div>
            <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#a8a29e', marginBottom: '4px' }}>Invoice Details</div>
            <table style={{ fontSize: '11px', width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ color: '#78716c', paddingBottom: '3px', paddingRight: '12px' }}>Order Date</td>
                  <td style={{ fontWeight: '600', color: '#1c1917' }}>{new Date(order.order_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style={{ color: '#78716c', paddingBottom: '3px', paddingRight: '12px' }}>Due Date</td>
                  <td style={{ fontWeight: '600', color: '#1c1917' }}>{new Date(order.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                </tr>
                {order.actual_delivery_date && (
                  <tr>
                    <td style={{ color: '#78716c', paddingBottom: '3px', paddingRight: '12px' }}>Delivered</td>
                    <td style={{ fontWeight: '600', color: '#22c55e' }}>{new Date(order.actual_delivery_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Line Items Table */}
        <div style={{ marginBottom: '8mm' }}>
          <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#a8a29e', marginBottom: '4px' }}>Order Items</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#fafaf9', borderTop: '1px solid #e7e5e4', borderBottom: '1px solid #e7e5e4' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '700', color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px' }}>#</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '700', color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px' }}>Garment</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '700', color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px' }}>Fabric Source</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10px', fontWeight: '700', color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px' }}>Style Details</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', fontSize: '10px', fontWeight: '700', color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f5f5f4' }}>
                  <td style={{ padding: '8px', color: '#a8a29e', fontWeight: '600' }}>{idx + 1}</td>
                  <td style={{ padding: '8px', fontWeight: '700', color: '#1c1917' }}>{item.garment_type}</td>
                  <td style={{ padding: '8px', color: '#57534e', textTransform: 'capitalize' }}>{item.fabric_source.replace('_', ' ')}</td>
                  <td style={{ padding: '8px', color: '#78716c', fontSize: '10px' }}>
                    {item.style_details.collar && `Collar: ${item.style_details.collar}`}
                    {item.style_details.cuffs && ` | Cuffs: ${item.style_details.cuffs}`}
                    {item.style_details.pockets && ` | Pockets: ${item.style_details.pockets}`}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700', color: '#1c1917' }}>
                    ${Number(item.unit_price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8mm' }}>
          <table style={{ width: '55mm', fontSize: '12px' }}>
            <tbody>
              <tr>
                <td style={{ color: '#78716c', paddingBottom: '4px' }}>Subtotal</td>
                <td style={{ textAlign: 'right', fontWeight: '600', paddingBottom: '4px' }}>${Number(order.subtotal).toFixed(2)}</td>
              </tr>
              {Number(order.discount) > 0 && (
                <tr>
                  <td style={{ color: '#78716c', paddingBottom: '4px' }}>Discount</td>
                  <td style={{ textAlign: 'right', color: '#22c55e', fontWeight: '600', paddingBottom: '4px' }}>-${Number(order.discount).toFixed(2)}</td>
                </tr>
              )}
              {Number(order.tax) > 0 && (
                <tr>
                  <td style={{ color: '#78716c', paddingBottom: '4px' }}>Tax</td>
                  <td style={{ textAlign: 'right', fontWeight: '600', paddingBottom: '4px' }}>${Number(order.tax).toFixed(2)}</td>
                </tr>
              )}
              <tr style={{ borderTop: '2px solid #d97706' }}>
                <td style={{ paddingTop: '6px', fontWeight: '800', fontSize: '14px' }}>Total</td>
                <td style={{ textAlign: 'right', fontWeight: '900', fontSize: '14px', paddingTop: '6px', color: '#1c1917' }}>${Number(order.total_amount).toFixed(2)}</td>
              </tr>
              <tr>
                <td style={{ color: '#22c55e', paddingTop: '3px', fontWeight: '600' }}>Paid</td>
                <td style={{ textAlign: 'right', color: '#22c55e', fontWeight: '700', paddingTop: '3px' }}>${Number(order.paid_amount).toFixed(2)}</td>
              </tr>
              {balance > 0 && (
                <tr>
                  <td style={{ color: '#ef4444', fontWeight: '700', paddingTop: '3px' }}>Balance Due</td>
                  <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: '900', paddingTop: '3px' }}>${balance.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Payment History */}
        {order.payments.length > 0 && (
          <div style={{ marginBottom: '8mm', padding: '4mm', background: '#fafaf9', borderRadius: '4px', border: '1px solid #e7e5e4' }}>
            <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#a8a29e', marginBottom: '4px' }}>Payment History</div>
            {order.payments.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '2px 0' }}>
                <span style={{ color: '#78716c', textTransform: 'capitalize' }}>
                  {p.payment_method.replace('_', ' ')} — {new Date(p.created_at).toLocaleDateString()}
                </span>
                <span style={{ fontWeight: '700', color: '#22c55e' }}>${Number(p.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div style={{ marginBottom: '8mm', padding: '4mm', background: '#fffbeb', borderRadius: '4px', border: '1px solid #fcd34d' }}>
            <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#a8a29e', marginBottom: '4px' }}>Notes</div>
            <p style={{ fontSize: '11px', color: '#57534e', margin: 0 }}>{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e7e5e4', paddingTop: '6mm', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0 }}>Thank you for choosing Huzaifa. We take pride in every stitch.</p>
          <p style={{ fontSize: '10px', color: '#d4d0cc', marginTop: '3px' }}>For inquiries please contact us. This invoice was generated electronically.</p>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
}
