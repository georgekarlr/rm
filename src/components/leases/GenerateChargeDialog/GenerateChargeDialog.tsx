import React, { useState, useEffect } from 'react';
import { CreditCard, X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { supabase } from '../../../lib/supabase';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { triggerLeasesRefresh } from '../../../hooks/useLeases';
import { GenerateChargeForm } from './GenerateChargeForm';
import { UserInfoBanner } from './UserInfoBanner';
import { LeaseInfo } from './LeaseInfo';
import { getDefaultDueDate } from './constants';
import type { GenerateChargeFormData, GenerateChargeDialogProps } from './types';

export function GenerateChargeDialog({ isOpen, onClose, onSuccess, lease }: GenerateChargeDialogProps) {
  const { currentUser } = useCurrentUser();
  
  const [formData, setFormData] = useState<GenerateChargeFormData>({
    amount: '',
    category: 'rent',
    dueDate: getDefaultDueDate(),
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reset form when dialog opens and set default amount to base_charge_amount if available
  useEffect(() => {
    if (isOpen && lease) {
      setFormData({
        amount: lease.base_charge_amount ? lease.base_charge_amount.toString() : '',
        category: 'rent',
        dueDate: getDefaultDueDate(),
        description: ''
      });
      setMessage(null);
    }
  }, [isOpen, lease]);

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid charge amount' });
      return false;
    }

    if (!formData.category) {
      setMessage({ type: 'error', text: 'Please select a charge category' });
      return false;
    }

    if (!formData.dueDate) {
      setMessage({ type: 'error', text: 'Please select a due date' });
      return false;
    }

    // Validate due date is not in the past
    const dueDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
      setMessage({ type: 'error', text: 'Due date cannot be in the past' });
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

    if (!lease) {
      setMessage({ type: 'error', text: 'No lease selected for charge generation' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      // Convert due date to timestamptz format
      const dueDateTimestamp = new Date(formData.dueDate + 'T23:59:59').toISOString();

      console.log('🔄 Generating charge:', {
        leaseId: lease.id,
        amount: parseFloat(formData.amount),
        category: formData.category,
        dueDate: dueDateTimestamp,
        description: formData.description || null,
        username: currentUser.name
      });

      // Call the Supabase function to generate charge
      const { data, error } = await supabase.rpc('generate_charge', {
        p_lease_id: lease.id,
        p_amount: parseFloat(formData.amount),
        p_category: formData.category,
        p_due_date: dueDateTimestamp,
        p_username: currentUser.name,
        p_description: formData.description || null
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(error.message);
      }

      // Check the response from the function
      if (data && data.length > 0) {
        const result = data[0];
        
        if (result.success) {
          console.log('✅ Charge generated successfully:', data);

          // Show success message
          setMessage({ 
            type: 'success', 
            text: result.message || `Charge of $${parseFloat(formData.amount).toLocaleString()} generated successfully! Charge ID: ${result.charge_id}` 
          });

          // Reset form
          setFormData({
            amount: '',
            category: 'rent',
            dueDate: getDefaultDueDate(),
            description: ''
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
            text: result.message || 'Failed to generate charge' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unable to generate charge. Please try again.' });
      }

    } catch (error: any) {
      console.error('❌ Error generating charge:', error);
      
      let errorMessage = 'Failed to generate charge';
      if (error.message) {
        if (error.message.includes('lease') && error.message.includes('not found')) {
          errorMessage = 'Lease not found or has been deleted';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to generate charges';
        } else if (error.message.includes('amount') || error.message.includes('invalid')) {
          errorMessage = 'Invalid charge amount provided';
        } else if (error.message.includes('date')) {
          errorMessage = 'Invalid due date provided';
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

  const handleFormDataChange = (newData: Partial<GenerateChargeFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  if (!isOpen || !lease) return null;

  const isFormValid = formData.amount && 
                     parseFloat(formData.amount) > 0 &&
                     formData.category && 
                     formData.dueDate;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl mx-auto max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Generate Charge</h2>
              <p className="text-sm text-gray-600">Create a new charge for this lease</p>
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

            {/* Lease Info */}
            <LeaseInfo lease={lease} />

            {/* Form */}
            <GenerateChargeForm
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
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 shadow-lg"
            >
              {submitting ? 'Generating Charge...' : 'Generate Charge'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}