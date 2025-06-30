import React, { useState, useEffect } from 'react';
import { Receipt, X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { supabase } from '../../../lib/supabase';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { triggerLeasesRefresh } from '../../../hooks/useLeases';
import { RecordPaymentForm } from './RecordPaymentForm';
import { UserInfoBanner } from './UserInfoBanner';
import { LeaseInfo } from './LeaseInfo';
import { getDefaultTransactionDate, generateId } from './constants';
import type { RecordPaymentFormData, PaymentDetail, ChargeAllocation, RecordPaymentDialogProps } from './types';

export function RecordPaymentDialog({ isOpen, onClose, onSuccess, lease }: RecordPaymentDialogProps) {
  const { currentUser } = useCurrentUser();
  
  const [formData, setFormData] = useState<RecordPaymentFormData>({
    totalAmount: '',
    transactionDate: getDefaultTransactionDate(),
    paymentDetails: [
      {
        id: generateId(),
        amount: '',
        paymentMethod: 'CASH',
        paymentType: 'RENT'
      }
    ],
    allocations: [],
    notes: ''
  });
  
  const [availableCharges, setAvailableCharges] = useState<any[]>([]);
  const [loadingCharges, setLoadingCharges] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch available charges when dialog opens
  useEffect(() => {
    if (isOpen && lease) {
      fetchAvailableCharges();
    }
  }, [isOpen, lease]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        totalAmount: '',
        transactionDate: getDefaultTransactionDate(),
        paymentDetails: [
          {
            id: generateId(),
            amount: '',
            paymentMethod: 'CASH',
            paymentType: 'RENT'
          }
        ],
        allocations: [],
        notes: ''
      });
      setMessage(null);
    }
  }, [isOpen]);

  // Update allocations when available charges change
  useEffect(() => {
    if (availableCharges.length > 0) {
      const newAllocations = availableCharges.map(charge => ({
        id: generateId(),
        chargeId: charge.charge_id,
        amount: '0',
        selected: false
      }));
      
      setFormData(prev => ({
        ...prev,
        allocations: newAllocations
      }));
    }
  }, [availableCharges]);

  const fetchAvailableCharges = async () => {
    if (!lease) return;
    
    setLoadingCharges(true);
    
    try {
      // Fetch unpaid charges for this lease using the PostgreSQL function
      const { data, error } = await supabase.rpc('get_unpaid_charges_for_lease', {
        p_lease_id: lease.id
      });
      
      if (error) throw error;
      
      setAvailableCharges(data || []);
    } catch (error: any) {
      console.error('Error fetching charges:', error);
      setMessage({
        type: 'error',
        text: `Failed to load charges: ${error.message}`
      });
      setAvailableCharges([]);
    } finally {
      setLoadingCharges(false);
    }
  };

  const validateForm = () => {
    // Check total amount
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid payment amount' });
      return false;
    }

    // Check transaction date
    if (!formData.transactionDate) {
      setMessage({ type: 'error', text: 'Please select a transaction date' });
      return false;
    }

    // Check payment details
    if (formData.paymentDetails.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one payment method' });
      return false;
    }

    // Validate each payment detail
    for (const detail of formData.paymentDetails) {
      if (!detail.amount || parseFloat(detail.amount) <= 0) {
        setMessage({ type: 'error', text: 'All payment methods must have a valid amount' });
        return false;
      }
    }

    // Check if any allocations are selected
    const selectedAllocations = formData.allocations.filter(a => a.selected);
    if (selectedAllocations.length === 0) {
      setMessage({ type: 'error', text: 'Please allocate the payment to at least one charge' });
      return false;
    }

    // Validate each selected allocation
    for (const allocation of selectedAllocations) {
      if (!allocation.amount || parseFloat(allocation.amount) <= 0) {
        setMessage({ type: 'error', text: 'All selected allocations must have a valid amount' });
        return false;
      }
    }

    // Calculate total allocated amount
    const totalAllocated = selectedAllocations.reduce(
      (sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 
      0
    );
    
    // Check if allocation matches total amount
    const totalAmount = parseFloat(formData.totalAmount);
    if (Math.abs(totalAmount - totalAllocated) > 0.01) {
      setMessage({ 
        type: 'error', 
        text: `The allocated amount ($${totalAllocated.toLocaleString()}) does not match the total payment amount ($${totalAmount.toLocaleString()})` 
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

    if (!lease) {
      setMessage({ type: 'error', text: 'No lease selected for payment recording' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      // Prepare payment details array
      const paymentDetails = formData.paymentDetails.map(detail => ({
        amount: parseFloat(detail.amount),
        payment_method: detail.paymentMethod,
        payment_type: detail.paymentType
      }));

      // Prepare allocations array
      const allocations = formData.allocations
        .filter(a => a.selected && parseFloat(a.amount) > 0)
        .map(allocation => ({
          charge_id: allocation.chargeId,
          amount_applied: parseFloat(allocation.amount)
        }));

      console.log('🔄 Recording payment:', {
        leaseId: lease.id,
        totalAmount: parseFloat(formData.totalAmount),
        transactionDate: formData.transactionDate,
        managerName: currentUser.name,
        username: currentUser.name,
        paymentDetails,
        allocations,
        notes: formData.notes || null
      });

      // Call the Supabase function to record payment
      const { data, error } = await supabase.rpc('record_and_allocate_payment', {
        p_lease_id: lease.id,
        p_total_amount: parseFloat(formData.totalAmount),
        p_transaction_date: new Date(formData.transactionDate).toISOString(),
        p_manager_name: currentUser.name,
        p_username: currentUser.name,
        p_payment_details: paymentDetails,
        p_allocations: allocations,
        p_notes: formData.notes || null
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(error.message);
      }

      // Check the response from the function
      if (data && data.length > 0) {
        const result = data[0];
        
        if (result.success) {
          console.log('✅ Payment recorded successfully:', data);

          // Show success message
          setMessage({ 
            type: 'success', 
            text: result.message || `Payment of $${parseFloat(formData.totalAmount).toLocaleString()} recorded successfully!` 
          });

          // Reset form
          setFormData({
            totalAmount: '',
            transactionDate: getDefaultTransactionDate(),
            paymentDetails: [
              {
                id: generateId(),
                amount: '',
                paymentMethod: 'CASH',
                paymentType: 'RENT'
              }
            ],
            allocations: [],
            notes: ''
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
            text: result.message || 'Failed to record payment' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unable to record payment. Please try again.' });
      }

    } catch (error: any) {
      console.error('❌ Error recording payment:', error);
      
      let errorMessage = 'Failed to record payment';
      if (error.message) {
        if (error.message.includes('lease') && error.message.includes('not found')) {
          errorMessage = 'Lease not found or has been deleted';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to record payments';
        } else if (error.message.includes('amount') || error.message.includes('invalid')) {
          errorMessage = 'Invalid payment amount provided';
        } else if (error.message.includes('charge') && error.message.includes('not found')) {
          errorMessage = 'One or more charges not found or already paid';
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

  const handleFormDataChange = (newData: Partial<RecordPaymentFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleAddPaymentDetail = () => {
    const newDetail: PaymentDetail = {
      id: generateId(),
      amount: '',
      paymentMethod: 'CASH',
      paymentType: 'RENT'
    };
    
    setFormData(prev => ({
      ...prev,
      paymentDetails: [...prev.paymentDetails, newDetail]
    }));
  };

  const handleRemovePaymentDetail = (id: string) => {
    setFormData(prev => ({
      ...prev,
      paymentDetails: prev.paymentDetails.filter(detail => detail.id !== id)
    }));
  };

  const handleUpdatePaymentDetail = (id: string, field: keyof PaymentDetail, value: string) => {
    setFormData(prev => ({
      ...prev,
      paymentDetails: prev.paymentDetails.map(detail => 
        detail.id === id ? { ...detail, [field]: value } : detail
      )
    }));
  };

  const handleUpdateAllocation = (id: string, field: keyof Omit<ChargeAllocation, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      allocations: prev.allocations.map(allocation => 
        allocation.id === id ? { ...allocation, [field]: value } : allocation
      )
    }));
  };

  if (!isOpen || !lease) return null;

  // Calculate total from payment details
  const totalFromDetails = formData.paymentDetails.reduce(
    (sum, detail) => sum + (parseFloat(detail.amount) || 0), 
    0
  );
  
  // Calculate total allocated
  const totalAllocated = formData.allocations.reduce(
    (sum, allocation) => allocation.selected ? sum + (parseFloat(allocation.amount) || 0) : sum, 
    0
  );
  
  const isFormValid = 
    totalFromDetails > 0 && 
    formData.transactionDate && 
    formData.paymentDetails.every(d => d.amount && parseFloat(d.amount) > 0) &&
    formData.allocations.some(a => a.selected && parseFloat(a.amount) > 0) &&
    Math.abs(totalFromDetails - totalAllocated) < 0.01;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl mx-auto max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
              <p className="text-sm text-gray-600">Record a payment for this lease</p>
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
            <RecordPaymentForm
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onSubmit={handleSubmit}
              submitting={submitting}
              lease={lease}
              message={message}
              onAddPaymentDetail={handleAddPaymentDetail}
              onRemovePaymentDetail={handleRemovePaymentDetail}
              onUpdatePaymentDetail={handleUpdatePaymentDetail}
              onUpdateAllocation={handleUpdateAllocation}
              availableCharges={availableCharges}
              loadingCharges={loadingCharges}
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
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500 shadow-lg"
            >
              {submitting ? 'Recording Payment...' : 'Record Payment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}