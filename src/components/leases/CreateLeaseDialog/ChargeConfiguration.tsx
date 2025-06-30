import React from 'react';
import { DollarSign } from 'lucide-react';
import { Input } from '../../ui/Input';
import { CustomChargePeriod } from './CustomChargePeriod';
import type { CreateLeaseFormData, ChargePeriodOption } from './types';

interface ChargeConfigurationProps {
  formData: CreateLeaseFormData;
  submitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCustomPeriodChange: (field: 'minutes' | 'hours' | 'days', value: number) => void;
}

const chargePeriodOptions: ChargePeriodOption[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom Period', isCustom: true },
];

export function ChargeConfiguration({ 
  formData, 
  submitting, 
  onChange, 
  onCustomPeriodChange 
}: ChargeConfigurationProps) {
  const isCustomPeriod = formData.chargePeriod === 'custom';

  const getChargePreview = () => {
    if (!formData.baseChargeAmount) return null;

    const amount = parseFloat(formData.baseChargeAmount);
    if (isNaN(amount)) return null;

    if (isCustomPeriod) {
      const customPeriod = formData.customChargePeriod;
      if (!customPeriod || (!customPeriod.days && !customPeriod.hours && !customPeriod.minutes)) {
        return `$${amount.toLocaleString()} per custom period (not set)`;
      }

      const parts = [];
      if (customPeriod.days && customPeriod.days > 0) {
        parts.push(`${customPeriod.days} day${customPeriod.days > 1 ? 's' : ''}`);
      }
      if (customPeriod.hours && customPeriod.hours > 0) {
        parts.push(`${customPeriod.hours} hour${customPeriod.hours > 1 ? 's' : ''}`);
      }
      if (customPeriod.minutes && customPeriod.minutes > 0) {
        parts.push(`${customPeriod.minutes} minute${customPeriod.minutes > 1 ? 's' : ''}`);
      }

      const periodText = parts.join(', ');
      return `$${amount.toLocaleString()} per ${periodText}`;
    }

    return `$${amount.toLocaleString()} per ${formData.chargePeriod}`;
  };

  return (
    <>
      {/* Charge Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Base Charge Amount *
          </label>
          <Input
            type="number"
            name="baseChargeAmount"
            value={formData.baseChargeAmount}
            onChange={onChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
            disabled={submitting}
            className="focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Charge Period *
          </label>
          <select
            name="chargePeriod"
            value={formData.chargePeriod}
            onChange={onChange}
            required
            disabled={submitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            {chargePeriodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Period Configuration */}
      {isCustomPeriod && (
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <CustomChargePeriod
            formData={formData}
            submitting={submitting}
            onCustomPeriodChange={onCustomPeriodChange}
          />
        </div>
      )}

      {/* Charge Preview */}
      {formData.baseChargeAmount && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Charge Summary:</strong> {getChargePreview()}
          </p>
        </div>
      )}
    </>
  );
}