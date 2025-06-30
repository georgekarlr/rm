import React, { useState } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useLeases, type Lease } from '../hooks/useLeases';
import { LeasesHeader } from '../components/leases/LeasesHeader';
import { LeasesPermissionNotices } from '../components/leases/LeasesPermissionNotices';
import { LeasesSummaryCards } from '../components/leases/LeasesSummaryCards';
import { LeasesSearchFilter } from '../components/leases/LeasesSearchFilter';
import { LeasesGrid } from '../components/leases/LeasesGrid';
import { LeasesLoadingState } from '../components/leases/LeasesLoadingState';
import { LeasesErrorState } from '../components/leases/LeasesErrorState';
import { CreateLeaseDialog } from '../components/leases/CreateLeaseDialog';
import { EditLeaseDialog } from '../components/leases/EditLeaseDialog';
import { ViewLeaseDialog } from '../components/leases/ViewLeaseDialog';
import { GenerateChargeDialog } from '../components/leases/GenerateChargeDialog';
import { TerminateLeaseDialog } from '../components/leases/TerminateLeaseDialog';
import { RecordPaymentDialog } from '../components/leases/RecordPaymentDialog';

export function LeasesPage() {
  const { currentUser } = useCurrentUser();
  const { leases, loading, error, getLeaseStats, refetch } = useLeases();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showGenerateChargeDialog, setShowGenerateChargeDialog] = useState(false);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showRecordPaymentDialog, setShowRecordPaymentDialog] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  
  // Check permissions based on current user type
  const canCreateLease = currentUser?.user_type === 'admin' || currentUser?.user_type === 'leaser';
  const canEdit = currentUser?.user_type === 'admin' || currentUser?.user_type === 'leaser';

  // Get stats
  const stats = getLeaseStats();

  // Filter leases based on search query
  const filteredLeases = searchQuery.trim() 
    ? leases.filter(lease => {
        const query = searchQuery.toLowerCase();
        return lease.renterName.toLowerCase().includes(query) || 
               lease.assetName.toLowerCase().includes(query) ||
               lease.leaseStatus.toLowerCase().includes(query) ||
               lease.financialStatus.toLowerCase().includes(query);
      })
    : leases;

  const handleViewLease = (lease: Lease) => {
    setSelectedLease(lease);
    setShowViewDialog(true);
  };

  const handleEditLease = (lease: Lease) => {
    setSelectedLease(lease);
    setShowEditDialog(true);
  };

  const handleTerminateLease = (lease: Lease) => {
    setSelectedLease(lease);
    setShowTerminateDialog(true);
  };

  const handleChargeBill = (lease: Lease) => {
    setSelectedLease(lease);
    setShowGenerateChargeDialog(true);
  };

  const handleRecordPayment = (lease: Lease) => {
    setSelectedLease(lease);
    setShowRecordPaymentDialog(true);
  };

  const handleCreateLease = () => {
    setShowCreateDialog(true);
  };

  const handleLeaseCreated = () => {
    // Data will be automatically refreshed via global event system
    console.log('✅ Lease created - data will refresh automatically');
  };

  const handleLeaseUpdated = () => {
    // Data will be automatically refreshed via global event system
    console.log('✅ Lease updated - data will refresh automatically');
  };

  const handleLeaseTerminated = () => {
    // Data will be automatically refreshed via global event system
    console.log('✅ Lease terminated - data will refresh automatically');
  };

  const handleChargeGenerated = () => {
    // Data will be automatically refreshed via global event system
    console.log('✅ Charge generated - data will refresh automatically');
  };

  const handlePaymentRecorded = () => {
    // Data will be automatically refreshed via global event system
    console.log('✅ Payment recorded - data will refresh automatically');
  };

  const handleFilterClick = () => {
    console.log('Open filter dialog');
    // TODO: Implement filter dialog
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Loading state
  if (loading) {
    return <LeasesLoadingState />;
  }

  // Error state
  if (error) {
    return <LeasesErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <LeasesHeader
        currentUser={currentUser}
        canCreateLease={canCreateLease}
        onCreateLease={handleCreateLease}
      />

      {/* Permission Notices */}
      <LeasesPermissionNotices
        userType={currentUser?.user_type}
        canEdit={canEdit}
      />

      {/* Summary Cards */}
      <LeasesSummaryCards stats={stats} />

      {/* Search and Filter */}
      <LeasesSearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={handleFilterClick}
        totalResults={leases.length}
        filteredResults={filteredLeases.length}
        onClearSearch={handleClearSearch}
      />

      {/* Leases Grid */}
      <LeasesGrid
        leases={filteredLeases}
        canEdit={canEdit}
        canCreate={canCreateLease}
        searchQuery={searchQuery}
        onViewLease={handleViewLease}
        onEditLease={handleEditLease}
        onTerminateLease={handleTerminateLease}
        onChargeBill={handleChargeBill}
        onRecordPayment={handleRecordPayment}
        onCreateLease={handleCreateLease}
        onClearSearch={handleClearSearch}
      />

      {/* Create Lease Dialog */}
      <CreateLeaseDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleLeaseCreated}
      />

      {/* Edit Lease Dialog */}
      <EditLeaseDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedLease(null);
        }}
        onSuccess={handleLeaseUpdated}
        lease={selectedLease}
      />

      {/* View Lease Dialog */}
      <ViewLeaseDialog
        isOpen={showViewDialog}
        onClose={() => {
          setShowViewDialog(false);
          setSelectedLease(null);
        }}
        lease={selectedLease}
        onEdit={(lease) => {
          setShowViewDialog(false);
          handleEditLease(lease);
        }}
        onTerminate={(lease) => {
          setShowViewDialog(false);
          handleTerminateLease(lease);
        }}
        onChargeBill={(lease) => {
          setShowViewDialog(false);
          handleChargeBill(lease);
        }}
      />

      {/* Generate Charge Dialog */}
      <GenerateChargeDialog
        isOpen={showGenerateChargeDialog}
        onClose={() => {
          setShowGenerateChargeDialog(false);
          setSelectedLease(null);
        }}
        onSuccess={handleChargeGenerated}
        lease={selectedLease}
      />

      {/* Terminate Lease Dialog */}
      <TerminateLeaseDialog
        isOpen={showTerminateDialog}
        onClose={() => {
          setShowTerminateDialog(false);
          setSelectedLease(null);
        }}
        onSuccess={handleLeaseTerminated}
        lease={selectedLease}
      />

      {/* Record Payment Dialog */}
      <RecordPaymentDialog
        isOpen={showRecordPaymentDialog}
        onClose={() => {
          setShowRecordPaymentDialog(false);
          setSelectedLease(null);
        }}
        onSuccess={handlePaymentRecorded}
        lease={selectedLease}
      />
    </div>
  );
}