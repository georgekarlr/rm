import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface AssetDetail {
  type: string;
  value: string;
}

export interface RentableAsset {
  id: number;
  name: string;
  status: string;
  details: AssetDetail[];
  current_lease?: {
    lease_id: number;
    renter_name: string;
    end_date: string;
  };
  maintenance_history?: Array<{
    issue_id: number;
    status: string;
    description: string;
    request_date: string;
  }>;
}

export interface AssetType {
  id: number;
  name: string;
  coalesce: RentableAsset[];
}

export interface AssetTypesState {
  assetTypes: AssetType[];
  loading: boolean;
  error: string | null;
}

// Global refresh event system
const REFRESH_EVENT = 'assetTypesRefresh';

export function useAssetTypes() {
  const { user } = useAuth();
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssetTypes = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      console.log('🔄 Fetching asset types with nested assets...');

      // Call the Supabase function to get asset types with nested assets
      const { data, error } = await supabase.rpc('get_assets_overview_nested');

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(`Failed to fetch asset types: ${error.message}`);
      }

      if (data && Array.isArray(data)) {
        // Transform the data to match our interface
        const transformedData: AssetType[] = data.map((item: any) => ({
          id: item.asset_type_id,
          name: item.asset_type_name,
          coalesce: (item.assets || []).map((asset: any) => ({
            id: asset.asset_id,
            name: asset.asset_name,
            // Map RENTED status to OCCUPIED for UI consistency
            status: asset.status === 'RENTED' ? 'OCCUPIED' : asset.status || 'AVAILABLE',
            details: asset.details || [],
            current_lease: asset.current_lease,
            maintenance_history: asset.maintenance_history
          }))
        }));

        setAssetTypes(transformedData);
        console.log('✅ Asset types fetched successfully:', transformedData);
      } else {
        console.warn('No asset types data received or invalid format');
        setAssetTypes([]);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred while fetching asset types';
      setError(errorMessage);
      console.error('❌ Error fetching asset types:', err);
      
      // Set empty array on error to prevent UI issues
      setAssetTypes([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Trigger global refresh event
  const triggerGlobalRefresh = useCallback(() => {
    console.log('🔄 Triggering global asset types refresh...');
    window.dispatchEvent(new CustomEvent(REFRESH_EVENT));
  }, []);

  // Fetch data when user is available
  useEffect(() => {
    if (user) {
      fetchAssetTypes();
    } else {
      setAssetTypes([]);
      setLoading(false);
      setError(null);
    }
  }, [user, fetchAssetTypes]);

  // Listen for global refresh events
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Received global refresh event, refetching data...');
      if (user) {
        fetchAssetTypes(false); // Don't show loading spinner for background refreshes
      }
    };

    window.addEventListener(REFRESH_EVENT, handleRefresh);
    
    return () => {
      window.removeEventListener(REFRESH_EVENT, handleRefresh);
    };
  }, [user, fetchAssetTypes]);

  // Helper functions for working with asset types
  const getAssetTypeById = useCallback((id: number): AssetType | undefined => {
    return assetTypes.find(assetType => assetType.id === id);
  }, [assetTypes]);

  const getAssetsByType = useCallback((assetTypeId: number): RentableAsset[] => {
    const assetType = getAssetTypeById(assetTypeId);
    return assetType?.coalesce || [];
  }, [getAssetTypeById]);

  const getAvailableAssets = useCallback((assetTypeId?: number): RentableAsset[] => {
    if (assetTypeId) {
      return getAssetsByType(assetTypeId).filter(asset => asset.status === 'AVAILABLE');
    }
    
    return assetTypes.flatMap(assetType => 
      assetType.coalesce.filter(asset => asset.status === 'AVAILABLE')
    );
  }, [assetTypes, getAssetsByType]);

  const getAssetById = useCallback((assetId: number): RentableAsset | undefined => {
    for (const assetType of assetTypes) {
      const asset = assetType.coalesce.find(asset => asset.id === assetId);
      if (asset) return asset;
    }
    return undefined;
  }, [assetTypes]);

  const getTotalAssetsCount = useCallback((): number => {
    return assetTypes.reduce((total, assetType) => total + assetType.coalesce.length, 0);
  }, [assetTypes]);

  const getAvailableAssetsCount = useCallback((): number => {
    return assetTypes.reduce((total, assetType) => 
      total + assetType.coalesce.filter(asset => asset.status === 'AVAILABLE').length, 0
    );
  }, [assetTypes]);

  const getAssetTypeStats = useCallback(() => {
    return assetTypes.map(assetType => ({
      id: assetType.id,
      name: assetType.name,
      totalAssets: assetType.coalesce.length,
      availableAssets: assetType.coalesce.filter(asset => asset.status === 'AVAILABLE').length,
      occupiedAssets: assetType.coalesce.filter(asset => asset.status !== 'AVAILABLE').length,
      occupancyRate: assetType.coalesce.length > 0 
        ? Math.round(((assetType.coalesce.length - assetType.coalesce.filter(asset => asset.status === 'AVAILABLE').length) / assetType.coalesce.length) * 100)
        : 0
    }));
  }, [assetTypes]);

  return {
    assetTypes,
    loading,
    error,
    refetch: fetchAssetTypes,
    triggerGlobalRefresh,
    // Helper functions
    getAssetTypeById,
    getAssetsByType,
    getAvailableAssets,
    getAssetById,
    getTotalAssetsCount,
    getAvailableAssetsCount,
    getAssetTypeStats
  };
}

// Export the refresh trigger function for use in other components
export const triggerAssetTypesRefresh = () => {
  console.log('🔄 Triggering asset types refresh from external component...');
  window.dispatchEvent(new CustomEvent(REFRESH_EVENT));
};