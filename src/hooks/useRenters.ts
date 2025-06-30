import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface SocialMedia {
  platform: string;
  handle: string;
}

export interface Renter {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  other_info: string;
  created_at: string;
  update_at: string;
  social_media: SocialMedia[];
  // Computed fields for UI
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNumber: string;
  otherInfo: string;
  socialMedia: SocialMedia[];
  status: string;
  rating: number;
  totalRentals: number;
  joinDate: string;
}

export interface RentersState {
  renters: Renter[];
  loading: boolean;
  error: string | null;
}

// Global refresh event system
const REFRESH_EVENT = 'rentersRefresh';

export function useRenters() {
  const { user } = useAuth();
  const [renters, setRenters] = useState<Renter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRenters = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      console.log('🔄 Fetching renters...');

      // Call the Supabase function to get renters
      const { data, error } = await supabase.rpc('get_renters');

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(`Failed to fetch renters: ${error.message}`);
      }

      if (data && Array.isArray(data)) {
        // Transform the data to match our interface and add computed fields
        const transformedData: Renter[] = data.map((item: any) => {
          // Generate mock data for fields not in the database
          const mockRating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
          const mockTotalRentals = Math.floor(Math.random() * 20) + 1; // 1-20 rentals
          const mockStatus = Math.random() > 0.1 ? 'active' : 'inactive'; // 90% active

          return {
            // Database fields
            id: item.id,
            first_name: item.first_name,
            middle_name: item.middle_name || '',
            last_name: item.last_name,
            email: item.email,
            phone_number: item.phone_number,
            other_info: item.other_info || '',
            created_at: item.created_at,
            update_at: item.update_at,
            social_media: item.social_media || [],
            
            // Computed fields for UI compatibility
            firstName: item.first_name,
            middleName: item.middle_name || '',
            lastName: item.last_name,
            phoneNumber: item.phone_number,
            otherInfo: item.other_info || '',
            socialMedia: item.social_media || [],
            
            // Mock fields for UI (these would come from other tables in a real app)
            status: mockStatus,
            rating: mockRating,
            totalRentals: mockTotalRentals,
            joinDate: item.created_at
          };
        });

        setRenters(transformedData);
        console.log('✅ Renters fetched successfully:', transformedData);
      } else {
        console.warn('No renters data received or invalid format');
        setRenters([]);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred while fetching renters';
      setError(errorMessage);
      console.error('❌ Error fetching renters:', err);
      
      // Set empty array on error to prevent UI issues
      setRenters([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Trigger global refresh event
  const triggerGlobalRefresh = useCallback(() => {
    console.log('🔄 Triggering global renters refresh...');
    window.dispatchEvent(new CustomEvent(REFRESH_EVENT));
  }, []);

  // Fetch data when user is available
  useEffect(() => {
    if (user) {
      fetchRenters();
    } else {
      setRenters([]);
      setLoading(false);
      setError(null);
    }
  }, [user, fetchRenters]);

  // Listen for global refresh events
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Received global refresh event, refetching renters...');
      if (user) {
        fetchRenters(false); // Don't show loading spinner for background refreshes
      }
    };

    window.addEventListener(REFRESH_EVENT, handleRefresh);
    
    return () => {
      window.removeEventListener(REFRESH_EVENT, handleRefresh);
    };
  }, [user, fetchRenters]);

  // Helper functions for working with renters
  const getRenterById = useCallback((id: number): Renter | undefined => {
    return renters.find(renter => renter.id === id);
  }, [renters]);

  const getActiveRenters = useCallback((): Renter[] => {
    return renters.filter(renter => renter.status === 'active');
  }, [renters]);

  const getRentersByRating = useCallback((minRating: number): Renter[] => {
    return renters.filter(renter => renter.rating >= minRating);
  }, [renters]);

  const searchRenters = useCallback((query: string): Renter[] => {
    if (!query.trim()) return renters;
    
    const lowercaseQuery = query.toLowerCase();
    return renters.filter(renter => 
      renter.firstName.toLowerCase().includes(lowercaseQuery) ||
      renter.lastName.toLowerCase().includes(lowercaseQuery) ||
      renter.email.toLowerCase().includes(lowercaseQuery) ||
      renter.phoneNumber.includes(query)
    );
  }, [renters]);

  const getTotalRentalsCount = useCallback((): number => {
    return renters.reduce((total, renter) => total + renter.totalRentals, 0);
  }, [renters]);

  const getAverageRating = useCallback((): number => {
    if (renters.length === 0) return 0;
    const totalRating = renters.reduce((total, renter) => total + renter.rating, 0);
    return totalRating / renters.length;
  }, [renters]);

  const getRenterStats = useCallback(() => {
    const activeRenters = getActiveRenters();
    const totalRentals = getTotalRentalsCount();
    const averageRating = getAverageRating();
    
    return {
      totalRenters: renters.length,
      activeRenters: activeRenters.length,
      inactiveRenters: renters.length - activeRenters.length,
      totalRentals,
      averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
    };
  }, [renters, getActiveRenters, getTotalRentalsCount, getAverageRating]);

  return {
    renters,
    loading,
    error,
    refetch: fetchRenters,
    triggerGlobalRefresh,
    // Helper functions
    getRenterById,
    getActiveRenters,
    getRentersByRating,
    searchRenters,
    getTotalRentalsCount,
    getAverageRating,
    getRenterStats
  };
}

// Export the refresh trigger function for use in other components
export const triggerRentersRefresh = () => {
  console.log('🔄 Triggering renters refresh from external component...');
  window.dispatchEvent(new CustomEvent(REFRESH_EVENT));
};