import React from 'react';
import { FileText, User, Building, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import type { LeaseTerminationInfoProps } from './types';

export function LeaseTerminationInfo({ lease }: LeaseTerminationInfoProps) {
  if (!lease) return null;

  const calculateRemainingDays = () => {
    const endDate = new Date(lease.endDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const remainingDays = calculateRemainingDays();

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <FileText className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h4 className="font-medium text-red-900">Lease Termination Details</h4>
          <p className="text-sm text-red-600">Lease ID: {lease.id}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-red-600">Renter</p>
              <p className="text-sm font-semibold text-red-900">{lease.renterName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-red-600">Asset</p>
              <p className="text-sm font-semibold text-red-900">{lease.assetName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-red-600">Original End Date</p>
              <p className="text-sm font-semibold text-red-900">
                {new Date(lease.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-red-600">Outstanding Balance</p>
              <p className="text-sm font-semibold text-red-900">
                ${lease.outstandingBalance?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-red-600">Overdue Balance</p>
              <p className="text-sm font-semibold text-red-900">
                ${lease.overdueBalance?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-red-600">Days Remaining</p>
              <p className="text-sm font-semibold text-red-900">
                {remainingDays} days
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Indicators */}
      <div className="flex flex-wrap gap-2 mt-4">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          lease.leaseStatus === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {lease.leaseStatus}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          lease.financialStatus === 'paid' 
            ? 'bg-green-100 text-green-800'
            : lease.financialStatus === 'overdue'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {lease.financialStatus}
        </span>
        
        {remainingDays > 0 && (
          <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800 font-medium">
            Early Termination
          </span>
        )}
      </div>
    </div>
  );
}