import React from 'react';
import { DollarSign, Calendar, FileText } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Alert } from '../../ui/Alert';
import { PaymentDetailsSection } from './PaymentDetailsSection';
import { ChargeAllocationsSection } from './ChargeAllocationsSection';
import { PaymentSummary } from './PaymentSummary';
import { paymentMethods, paymentTypes } from './constants';
import type { RecordPaymentFormProps } from './types';

export function RecordPaymentForm({
  formData,
  onFormDataChange,
  onSubmit,
  submitting,
  lease,
  message,
  onAddPaymentDetail,
  onRemovePaymentDetail,
  onUpdatePaymentDetail,
  onUpdateAllocation,
  availableCharges,
  loadingCharges
}: RecordPaymentFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFormDataChange({ [name]: value });
  };

  // Calculate total amount from payment details
  const totalFromDetails = formData.paymentDetails.reduce(
    (sum, detail) => sum + (parseFloat(detail.amount) || 0), 
    0
  );

  // Calculate total allocated amount
  const totalAllocated = formData.allocations.reduce(
    (sum, allocation) => allocation.selected ? sum + (parseFloat(allocation.amount) || 0) : sum, 
    0
  );

  // Update total amount when payment details change
  React.useEffect(() => {
    if (Math.abs(totalFromDetails - parseFloat(formData.totalAmount || '0')) > 0.01) {
      onFormDataChange({ totalAmount: totalFromDetails.toString() });
    }
  }, [totalFromDetails]);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Total Amount and Transaction Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Total Payment Amount *
          </label>
          <Input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
            disabled={submitting || formData.paymentDetails.length > 0}
            className={`focus:ring-blue-500 focus:border-blue-500 ${
              formData.paymentDetails.length > 0 ? 'bg-gray-100' : ''
            }`}
          />
          {formData.paymentDetails.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Total is calculated from payment details below
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Transaction Date *
          </label>
          <Input
            type="date"
            name="transactionDate"
            value={formData.transactionDate}
            onChange={handleInputChange}
            required
            disabled={submitting}
            className="focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Payment Details */}
      <PaymentDetailsSection
        paymentDetails={formData.paymentDetails}
        submitting={submitting}
        onAddPaymentDetail={onAddPaymentDetail}
        onRemovePaymentDetail={onRemovePaymentDetail}
        onUpdatePaymentDetail={onUpdatePaymentDetail}
        paymentMethods={paymentMethods}
        paymentTypes={paymentTypes}
      />

      {/* Charge Allocations */}
      <ChargeAllocationsSection
        allocations={formData.allocations}
        availableCharges={availableCharges}
        loadingCharges={loadingCharges}
        submitting={submitting}
        onUpdateAllocation={onUpdateAllocation}
        totalAmount={parseFloat(formData.totalAmount) || 0}
        totalAllocated={totalAllocated}
      />

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="inline h-4 w-4 mr-1" />
          Notes (Optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Add any additional notes about this payment..."
          disabled={submitting}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
        />
      </div>

      {/* Payment Summary */}
      <PaymentSummary 
        formData={formData} 
        lease={lease} 
        totalAllocated={totalAllocated} 
      />

      {/* Message */}
      {message && (
        <Alert
          type={message.type}
          message={message.text}
        />
      )}

      {/* Help Text */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Recording Notes:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Add one or more payment methods if the payment was split</li>
          <li>• Allocate the payment to specific charges</li>
          <li>• The system will automatically update the lease's financial status</li>
          <li>• All payment transactions are logged for audit purposes</li>
        </ul>
      </div>
    </form>
  );
}