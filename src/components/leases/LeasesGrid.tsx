import React from 'react';
import { FileText, Search, Plus } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { LeaseCard } from './LeaseCard';
import type { Lease } from './LeaseCard/types';

interface LeasesGridProps {
  leases: Lease[];
  canEdit: boolean;
  canCreate: boolean;
  searchQuery: string;
  onViewLease: (lease: Lease) => void;
  onEditLease: (lease: Lease) => void;
  onTerminateLease?: (lease: Lease) => void;
  onChargeBill?: (lease: Lease) => void;
  onRecordPayment?: (lease: Lease) => void;
  onCreateLease?: () => void;
  onClearSearch: () => void;
}

export function LeasesGrid({ 
  leases, 
  canEdit, 
  canCreate,
  searchQuery,
  onViewLease, 
  onEditLease,
  onTerminateLease,
  onChargeBill,
  onRecordPayment,
  onCreateLease,
  onClearSearch
}: LeasesGridProps) {
  if (leases.length > 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {leases.map((lease) => (
          <LeaseCard
            key={lease.id}
            lease={lease}
            canEdit={canEdit}
            onView={onViewLease}
            onEdit={onEditLease}
            onTerminate={onTerminateLease}
            onChargeBill={onChargeBill}
            onRecordPayment={onRecordPayment}
          />
        ))}
      </div>
    );
  }

  // Empty states
  if (searchQuery.trim()) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Leases Found</h3>
            <p className="text-gray-600 mb-4">
              No leases match your search criteria. Try adjusting your search terms.
            </p>
            <Button variant="outline" onClick={onClearSearch}>
              Clear Search
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Leases Found</h3>
          <p className="text-gray-600 mb-4">
            No leases have been created yet. Start by creating your first lease agreement.
          </p>
          {canCreate && onCreateLease && (
            <Button onClick={onCreateLease}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Lease
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}