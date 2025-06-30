import React, { useState, useEffect } from 'react';
import { XCircle, X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { supabase } from '../../../lib/supabase';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { triggerLeasesRefresh } from '../../../hooks/useLeases';
import { TerminateLeaseForm } from './TerminateLeaseForm';
import { UserInfoBanner } from './UserInfoBanner';
import { LeaseTerminationInfo } from './LeaseTerminationInfo';
import type { TerminateLeaseDialogProps } from './types';

export function TerminateLeaseDialog({ isOpen, onClose, onSuccess, lease }: TerminateLeaseDialogProps) {
  const { currentUser } = useCurrentUser();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setMessage(null);
    }
  }, [isOpen]);

  const validateTermination = () => {
    if (!lease) {
      setMessage({ type: 'error', text: 'No lease selected for termination' });
      return false;
    }

    if (lease.leaseStatus !== 'active') {
      setMessage({ 
        type: 'error', 
        text: `Only active leases can be terminated. Current status: ${lease.leaseStatus}` 
      });
      return false;
    }

    {/* // Check if lease has already started
    const startDate = new Date(lease.startDate);
    const now = new Date();
    
    if (startDate > now) {
      setMessage({ 
        type: 'error', 
        text: 'Cannot terminate a lease that has not started yet' 
      });
      return false;
    }
    */}

    // Check if lease has already expired
    const endDate = new Date(lease.endDate);
    if (endDate < now) {
      setMessage({ 
        type: 'error', 
        text: 'This lease has already expired. Use lease renewal or amendment instead.' 
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.name) {
      setMessage({ type: 'error', text: 'Current user name is required' });
      return;
    }

    if (!validateTermination()) {
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      console.log('🔄 Terminating lease:', {
        leaseId: lease.id,
        username: currentUser.name
      });

      // Call the Supabase function to terminate lease
      const { data, error } = await supabase.rpc('terminate_lease', {
        p_lease_id: lease.id,
        p_username: currentUser.name
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(error.message);
      }

      // Check the response from the function
      if (data && data.length > 0) {
        const result = data[0];
        
        if (result.success) {
          console.log('✅ Lease terminated successfully:', data);

          // Show success message
          setMessage({ 
            type: 'success', 
            text: result.message || 'Lease has been terminated successfully!' 
          });

          // Trigger global refresh to update all components
          triggerLeasesRefresh();

          // Call success callback after a short delay
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        } else {
          // Function returned success: false
          setMessage({ 
            type: 'error', 
            text: result.message || 'Failed to terminate lease' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unable to terminate lease. Please try again.' });
      }

    } catch (error: any) {
      console.error('❌ Error terminating lease:', error);
      
      let errorMessage = 'Failed to terminate lease';
      if (error.message) {
        if (error.message.includes('lease') && error.message.includes('not found')) {
          errorMessage = 'Lease not found or has been deleted';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to terminate leases';
        } else if (error.message.includes('status')) {
          errorMessage = 'Only active leases can be terminated';
        } else if (error.message.includes('date')) {
          errorMessage = 'Invalid lease dates for termination';
        } else {
          errorMessage = error.message;
        }
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setMessage(null);
      onClose();
    }
  };

  if (!isOpen || !lease) return null;

  // Check if user has permission to terminate leases
  const canTerminate = currentUser?.user_type === 'admin' || currentUser?.user_type === 'leaser';

  if (!canTerminate) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Only admin and leaser users can terminate leases. Your current role ({currentUser?.user_type}) 
              does not have permission to perform this action.
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl mx-auto max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Terminate Lease</h2>
              <p className="text-sm text-gray-600">Permanently end this lease agreement</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Current User Info */}
            <UserInfoBanner currentUser={currentUser} />

            {/* Lease Information */}
            <LeaseTerminationInfo lease={lease} />

            {/* Form */}
            <TerminateLeaseForm
              onSubmit={handleSubmit}
              submitting={submitting}
              lease={lease}
              message={message}
            />
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              <p><strong>Warning:</strong> Lease termination is permanent and cannot be undone.</p>
              <p>Ensure all financial matters are resolved before proceeding.</p>
            </div>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="ml-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}