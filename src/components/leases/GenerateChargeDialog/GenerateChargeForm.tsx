import React from 'react';
import { DollarSign, Calendar, FileText } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Alert } from '../../ui/Alert';
import { CategorySelector } from './CategorySelector';
import { ChargePreview } from './ChargePreview';
import type { GenerateChargeFormProps } from './types';

export function GenerateChargeForm({
  formData,
  onFormDataChange,
  onSubmit,
  submitting,
  lease,
  message
}: GenerateChargeFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFormDataChange({ [name]: value });
  };

  const handleCategoryChange = (category: string) => {
    onFormDataChange({ category });
  };

  const handleUseBaseChargeAmount = () => {
    if (lease && lease.base_charge_amount) {
      onFormDataChange({ amount: lease.base_charge_amount.toString() });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Category Selection */}
      <CategorySelector
        formData={formData}
        submitting={submitting}
        onChange={handleCategoryChange}
      />

      {/* Amount and Due Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Charge Amount *
          </label>
          <div className="space-y-2">
            <Input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              disabled={submitting}
              className="focus:ring-green-500 focus:border-green-500"
            />
            {lease && lease.base_charge_amount > 0 && (
              <button
                type="button"
                onClick={handleUseBaseChargeAmount}
                className="text-xs text-green-600 hover:text-green-800 underline"
              >
                Use base charge amount (${lease.base_charge_amount.toLocaleString()})
              </button>
            )}
            {formData.amount && (
              <p className="text-xs text-gray-600">
                Amount: ${parseFloat(formData.amount || '0').toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Due Date *
          </label>
          <Input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            required
            disabled={submitting}
            className="focus:ring-green-500 focus:border-green-500"
          />
          {formData.dueDate && (
            <p className="text-xs text-gray-600 mt-1">
              Due: {new Date(formData.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="inline h-4 w-4 mr-1" />
          Description (Optional)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Add any additional details about this charge..."
          disabled={submitting}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional description to provide more context about this charge
        </p>
      </div>

      {/* Charge Preview */}
      <ChargePreview formData={formData} lease={lease} />

      {/* Message */}
      {message && (
        <Alert
          type={message.type}
          message={message.text}
        />
      )}

      {/* Help Text */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Charge Generation Notes:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Select the appropriate category for accurate record keeping</li>
          <li>• Amount must be a positive number</li>
          <li>• Due date should be in the future for new charges</li>
          <li>• Description helps provide context for the charge</li>
          <li>• Generated charges will be added to the lease's outstanding balance</li>
        </ul>
      </div>
    </form>
  );
}