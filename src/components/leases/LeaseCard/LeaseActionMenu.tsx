import React, { useState, useEffect } from 'react';
import { MoreVertical, Eye, Edit, XCircle, CreditCard, Receipt } from 'lucide-react';
import type { LeaseActionMenuProps } from './types';

export function LeaseActionMenu({
  lease,
  canEdit,
  canTerminate,
  canChargeBill,
  onView,
  onEdit,
  onTerminate,
  onChargeBill,
  onRecordPayment
}: LeaseActionMenuProps) {
  const [showActions, setShowActions] = useState(false);
  
  // Check if payment can be recorded (active leases with outstanding balance)
  const canRecordPayment = canEdit && 
                          lease.leaseStatus?.toLowerCase() === 'active' && 
                          lease.outstandingBalance > 0 && 
                          onRecordPayment !== undefined;

  const handleActionClick = (action: 'view' | 'edit' | 'terminate' | 'charge' | 'record') => {
    setShowActions(false);
    
    switch (action) {
      case 'view':
        onView(lease);
        break;
      case 'edit':
        onEdit(lease);
        break;
      case 'terminate':
        if (onTerminate) onTerminate(lease);
        break;
      case 'charge':
        if (onChargeBill) onChargeBill(lease);
        break;
      case 'record':
        if (onRecordPayment) onRecordPayment(lease);
        break;
    }
  };

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowActions(false);
    if (showActions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActions]);

  return (
    <div className="absolute top-2 right-2 z-10">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowActions(!showActions);
        }}
        className={`p-1.5 rounded-lg transition-all duration-200 ${
          showActions 
            ? 'bg-gray-200 text-gray-700' 
            : 'bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-gray-700'
        } shadow-sm border border-gray-200`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {/* Actions Dropdown */}
      {showActions && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px] z-20">
          <button
            onClick={() => handleActionClick('view')}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Eye className="h-4 w-4 text-blue-500" />
            <span>View Details</span>
          </button>
          
          {canEdit && (
            <button
              onClick={() => handleActionClick('edit')}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Edit className="h-4 w-4 text-orange-500" />
              <span>Edit Terms</span>
            </button>
          )}
          
          {canTerminate && onTerminate && (
            <button
              onClick={() => handleActionClick('terminate')}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Terminate</span>
            </button>
          )}
          
          {canChargeBill && onChargeBill && (
            <button
              onClick={() => handleActionClick('charge')}
              className="w-full px-3 py-2 text-left text-sm text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex items-center space-x-2 mx-1 rounded-md shadow-sm"
            >
              <CreditCard className="h-4 w-4 text-white" />
              <span className="font-medium">Charge Bill</span>
            </button>
          )}
          
          {canRecordPayment && onRecordPayment && (
            <button
              onClick={() => handleActionClick('record')}
              className="w-full px-3 py-2 text-left text-sm text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center space-x-2 mx-1 rounded-md shadow-sm mt-1"
            >
              <Receipt className="h-4 w-4 text-white" />
              <span className="font-medium">Record Payment</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}