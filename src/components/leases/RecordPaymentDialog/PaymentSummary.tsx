import React from 'react';
import { Receipt, Calendar, DollarSign, FileText } from 'lucide-react';
import { getPaymentMethodConfig, getPaymentTypeConfig } from './constants';
import type { PaymentSummaryProps } from './types';

export function PaymentSummary({ formData, lease, totalAllocated }: PaymentSummaryProps) {
  if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
    return null;
  }

  const totalAmount = parseFloat(formData.totalAmount);
  const remainingToAllocate = totalAmount - totalAllocated;
  const isFullyAllocated = Math.abs(remainingToAllocate) < 0.01;
  const isOverAllocated = remainingToAllocate < 0;

  const paymentMethods = formData.paymentDetails.map(detail => {
    const config = getPaymentMethodConfig(detail.paymentMethod);
    return {
      method: config.label,
      amount: parseFloat(detail.amount) || 0
    };
  });

  const paymentTypes = formData.paymentDetails.map(detail => {
    const config = getPaymentTypeConfig(detail.paymentType);
    return {
      type: config.label,
      amount: parseFloat(detail.amount) || 0
    };
  });

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Receipt className="h-5 w-5 text-blue-600" />
        </div>
        <h4 className="font-medium text-blue-900">Payment Summary</h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-blue-700 font-medium">Total Amount</p>
              <p className="text-lg font-bold text-blue-900">
                ${totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-blue-700 font-medium">Transaction Date</p>
              <p className="text-blue-900 font-semibold">
                {new Date(formData.transactionDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-blue-700 font-medium">Allocation Status</p>
            <p className={`font-semibold ${
              isFullyAllocated 
                ? 'text-green-600' 
                : isOverAllocated 
                ? 'text-red-600' 
                : 'text-yellow-600'
            }`}>
              {isFullyAllocated 
                ? 'Fully Allocated' 
                : isOverAllocated 
                ? `Over-allocated by $${Math.abs(remainingToAllocate).toLocaleString()}` 
                : `$${remainingToAllocate.toLocaleString()} unallocated`}
            </p>
          </div>
          
          <div>
            <p className="text-blue-700 font-medium">Payment Methods</p>
            <div className="space-y-1">
              {paymentMethods.map((pm, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-blue-800">{pm.method}:</span>
                  <span className="font-medium text-blue-900">${pm.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {formData.notes && (
        <div className="mt-4 pt-3 border-t border-blue-200">
          <div className="flex items-start space-x-2">
            <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-blue-700 font-medium text-sm">Notes</p>
              <p className="text-blue-800 text-sm">{formData.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}