'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Ruler, Info } from 'lucide-react';
import { saveCustomerMeasurementsAction, fetchCustomerMeasurementsAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface MeasurementFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId: string;
  customerName: string;
  templates: {
    id: string;
    name: string;
    fields: { name: string; label: string; unit: string; group: string }[];
  }[];
}

export default function MeasurementForm({
  open,
  onClose,
  onSuccess,
  customerId,
  customerName,
  templates,
}: MeasurementFormProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [preloadingValues, setPreloadingValues] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // Set the first template as default if available
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  // Load existing latest measurements to prefill the form
  useEffect(() => {
    if (!open || !customerId || !selectedTemplateId) return;

    const loadLatestMeasurements = async () => {
      setPreloadingValues(true);
      try {
        const measurementsHistory = await fetchCustomerMeasurementsAction(customerId);
        // Find latest measurement for the selected template
        const match = measurementsHistory.find(
          (m) => m.template_id === selectedTemplateId
        );

        if (match && typeof match.measurements === 'object') {
          const prefilled: Record<string, string> = {};
          Object.entries(match.measurements as Record<string, number>).forEach(([k, v]) => {
            prefilled[k] = v.toString();
          });
          setFormValues(prefilled);
          setNotes(match.notes || '');
          toast.info(`Preloaded measurements from version ${match.version}`);
        } else {
          // Clear form values if no prior record
          setFormValues({});
          setNotes('');
        }
      } catch (err) {
        console.error('Failed to load past measurements', err);
      } finally {
        setPreloadingValues(false);
      }
    };

    loadLatestMeasurements();
  }, [open, customerId, selectedTemplateId]);

  const handleInputChange = (fieldName: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    // Validate that measurements are numbers
    const parsedMeasurements: Record<string, number> = {};
    let hasValidationError = false;

    selectedTemplate.fields.forEach((field) => {
      const val = formValues[field.name];
      if (!val || val.trim() === '') {
        // Option to leave some fields empty, but let's notify the user if vital fields are empty
        return;
      }
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) {
        toast.error(`Invalid value for ${field.label}. Must be a positive number.`);
        hasValidationError = true;
      } else {
        parsedMeasurements[field.name] = num;
      }
    });

    if (hasValidationError) return;
    if (Object.keys(parsedMeasurements).length === 0) {
      toast.error('Please input at least one measurement value.');
      return;
    }

    setLoading(true);
    try {
      const response = await saveCustomerMeasurementsAction(
        customerId,
        selectedTemplate.id,
        parsedMeasurements,
        notes
      );

      if (response.success) {
        toast.success(`Measurements recorded successfully! (Version ${response.data.version})`);
        onSuccess();
        onClose();
      } else {
        toast.error(response.error || 'Failed to save measurements');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Group fields of the template
  const groupedFields: Record<string, { name: string; label: string; unit: string; group: string }[]> = {};
  if (selectedTemplate) {
    selectedTemplate.fields.forEach((f) => {
      const groupName = f.group || 'General';
      if (!groupedFields[groupName]) {
        groupedFields[groupName] = [];
      }
      groupedFields[groupName].push(f);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-xl bg-stone-950 border border-stone-850 text-stone-100 rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Ruler className="w-5 h-5 text-amber-500" />
            Record Measurements
          </DialogTitle>
          <DialogDescription className="text-stone-400 text-xs">
            Logging sizing values for client <span className="text-stone-200 font-bold">{customerName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 border-b border-stone-900">
          <Label className="text-stone-300 text-xs font-semibold uppercase tracking-wider">Garment Type</Label>
          <Select value={selectedTemplateId} onValueChange={(val) => val && setSelectedTemplateId(val)}>
            <SelectTrigger className="bg-stone-900 border-stone-800 text-stone-100">
              <SelectValue placeholder="Select clothing item type..." />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-stone-800 text-stone-100">
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {preloadingValues ? (
          <div className="py-12 flex flex-col items-center justify-center text-stone-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <p className="text-xs">Loading customer's latest size logs...</p>
          </div>
        ) : selectedTemplate ? (
          <form onSubmit={onSubmit} className="space-y-6 pt-2">
            {/* Render form fields by group */}
            {Object.entries(groupedFields).map(([groupName, fields]) => (
              <div key={groupName} className="space-y-3">
                <h4 className="text-xs font-extrabold text-amber-500/90 uppercase tracking-widest border-b border-stone-900 pb-1">
                  {groupName} Parameters
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {fields.map((field) => (
                    <div key={field.name} className="space-y-1.5">
                      <Label htmlFor={field.name} className="text-stone-400 text-xs font-medium">
                        {field.label} ({field.unit})
                      </Label>
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        placeholder="0.0"
                        value={formValues[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-stone-300 text-xs font-semibold uppercase tracking-wider">
                Fitting Notes for this garment
              </Label>
              <textarea
                id="notes"
                rows={2}
                placeholder="Comfort fit, slim fitting, loose shoulder, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-stone-800 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-stone-900">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="hover:bg-stone-900 text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Record Sizes'
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-8 text-center text-stone-500 text-xs flex items-center justify-center gap-1.5">
            <Info className="w-4 h-4 text-amber-500/80" />
            No templates configured in system database.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
