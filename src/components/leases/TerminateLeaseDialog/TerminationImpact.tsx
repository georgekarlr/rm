import React from 'react';
import { Building, Calendar, DollarSign, FileText, Users } from 'lucide-react';
import type { TerminationImpactProps } from './types';

export function TerminationImpact({ lease }: TerminationImpactProps) {
  if (!lease) return null;

  const terminationDate = new Date().toLocaleDateString();
  const originalEndDate = new Date(lease.endDate).toLocaleDateString();

  return (
    <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gray-100 rounded-lg">
          <FileText className="h-5 w-5 text-gray-600" />
        </div>
        <h4 className="font-medium text-gray-900">Termination Impact Summary</h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-gray-600 font-medium">Termination Date</p>
              <p className="text-gray-900 font-semibold">{terminationDate}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-gray-600 font-medium">Original End Date</p>
              <p className="text-gray-900 font-semibold">{originalEndDate}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-gray-600 font-medium">Asset Status</p>
              <p className="text-green-600 font-semibold">Will become Available</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-gray-600 font-medium">Renter Status</p>
              <p className="text-gray-900 font-semibold">Lease Terminated</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Financial Impact */}
      {(lease.outstandingBalance > 0 || lease.overdueBalance > 0) && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <p className="text-gray-600 font-medium text-sm">Financial Impact</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-500">Outstanding Balance</p>
              <p className="text-red-600 font-semibold">
                ${lease.outstandingBalance?.toLocaleString() || '0'} (Remains Due)
              </p>
            </div>
            <div>
              <p className="text-gray-500">Overdue Balance</p>
              <p className="text-red-600 font-semibold">
                ${lease.overdueBalance?.toLocaleString() || '0'} (Remains Due)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}