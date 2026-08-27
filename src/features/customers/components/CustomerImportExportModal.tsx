'use client';

import React, { useState } from 'react';
import { useCustomerStore } from '@/store/useCustomerStore';
import { Download, Upload, FileSpreadsheet, FileText, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImportExportModalProps {
  onClose: () => void;
}

export default function CustomerImportExportModal({ onClose }: ImportExportModalProps) {
  const { customers, importCustomers } = useCustomerStore();
  const [activeMode, setActiveMode] = useState<'export' | 'import'>('export');
  const [importText, setImportText] = useState('');

  // CSV Generator for Export
  const handleExportCSV = () => {
    const headers = ['Customer ID', 'Full Name', 'Mobile', 'Email', 'Gender', 'Category', 'City', 'Total Spent', 'Total Orders'];
    const rows = customers.map((c) => [
      c.customerId,
      `"${c.fullName}"`,
      `"${c.mobile}"`,
      `"${c.email || ''}"`,
      c.gender,
      c.category,
      `"${c.address?.city || ''}"`,
      c.totalSpent,
      c.totalOrders,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Huzaifa_Customers_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded');
  };

  const handleDownloadSampleTemplate = () => {
    const sample = `Full Name,Mobile,Email,Gender,Category,City\n"Sheikh Zubair","+92 300 1122334","zubair@test.com","male","vip","Lahore"\n"Maira Malik","+92 321 9988776","maira@test.com","female","regular","Karachi"`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Huzaifa_Customers_Import_Template.csv';
    a.click();
    toast.success('Sample import template downloaded');
  };

  const handleProcessImport = () => {
    if (!importText.trim()) {
      toast.error('Please paste CSV contents or upload a file');
      return;
    }

    const lines = importText.trim().split('\n');
    if (lines.length <= 1) {
      toast.error('CSV contains no data rows');
      return;
    }

    const records: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.replace(/"/g, '').trim());
      if (parts[0]) {
        records.push({
          fullName: parts[0],
          mobile: parts[1] || '+92 300 0000000',
          email: parts[2] || '',
          gender: (parts[3] as any) || 'male',
          category: (parts[4] as any) || 'regular',
          address: { city: parts[5] || 'Lahore' },
        });
      }
    }

    if (records.length > 0) {
      importCustomers(records);
      onClose();
    } else {
      toast.error('Failed to parse customer rows');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-stone-950 border border-stone-800 text-stone-100 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-stone-100">Customer Data Management</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-stone-850 bg-stone-950 p-1 gap-1 text-xs">
          <button
            onClick={() => setActiveMode('export')}
            className={`flex-1 py-2 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'export' ? 'bg-amber-500 text-stone-950 font-bold shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Export Data ({customers.length})
          </button>
          <button
            onClick={() => setActiveMode('import')}
            className={`flex-1 py-2 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'import' ? 'bg-amber-500 text-stone-950 font-bold shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Import CSV / Excel
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {activeMode === 'export' ? (
            <div className="space-y-4">
              <p className="text-stone-400">
                Export all customer records, order histories, and sizing metrics into standard formats:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleExportCSV}
                  className="h-12 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/60 font-bold gap-2 flex-col justify-center"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Download CSV File
                </Button>
                <Button
                  onClick={() => {
                    window.print();
                  }}
                  className="h-12 bg-blue-950/60 border border-blue-500/30 text-blue-400 hover:bg-blue-900/60 font-bold gap-2 flex-col justify-center"
                >
                  <FileText className="w-5 h-5" />
                  Print / Save PDF Summary
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-stone-400">Paste CSV contents or upload below:</p>
                <button
                  onClick={handleDownloadSampleTemplate}
                  className="text-amber-400 hover:underline font-semibold text-[11px]"
                >
                  Download Sample CSV Template
                </button>
              </div>

              <textarea
                rows={6}
                placeholder={`Full Name,Mobile,Email,Gender,Category,City\n"Sheikh Zubair","+92 300 1122334","zubair@test.com","male","vip","Lahore"`}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full p-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 font-mono text-[11px] outline-none focus:border-amber-500"
              />

              <Button
                onClick={handleProcessImport}
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold h-10 gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <Upload className="w-4 h-4" />
                Process & Import Records
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
