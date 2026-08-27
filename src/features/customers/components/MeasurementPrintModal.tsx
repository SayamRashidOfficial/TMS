'use client';

import React from 'react';
import { Customer, MeasurementProfile } from '@/types/customer';
import { Printer, X, Scissors, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MeasurementPrintModalProps {
  customer: Customer;
  measurement: MeasurementProfile;
  onClose: () => void;
}

export default function MeasurementPrintModal({
  customer,
  measurement,
  onClose,
}: MeasurementPrintModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const fields = Object.entries(measurement.measurements).filter(([_, val]) => val !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-stone-950 border border-stone-800 text-stone-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/60 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-stone-100">Tailor Specification & Measurement Spec Sheet</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Spec Sheet
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Printable Spec Sheet Content */}
        <div className="p-8 overflow-y-auto space-y-6 print:p-0 print:bg-white print:text-black" id="printable-spec-sheet">
          {/* Header Branding */}
          <div className="border-b-2 border-stone-800 pb-4 flex justify-between items-start print:border-black">
            <div>
              <h1 className="text-2xl font-extrabold tracking-widest text-amber-500 print:text-black">HUZAIFA ATELIER</h1>
              <p className="text-xs text-stone-400 print:text-gray-600">Bespoke Tailoring & Garment Craftsmanship</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold px-2 py-1 bg-stone-900 border border-stone-800 rounded print:bg-gray-100 print:text-black">
                SPEC #{measurement.id.substring(0, 8).toUpperCase()}
              </span>
              <p className="text-[11px] text-stone-500 mt-1 print:text-gray-500">
                Date: {new Date(measurement.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Customer & Garment Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-stone-900/60 border border-stone-800 print:bg-gray-50 print:border-gray-300 print:text-black text-xs">
            <div>
              <span className="font-bold uppercase text-[10px] text-amber-400 print:text-black block">Customer Info</span>
              <div className="font-extrabold text-sm text-stone-100 mt-0.5 print:text-black">{customer.fullName}</div>
              <div className="text-stone-400 print:text-gray-700">ID: {customer.customerId}</div>
              <div className="text-stone-400 print:text-gray-700 font-mono">Mobile: {customer.mobile}</div>
            </div>

            <div>
              <span className="font-bold uppercase text-[10px] text-amber-400 print:text-black block">Garment Profile</span>
              <div className="font-extrabold text-sm text-stone-100 mt-0.5 capitalize print:text-black">
                {measurement.name} (v{measurement.version})
              </div>
              <div className="text-stone-400 print:text-gray-700 capitalize">Type: {measurement.garmentType.replace('_', ' ')}</div>
              <div className="text-stone-400 print:text-gray-700">Master: {measurement.createdBy}</div>
            </div>
          </div>

          {/* Measurements Table Grid */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-3 border-b border-stone-800 pb-1 print:text-black print:border-black">
              Body Measurements ({measurement.unit.toUpperCase()})
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {fields.map(([key, val]) => (
                <div
                  key={key}
                  className="p-3 rounded-lg bg-stone-900 border border-stone-850 flex flex-col justify-between print:bg-gray-100 print:border-gray-400"
                >
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider capitalize print:text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="text-lg font-mono font-extrabold text-amber-400 mt-1 print:text-black">
                    {val} <span className="text-xs font-normal text-stone-500 print:text-gray-600">{measurement.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fitting Notes & Instructions */}
          {measurement.notes && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 print:bg-gray-50 print:border-gray-300 print:text-black">
              <span className="font-bold uppercase text-[10px] text-amber-400 block mb-1 print:text-black">Cutting Master Instructions</span>
              <p className="leading-relaxed">{measurement.notes}</p>
            </div>
          )}

          {/* Tailor Sign-Off Block */}
          <div className="pt-8 border-t border-dashed border-stone-800 grid grid-cols-2 gap-8 text-center text-xs text-stone-400 print:border-gray-400 print:text-black">
            <div>
              <div className="h-12 border-b border-stone-700 mb-2 print:border-black" />
              <span>Cutting Master Signature</span>
            </div>
            <div>
              <div className="h-12 border-b border-stone-700 mb-2 print:border-black" />
              <span>Quality Inspector Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
