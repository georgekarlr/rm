import React from 'react';

export function HelpText() {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Lease Creation Notes:</h4>
      <ul className="text-xs text-gray-600 space-y-1">
        <li>• Only available assets can be selected for new leases</li>
        <li>• Only active renters can be assigned to leases</li>
        <li>• Start date can be in the past, present, or future</li>
        <li>• End date must be after start date</li>
        <li>• Base charge amount will be used for payment calculations</li>
      </ul>
    </div>
  );
}