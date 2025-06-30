import React, { useState } from 'react';
import { Plus, X, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { triggerAssetTypesRefresh } from '../../hooks/useAssetTypes';
import type { AssetType } from '../../hooks/useAssetTypes';

interface AssetDetail {
  type: string;
  value: string;
}

interface AddAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assetType: AssetType;
}

export function AddAssetDialog({ isOpen, onClose, onSuccess, assetType }: AddAssetDialogProps) {
  const { currentUser } = useCurrentUser();
  const [assetName, setAssetName] = useState('');
  const [details, setDetails] = useState<AssetDetail[]>([{ type: '', value: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const addDetailField = () => {
    setDetails([...details, { type: '', value: '' }]);
  };

  const removeDetailField = (index: number) => {
    if (details.length > 1) {
      setDetails(details.filter((_, i) => i !== index));
    }
  };

  const updateDetail = (index: number, field: 'type' | 'value', value: string) => {
    const updatedDetails = details.map((detail, i) => 
      i === index ? { ...detail, [field]: value } : detail
    );
    setDetails(updatedDetails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.name) {
      setMessage({ type: 'error', text: 'Current user name is required' });
      return;
    }

    if (!assetName.trim()) {
      setMessage({ type: 'error', text: 'Asset name is required' });
      return;
    }

    // Filter out empty details
    const validDetails = details.filter(detail => detail.type.trim() && detail.value.trim());

    setSubmitting(true);
    setMessage(null);

    try {
      console.log('🔄 Adding asset:', {
        name: assetName.trim(),
        asset_type_id: assetType.id,
        details: validDetails,
        username: currentUser.name
      });

      // Convert details to JSONB array format
      const jsonbDetails = validDetails.map(detail => ({
        type: detail.type.trim(),
        value: detail.value.trim()
      }));

      // Call the Supabase function to add rentable asset
      const { data, error } = await supabase.rpc('add_rentable_asset', {
        p_name: assetName.trim(),
        p_asset_type_id: assetType.id,
        p_details: jsonbDetails,
        p_username: currentUser.name
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Asset added successfully:', data);

      // Show success message
      setMessage({ 
        type: 'success', 
        text: `Asset "${assetName}" has been added to ${assetType.name} successfully!` 
      });

      // Reset form
      setAssetName('');
      setDetails([{ type: '', value: '' }]);

      // Trigger global refresh to update all components
      triggerAssetTypesRefresh();

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error('❌ Error adding asset:', error);
      
      let errorMessage = 'Failed to add asset';
      if (error.message) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          errorMessage = 'An asset with this name already exists in this asset type';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to add assets';
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
      setAssetName('');
      setDetails([{ type: '', value: '' }]);
      setMessage(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-auto max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Asset</h2>
              <p className="text-sm text-gray-600">Add asset to {assetType.name}</p>
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
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">
                  Adding to {assetType.name} as: {currentUser?.name} ({currentUser?.user_type})
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Asset Name */}
              <Input
                label="Asset Name"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder={`e.g., ${assetType.name} A1, Conference Room B1`}
                required
                disabled={submitting}
                className="focus:ring-green-500 focus:border-green-500"
              />

              {/* Asset Details */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Asset Details (Optional)
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addDetailField}
                    disabled={submitting}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Detail
                  </Button>
                </div>

                <div className="space-y-3">
                  {details.map((detail, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Input
                          label={index === 0 ? "Detail Type" : ""}
                          value={detail.type}
                          onChange={(e) => updateDetail(index, 'type', e.target.value)}
                          placeholder="e.g., Capacity, Features, Floor"
                          disabled={submitting}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          label={index === 0 ? "Detail Value" : ""}
                          value={detail.value}
                          onChange={(e) => updateDetail(index, 'value', e.target.value)}
                          placeholder="e.g., 10 people, WiFi, 2nd Floor"
                          disabled={submitting}
                        />
                      </div>
                      {details.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeDetailField(index)}
                          disabled={submitting}
                          className="text-red-600 border-red-300 hover:bg-red-50 mb-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Add specific details about this asset like capacity, features, location, etc.
                </p>
              </div>

              {/* Message */}
              {message && (
                <Alert
                  type={message.type}
                  message={message.text}
                />
              )}

              {/* Help Text */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Asset Details Examples:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>• <strong>Capacity:</strong> "10 people"</div>
                  <div>• <strong>Features:</strong> "WiFi, Projector"</div>
                  <div>• <strong>Floor:</strong> "2nd Floor"</div>
                  <div>• <strong>Size:</strong> "25 sqm"</div>
                </div>
              </div>
            </form>
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
              onClick={handleSubmit}
              loading={submitting}
              disabled={!assetName.trim() || submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding Asset...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Asset
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}