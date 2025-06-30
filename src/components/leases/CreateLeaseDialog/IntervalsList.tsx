import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { CreateLeaseFormData, LeaseInterval } from './types';

interface IntervalsListProps {
  formData: CreateLeaseFormData;
  submitting: boolean;
}

export function IntervalsList({ formData, submitting }: IntervalsListProps) {
  const [intervals, setIntervals] = useState<LeaseInterval[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateIntervals = async () => {
    // Validate required fields
    if (!formData.startDate || !formData.startTime || 
        !formData.endDate || !formData.endTime || 
        !formData.baseChargeAmount || !formData.chargePeriod) {
      setIntervals([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate async calculation with delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      const chargeAmount = parseFloat(formData.baseChargeAmount);

      if (endDateTime <= startDateTime) {
        setError('End date/time must be after start date/time');
        setIntervals([]);
        return;
      }

      // Calculate interval duration in minutes
      let intervalMinutes = 0;
      
      if (formData.chargePeriod === 'custom') {
        const custom = formData.customChargePeriod;
        if (custom) {
          intervalMinutes = (custom.days || 0) * 24 * 60 + 
                          (custom.hours || 0) * 60 + 
                          (custom.minutes || 0);
        }
      } else {
        const periodMinutes = {
          'hourly': 60,
          'daily': 24 * 60,
          'weekly': 7 * 24 * 60,
          'monthly': 30 * 24 * 60,
          'quarterly': 90 * 24 * 60,
          'yearly': 365 * 24 * 60
        };
        intervalMinutes = periodMinutes[formData.chargePeriod as keyof typeof periodMinutes] || 0;
      }

      if (intervalMinutes <= 0) {
        setError('Invalid charge period configuration');
        setIntervals([]);
        return;
      }

      // Generate intervals
      const calculatedIntervals: LeaseInterval[] = [];
      let currentStart = new Date(startDateTime);
      let intervalNumber = 1;

      while (currentStart < endDateTime) {
        const currentEnd = new Date(currentStart.getTime() + intervalMinutes * 60 * 1000);
        
        // Don't exceed the lease end date
        if (currentEnd > endDateTime) {
          currentEnd.setTime(endDateTime.getTime());
        }

        const duration = currentEnd.getTime() - currentStart.getTime();
        const durationMinutes = Math.floor(duration / (1000 * 60));
        const durationHours = Math.floor(durationMinutes / 60);
        const durationDays = Math.floor(durationHours / 24);

        let durationText = '';
        if (durationDays > 0) {
          durationText += `${durationDays}d `;
        }
        if (durationHours % 24 > 0) {
          durationText += `${durationHours % 24}h `;
        }
        if (durationMinutes % 60 > 0) {
          durationText += `${durationMinutes % 60}m`;
        }

        calculatedIntervals.push({
          id: `interval-${intervalNumber}`,
          startDateTime: new Date(currentStart),
          endDateTime: new Date(currentEnd),
          duration: durationText.trim() || '0m',
          chargeAmount: chargeAmount,
          intervalNumber: intervalNumber
        });

        currentStart = new Date(currentEnd);
        intervalNumber++;

        // Safety limit to prevent infinite loops
        if (calculatedIntervals.length > 1000) {
          setError('Too many intervals generated. Please use a longer charge period.');
          setIntervals([]);
          return;
        }
      }

      setIntervals(calculatedIntervals);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate intervals');
      setIntervals([]);
    } finally {
      setLoading(false);
    }
  };

  // Recalculate intervals when form data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateIntervals();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [
    formData.startDate,
    formData.startTime,
    formData.endDate,
    formData.endTime,
    formData.baseChargeAmount,
    formData.chargePeriod,
    formData.customChargePeriod
  ]);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTotalAmount = () => {
    return intervals.reduce((total, interval) => total + interval.chargeAmount, 0);
  };

  if (!formData.startDate || !formData.endDate || !formData.chargePeriod) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-center text-gray-500">
          <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Complete the form above to see charge intervals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h4 className="text-sm font-medium text-gray-700">Charge Intervals</h4>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={calculateIntervals}
          disabled={loading || submitting}
          className="text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse p-3 bg-gray-100 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                  <div className="h-2 bg-gray-300 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : intervals.length > 0 ? (
        <>
          {/* Summary */}
          <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">
                  {intervals.length} charge interval{intervals.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-green-700">
                  Total lease value: ${getTotalAmount().toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>

          {/* Intervals List */}
          <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
            {intervals.map((interval, index) => (
              <div
                key={interval.id}
                className="p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        #{interval.intervalNumber}
                      </span>
                      <span className="text-xs text-gray-500">{interval.duration}</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Start: {formatDateTime(interval.startDateTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>End: {formatDateTime(interval.endDateTime)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${interval.chargeAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            No intervals calculated. Please check your date/time and charge period settings.
          </p>
        </div>
      )}
    </div>
  );
}