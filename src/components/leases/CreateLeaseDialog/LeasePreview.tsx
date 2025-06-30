import React from 'react';
import { FileText, Calendar, Clock } from 'lucide-react';
import type { CreateLeaseFormData, AssetOption, RenterOption } from './types';

interface LeasePreviewProps {
  formData: CreateLeaseFormData;
  selectedAsset?: AssetOption;
  selectedRenter?: RenterOption;
}

export function LeasePreview({ formData, selectedAsset, selectedRenter }: LeasePreviewProps) {
  if (!selectedAsset || !selectedRenter || !formData.startDate || !formData.endDate || 
      !formData.startTime || !formData.endTime || !formData.baseChargeAmount) {
    return null;
  }

  const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
  const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
  
  const duration = endDateTime.getTime() - startDateTime.getTime();
  const durationMinutes = Math.floor(duration / (1000 * 60));
  const durationHours = Math.floor(durationMinutes / 60);
  const durationDays = Math.floor(durationHours / 24);

  let durationText = '';
  if (durationDays > 0) {
    durationText += `${durationDays} day${durationDays > 1 ? 's' : ''} `;
  }
  if (durationHours % 24 > 0) {
    durationText += `${durationHours % 24} hour${(durationHours % 24) > 1 ? 's' : ''} `;
  }
  if (durationMinutes % 60 > 0) {
    durationText += `${durationMinutes % 60} minute${(durationMinutes % 60) > 1 ? 's' : ''}`;
  }

  const getChargePeriodText = () => {
    if (formData.chargePeriod === 'custom') {
      const custom = formData.customChargePeriod;
      if (!custom || (!custom.days && !custom.hours && !custom.minutes)) {
        return 'Custom (not configured)';
      }
      
      const parts = [];
      if (custom.days && custom.days > 0) {
        parts.push(`${custom.days} day${custom.days > 1 ? 's' : ''}`);
      }
      if (custom.hours && custom.hours > 0) {
        parts.push(`${custom.hours} hour${custom.hours > 1 ? 's' : ''}`);
      }
      if (custom.minutes && custom.minutes > 0) {
        parts.push(`${custom.minutes} minute${custom.minutes > 1 ? 's' : ''}`);
      }
      
      return `Custom (${parts.join(', ')})`;
    }
    
    return formData.chargePeriod;
  };

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <h4 className="font-medium text-blue-900">Lease Agreement Preview</h4>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <p className="text-blue-700"><strong>Asset:</strong> {selectedAsset.name}</p>
          <p className="text-blue-700"><strong>Renter:</strong> {selectedRenter.firstName} {selectedRenter.lastName}</p>
          <p className="text-blue-700"><strong>Duration:</strong> {durationText.trim() || '0 minutes'}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-blue-700">
            <Calendar className="h-4 w-4" />
            <span><strong>Start:</strong> {startDateTime.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-700">
            <Calendar className="h-4 w-4" />
            <span><strong>End:</strong> {endDateTime.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-700">
            <Clock className="h-4 w-4" />
            <span><strong>Charge:</strong> ${parseFloat(formData.baseChargeAmount).toLocaleString()} per {getChargePeriodText()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}