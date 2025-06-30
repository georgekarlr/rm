import React from 'react';
import { X, FileText, Calendar, User, Building } from 'lucide-react';
import type { LeaseDetailsHeaderProps } from './types';

export function LeaseDetailsHeader({ lease, onClose }: LeaseDetailsHeaderProps) {
  if (!lease) return null;

  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Lease Details</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{lease.renterName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Building className="h-4 w-4" />
              <span>{lease.assetName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>ID: {lease.id}</span>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      >
        <X className="h-5 w-5 text-gray-500" />
      </button>
    </div>
  );
}