import React from 'react';
import { Clock, Plus, Minus } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import type { CreateLeaseFormData } from './types';

interface CustomChargePeriodProps {
  formData: CreateLeaseFormData;
  submitting: boolean;
  onCustomPeriodChange: (field: 'minutes' | 'hours' | 'days', value: number) => void;
}

export function CustomChargePeriod({ formData, submitting, onCustomPeriodChange }: CustomChargePeriodProps) {
  const customPeriod = formData.customChargePeriod || { minutes: 0, hours: 0, days: 0 };

  const handleIncrement = (field: 'minutes' | 'hours' | 'days') => {
    const currentValue = customPeriod[field] || 0;
    const maxValues = { minutes: 59, hours: 23, days: 365 };
    const newValue = Math.min(currentValue + 1, maxValues[field]);
    onCustomPeriodChange(field, newValue);
  };

  const handleDecrement = (field: 'minutes' | 'hours' | 'days') => {
    const currentValue = customPeriod[field] || 0;
    const newValue = Math.max(currentValue - 1, 0);
    onCustomPeriodChange(field, newValue);
  };

  const handleDirectChange = (field: 'minutes' | 'hours' | 'days', value: string) => {
    const numValue = parseInt(value) || 0;
    const maxValues = { minutes: 59, hours: 23, days: 365 };
    const clampedValue = Math.max(0, Math.min(numValue, maxValues[field]));
    onCustomPeriodChange(field, clampedValue);
  };

  const getTotalMinutes = () => {
    return (customPeriod.days || 0) * 24 * 60 + 
           (customPeriod.hours || 0) * 60 + 
           (customPeriod.minutes || 0);
  };

  const formatCustomPeriod = () => {
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
    return parts.length > 0 ? parts.join(', ') : 'No period set';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <Clock className="h-5 w-5 text-blue-600" />
        <h4 className="text-sm font-medium text-gray-700">Custom Charge Period</h4>
      </div>

      {/* Custom Period Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Days */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Days</label>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleDecrement('days')}
              disabled={submitting || (customPeriod.days || 0) <= 0}
              className="p-2"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              value={customPeriod.days || 0}
              onChange={(e) => handleDirectChange('days', e.target.value)}
              min="0"
              max="365"
              disabled={submitting}
              className="text-center"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleIncrement('days')}
              disabled={submitting || (customPeriod.days || 0) >= 365}
              className="p-2"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Hours */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Hours</label>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleDecrement('hours')}
              disabled={submitting || (customPeriod.hours || 0) <= 0}
              className="p-2"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              value={customPeriod.hours || 0}
              onChange={(e) => handleDirectChange('hours', e.target.value)}
              min="0"
              max="23"
              disabled={submitting}
              className="text-center"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleIncrement('hours')}
              disabled={submitting || (customPeriod.hours || 0) >= 23}
              className="p-2"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Minutes */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Minutes</label>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleDecrement('minutes')}
              disabled={submitting || (customPeriod.minutes || 0) <= 0}
              className="p-2"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              value={customPeriod.minutes || 0}
              onChange={(e) => handleDirectChange('minutes', e.target.value)}
              min="0"
              max="59"
              disabled={submitting}
              className="text-center"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleIncrement('minutes')}
              disabled={submitting || (customPeriod.minutes || 0) >= 59}
              className="p-2"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Period Summary */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Custom Period</p>
            <p className="text-blue-700">{formatCustomPeriod()}</p>
          </div>
          <div className="text-right text-xs text-blue-600">
            <p>Total: {getTotalMinutes().toLocaleString()} minutes</p>
            {getTotalMinutes() > 0 && (
              <p>≈ {(getTotalMinutes() / 60).toFixed(1)} hours</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">Quick Presets:</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              onCustomPeriodChange('minutes', 30);
              onCustomPeriodChange('hours', 0);
              onCustomPeriodChange('days', 0);
            }}
            disabled={submitting}
            className="text-xs"
          >
            30 min
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              onCustomPeriodChange('minutes', 0);
              onCustomPeriodChange('hours', 1);
              onCustomPeriodChange('days', 0);
            }}
            disabled={submitting}
            className="text-xs"
          >
            1 hour
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              onCustomPeriodChange('minutes', 0);
              onCustomPeriodChange('hours', 0);
              onCustomPeriodChange('days', 1);
            }}
            disabled={submitting}
            className="text-xs"
          >
            1 day
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              onCustomPeriodChange('minutes', 0);
              onCustomPeriodChange('hours', 0);
              onCustomPeriodChange('days', 7);
            }}
            disabled={submitting}
            className="text-xs"
          >
            1 week
          </Button>
        </div>
      </div>
    </div>
  );
}