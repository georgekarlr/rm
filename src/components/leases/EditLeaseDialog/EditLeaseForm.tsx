import React from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Alert } from '../../ui/Alert';
import type { EditLeaseFormProps } from './types';

export function EditLeaseForm({
  formData,
  onFormDataChange,
  onSubmit,
  submitting,
  lease,
  message
}: EditLeaseFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFormDataChange({ [name]: value });
  };

  const calculateDurationChange = () => {
    if (!formData.newEndDate || !lease?.endDate) return null;
    
    const currentEndDate = new Date(lease.endDate);
    const newEndDate = new Date(formData.newEndDate);
    const daysDifference = Math.ceil(
      (newEndDate.getTime() - currentEndDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysDifference;
  };

  const durationChange = calculateDurationChange();

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* New End Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="inline h-4 w-4 mr-1" />
          New End Date *
        </label>
        <Input
          type="date"
          name="newEndDate"
          value={formData.newEndDate}
          onChange={handleInputChange}
          required
          disabled={submitting}
          className="focus:ring-orange-500 focus:border-orange-500"
        />
        {durationChange !== null && (
          <p className="text-xs text-gray-600 mt-1">
            {durationChange > 0 
              ? `Extending lease by ${durationChange} days`
              : durationChange < 0
              ? `Shortening lease by ${Math.abs(durationChange)} days`
              : 'No change in lease duration'
            }
          </p>
        )}
      </div>

      {/* New Base Charge Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <DollarSign className="inline h-4 w-4 mr-1" />
          New Base Charge Amount *
        </label>
        <Input
          type="number"
          name="newBaseChargeAmount"
          value={formData.newBaseChargeAmount}
          onChange={handleInputChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          required
          disabled={submitting}
          className="focus:ring-orange-500 focus:border-orange-500"
        />
        {formData.newBaseChargeAmount && (
          <p className="text-xs text-gray-600 mt-1">
            New charge: ${parseFloat(formData.newBaseChargeAmount || '0').toLocaleString()}
          </p>
        )}
      </div>

      {/* Changes Preview */}
      {(formData.newEndDate || formData.newBaseChargeAmount) && (
        <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
          <h4 className="font-medium text-orange-900 mb-2">Lease Amendment Summary</h4>
          <div className="space-y-2 text-sm">
            {formData.newEndDate && (
              <div className="flex justify-between">
                <span className="text-orange-700">New End Date:</span>
                <span className="font-medium text-orange-900">
                  {new Date(formData.newEndDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {formData.newBaseChargeAmount && (
              <div className="flex justify-between">
                <span className="text-orange-700">New Base Charge:</span>
                <span className="font-medium text-orange-900">
                  ${parseFloat(formData.newBaseChargeAmount).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <Alert
          type={message.type}
          message={message.text}
        />
      )}

      {/* Help Text */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Lease Amendment Notes:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Only the end date and base charge amount can be modified</li>
          <li>• New end date must be after the current start date</li>
          <li>• Base charge amount must be a positive number</li>
          <li>• Changes will take effect immediately upon confirmation</li>
        </ul>
      </div>
    </form>
  );
}