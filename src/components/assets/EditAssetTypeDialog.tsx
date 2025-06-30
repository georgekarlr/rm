import React, { useState, useEffect } from 'react';
import { Package, X, Save, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { triggerAssetTypesRefresh } from '../../hooks/useAssetTypes';
import type { AssetType } from '../../hooks/useAssetTypes';

interface EditAssetTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assetType: AssetType | null;
}

export function EditAssetTypeDialog({ isOpen, onClose, onSuccess, assetType }: EditAssetTypeDialogProps) {
  const { currentUser } = useCurrentUser();
  const [assetTypeName, setAssetTypeName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Update form when assetType changes
  useEffect(() => {
    if (assetType) {
      setAssetTypeName(assetType.name);
    } else {
      setAssetTypeName('');
    }
    setMessage(null);
  }, [assetType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.name) {
      setMessage({ type: 'error', text: 'Current user name is required' });
      return;
    }

    if (!assetType) {
      setMessage({ type: 'error', text: 'No asset type selected for editing' });
      return;
    }

    if (!assetTypeName.trim()) {
      setMessage({ type: 'error', text: 'Asset type name is required' });
      return;
    }

    if (assetTypeName.trim() === assetType.name) {
      setMessage({ type: 'error', text: 'No changes detected. Please modify the name to update.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      // Call the Supabase function to edit asset type
      const { data, error } = await supabase.rpc('edit_asset_type', {
        p_asset_type_id: assetType.id,
        p_new_name: assetTypeName.trim(),
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
            text: result.message || `Asset type has been updated successfully!` 
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
            text: result.message || 'Failed to update asset type' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unable to update asset type. Please try again.' });
      }

    } catch (error: any) {
      let errorMessage = 'Failed to update asset type';
      if (error.message) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          errorMessage = 'An asset type with this name already exists';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to update asset types';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Asset type not found or has been deleted';
        } else {
          errorMessage = 'Unable to update asset type. Please try again.';
        }
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setAssetTypeName(assetType?.name || '');
      setMessage(null);
      onClose();
    }
  };

  if (!isOpen || !assetType) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Asset Type</h2>
              <p className="text-sm text-gray-600">Update asset type information</p>
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
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-orange-800">
                Editing as: {currentUser?.name} ({currentUser?.user_type})
              </span>
            </div>
          </div>

          {/* Asset Type Info */}
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Current Asset Type</p>
                <p className="text-lg font-semibold text-gray-900">{assetType.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Assets</p>
                <p className="text-lg font-semibold text-blue-600">{assetType.coalesce.length}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Asset Type Name"
              value={assetTypeName}
              onChange={(e) => setAssetTypeName(e.target.value)}
              placeholder="Enter new asset type name"
              required
              disabled={submitting}
              className="focus:ring-orange-500 focus:border-orange-500"
            />

            {/* Message */}
            {message && (
              <Alert
                type={message.type}
                message={message.text}
              />
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
                type="submit"
                loading={submitting}
                disabled={!assetTypeName.trim() || submitting || assetTypeName.trim() === assetType.name}
                className="flex-1 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Asset Type
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Warning */}
          {assetType.coalesce.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> This asset type has {assetType.coalesce.length} associated assets. 
                Updating the name will affect all related assets.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}