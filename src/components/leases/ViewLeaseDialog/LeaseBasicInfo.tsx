import React from 'react';
import { Calendar, Clock, MapPin, User, Building, Tag, FileText, DollarSign } from 'lucide-react';
import type { LeaseBasicInfoProps } from './types';

export function LeaseBasicInfo({ lease }: LeaseBasicInfoProps) {
  if (!lease) return null;

  // Log the actual values for debugging
  console.log('Lease status in LeaseBasicInfo:', {
    leaseStatus: lease.leaseStatus,
    financialStatus: lease.financialStatus,
    id: lease.id,
    baseChargeAmount: lease.base_charge_amount
  });

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
      case 'ended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'terminated':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getFinancialStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'paid':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'partial':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const calculateDuration = () => {
    const start = new Date(lease.startDate);
    const end = new Date(lease.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      return `${months} month${months > 1 ? 's' : ''}${remainingDays > 0 ? ` ${remainingDays} days` : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingDays = diffDays % 365;
      const months = Math.floor(remainingDays / 30);
      return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months} months` : ''}`;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lease Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span>Lease Information</span>
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Renter</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{lease.renterName}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Asset</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{lease.assetName}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Duration</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{calculateDuration()}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Base Charge</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              ${lease.base_charge_amount?.toLocaleString() || '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Dates and Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span>Dates & Status</span>
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Start Date</span>
            <span className="text-sm font-semibold text-gray-900">
              {new Date(lease.startDate).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">End Date</span>
            <span className="text-sm font-semibold text-gray-900">
              {new Date(lease.endDate).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Lease Status</span>
            <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getStatusColor(lease.leaseStatus)}`}>
              {lease.leaseStatus}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Financial Status</span>
            <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getFinancialStatusColor(lease.financialStatus)}`}>
              {lease.financialStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}