import React from 'react';
import { AlertTriangle, DollarSign, Calendar, Info } from 'lucide-react';
import type { TerminationWarningsProps } from './types';

export function TerminationWarnings({ lease }: TerminationWarningsProps) {
  if (!lease) return null;

  const calculateRemainingDays = () => {
    const endDate = new Date(lease.endDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const remainingDays = calculateRemainingDays();
  const hasOutstandingBalance = (lease.outstandingBalance || 0) > 0;
  const hasOverdueBalance = (lease.overdueBalance || 0) > 0;
  const isEarlyTermination = remainingDays > 0;

  return (
    <div className="space-y-4">
      {/* Critical Warnings */}
      {hasOverdueBalance && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-900">Critical: Overdue Payments</h4>
              <p className="text-sm text-red-700 mt-1">
                This lease has ${lease.overdueBalance?.toLocaleString() || '0'} in overdue payments. 
                Terminating the lease does not automatically resolve these outstanding debts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Outstanding Balance Warning */}
      {hasOutstandingBalance && !hasOverdueBalance && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <DollarSign className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">Outstanding Balance</h4>
              <p className="text-sm text-yellow-700 mt-1">
                This lease has ${lease.outstandingBalance?.toLocaleString() || '0'} in outstanding balance. 
                Consider collecting payments before termination.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Early Termination Warning */}
      {isEarlyTermination && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-orange-900">Early Termination</h4>
              <p className="text-sm text-orange-700 mt-1">
                This lease is being terminated {remainingDays} days before its scheduled end date 
                ({new Date(lease.endDate).toLocaleDateString()}). This may have legal and financial implications.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* General Information */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Termination Effects</h4>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• The lease status will be changed to "terminated"</li>
              <li>• The asset will become available for new leases</li>
              <li>• The termination date will be set to today</li>
              <li>• All actions will be logged for audit purposes</li>
              <li>• This action cannot be undone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}