'use client';

import React, { useState } from 'react';
import { useCustomerStore } from '@/store/useCustomerStore';
import {
  Layers,
  X,
  Trash2,
  Tag,
  Crown,
  MessageSquare,
  Mail,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BulkActionsModalProps {
  onClose: () => void;
}

export default function CustomerBulkActionsModal({ onClose }: BulkActionsModalProps) {
  const {
    selectedCustomerIds,
    bulkDeleteCustomers,
    bulkAssignCategory,
    bulkAddTags,
    clearSelection,
  } = useCustomerStore();

  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'category' | 'tags' | 'message' | 'delete'>('category');

  const count = selectedCustomerIds.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-stone-950 border border-stone-800 text-stone-100 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm text-stone-100">
              Bulk Operations ({count} Customers Selected)
            </h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-stone-850 bg-stone-950 p-1 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('category')}
            className={`flex-1 py-2 font-semibold rounded-lg transition-colors ${
              activeTab === 'category' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Assign Category
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex-1 py-2 font-semibold rounded-lg transition-colors ${
              activeTab === 'tags' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Add Tags
          </button>
          <button
            onClick={() => setActiveTab('message')}
            className={`flex-1 py-2 font-semibold rounded-lg transition-colors ${
              activeTab === 'message' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Broadcast
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={`flex-1 py-2 font-semibold rounded-lg transition-colors ${
              activeTab === 'delete' ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Bulk Delete
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {activeTab === 'category' && (
            <div className="space-y-3">
              <p className="text-stone-400">Change customer tier category for all {count} selected records:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => {
                    bulkAssignCategory('regular');
                    onClose();
                  }}
                  className="bg-stone-900 border border-stone-800 text-stone-200 hover:border-amber-500 h-10"
                >
                  Regular
                </Button>
                <Button
                  onClick={() => {
                    bulkAssignCategory('vip');
                    onClose();
                  }}
                  className="bg-purple-900/40 border border-purple-500/30 text-purple-300 hover:bg-purple-800/40 h-10 font-bold"
                >
                  <Crown className="w-4 h-4 mr-1 text-purple-400" />
                  VIP Member
                </Button>
                <Button
                  onClick={() => {
                    bulkAssignCategory('corporate');
                    onClose();
                  }}
                  className="bg-blue-900/40 border border-blue-500/30 text-blue-300 hover:bg-blue-800/40 h-10"
                >
                  Corporate
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-3">
              <p className="text-stone-400">Add a custom tag to {count} customer profiles:</p>
              <Input
                placeholder="e.g. Eid-Ul-Adha Campaign, Super-150s-Buyer..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="h-10 bg-stone-900 border-stone-800 text-xs text-stone-100"
              />
              <Button
                onClick={() => {
                  if (tagInput.trim()) {
                    bulkAddTags(tagInput.trim());
                    onClose();
                  }
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 font-bold h-9"
              >
                Apply Tag to {count} Records
              </Button>
            </div>
          )}

          {activeTab === 'message' && (
            <div className="space-y-3">
              <p className="text-stone-400">Launch marketing broadcast to selected customers:</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => {
                    alert(`WhatsApp Broadcast initiated for ${count} customers.`);
                    onClose();
                  }}
                  className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/60 h-10 gap-2 font-bold"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp Broadcast
                </Button>
                <Button
                  onClick={() => {
                    alert(`SMS Alert sent to ${count} customers.`);
                    onClose();
                  }}
                  className="bg-blue-950/60 border border-blue-500/30 text-blue-400 hover:bg-blue-900/60 h-10 gap-2 font-bold"
                >
                  <Mail className="w-4 h-4" />
                  SMS Campaign
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'delete' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300">
                <p className="font-bold mb-1">Warning!</p>
                <p>
                  You are about to permanently delete <strong>{count} customer records</strong> and all associated sizing history.
                </p>
              </div>
              <Button
                onClick={() => {
                  bulkDeleteCustomers();
                  onClose();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-10 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Permanently Delete {count} Customers
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
