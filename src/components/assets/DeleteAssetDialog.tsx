import React, { useState } from 'react';
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { triggerAssetTypesRefresh } from '../../hooks/useAssetTypes';
import type { RentableAsset, AssetType } from '../../hooks/useAssetTypes';

interface DeleteAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  asset: RentableAsset | null;
  assetType: AssetType;
}

export function DeleteAssetDialog({ isOpen, onClose, onSuccess, asset, assetType }: DeleteAssetDialogProps) {
  const { currentUser } = useCurrentUser();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDelete = async () => {
    if (!currentUser?.name) {
      setMessage({ type: 'error', text: 'Current user name is required' });
      return;
    }

    if (!asset) {
      setMessage({ type: 'error', text: 'No asset selected for deletion' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      console.log('🔄 Deleting asset:', {
        asset_id: asset.id,
        username: currentUser.name
      });

      // Call the Supabase function to delete rentable asset
      const { data, error } = await supabase.rpc('delete_rentable_asset', {
        p_asset_id: asset.id,
        p_username: currentUser.name
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(error.message);
      }

      // Check the response from the function
      if (data && data.length > 0) {
        const result = data[0];
        
        if (result.success) {
          // Show success message
          setMessage({ 
            type: 'success', 
            text: result.message || `Asset has been deleted successfully!` 
          });

          // Trigger global refresh to update all components
          triggerAssetTypesRefresh();

          // Call success callback after a short delay
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1500);
        } else {
          // Function returned success: false
          setMessage({ 
            type: 'error', 
            text: result.message || 'Failed to delete asset' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unable to delete asset. Please try again.' });
      }

    } catch (error: any) {
      console.error('❌ Error deleting asset:', error);
      
      let errorMessage = 'Failed to delete asset';
      if (error.message) {
        if (error.message.includes('in use') || error.message.includes('cannot delete')) {
          errorMessage = 'Cannot delete asset that is currently in use or has active bookings';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to delete assets';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Asset not found or has already been deleted';
        } else {
          errorMessage = 'Unable to delete asset. Please try again.';
        }
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setMessage(null);
      onClose();
    }
  };

  if (!isOpen || !asset) return null;

  const isOccupied = asset.status === 'OCCUPIED';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-auto max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Delete Asset</h2>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Current User Info */}
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-800">
                  Deleting as: {currentUser?.name} ({currentUser?.user_type})
                </span>
              </div>
            </div>

            {/* Asset Info */}
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Asset to Delete</p>
                  <p className="text-lg font-semibold text-gray-900">{asset.name}</p>
                  <p className="text-sm text-gray-600">{assetType.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`text-sm font-semibold ${
                    isOccupied ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {asset.status}
                  </p>
                </div>
              </div>

              {/* Asset Details */}
              {asset.details && asset.details.length > 0 && (
                <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Asset Details</p>
                  <div className="space-y-1">
                    {asset.details.map((detail, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{detail.type}:</span>
                        <span className="font-medium text-gray-900">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isOccupied && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Warning: This asset is currently occupied
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Warning Message */}
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">Permanent Deletion</h4>
                  <p className="text-sm text-red-700">
                    {isOccupied 
                      ? `This will permanently delete the asset "${asset.name}" which is currently occupied. The system will handle any active bookings or relationships safely.`
                      : `This will permanently delete the asset "${asset.name}". This action cannot be undone.`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className="mb-4">
                <Alert
                  type={message.type}
                  message={message.text}
                />
              </div>
            )}

            {/* Additional Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> The system will handle the deletion safely and return appropriate messages. 
                Any constraints or business rules will be enforced automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Actions - Fixed */}
        <div className="p-6 border-t border-gray-100 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              loading={submitting}
              disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Asset
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}