import React from 'react';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { intervalStatusConfig, paymentStatusConfig } from './constants';
import type { IntervalCardProps } from './types';

export function IntervalCard({ interval, isHighlighted = false }: IntervalCardProps) {
  const statusConfig = intervalStatusConfig[interval.status];
  const paymentConfig = paymentStatusConfig[interval.isPaid ? 'paid' : 'unpaid'];
  const StatusIcon = statusConfig.icon;
  const PaymentIcon = paymentConfig.icon;

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

  const formatDuration = (duration: string) => {
    return duration || 'N/A';
  };

  return (
    <div className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
      isHighlighted 
        ? 'border-blue-300 bg-blue-50 shadow-md' 
        : `border-gray-200 bg-white hover:border-gray-300 ${statusConfig.borderColor}`
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${statusConfig.bg} rounded-lg`}>
            <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-900">
                Interval #{interval.intervalNumber}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} font-medium`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-gray-600">{formatDuration(interval.duration)}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <PaymentIcon className={`h-4 w-4 ${paymentConfig.color}`} />
            <span className="text-lg font-bold text-gray-900">
              ${interval.chargeAmount.toLocaleString()}
            </span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${paymentConfig.bg} ${paymentConfig.color} font-medium`}>
            {paymentConfig.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          <Calendar className="h-3 w-3" />
          <div>
            <p className="font-medium">Start</p>
            <p>{formatDateTime(interval.startDateTime)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-3 w-3" />
          <div>
            <p className="font-medium">End</p>
            <p>{formatDateTime(interval.endDateTime)}</p>
          </div>
        </div>
      </div>

      {interval.status === 'overdue' && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-700 font-medium">
            Payment overdue since {formatDateTime(interval.dueDate)}
          </p>
        </div>
      )}

      {interval.status === 'current' && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-md">
          <p className="text-xs text-orange-700 font-medium">
            Current billing period - Due {formatDateTime(interval.dueDate)}
          </p>
        </div>
      )}
    </div>
  );
}