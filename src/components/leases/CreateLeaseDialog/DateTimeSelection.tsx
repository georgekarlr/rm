import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Input } from '../../ui/Input';
import type { CreateLeaseFormData } from './types';

interface DateTimeSelectionProps {
  formData: CreateLeaseFormData;
  submitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DateTimeSelection({ formData, submitting, onChange }: DateTimeSelectionProps) {
  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime) return null;
    
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    const diffMs = endDateTime.getTime() - startDateTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    const remainingHours = diffHours % 24;
    const remainingMinutes = diffMinutes % 60;
    
    let duration = '';
    if (diffDays > 0) duration += `${diffDays} day${diffDays > 1 ? 's' : ''} `;
    if (remainingHours > 0) duration += `${remainingHours} hour${remainingHours > 1 ? 's' : ''} `;
    if (remainingMinutes > 0) duration += `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
    
    return {
      totalMinutes: diffMinutes,
      totalHours: diffHours,
      totalDays: diffDays,
      formatted: duration.trim() || '0 minutes'
    };
  };

  const duration = calculateDuration();

  return (
    <>
      {/* Start Date and Time */}
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
            <Clock className="inline h-4 w-4 mr-1" />
            Start Time *
          </label>
          <Input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={onChange}
            required
            disabled={submitting}
            className="focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* End Date and Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            End Time *
          </label>
          <Input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={onChange}
            required
            disabled={submitting}
            className="focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Lease Duration Preview */}
      {duration && (
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Total Lease Duration</p>
              <p className="text-lg font-bold text-blue-700">{duration.formatted}</p>
            </div>
            <div className="text-right text-xs text-blue-600">
              <p>{duration.totalMinutes.toLocaleString()} minutes</p>
              <p>{duration.totalHours.toLocaleString()} hours</p>
              <p>{duration.totalDays} days</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}