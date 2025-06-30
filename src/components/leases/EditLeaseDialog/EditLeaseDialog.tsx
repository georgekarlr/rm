import React, { useState, useEffect } from 'react';
import { Edit, X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { supabase } from '../../../lib/supabase';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { triggerLeasesRefresh } from '../../../hooks/useLeases';
import { EditLeaseForm } from './EditLeaseForm';
import { UserInfoBanner } from './UserInfoBanner';
import { LeaseInfo } from './LeaseInfo';
import type { EditLeaseFormData, EditLeaseDialogProps } from './types';

export function EditLeaseDialog({ isOpen, onClose, onSuccess, lease }: EditLeaseDialogProps) {
  const { currentUser } = useCurrentUser();
  
  const [formData, setFormData] = useState<EditLeaseFormData>({
    newEndDate: '',
    newBaseChargeAmount: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize form data when lease changes
  useEffect(() => {
    if (lease) {
      setFormData({
        newEndDate: lease.endDate ? lease.endDate.split('T')[0] : '', // Convert to YYYY-MM-DD format
        newBaseChargeAmount: lease.outstandingBalance?.toString() || ''
      });
    } else {
      setFormData({
        newEndDate: '',
        newBaseChargeAmount: ''
      });
    }
    setMessage(null);
  }, [lease]);

  const validateForm = () => {
    if (!formData.newEndDate) {
      setMessage({ type: 'error', text: 'Please select a new end date' });
      return false;
    }

    if (!formData.newBaseChargeAmount || parseFloat(formData.newBaseChargeAmount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid base charge amount' });
      return false;
    }

    // Validate that new end date is after start date
    if (lease?.startDate) {
      const startDate = new Date(lease.startDate);
      const newEndDate = new Date(formData.newEndDate);
      
      if (newEndDate <= startDate) {
        setMessage({ type: 'error', text: 'New end date must be after the lease start date' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.name) {
      setMessage({ type: 'error', text: 'Current user name is required' });
      return;
    }

    if (!lease) {
      setMessage({ type: 'error', text: 'No lease selected for editing' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      console.log('🔄 Amending lease terms:', {
        leaseId: lease.id,
        newEndDate: formData.newEndDate,
        newBaseChargeAmount: parseFloat(formData.newBaseChargeAmount),
        username: currentUser.name
      });

      // Call the Supabase function to amend lease terms
      const { data, error } = await supabase.rpc('amend_lease_terms', {
        p_lease_id: lease.id,
        p_new_end_date: formData.newEndDate,
        p_new_base_charge_amount: parseFloat(formData.newBaseChargeAmount),
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
          console.log('✅ Lease amended successfully:', data);

          // Show success message
          setMessage({ 
            type: 'success', 
            text: result.message || 'Lease terms have been amended successfully!' 
          });

          // Trigger global refresh to update all components
          triggerLeasesRefresh();

          // Call success callback after a short delay
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1500);
        } else {
          // Function returned success: false
          setMessage({ 
            type: 'error', 
            text: result.message || 'Failed to amend lease terms' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unable to amend lease terms. Please try again.' });
      }

    } catch (error: any) {
      console.error('❌ Error amending lease:', error);
      
      let errorMessage = 'Failed to amend lease terms';
      if (error.message) {
        if (error.message.includes('lease') && error.message.includes('not found')) {
          errorMessage = 'Lease not found or has been deleted';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to amend lease terms';
        } else if (error.message.includes('date') || error.message.includes('invalid')) {
          errorMessage = 'Invalid date or amount provided';
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

  const handleFormDataChange = (newData: Partial<EditLeaseFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  if (!isOpen || !lease) return null;

  const isFormValid = formData.newEndDate && 
                     formData.newBaseChargeAmount && 
                     parseFloat(formData.newBaseChargeAmount) > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-auto max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Edit className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Lease Terms</h2>
              <p className="text-sm text-gray-600">Amend lease end date and base charge</p>
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

            {/* Current Lease Info */}
            <LeaseInfo lease={lease} />

            {/* Form */}
            <EditLeaseForm
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onSubmit={handleSubmit}
              submitting={submitting}
              lease={lease}
              message={message}
            />
          </div>
        </div>

        {/* Actions - Fixed */}
        <div className="p-6 border-t border-gray-100 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={!isFormValid || submitting}
              className="flex-1 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
            >
              {submitting ? 'Amending Lease...' : 'Amend Lease Terms'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}