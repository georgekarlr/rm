import React from 'react';
import { userTypeConfig } from './constants';
import type { UserTypeSelectorProps } from './types';

export function UserTypeSelector({ selectedType, onChange, className = '' }: UserTypeSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Object.entries(userTypeConfig).map(([type, config]) => {
        const Icon = config.icon;
        return (
          <div
            key={type}
            onClick={() => onChange(type)}
            className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedType === type
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className={`p-2 ${config.bg} rounded-lg`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{config.label}</p>
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
              selectedType === type
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300'
            }`}>
              {selectedType === type && (
                <div className="w-full h-full rounded-full bg-white scale-50 transition-transform"></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}