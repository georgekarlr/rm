import React from 'react';
import { X, Building, CheckCircle, Users, AlertTriangle, Clock, Calendar, FileText, PenTool as Tool } from 'lucide-react';
import { Button } from '../ui/Button';
import type { RentableAsset, AssetType } from '../../hooks/useAssetTypes';

interface ViewAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: RentableAsset | null;
  assetType: AssetType | null;
}

export function ViewAssetDialog({ isOpen, onClose, asset, assetType }: ViewAssetDialogProps) {
  if (!isOpen || !asset || !assetType) return null;

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

  const config = statusConfig[asset.status as keyof typeof statusConfig] || statusConfig.UNAVAILABLE;
  const StatusIcon = config.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl mx-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Asset Details</h2>
              <p className="text-sm text-gray-600">{assetType.name} - {asset.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Status Banner */}
            <div className={`p-4 ${config.bg} rounded-lg border border-${config.color.split('-')[1]}-200`}>
              <div className="flex items-center space-x-3">
                <StatusIcon className={`h-6 w-6 ${config.color}`} />
                <div>
                  <h3 className={`font-semibold ${config.color}`}>Status: {config.label}</h3>
                  <p className="text-sm text-gray-700">
                    {asset.status === 'OCCUPIED' 
                      ? 'This asset is currently rented and unavailable for new leases'
                      : asset.status === 'AVAILABLE'
                      ? 'This asset is available for rent'
                      : asset.status === 'MAINTENANCE'
                      ? 'This asset is currently under maintenance'
                      : 'This asset is currently unavailable'}
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <span>Basic Information</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Asset Name</span>
                    <span className="text-sm font-semibold text-gray-900">{asset.name}</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Asset Type</span>
                    <span className="text-sm font-semibold text-gray-900">{assetType.name}</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Asset ID</span>
                    <span className="text-sm font-semibold text-gray-900">{asset.id}</span>
                  </div>
                </div>
              </div>

              {/* Asset Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Asset Details</span>
                </h3>
                
                {asset.details && asset.details.length > 0 ? (
                  <div className="space-y-3">
                    {asset.details.map((detail, index) => (
                      <div key={index} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{detail.type}</span>
                        <span className="text-sm font-semibold text-gray-900">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">No additional details available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Current Lease Information */}
            {asset.status === 'OCCUPIED' && asset.current_lease && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Current Lease</span>
                </h3>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Renter</p>
                      <p className="text-base font-semibold text-blue-900">{asset.current_lease.renter_name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-blue-700">Lease ID</p>
                      <p className="text-base font-semibold text-blue-900">{asset.current_lease.lease_id}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-blue-700">End Date</p>
                      <p className="text-base font-semibold text-blue-900">{formatDate(asset.current_lease.end_date)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Maintenance History */}
            {asset.maintenance_history && asset.maintenance_history.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Tool className="h-5 w-5 text-blue-600" />
                  <span>Maintenance History</span>
                </h3>
                
                <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {asset.maintenance_history.map((issue, index) => (
                    <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-yellow-100 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          </div>
                          <span className="font-medium text-gray-900">Issue #{issue.issue_id}</span>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                          {issue.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Reported: {formatDate(issue.request_date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex-shrink-0">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}