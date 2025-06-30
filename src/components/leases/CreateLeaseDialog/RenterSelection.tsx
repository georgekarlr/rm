import React from 'react';
import { User } from 'lucide-react';
import type { CreateLeaseFormData, RenterOption } from './types';

interface RenterSelectionProps {
  formData: CreateLeaseFormData;
  activeRenters: RenterOption[];
  selectedRenter?: RenterOption;
  rentersLoading: boolean;
  submitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function RenterSelection({
  formData,
  activeRenters,
  selectedRenter,
  rentersLoading,
  submitting,
  onChange
}: RenterSelectionProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Renter *
        </label>
        {rentersLoading ? (
          <div className="animate-pulse h-10 bg-gray-200 rounded-lg"></div>
        ) : (
          <select
            name="renterId" // Changed from renterUserId to renterId
            value={formData.renterId} // Changed from renterUserId to renterId
            onChange={onChange}
            required
            disabled={submitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Choose a renter...</option>
            {activeRenters.map(renter => (
              <option key={renter.id} value={renter.id}>
                {renter.firstName} {renter.lastName} - {renter.email}
              </option>
            ))}
          </select>
        )}
        {activeRenters.length === 0 && !rentersLoading && (
          <p className="text-sm text-red-600 mt-1">
            No active renters found. Please add renters first.
          </p>
        )}
      </div>

      {/* Selected Renter Preview */}
      {selectedRenter && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-purple-900">
                Selected Renter: {selectedRenter.firstName} {selectedRenter.lastName}
              </p>
              <p className="text-sm text-purple-700">
                Email: {selectedRenter.email} | Phone: {selectedRenter.phoneNumber}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Rating: {selectedRenter.rating}/5 | Total Rentals: {selectedRenter.totalRentals}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}