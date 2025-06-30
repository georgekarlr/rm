import React from 'react';
import { FileText, User, Building, Calendar, DollarSign } from 'lucide-react';
import type { LeaseInfoProps } from './types';

export function LeaseInfo({ lease }: LeaseInfoProps) {
  if (!lease) return null;

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-medium text-blue-900">Lease Information</h4>
          <p className="text-sm text-blue-600">Lease ID: {lease.id}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-blue-600">Renter</p>
              <p className="text-sm font-semibold text-blue-900">{lease.renterName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-blue-600">Asset</p>
              <p className="text-sm font-semibold text-blue-900">{lease.assetName}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-blue-600">Lease Period</p>
              <p className="text-sm font-semibold text-blue-900">
                {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-blue-600">Base Charge Amount</p>
              <p className="text-sm font-semibold text-blue-900">
                ${lease.base_charge_amount?.toLocaleString() || '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Financial Info */}
      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-blue-200">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-xs text-blue-600">Outstanding Balance</p>
            <p className="text-sm font-semibold text-blue-900">
              ${lease.outstandingBalance?.toLocaleString() || '0.00'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-xs text-blue-600">Overdue Balance</p>
            <p className="text-sm font-semibold text-blue-900">
              ${lease.overdueBalance?.toLocaleString() || '0.00'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}