import React, { useState } from 'react';
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { triggerAssetTypesRefresh } from '../../hooks/useAssetTypes';
import type { AssetType } from '../../hooks/useAssetTypes';

interface DeleteAssetTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assetType: AssetType | null;
}

export function DeleteAssetTypeDialog({ isOpen, onClose, onSuccess, assetType }: DeleteAssetTypeDialogProps) {
  const { currentUser } = useCurrentUser();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDelete = async () => {
    if (!currentUser?.name) {
      setMessage({ type: 'error', text: 'Current user name is required' });
      return;
    }

    if (!assetType) {
      setMessage({ type: 'error', text: 'No asset type selected for deletion' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      // Call the Supabase function to delete asset type
      const { data, error } = await supabase.rpc('delete_asset_type', {
        p_asset_type_id: assetType.id,
        p_username: currentUser.name
      });

      if (error) {
        throw error;
      }

      // Check the response from the function
      if (data && data.length > 0) {
        const result = data[0];
        
        if (result.success) {
          // Show success message
          setMessage({ 
            type: 'success', 
            text: result.message || `Asset type has been deleted successfully!` 
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
            text: result.message || 'Failed to delete asset type' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unable to delete asset type. Please try again.' });
      }

    } catch (error: any) {
      let errorMessage = 'Failed to delete asset type';
      if (error.message) {
        if (error.message.includes('has assets') || error.message.includes('cannot delete')) {
          errorMessage = 'Cannot delete asset type that has associated assets. Please remove all assets first.';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to delete asset types';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Asset type not found or has already been deleted';
        } else {
          errorMessage = 'Unable to delete asset type. Please try again.';
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

  if (!isOpen || !assetType) return null;

  const hasAssets = assetType.coalesce.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Delete Asset Type</h2>
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

        {/* Content */}
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

          {/* Asset Type Info */}
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Asset Type to Delete</p>
                <p className="text-lg font-semibold text-gray-900">{assetType.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Associated Assets</p>
                <p className={`text-lg font-semibold ${hasAssets ? 'text-red-600' : 'text-green-600'}`}>
                  {assetType.coalesce.length}
                </p>
              </div>
            </div>

            {hasAssets && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Warning: This asset type has {assetType.coalesce.length} associated assets
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
                  {hasAssets 
                    ? `This will permanently delete the asset type "${assetType.name}" and may affect ${assetType.coalesce.length} associated assets. The system will handle the deletion safely.`
                    : `This will permanently delete the asset type "${assetType.name}". This action cannot be undone.`
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

          {/* Actions */}
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
                  Delete Asset Type
                </>
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> The system will handle the deletion safely and return appropriate messages. 
              Any constraints or business rules will be enforced automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}