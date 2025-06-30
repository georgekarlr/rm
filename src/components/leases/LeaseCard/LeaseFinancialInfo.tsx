import React from 'react';
import { AlertTriangle, Triangle as ExclamationTriangle } from 'lucide-react';
import type { LeaseFinancialInfoProps } from './types';

export function LeaseFinancialInfo({ lease }: LeaseFinancialInfoProps) {
  const financialConfig = {
    paid: { icon: AlertTriangle, color: 'text-green-600' },
    overdue: { icon: AlertTriangle, color: 'text-red-600' },
    pending: { icon: AlertTriangle, color: 'text-yellow-600' },
    partial: { icon: AlertTriangle, color: 'text-orange-600' },
  };

  const config = financialConfig[lease.financialStatus as keyof typeof financialConfig] || financialConfig.pending;
  const FinancialIcon = config.icon;

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Outstanding Balance */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Outstanding Balance</p>
          <div className="flex items-center space-x-2">
            <p className={`text-lg font-bold ${
              lease.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              ${lease.outstandingBalance.toLocaleString()}
            </p>
            {lease.outstandingBalance > 0 && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>

        {/* Overdue Balance */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Overdue Balance</p>
          <div className="flex items-center space-x-2">
            <p className={`text-lg font-bold ${
              lease.overdueBalance > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              ${lease.overdueBalance.toLocaleString()}
            </p>
            {lease.overdueBalance > 0 && (
              <ExclamationTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* Next Payment Due */}
      {lease.nextPaymentDue && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Next Payment Due</p>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-semibold text-gray-900">
              {new Date(lease.nextPaymentDue).toLocaleDateString()}
            </p>
            <FinancialIcon className={`h-4 w-4 ${config.color}`} />
          </div>
        </div>
      )}
    </div>
  );
}