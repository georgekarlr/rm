import React from 'react';
import type { Lease, LeaseStatusConfig } from './types';

interface LeaseStatusBadgesProps {
  lease: Lease;
  leaseConfig: LeaseStatusConfig;
  financialConfig: LeaseStatusConfig;
}

export function LeaseStatusBadges({ lease, leaseConfig, financialConfig }: LeaseStatusBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className={`text-xs px-2 py-1 rounded-full ${leaseConfig.bg} ${leaseConfig.color} font-medium`}>
        {leaseConfig.label}
      </span>
      <span className={`text-xs px-2 py-1 rounded-full ${financialConfig.bg} ${financialConfig.color} font-medium`}>
        {financialConfig.label}
      </span>
      {lease.isExpiringSoon && (
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-600 font-medium">
          Expiring Soon
        </span>
      )}
      {lease.isExpired && (
        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 font-medium">
          Expired
        </span>
      )}
      {lease.overdueBalance > 0 && (
        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 font-medium">
          Overdue
        </span>
      )}
    </div>
  );
}