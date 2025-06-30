import React from 'react';
import { Edit, XCircle, CreditCard, Zap, Receipt } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { LeaseActionsBarProps } from './types';

export function LeaseActionsBar({
  lease,
  canEdit,
  canTerminate,
  canChargeBill,
  onEdit,
  onTerminate,
  onChargeBill,
  onRecordPayment
}: LeaseActionsBarProps) {
  // Check if payment can be recorded (active leases with outstanding balance)
  const canRecordPayment = canEdit && 
                          lease.leaseStatus?.toLowerCase() === 'active' && 
                          lease.outstandingBalance > 0 && 
                          onRecordPayment !== undefined;

  return (
    <div className="p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
      <div className="flex flex-wrap gap-3">
        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Charge Bill Button */}
          {canChargeBill && onChargeBill && (
            <Button
              onClick={() => onChargeBill(lease)}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-base py-3"
            >
              <div className="flex items-center justify-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Charge Bill</span>
                <Zap className="w-4 h-4 animate-pulse" />
              </div>
            </Button>
          )}

          {/* Record Payment Button */}
          {canRecordPayment && onRecordPayment && (
            <Button
              onClick={() => onRecordPayment(lease)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-base py-3"
            >
              <div className="flex items-center justify-center space-x-2">
                <Receipt className="w-5 h-5" />
                <span>Record Payment</span>
              </div>
            </Button>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-3 flex-1">
          {canEdit && onEdit && (
            <Button
              variant="outline"
              onClick={() => onEdit(lease)}
              className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Terms
            </Button>
          )}

          {canTerminate && onTerminate && (
            <Button
              variant="outline"
              onClick={() => onTerminate(lease)}
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Terminate
            </Button>
          )}
        </div>
      </div>

      {/* Action Descriptions */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-gray-600">
        {canChargeBill && onChargeBill && (
          <div className="text-center">
            <p className="font-medium text-green-700">Charge Bill</p>
            <p>Generate and send invoice for outstanding amounts</p>
          </div>
        )}
        {canRecordPayment && onRecordPayment && (
          <div className="text-center">
            <p className="font-medium text-blue-700">Record Payment</p>
            <p>Record a payment received from the renter</p>
          </div>
        )}
        {canEdit && onEdit && (
          <div className="text-center">
            <p className="font-medium text-orange-700">Edit Terms</p>
            <p>Modify lease end date and charge amounts</p>
          </div>
        )}
        {canTerminate && onTerminate && (
          <div className="text-center">
            <p className="font-medium text-red-700">Terminate</p>
            <p>End the lease agreement early</p>
          </div>
        )}
      </div>
    </div>
  );
}