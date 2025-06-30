import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';
import { supabase } from '../../../lib/supabase';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { useAssetTypes } from '../../../hooks/useAssetTypes';
import { useRenters } from '../../../hooks/useRenters';
import { triggerLeasesRefresh } from '../../../hooks/useLeases';
import { CreateLeaseForm } from './CreateLeaseForm';
import { UserInfoBanner } from './UserInfoBanner';
import type { CreateLeaseFormData } from './types';

interface CreateLeaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateLeaseDialog({ isOpen, onClose, onSuccess }: CreateLeaseDialogProps) {
  const { currentUser } = useCurrentUser();
  const { assetTypes, loading: assetsLoading } = useAssetTypes();
  const { renters, loading: rentersLoading } = useRenters();
  
  const [formData, setFormData] = useState<CreateLeaseFormData>({
    assetId: '',
    renterId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    baseChargeAmount: '',
    chargePeriod: 'monthly',
    customChargePeriod: { minutes: 0, hours: 0, days: 0 }
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Get all available assets from all asset types
  const availableAssets = assetTypes.flatMap(assetType => 
    assetType.coalesce.filter(asset => asset.status === 'AVAILABLE')
  );

  // Get active renters
  const activeRenters = renters.filter(renter => renter.status === 'active');

  const validateForm = () => {
    if (!formData.assetId) {
      setMessage({ type: 'error', text: 'Please select an asset' });
      return false;
    }

    if (!formData.renterId) {
      setMessage({ type: 'error', text: 'Please select a renter' });
      return false;
    }

    if (!formData.startDate || !formData.startTime) {
      setMessage({ type: 'error', text: 'Please select start date and time' });
      return false;
    }

    if (!formData.endDate || !formData.endTime) {
      setMessage({ type: 'error', text: 'Please select end date and time' });
      return false;
    }

    if (!formData.baseChargeAmount || parseFloat(formData.baseChargeAmount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid charge amount' });
      return false;
    }

    // Validate date/time combination
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      setMessage({ type: 'error', text: 'End date/time must be after start date/time' });
      return false;
    }

    // Validate custom charge period if selected
    if (formData.chargePeriod === 'custom') {
      const custom = formData.customChargePeriod;
      if (!custom || (!custom.days && !custom.hours && !custom.minutes)) {
        setMessage({ type: 'error', text: 'Please configure the custom charge period' });
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

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      // Combine date and time for start and end
      const startDateTime = `${formData.startDate}T${formData.startTime}`;
      const endDateTime = `${formData.endDate}T${formData.endTime}`;

      // Determine charge period for database
      let chargePeriodForDb = formData.chargePeriod;
      if (formData.chargePeriod === 'custom') {
        const custom = formData.customChargePeriod!;
        const totalMinutes = (custom.days || 0) * 24 * 60 + 
                           (custom.hours || 0) * 60 + 
                           (custom.minutes || 0);
        chargePeriodForDb = `custom_${totalMinutes}_minutes`;
      }

      console.log('🔄 Creating new lease with date/time:', {
        assetId: parseInt(formData.assetId),
        renterId: parseInt(formData.renterId),
        startDateTime,
        endDateTime,
        baseChargeAmount: parseFloat(formData.baseChargeAmount),
        chargePeriod: chargePeriodForDb,
        username: currentUser.name
      });

      // Call the updated Supabase function with new parameter names
      const { data, error } = await supabase.rpc('create_new_lease', {
        p_asset_id: parseInt(formData.assetId),
        p_renter_id: parseInt(formData.renterId),
        p_start_date: startDateTime,
        p_end_date: endDateTime,
        p_base_charge_amount: parseFloat(formData.baseChargeAmount),
        p_charge_period: chargePeriodForDb,
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
          console.log('✅ Lease created successfully:', data);

          // Show success message
          setMessage({ 
            type: 'success', 
            text: result.message || `Lease created successfully! Lease ID: ${result.new_lease_id}` 
          });

          // Reset form
          setFormData({
            assetId: '',
            renterId: '',
            startDate: '',
            startTime: '',
            endDate: '',
            endTime: '',
            baseChargeAmount: '',
            chargePeriod: 'monthly',
            customChargePeriod: { minutes: 0, hours: 0, days: 0 }
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
            text: result.message || 'Failed to create lease' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unable to create lease. Please try again.' });
      }

    } catch (error: any) {
      console.error('❌ Error creating lease:', error);
      
      let errorMessage = 'Failed to create lease';
      if (error.message) {
        if (error.message.includes('asset') && error.message.includes('not available')) {
          errorMessage = 'Selected asset is no longer available';
        } else if (error.message.includes('renter') && error.message.includes('not found')) {
          errorMessage = 'Selected renter not found';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to create leases';
        } else if (error.message.includes('date') || error.message.includes('invalid')) {
          errorMessage = 'Invalid date/time range provided';
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
      setFormData({
        assetId: '',
        renterId: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        baseChargeAmount: '',
        chargePeriod: 'monthly',
        customChargePeriod: { minutes: 0, hours: 0, days: 0 }
      });
      setMessage(null);
      onClose();
    }
  };

  const handleFormDataChange = (newData: Partial<CreateLeaseFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  // Set default dates and times (start: now, end: 1 year from now)
  useEffect(() => {
    if (isOpen && !formData.startDate) {
      const now = new Date();
      const oneYearLater = new Date();
      oneYearLater.setFullYear(now.getFullYear() + 1);
      
      setFormData(prev => ({
        ...prev,
        startDate: now.toISOString().split('T')[0],
        startTime: now.toTimeString().slice(0, 5),
        endDate: oneYearLater.toISOString().split('T')[0],
        endTime: now.toTimeString().slice(0, 5)
      }));
    }
  }, [isOpen, formData.startDate]);

  if (!isOpen) return null;

  const isFormValid = formData.assetId && 
                     formData.renterId && 
                     formData.startDate && 
                     formData.startTime &&
                     formData.endDate && 
                     formData.endTime &&
                     formData.baseChargeAmount && 
                     availableAssets.length > 0 && 
                     activeRenters.length > 0 &&
                     (formData.chargePeriod !== 'custom' || 
                      (formData.customChargePeriod && 
                       (formData.customChargePeriod.days! > 0 || 
                        formData.customChargePeriod.hours! > 0 || 
                        formData.customChargePeriod.minutes! > 0)));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl mx-auto max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Lease</h2>
              <p className="text-sm text-gray-600">Set up a new lease agreement with precise timing</p>
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

            {/* Form */}
            <CreateLeaseForm
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onSubmit={handleSubmit}
              submitting={submitting}
              assetTypes={assetTypes}
              availableAssets={availableAssets}
              activeRenters={activeRenters}
              assetsLoading={assetsLoading}
              rentersLoading={rentersLoading}
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
              className="flex-1"
            >
              {submitting ? 'Creating Lease...' : 'Create Lease'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}