import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Send, Loader2, Building, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { triggerIssuesRefresh } from '../../hooks/useIssues';
import type { AssetType, RentableAsset } from '../../hooks/useAssetTypes';

interface IssueReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assetId?: number;
  assetName?: string;
  renterId?: number;
}

export function IssueReportDialog({ 
  isOpen, 
  onClose, 
  onSuccess, 
  assetId: initialAssetId, 
  assetName: initialAssetName,
  renterId 
}: IssueReportDialogProps) {
  const { currentUser } = useCurrentUser();
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Asset selection state
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetError, setAssetError] = useState<string | null>(null);

  // Fetch asset types with assets when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchAssetTypes();
      
      // Set initial asset ID if provided
      if (initialAssetId) {
        setSelectedAssetId(initialAssetId);
      }
    }
  }, [isOpen, initialAssetId]);

  const fetchAssetTypes = async () => {
    try {
      setLoadingAssets(true);
      setAssetError(null);

      console.log('🔄 Fetching asset types with nested assets...');

      // Call the Supabase function to get asset types with nested assets
      const { data, error } = await supabase.rpc('get_asset_types_with_assets');

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(`Failed to fetch asset types: ${error.message}`);
      }

      if (data && Array.isArray(data)) {
        // Transform the data to match our interface
        const transformedData: AssetType[] = data.map((item: any) => ({
          id: item.asset_type_id,
          name: item.asset_type_name,
          coalesce: item.rentable_assets || []
        }));

        setAssetTypes(transformedData);
        console.log('✅ Asset types fetched successfully:', transformedData);
        
        // If no initial asset ID was provided, select the first available asset
        if (!initialAssetId && !selectedAssetId && transformedData.length > 0) {
          const firstAssetType = transformedData[0];
          if (firstAssetType.coalesce && firstAssetType.coalesce.length > 0) {
            setSelectedAssetId(firstAssetType.coalesce[0].id);
          }
        }
      } else {
        console.warn('No asset types data received or invalid format');
        setAssetTypes([]);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred while fetching asset types';
      setAssetError(errorMessage);
      console.error('❌ Error fetching asset types:', err);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.name) {
      setMessage({ type: 'error', text: 'Current user name is required' });
      return;
    }

    if (!selectedAssetId) {
      setMessage({ type: 'error', text: 'Please select an asset' });
      return;
    }

    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Please provide a description of the issue' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      console.log('🔄 Reporting issue:', {
        assetId: selectedAssetId,
        description: description.trim(),
        username: currentUser.name,
        renterId: renterId || null
      });

      // Call the Supabase function to create issue report
      const { data, error } = await supabase.rpc('create_issue_report', {
        p_asset_id: selectedAssetId,
        p_description: description.trim(),
        p_username: currentUser.name,
        p_renter_id: renterId || null
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(error.message);
      }

      console.log('Issue report response:', data);

      // Check the response from the function - data is an array of rows
      if (data && data.length > 0 && data[0].success) {
        console.log('✅ Issue reported successfully:', data);

        // Get the selected asset name for the success message
        const selectedAsset = getSelectedAsset();
        const assetName = selectedAsset?.name || 'Unknown Asset';

        // Show success message
        setMessage({ 
          type: 'success', 
          text: data[0].message || `Issue for "${assetName}" has been reported successfully! Issue ID: ${data[0].new_issue_id}` 
        });

        // Reset form
        setDescription('');

        // Trigger global refresh to update all components
        triggerIssuesRefresh();

        // Call success callback after a short delay
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        // Function returned success: false
        setMessage({ 
          type: 'error', 
          text: data && data.length > 0 ? data[0].message : 'Failed to report issue' 
        });
      }
    } catch (error: any) {
      console.error('❌ Error reporting issue:', error);
      
      let errorMessage = 'Failed to report issue';
      if (error.message) {
        if (error.message.includes('asset') && error.message.includes('not found')) {
          errorMessage = 'Asset not found or has been deleted';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to report issues';
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
      setDescription('');
      setMessage(null);
      onClose();
    }
  };

  const getSelectedAsset = (): RentableAsset | undefined => {
    if (!selectedAssetId) return undefined;
    
    for (const assetType of assetTypes) {
      const asset = assetType.coalesce.find(a => a.id === selectedAssetId);
      if (asset) return asset;
    }
    
    return undefined;
  };

  const getAssetName = (): string => {
    if (initialAssetName && initialAssetId === selectedAssetId) {
      return initialAssetName;
    }
    
    const selectedAsset = getSelectedAsset();
    return selectedAsset?.name || 'Unknown Asset';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-auto max-h-[95vh] flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Report Issue</h2>
              <p className="text-sm text-gray-600">Report a problem with an asset</p>
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
        <div class="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Current User Info */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-yellow-800">
                Reporting as: {currentUser?.name} ({currentUser?.user_type})
              </span>
            </div>
          </div>
</div>
          {/* Asset Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Asset *
            </label>
            
            {assetError ? (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">{assetError}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchAssetTypes}
                    disabled={loadingAssets}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${loadingAssets ? 'animate-spin' : ''}`} />
                    Retry
                  </Button>
                </div>
              </div>
            ) : loadingAssets ? (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
                <span className="text-sm text-gray-600">Loading assets...</span>
              </div>
            ) : (
              <select
                value={selectedAssetId || ''}
                onChange={(e) => setSelectedAssetId(parseInt(e.target.value))}
                disabled={submitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Select an asset</option>
                {assetTypes.map(assetType => (
                  <optgroup key={assetType.id} label={assetType.name}>
                    {assetType.coalesce.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </div>

          {/* Selected Asset Info */}
          {selectedAssetId && !loadingAssets && !assetError && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg bg-yellow-50 border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Building className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Selected Asset</p>
                  <p className="text-lg font-semibold text-gray-900">{getAssetName()}</p>
                  <p className="text-xs text-gray-500">Asset ID: {selectedAssetId}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                required
                disabled={submitting}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            {/* Message */}
            {message && (
              <Alert
                type={message.type}
                message={message.text}
              />
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 flex-shrink-0 border-t border-gray-100">
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
                onClick={handleSubmit}
                loading={submitting}
                disabled={!description.trim() || !selectedAssetId || submitting}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg p-4 text-sm font-medium">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> Please provide as much detail as possible about the issue. 
              Include when it started, how it affects the asset, and any other relevant information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}