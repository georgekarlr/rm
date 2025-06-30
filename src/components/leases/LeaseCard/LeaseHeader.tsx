import React from 'react';
import type { LeaseHeaderProps } from './types';

export function LeaseHeader({ lease, leaseConfig, financialConfig }: LeaseHeaderProps) {
  const LeaseIcon = leaseConfig.icon;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3 pr-8">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className={`p-3 ${leaseConfig.bg} rounded-full flex-shrink-0`}>
          <LeaseIcon className={`h-6 w-6 ${leaseConfig.color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {lease.renterName}
          </h3>
          <p className="text-sm text-gray-600 truncate">
            {lease.assetName}
          </p>
        </div>
      </div>
    </div>
  );
}