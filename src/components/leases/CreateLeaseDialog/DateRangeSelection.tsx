import React from 'react';
import { Calendar } from 'lucide-react';
import { Input } from '../../ui/Input';
import type { CreateLeaseFormData } from './types';

interface DateRangeSelectionProps {
  formData: CreateLeaseFormData;
  submitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// This component is now replaced by DateTimeSelection
// Keeping for backward compatibility
export function DateRangeSelection({ formData, submitting, onChange }: DateRangeSelectionProps) {
  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return null;
    
    const days = Math.ceil(
      (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    const months = Math.ceil(days / 30);
    
    return { days, months };
  };

  const duration = calculateDuration();

  return (
    <>
      {/* Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Start Date *
          </label>
          <Input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={onChange}
            required
            disabled={submitting}
            className="focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            End Date *
          </label>
          <Input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={onChange}
            required
            disabled={submitting}
            className="focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Lease Duration Preview */}
      {duration && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Lease Duration:</strong> {duration.days} days ({duration.months} months)
          </p>
        </div>
      )}
    </>
  );
}