import React from 'react';
import type { Lease } from './types';

interface LeaseDateInfoProps {
  lease: Lease;
}

export function LeaseDateInfo({ lease }: LeaseDateInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Start Date</p>
        <p className="text-sm font-semibold text-gray-900">
          {new Date(lease.startDate).toLocaleDateString()}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">End Date</p>
        <p className="text-sm font-semibold text-gray-900">
          {new Date(lease.endDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}