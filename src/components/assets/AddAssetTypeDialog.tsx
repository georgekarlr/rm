import React, { useState } from 'react';
import { Package, X, Plus, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { triggerAssetTypesRefresh } from '../../hooks/useAssetTypes';

interface AddAssetTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddAssetTypeDialog({ isOpen, onClose, onSuccess }: AddAssetTypeDialogProps) {
  const { currentUser } = useCurrentUser();
  const [assetTypeName, setAssetTypeName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.name) {
      setMessage({ type: 'error', text: 'Current user name is required' });
      return;
    }

    if (!assetTypeName.trim()) {
      setMessage({ type: 'error', text: 'Asset type name is required' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      console.log('🔄 Adding asset type:', {
        name: assetTypeName.trim(),
        username: currentUser.name
      });

      // Call the Supabase function to add asset type
      const { data, error } = await supabase.rpc('add_asset_type', {
        p_name: assetTypeName.trim(),
        p_username: currentUser.name
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Asset type added successfully:', data);

      // Show success message
      setMessage({ 
        type: 'success', 
        text: `Asset type "${assetTypeName}" has been added successfully!` 
      });

      // Reset form
      setAssetTypeName('');

      // Trigger global refresh to update all components
      triggerAssetTypesRefresh();

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error('❌ Error adding asset type:', error);
      
      let errorMessage = 'Failed to add asset type';
      if (error.message) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          errorMessage = 'An asset type with this name already exists';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to add asset types';
        } else {
          errorMessage = error.message;
        }
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setAssetTypeName('');
      setMessage(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Asset Type</h2>
              <p className="text-sm text-gray-600">Create a new asset type category</p>
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
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">
                Adding as: {currentUser?.name} ({currentUser?.user_type})
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Asset Type Name"
              value={assetTypeName}
              onChange={(e) => setAssetTypeName(e.target.value)}
              placeholder="e.g., Room, Apartment, Office Space"
              required
              disabled={submitting}
              className="focus:ring-blue-500 focus:border-blue-500"
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
                disabled={!assetTypeName.trim() || submitting}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Asset Type
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Tip:</strong> Choose a descriptive name for your asset type. 
              This will help organize your rentable assets into logical categories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}