import React from 'react';
import { Building, Home, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAssetTypes } from '../../hooks/useAssetTypes';
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
    icon: AlertCircle,
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
  canEdit: boolean;
}

function AssetCard({ asset, canEdit }: AssetCardProps) {
  const config = statusConfig[asset.status as keyof typeof statusConfig] || statusConfig.UNAVAILABLE;
  const Icon = config.icon;

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${config.bg} rounded-lg`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{asset.name}</h4>
            <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} font-medium`}>
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {asset.details && asset.details.length > 0 && (
        <div className="space-y-2 mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Details</p>
          <div className="grid grid-cols-1 gap-1">
            {asset.details.map((detail, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{detail.type}:</span>
                <span className="font-medium text-gray-900">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {canEdit && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            View
          </Button>
          <Button size="sm" className="flex-1">
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}

interface AssetTypeCardProps {
  assetType: AssetType;
  canEdit: boolean;
}

function AssetTypeCard({ assetType, canEdit }: AssetTypeCardProps) {
  const availableCount = assetType.coalesce.filter(asset => asset.status === 'AVAILABLE').length;
  const totalCount = assetType.coalesce.length;
  const occupancyRate = totalCount > 0 ? Math.round(((totalCount - availableCount) / totalCount) * 100) : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{assetType.name}</h3>
              <p className="text-sm text-gray-600">{totalCount} total assets</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Occupancy</p>
            <p className="text-lg font-bold text-gray-900">{occupancyRate}%</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Available</p>
            <p className="text-lg font-bold text-green-600">{availableCount}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Occupied</p>
            <p className="text-lg font-bold text-blue-600">{totalCount - availableCount}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-lg font-bold text-gray-900">{totalCount}</p>
          </div>
        </div>

        {/* Assets List */}
        {assetType.coalesce.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Assets</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {assetType.coalesce.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  canEdit={canEdit}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Home className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p>No assets found</p>
            <p className="text-xs mt-1">Add assets to this type to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AssetTypesList() {
  const { currentUser } = useCurrentUser();
  const { assetTypes, loading, error, refetch, getAssetTypeStats } = useAssetTypes();
  
  // Check permissions based on current user type
  const canEdit = currentUser?.user_type === 'admin' || currentUser?.user_type === 'leaser';

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="text-center space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                      <div className="h-6 bg-gray-200 rounded w-8 mx-auto"></div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Asset Types</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refetch}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assetTypes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Building className="h-8 w-8 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Asset Types Found</h3>
            <p className="text-gray-600 mb-4">
              No asset types are currently available. Contact your administrator to set up asset types.
            </p>
            <Button onClick={refetch}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permission Notice */}
      {currentUser?.user_type === 'viewer' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Viewer Mode:</strong> You can view asset information but cannot make changes.
          </p>
        </div>
      )}

      {/* Asset Types List */}
      {assetTypes.map((assetType) => (
        <AssetTypeCard
          key={assetType.id}
          assetType={assetType}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}