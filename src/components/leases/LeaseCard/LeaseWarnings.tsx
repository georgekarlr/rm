import React from 'react';
import { AlertTriangle, DollarSign, Triangle as ExclamationTriangle } from 'lucide-react';
import type { LeaseWarningsProps } from './types';

export function LeaseWarnings({ lease }: LeaseWarningsProps) {
  return (
    <>
      {/* Critical Overdue Balance Warning */}
      {lease.overdueBalance > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              Critical: ${lease.overdueBalance.toLocaleString()} overdue payment
            </span>
          </div>
        </div>
      )}

      {/* Outstanding Balance Warning */}
      {lease.outstandingBalance > 0 && lease.overdueBalance === 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Outstanding balance of ${lease.outstandingBalance.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Expiry Warning */}
      {lease.isExpiringSoon && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Expires in {lease.daysUntilExpiry} days
            </span>
          </div>
        </div>
      )}
    </>
  );
}