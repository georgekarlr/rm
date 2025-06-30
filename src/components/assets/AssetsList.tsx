import React, { useState } from 'react';
import { Home, CheckCircle, Users, AlertCircle, AlertTriangle, Clock, Plus, Edit, Trash2, MoreVertical, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { AddAssetDialog } from './AddAssetDialog';
import { EditAssetDialog } from './EditAssetDialog';
import { DeleteAssetDialog } from './DeleteAssetDialog';
import { ViewAssetDialog } from './ViewAssetDialog';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { AssetType, RentableAsset } from '../../hooks/useAssetTypes';

const statusConfig = {
  AVAILABLE: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Available',
  },
  OCCUPIED: {
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'Occupied',
  },
  MAINTENANCE: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    label: 'Maintenance',
  },
  UNAVAILABLE: {
    icon: Clock,
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Unavailable',
  },
};

interface AssetCardProps {
  asset: RentableAsset;
  assetType: AssetType;
  canEdit: boolean;
  onEdit: (asset: RentableAsset) => void;
  onDelete: (asset: RentableAsset) => void;
  onView: (asset: RentableAsset) => void;
}

function AssetCard({ asset, assetType, canEdit, onEdit, onDelete, onView }: AssetCardProps) {
  const [showActions, setShowActions] = useState(false);
  const config = statusConfig[asset.status as keyof typeof statusConfig] || statusConfig.UNAVAILABLE;
  const Icon = config.icon;

  const handleActionClick = (action: 'edit' | 'delete' | 'view') => {
    setShowActions(false);
    if (action === 'edit') {
      onEdit(asset);
    } else if (action === 'delete') {
      onDelete(asset);
    } else if (action === 'view') {
      onView(asset);
    }
  };

  // Close actions menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowActions(false);
    if (showActions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActions]);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 relative">
      <CardContent className="p-4">
        {/* Actions Menu Button */}
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              showActions 
                ? 'bg-gray-200 text-gray-700' 
                : 'bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            } shadow-sm border border-gray-200`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Actions Dropdown */}
          {showActions && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-20">
              <button
                onClick={() => handleActionClick('view')}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Eye className="h-4 w-4 text-blue-500" />
                <span>View Details</span>
              </button>
              {canEdit && (
                <>
                  <button
                    onClick={() => handleActionClick('edit')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4 text-orange-500" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleActionClick('delete')}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-3 pr-8">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${config.bg} rounded-lg`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{asset.name}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} font-medium`}>
                {config.label}
              </span>
            </div>
          </div>
        </div>

        {/* Current Lease Info (if occupied) */}
        {asset.status === 'OCCUPIED' && asset.current_lease && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-medium text-blue-700">
              Rented to: {asset.current_lease.renter_name}
            </p>
            <p className="text-xs text-blue-600">
              Until: {new Date(asset.current_lease.end_date).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Maintenance History */}
        {asset.maintenance_history && asset.maintenance_history.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Maintenance Issues</p>
            <div className="text-xs text-gray-600">
              {asset.maintenance_history.length} open issue{asset.maintenance_history.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {asset.details && asset.details.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Details</p>
            <div className="space-y-1">
              {asset.details.map((detail, index) => (
                <div key={index} className="flex justify-between text-sm bg-gray-50 px-2 py-1 rounded">
                  <span className="text-gray-600">{detail.type}:</span>
                  <span className="font-medium text-gray-900">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onView(asset)}>
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
          {canEdit && (
            <Button size="sm" className="flex-1" onClick={() => onEdit(asset)}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface AssetsListProps {
  assetType: AssetType;
  canEdit: boolean;
}

export function AssetsList({ assetType, canEdit }: AssetsListProps) {
  const { currentUser } = useCurrentUser();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<RentableAsset | null>(null);

  const availableCount = assetType.coalesce.filter(asset => asset.status === 'AVAILABLE').length;
  const totalCount = assetType.coalesce.length;
  const occupancyRate = totalCount > 0 ? Math.round(((totalCount - availableCount) / totalCount) * 100) : 0;

  const handleAssetAdded = () => {
    // Data will be automatically refreshed via global event system
    console.log('✅ Asset added - data will refresh automatically');
  };

  const handleAssetUpdated = () => {
    // Data will be automatically refreshed via global event system
    console.log('✅ Asset updated - data will refresh automatically');
  };

  const handleAssetDeleted = () => {
    // Data will be automatically refreshed via global event system
    console.log('✅ Asset deleted - data will refresh automatically');
  };

  const handleEditAsset = (asset: RentableAsset) => {
    setSelectedAsset(asset);
    setShowEditDialog(true);
  };

  const handleDeleteAsset = (asset: RentableAsset) => {
    setSelectedAsset(asset);
    setShowDeleteDialog(true);
  };

  const handleViewAsset = (asset: RentableAsset) => {
    setSelectedAsset(asset);
    setShowViewDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Asset Type Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{assetType.name} Assets</h2>
              <p className="text-gray-600">
                Manage assets for this type
                {currentUser && (
                  <span className="ml-2 text-sm text-blue-600">
                    ({currentUser.name} - {currentUser.user_type})
                  </span>
                )}
              </p>
            </div>
            {canEdit && (
              <Button 
                className="w-full sm:w-auto"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {assetType.name} Asset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total</p>
              <p className="text-xl font-bold text-gray-900">{totalCount}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Available</p>
              <p className="text-xl font-bold text-green-600">{availableCount}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Occupied</p>
              <p className="text-xl font-bold text-blue-600">{totalCount - availableCount}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">Occupancy</p>
              <p className="text-xl font-bold text-purple-600">{occupancyRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      {assetType.coalesce.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assetType.coalesce.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              assetType={assetType}
              canEdit={canEdit}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
              onView={handleViewAsset}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assets Found</h3>
              <p className="text-gray-600 mb-4">
                No assets have been added to this asset type yet.
              </p>
              {canEdit && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First {assetType.name} Asset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Asset Dialog */}
      <AddAssetDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={handleAssetAdded}
        assetType={assetType}
      />

      {/* Edit Asset Dialog */}
      <EditAssetDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedAsset(null);
        }}
        onSuccess={handleAssetUpdated}
        asset={selectedAsset}
        assetType={assetType}
      />

      {/* Delete Asset Dialog */}
      <DeleteAssetDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedAsset(null);
        }}
        onSuccess={handleAssetDeleted}
        asset={selectedAsset}
        assetType={assetType}
      />

      {/* View Asset Dialog */}
      <ViewAssetDialog
        isOpen={showViewDialog}
        onClose={() => {
          setShowViewDialog(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
        assetType={assetType}
      />
    </div>
  );
}