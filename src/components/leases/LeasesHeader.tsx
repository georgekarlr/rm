import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface LeasesHeaderProps {
  currentUser?: {
    name: string;
    user_type: string;
  } | null;
  canCreateLease: boolean;
  onCreateLease?: () => void;
}

export function LeasesHeader({ currentUser, canCreateLease, onCreateLease }: LeasesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leases</h1>
        <p className="text-gray-600">
          Manage lease agreements and renewals
          {currentUser && (
            <span className="ml-2 text-sm text-blue-600">
              ({currentUser.name} - {currentUser.user_type})
            </span>
          )}
        </p>
      </div>
      {canCreateLease && onCreateLease && (
        <Button className="w-full sm:w-auto" onClick={onCreateLease}>
          <Plus className="w-4 h-4 mr-2" />
          Create Lease
        </Button>
      )}
    </div>
  );
}