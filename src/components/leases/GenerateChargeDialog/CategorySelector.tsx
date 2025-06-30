import React from 'react';
import { chargeCategories } from './constants';
import type { GenerateChargeFormData } from './types';

interface CategorySelectorProps {
  formData: GenerateChargeFormData;
  submitting: boolean;
  onChange: (category: string) => void;
}

export function CategorySelector({ formData, submitting, onChange }: CategorySelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Charge Category *
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {chargeCategories.map((category) => {
          const Icon = category.icon;
          const isSelected = formData.category === category.value;
          
          return (
            <button
              key={category.value}
              type="button"
              onClick={() => onChange(category.value)}
              disabled={submitting}
              className={`p-3 border rounded-lg text-left transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-4 w-4 ${
                    isSelected ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    isSelected ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {category.label}
                  </p>
                  <p className={`text-xs ${
                    isSelected ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {category.description}
                  </p>
                </div>
              </div>
              
              {isSelected && (
                <div className="mt-2 flex justify-end">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}