import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import type { PaymentDetailsSectionProps } from './types';

export function PaymentDetailsSection({
  paymentDetails,
  submitting,
  onAddPaymentDetail,
  onRemovePaymentDetail,
  onUpdatePaymentDetail,
  paymentMethods,
  paymentTypes
}: PaymentDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Payment Details</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAddPaymentDetail}
          disabled={submitting}
          className="text-blue-600 border-blue-300 hover:bg-blue-50"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Payment Method
        </Button>
      </div>

      {paymentDetails.map((detail, index) => {
        const PaymentMethodIcon = paymentMethods.find(m => m.value === detail.paymentMethod)?.icon || paymentMethods[0].icon;
        
        return (
          <div 
            key={detail.id} 
            className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <PaymentMethodIcon className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Payment {index + 1}
                </span>
              </div>
              {paymentDetails.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onRemovePaymentDetail(detail.id)}
                  disabled={submitting}
                  className="text-red-600 border-red-300 hover:bg-red-50 p-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <Input
                  type="number"
                  value={detail.amount}
                  onChange={(e) => onUpdatePaymentDetail(detail.id, 'amount', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  disabled={submitting}
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={detail.paymentMethod}
                  onChange={(e) => onUpdatePaymentDetail(detail.id, 'paymentMethod', e.target.value)}
                  required
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <select
                  value={detail.paymentType}
                  onChange={(e) => onUpdatePaymentDetail(detail.id, 'paymentType', e.target.value)}
                  required
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {paymentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      })}

      {paymentDetails.length === 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-500">No payment details added yet. Click "Add Payment Method" to begin.</p>
        </div>
      )}
    </div>
  );
}