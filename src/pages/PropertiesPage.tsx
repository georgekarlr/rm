import React, { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { HorizontalAssetTypes } from '../components/assets/HorizontalAssetTypes';
import { AssetsList } from '../components/assets/AssetsList';
import { AddAssetTypeDialog } from '../components/assets/AddAssetTypeDialog';
import { EditAssetTypeDialog } from '../components/assets/EditAssetTypeDialog';
import { DeleteAssetTypeDialog } from '../components/assets/DeleteAssetTypeDialog';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useAssetTypes } from '../hooks/useAssetTypes';
import type { AssetType } from '../hooks/useAssetTypes';

export function PropertiesPage() {
  const { currentUser } = useCurrentUser();
  const { assetTypes, loading, getTotalAssetsCount, getAvailableAssetsCount } = useAssetTypes();
  const [selectedAssetTypeId, setSelectedAssetTypeId] = useState<number | null>(null);
  const [showAddAssetTypeDialog, setShowAddAssetTypeDialog] = useState(false);
  const [showEditAssetTypeDialog, setShowEditAssetTypeDialog] = useState(false);
  const [showDeleteAssetTypeDialog, setShowDeleteAssetTypeDialog] = useState(false);
  const [selectedAssetTypeForEdit, setSelectedAssetTypeForEdit] = useState<AssetType | null>(null);
  
  // Check permissions based on current user type
  const canAddAssetType = currentUser?.user_type === 'admin';
  const canEditAssetType = currentUser?.user_type === 'admin';
  const canAddAsset = currentUser?.user_type === 'admin' || currentUser?.user_type === 'leaser';

  const totalAssets = getTotalAssetsCount();
  const availableAssets = getAvailableAssetsCount();

  const selectedAssetType = selectedAssetTypeId 
    ? assetTypes.find(type => type.id === selectedAssetTypeId)
    : null;

  const handleAssetTypeAdded = () => {
    // Data will be automatically refreshed via global event system
    console.log('✅ Asset type added - data will refresh automatically');
  };

  const handleEditAssetType = (assetType: AssetType) => {
    setSelectedAssetTypeForEdit(assetType);
    setShowEditAssetTypeDialog(true);
  };

  const handleDeleteAssetType = (assetType: AssetType) => {
    setSelectedAssetTypeForEdit(assetType);
    setShowDeleteAssetTypeDialog(true);
  };

  const handleAssetTypeUpdated = () => {
    // Data will be automatically refreshed via global event system
    console.log('✅ Asset type updated - data will refresh automatically');
    
    // Clear selection if the selected asset type was updated
    if (selectedAssetTypeForEdit && selectedAssetTypeId === selectedAssetTypeForEdit.id) {
      setSelectedAssetTypeId(null);
    }
  };

  const handleAssetTypeDeleted = () => {
    // Data will be automatically refreshed via global event system
    console.log('✅ Asset type deleted - data will refresh automatically');
    
    // Clear selection if the selected asset type was deleted
    if (selectedAssetTypeForEdit && selectedAssetTypeId === selectedAssetTypeForEdit.id) {
      setSelectedAssetTypeId(null);
    }
  };

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Types</h1>
          <p className="text-gray-600">
            Manage your asset types and rentable assets
            {currentUser && (
              <span className="ml-2 text-sm text-blue-600">
                ({currentUser.name} - {currentUser.user_type})
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {canAddAssetType && (
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => setShowAddAssetTypeDialog(true)}
            >
              <Package className="w-4 h-4 mr-2" />
              Add Asset Type
            </Button>
          )}
        </div>
      </div>

      {/* Permission Notice */}
      {currentUser?.user_type === 'viewer' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Viewer Mode:</strong> You can view asset information but cannot make changes.
          </p>
        </div>
      )}

      {/* Admin Features Notice */}
      {canEditAssetType && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>Admin Access:</strong> You can edit and delete asset types using the menu button (⋮) on each asset type card.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Asset Types</p>
          <p className="text-2xl font-bold text-gray-900">{assetTypes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Assets</p>
          <p className="text-2xl font-bold text-gray-900">{totalAssets}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Available</p>
          <p className="text-2xl font-bold text-green-600">{availableAssets}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Occupied</p>
          <p className="text-2xl font-bold text-blue-600">{totalAssets - availableAssets}</p>
        </div>
      </div>

      {/* Horizontal Asset Types */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Asset Type
          {selectedAssetType && (
            <span className="ml-2 text-base font-normal text-blue-600">
              → {selectedAssetType.name}
            </span>
          )}
        </h2>
        <HorizontalAssetTypes
          assetTypes={assetTypes}
          loading={loading}
          selectedAssetTypeId={selectedAssetTypeId}
          onAssetTypeSelect={setSelectedAssetTypeId}
          onEditAssetType={canEditAssetType ? handleEditAssetType : undefined}
          onDeleteAssetType={canEditAssetType ? handleDeleteAssetType : undefined}
          onAddAssetType={canAddAssetType ? () => setShowAddAssetTypeDialog(true) : undefined}
        />
      </div>

      {/* Assets List for Selected Type */}
      {selectedAssetTypeId && selectedAssetType && (
        <AssetsList
          assetType={selectedAssetType}
          canEdit={canAddAsset}
        />
      )}

      {/* No Selection State */}
      {!selectedAssetTypeId && !loading && assetTypes.length > 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Asset Type</h3>
          <p className="text-gray-600">
            Choose an asset type from the horizontal list above to view and manage its assets.
          </p>
        </div>
      )}

      {/* No Asset Types State */}
      {!loading && assetTypes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Asset Types Found</h3>
          <p className="text-gray-600 mb-4">
            You haven't created any asset types yet. Start by adding your first asset type.
          </p>
          {canAddAssetType && (
            <Button onClick={() => setShowAddAssetTypeDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Asset Type
            </Button>
          )}
        </div>
      )}

      {/* Add Asset Type Dialog */}
      <AddAssetTypeDialog
        isOpen={showAddAssetTypeDialog}
        onClose={() => setShowAddAssetTypeDialog(false)}
        onSuccess={handleAssetTypeAdded}
      />

      {/* Edit Asset Type Dialog */}
      <EditAssetTypeDialog
        isOpen={showEditAssetTypeDialog}
        onClose={() => {
          setShowEditAssetTypeDialog(false);
          setSelectedAssetTypeForEdit(null);
        }}
        onSuccess={handleAssetTypeUpdated}
        assetType={selectedAssetTypeForEdit}
      />

      {/* Delete Asset Type Dialog */}
      <DeleteAssetTypeDialog
        isOpen={showDeleteAssetTypeDialog}
        onClose={() => {
          setShowDeleteAssetTypeDialog(false);
          setSelectedAssetTypeForEdit(null);
        }}
        onSuccess={handleAssetTypeDeleted}
        assetType={selectedAssetTypeForEdit}
      />
    </div>
  );
}