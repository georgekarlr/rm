import React, { useState, useEffect } from 'react';
import { Edit, X, Save, Loader2, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { triggerAssetTypesRefresh } from '../../hooks/useAssetTypes';
import type { RentableAsset, AssetType } from '../../hooks/useAssetTypes';

interface AssetDetail {
  type: string;
  value: string;
}

interface EditAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  asset: RentableAsset | null;
  assetType: AssetType;
}

const statusOptions = [
  { value: 'AVAILABLE', label: 'Available', color: 'text-green-600' },
  { value: 'OCCUPIED', label: 'Occupied', color: 'text-blue-600' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: 'text-yellow-600' },
  { value: 'UNAVAILABLE', label: 'Unavailable', color: 'text-red-600' },
];

export function EditAssetDialog({ isOpen, onClose, onSuccess, asset, assetType }: EditAssetDialogProps) {
  const { currentUser } = useCurrentUser();
  const [assetName, setAssetName] = useState('');
  const [assetStatus, setAssetStatus] = useState('AVAILABLE');
  const [details, setDetails] = useState<AssetDetail[]>([{ type: '', value: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Update form when asset changes
  useEffect(() => {
    if (asset) {
      setAssetName(asset.name);
      setAssetStatus(asset.status);
      
      // Convert asset details to form format
      if (asset.details && asset.details.length > 0) {
        setDetails(asset.details.map(detail => ({
          type: detail.type,
          value: detail.value
        })));
      } else {
        setDetails([{ type: '', value: '' }]);
      }
    } else {
      setAssetName('');
      setAssetStatus('AVAILABLE');
      setDetails([{ type: '', value: '' }]);
    }
    setMessage(null);
  }, [asset]);

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

    if (!asset) {
      setMessage({ type: 'error', text: 'No asset selected for editing' });
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
      console.log('🔄 Editing asset:', {
        asset_id: asset.id,
        new_name: assetName.trim(),
        new_asset_type_id: assetType.id,
        new_status: assetStatus,
        new_details: validDetails,
        username: currentUser.name
      });

      // Convert details to JSONB array format
      const jsonbDetails = validDetails.map(detail => ({
        type: detail.type.trim(),
        value: detail.value.trim()
      }));

      // Call the Supabase function to edit rentable asset
      const { data, error } = await supabase.rpc('edit_rentable_asset', {
        p_asset_id: asset.id,
        p_new_name: assetName.trim(),
        p_new_asset_type_id: assetType.id,
        p_new_status: assetStatus,
        p_new_details: jsonbDetails,
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
            text: result.message || `Asset has been updated successfully!` 
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
            text: result.message || 'Failed to update asset' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unable to update asset. Please try again.' });
      }

    } catch (error: any) {
      console.error('❌ Error editing asset:', error);
      
      let errorMessage = 'Failed to update asset';
      if (error.message) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          errorMessage = 'An asset with this name already exists';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to update assets';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Asset not found or has been deleted';
        } else {
          errorMessage = 'Unable to update asset. Please try again.';
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-auto max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Edit className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Asset</h2>
              <p className="text-sm text-gray-600">Update asset information</p>
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
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-orange-800">
                  Editing as: {currentUser?.name} ({currentUser?.user_type})
                </span>
              </div>
            </div>

            {/* Asset Info */}
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Current Asset</p>
                  <p className="text-lg font-semibold text-gray-900">{asset.name}</p>
                  <p className="text-sm text-gray-600">{assetType.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Current Status</p>
                  <p className="text-sm font-semibold text-blue-600">{asset.status}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Asset Name */}
              <Input
                label="Asset Name"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="Enter asset name"
                required
                disabled={submitting}
                className="focus:ring-orange-500 focus:border-orange-500"
              />

              {/* Asset Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Status
                </label>
                <select
                  value={assetStatus}
                  onChange={(e) => setAssetStatus(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset Details */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Asset Details
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addDetailField}
                    disabled={submitting}
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
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
              </div>

              {/* Message */}
              {message && (
                <Alert
                  type={message.type}
                  message={message.text}
                />
              )}
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
                  Update Asset
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}