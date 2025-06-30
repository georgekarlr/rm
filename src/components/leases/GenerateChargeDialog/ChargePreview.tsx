import React from 'react';
import { Receipt, Calendar, DollarSign, Tag, FileText } from 'lucide-react';
import { getCategoryConfig } from './constants';
import type { ChargePreviewProps } from './types';

export function ChargePreview({ formData, lease }: ChargePreviewProps) {
  if (!formData.amount || !formData.category || !formData.dueDate) {
    return null;
  }

  const categoryConfig = getCategoryConfig(formData.category);
  const CategoryIcon = categoryConfig.icon;
  const amount = parseFloat(formData.amount);

  if (isNaN(amount) || amount <= 0) {
    return null;
  }

  // Check if amount matches base charge amount
  const isBaseChargeAmount = lease && lease.base_charge_amount && 
    Math.abs(amount - lease.base_charge_amount) < 0.01;

  return (
    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Receipt className="h-5 w-5 text-green-600" />
        </div>
        <h4 className="font-medium text-green-900">Charge Preview</h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-green-700 font-medium">Amount</p>
              <div className="flex items-center">
                <p className="text-lg font-bold text-green-900">
                  ${amount.toLocaleString()}
                </p>
                {isBaseChargeAmount && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Base Charge
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <CategoryIcon className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-green-700 font-medium">Category</p>
              <p className="text-green-900 font-semibold">{categoryConfig.label}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-green-700 font-medium">Due Date</p>
              <p className="text-green-900 font-semibold">
                {new Date(formData.dueDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-green-700 font-medium">Lease</p>
              <p className="text-green-900 font-semibold">{lease?.renterName}</p>
            </div>
          </div>
        </div>
      </div>
      
      {formData.description && (
        <div className="mt-4 pt-3 border-t border-green-200">
          <div className="flex items-start space-x-2">
            <FileText className="h-4 w-4 text-green-600 mt-0.5" />
            <div>
              <p className="text-green-700 font-medium text-sm">Description</p>
              <p className="text-green-800 text-sm">{formData.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}