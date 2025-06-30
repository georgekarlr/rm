import React from 'react';
import { FileText, Calendar, DollarSign } from 'lucide-react';

interface LeaseInfoProps {
  lease: any;
}

export function LeaseInfo({ lease }: LeaseInfoProps) {
  if (!lease) return null;

  return (
    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">Current Lease Details</h4>
          <p className="text-sm text-gray-600">Lease ID: {lease.id}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Renter</p>
          <p className="text-lg font-semibold text-gray-900">{lease.renterName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Asset</p>
          <p className="text-lg font-semibold text-gray-900">{lease.assetName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Start Date</p>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <p className="text-sm text-gray-900">{new Date(lease.startDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Current End Date</p>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <p className="text-sm text-gray-900">{new Date(lease.endDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Current Base Charge</p>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <p className="text-sm text-gray-900">${lease.outstandingBalance?.toLocaleString() || 'N/A'}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Status</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            lease.leaseStatus === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {lease.leaseStatus}
          </span>
        </div>
      </div>
    </div>
  );
}