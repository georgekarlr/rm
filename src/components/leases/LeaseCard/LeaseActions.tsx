import React from 'react';
import { Eye, CreditCard, Edit, XCircle, Receipt } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { LeaseActionsProps } from './types';

export function LeaseActions({
  lease,
  canEdit,
  canTerminate,
  canChargeBill,
  onView,
  onEdit,
  onTerminate,
  onChargeBill,
  onRecordPayment
}: LeaseActionsProps) {
  // Check if payment can be recorded (active leases with outstanding balance)
  const canRecordPayment = canEdit && 
                          lease.leaseStatus?.toLowerCase() === 'active' && 
                          lease.outstandingBalance > 0 && 
                          onRecordPayment !== undefined;

  return (
    <>
      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Highlighted Charge Bill Button */}
        {canChargeBill && onChargeBill && (
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
            onClick={() => onChargeBill(lease)}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Charge Bill
          </Button>
        )}
        
        {/* Record Payment Button */}
        {canRecordPayment && onRecordPayment && (
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
            onClick={() => onRecordPayment(lease)}
          >
            <Receipt className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        )}
        
        {/* View Details Button */}
        <Button 
          size="sm" 
          variant="outline" 
          className={`${(canChargeBill && onChargeBill) || (canRecordPayment && onRecordPayment) ? '' : 'col-span-2'}`}
          onClick={() => onView(lease)}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </div>

      {/* Secondary Action Buttons */}
      {canEdit && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(lease)}
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Terms
          </Button>
          
          {canTerminate && onTerminate && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onTerminate(lease)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Terminate
            </Button>
          )}
        </div>
      )}
    </>
  );
}