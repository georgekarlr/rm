import React from 'react';
import { Building } from 'lucide-react';
import type { CreateLeaseFormData, AssetOption } from './types';
import type { AssetType } from '../../../hooks/useAssetTypes';

interface AssetSelectionProps {
  formData: CreateLeaseFormData;
  assetTypes: AssetType[];
  availableAssets: AssetOption[];
  selectedAsset?: AssetOption;
  assetsLoading: boolean;
  submitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function AssetSelection({
  formData,
  assetTypes,
  availableAssets,
  selectedAsset,
  assetsLoading,
  submitting,
  onChange
}: AssetSelectionProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Asset *
        </label>
        {assetsLoading ? (
          <div className="animate-pulse h-10 bg-gray-200 rounded-lg"></div>
        ) : (
          <select
            name="assetId"
            value={formData.assetId}
            onChange={onChange}
            required
            disabled={submitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Choose an available asset...</option>
            {assetTypes.map(assetType => (
              <optgroup key={assetType.id} label={assetType.name}>
                {assetType.coalesce
                  .filter(asset => asset.status === 'AVAILABLE')
                  .map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} - {assetType.name}
                    </option>
                  ))
                }
              </optgroup>
            ))}
          </select>
        )}
        {availableAssets.length === 0 && !assetsLoading && (
          <p className="text-sm text-red-600 mt-1">
            No available assets found. Please ensure assets are marked as available.
          </p>
        )}
      </div>

      {/* Selected Asset Preview */}
      {selectedAsset && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">Selected Asset: {selectedAsset.name}</p>
              <p className="text-sm text-green-700">
                Status: {selectedAsset.status} | Type: {assetTypes.find(at => at.coalesce.some(a => a.id === selectedAsset.id))?.name}
              </p>
              {selectedAsset.details && selectedAsset.details.length > 0 && (
                <div className="mt-2 text-xs text-green-600">
                  {selectedAsset.details.map((detail, index) => (
                    <span key={index} className="mr-3">
                      {detail.type}: {detail.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}