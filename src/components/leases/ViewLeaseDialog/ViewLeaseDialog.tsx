import React, { useState, useEffect } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { LeaseDetailsHeader } from './LeaseDetailsHeader';
import { LeaseBasicInfo } from './LeaseBasicInfo';
import { LeaseFinancialSummary } from './LeaseFinancialSummary';
import { LeaseIntervalsList } from './LeaseIntervalsList';
import { LeaseActionsBar } from './LeaseActionsBar';
import type { ViewLeaseDialogProps, LeaseInterval } from './types';

export function ViewLeaseDialog({
  isOpen,
  onClose,
  lease,
  onEdit,
  onTerminate,
  onChargeBill,
  onRecordPayment
}: ViewLeaseDialogProps) {
  const { currentUser } = useCurrentUser();
  const [intervals, setIntervals] = useState<LeaseInterval[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check permissions
  const canEdit = currentUser?.user_type === 'admin' || currentUser?.user_type === 'leaser';
  
  // Determine if lease can be terminated (only active leases)
  const canTerminate = lease?.leaseStatus?.toLowerCase() === 'active' && canEdit && onTerminate !== undefined;
  
  // Determine if bill can be charged (active leases with outstanding balance or overdue)
  const canChargeBill = lease?.leaseStatus?.toLowerCase() === 'active' && 
                       (lease?.outstandingBalance > 0 || lease?.overdueBalance > 0) &&
                       canEdit && onChargeBill !== undefined;

  // Log the actual values for debugging
  useEffect(() => {
    if (lease) {
      console.log('ViewLeaseDialog - Lease status:', {
        leaseStatus: lease.leaseStatus,
        financialStatus: lease.financialStatus,
        id: lease.id,
        canTerminate,
        canChargeBill,
        canEdit,
        hasTerminateCallback: onTerminate !== undefined,
        hasChargeBillCallback: onChargeBill !== undefined
      });
    }
  }, [lease, canTerminate, canChargeBill, canEdit, onTerminate, onChargeBill]);

  // Process intervals from lease data
  const processIntervals = () => {
    if (!lease || !lease.intervals) {
      setIntervals([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      
      // Transform the intervals from the lease data
      const processedIntervals: LeaseInterval[] = lease.intervals.map((interval: any, index: number) => {
        const chargeDate = new Date(interval.charge_date);
        const dueDate = new Date(interval.due_date);
        
        // Determine status
        let status: 'upcoming' | 'current' | 'completed' | 'overdue' = 'upcoming';
        if (dueDate < now && !interval.is_paid) {
          status = 'overdue';
        } else if (chargeDate <= now && dueDate >= now) {
          status = 'current';
        } else if (chargeDate < now) {
          status = 'completed';
        }

        // Calculate duration (simplified for display)
        const duration = `${interval.category}`;

        return {
          id: `interval-${index + 1}`,
          intervalNumber: index + 1,
          startDateTime: chargeDate,
          endDateTime: dueDate,
          duration,
          chargeAmount: parseFloat(interval.amount),
          status,
          isPaid: interval.is_paid,
          dueDate
        };
      });

      setIntervals(processedIntervals);
    } catch (err: any) {
      console.error('Error processing intervals:', err);
      setError('Failed to process charge intervals');
      setIntervals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshIntervals = () => {
    processIntervals();
  };

  // Process intervals when dialog opens or lease changes
  useEffect(() => {
    if (isOpen && lease) {
      processIntervals();
    } else {
      setIntervals([]);
      setError(null);
    }
  }, [isOpen, lease]);

  if (!isOpen || !lease) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-6xl mx-auto max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <LeaseDetailsHeader lease={lease} onClose={onClose} />

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <LeaseBasicInfo lease={lease} />

            {/* Financial Summary */}
            <LeaseFinancialSummary lease={lease} />

            {/* Intervals List */}
            {lease.intervals && (
              <LeaseIntervalsList
                lease={lease}
                intervals={intervals}
                loading={loading}
                error={error}
                onRefresh={handleRefreshIntervals}
              />
            )}
          </div>
        </div>

        {/* Actions Bar - Fixed */}
        <LeaseActionsBar
          lease={lease}
          canEdit={canEdit}
          canTerminate={canTerminate}
          canChargeBill={canChargeBill}
          onEdit={onEdit}
          onTerminate={onTerminate}
          onChargeBill={onChargeBill}
          onRecordPayment={onRecordPayment}
        />
      </div>
    </div>
  );
}