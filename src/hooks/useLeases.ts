import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Lease {
  lease_id: number;
  asset_id: number;
  renter_id: number;
  asset_name: string;
  renter_name: string;
  start_date: string;
  end_date: string;
  lease_status: string;
  base_charge_amount: number;
  financial_status: string;
  next_payment_due: string;
  outstanding_balance: number;
  overdue_balance: number;
  intervals: any[];
  // Computed fields for UI
  id: number;
  assetId: number;
  renterId: number;
  assetName: string;
  renterName: string;
  startDate: string;
  endDate: string;
  leaseStatus: string;
  financialStatus: string;
  nextPaymentDue: string;
  outstandingBalance: number;
  overdueBalance: number;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
  isExpired: boolean;
}

export interface LeasesState {
  leases: Lease[];
  loading: boolean;
  error: string | null;
}

// Global refresh event system
const REFRESH_EVENT = 'leasesRefresh';

export function useLeases() {
  const { user } = useAuth();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeases = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      console.log('🔄 Fetching leases overview...');

      // Call the Supabase function to get leases overview
      const { data, error } = await supabase.rpc('get_leases_overview');

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(`Failed to fetch leases: ${error.message}`);
      }

      if (data && Array.isArray(data)) {
        // Transform the data to match our interface and add computed fields
        const transformedData: Lease[] = data.map((item: any) => {
          const endDate = new Date(item.end_date);
          const now = new Date();
          const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
          const isExpired = daysUntilExpiry < 0;

          // Log the actual values from the database for debugging
          console.log('Lease data from DB:', {
            id: item.lease_id,
            leaseStatus: item.lease_status,
            financialStatus: item.financial_status,
            baseChargeAmount: item.base_charge_amount
          });

          return {
            // Database fields
            lease_id: item.lease_id,
            asset_id: item.asset_id,
            renter_id: item.renter_id,
            asset_name: item.asset_name,
            renter_name: item.renter_name,
            start_date: item.start_date,
            end_date: item.end_date,
            lease_status: item.lease_status,
            base_charge_amount: parseFloat(item.base_charge_amount) || 0,
            financial_status: item.financial_status,
            next_payment_due: item.next_payment_due,
            outstanding_balance: parseFloat(item.outstanding_balance) || 0,
            overdue_balance: parseFloat(item.overdue_balance) || 0,
            intervals: item.intervals || [],
            
            // Computed fields for UI compatibility
            id: item.lease_id,
            assetId: item.asset_id,
            renterId: item.renter_id,
            assetName: item.asset_name,
            renterName: item.renter_name,
            startDate: item.start_date,
            endDate: item.end_date,
            // Use the exact status values from the database without forcing lowercase
            leaseStatus: item.lease_status || 'unknown',
            financialStatus: item.financial_status || 'unknown',
            nextPaymentDue: item.next_payment_due,
            outstandingBalance: parseFloat(item.outstanding_balance) || 0,
            overdueBalance: parseFloat(item.overdue_balance) || 0,
            daysUntilExpiry,
            isExpiringSoon,
            isExpired
          };
        });

        setLeases(transformedData);
        console.log('✅ Leases fetched successfully:', transformedData);
      } else {
        console.warn('No leases data received or invalid format');
        setLeases([]);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred while fetching leases';
      setError(errorMessage);
      console.error('❌ Error fetching leases:', err);
      
      // Set empty array on error to prevent UI issues
      setLeases([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Trigger global refresh event
  const triggerGlobalRefresh = useCallback(() => {
    console.log('🔄 Triggering global leases refresh...');
    window.dispatchEvent(new CustomEvent(REFRESH_EVENT));
  }, []);

  // Fetch data when user is available
  useEffect(() => {
    if (user) {
      fetchLeases();
    } else {
      setLeases([]);
      setLoading(false);
      setError(null);
    }
  }, [user, fetchLeases]);

  // Listen for global refresh events
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Received global refresh event, refetching leases...');
      if (user) {
        fetchLeases(false); // Don't show loading spinner for background refreshes
      }
    };

    window.addEventListener(REFRESH_EVENT, handleRefresh);
    
    return () => {
      window.removeEventListener(REFRESH_EVENT, handleRefresh);
    };
  }, [user, fetchLeases]);

  // Helper functions for working with leases
  const getLeaseById = useCallback((id: number): Lease | undefined => {
    return leases.find(lease => lease.id === id);
  }, [leases]);

  const getActiveLeases = useCallback((): Lease[] => {
    return leases.filter(lease => lease.leaseStatus.toLowerCase() === 'active');
  }, [leases]);

  const getExpiredLeases = useCallback((): Lease[] => {
    return leases.filter(lease => lease.isExpired);
  }, [leases]);

  const getExpiringSoonLeases = useCallback((): Lease[] => {
    return leases.filter(lease => lease.isExpiringSoon);
  }, [leases]);

  const getLeasesByStatus = useCallback((status: string): Lease[] => {
    return leases.filter(lease => lease.leaseStatus.toLowerCase() === status.toLowerCase());
  }, [leases]);

  const getLeasesByFinancialStatus = useCallback((status: string): Lease[] => {
    return leases.filter(lease => lease.financialStatus.toLowerCase() === status.toLowerCase());
  }, [leases]);

  const getOverduePayments = useCallback((): Lease[] => {
    return leases.filter(lease => lease.overdueBalance > 0);
  }, [leases]);

  const getTotalOutstandingBalance = useCallback((): number => {
    return leases.reduce((total, lease) => total + lease.outstandingBalance, 0);
  }, [leases]);

  const getTotalOverdueBalance = useCallback((): number => {
    return leases.reduce((total, lease) => total + lease.overdueBalance, 0);
  }, [leases]);

  const getTotalDeposits = useCallback((): number => {
    // This would need to be calculated from actual deposit data
    // For now, return a mock calculation
    return leases.length * 2000; // Assuming average deposit of $2000
  }, [leases]);

  const getLeaseStats = useCallback(() => {
    const activeLeases = getActiveLeases();
    const expiredLeases = getExpiredLeases();
    const expiringSoonLeases = getExpiringSoonLeases();
    const overduePayments = getOverduePayments();
    const totalDeposits = getTotalDeposits();
    const totalOutstandingBalance = getTotalOutstandingBalance();
    const totalOverdueBalance = getTotalOverdueBalance();
    
    return {
      totalLeases: leases.length,
      activeLeases: activeLeases.length,
      expiredLeases: expiredLeases.length,
      expiringSoonLeases: expiringSoonLeases.length,
      overduePayments: overduePayments.length,
      totalDeposits,
      totalOutstandingBalance,
      totalOverdueBalance
    };
  }, [leases, getActiveLeases, getExpiredLeases, getExpiringSoonLeases, getOverduePayments, getTotalDeposits, getTotalOutstandingBalance, getTotalOverdueBalance]);

  return {
    leases,
    loading,
    error,
    refetch: fetchLeases,
    triggerGlobalRefresh,
    // Helper functions
    getLeaseById,
    getActiveLeases,
    getExpiredLeases,
    getExpiringSoonLeases,
    getLeasesByStatus,
    getLeasesByFinancialStatus,
    getOverduePayments,
    getTotalOutstandingBalance,
    getTotalOverdueBalance,
    getTotalDeposits,
    getLeaseStats
  };
}

// Export the refresh trigger function for use in other components
export const triggerLeasesRefresh = () => {
  console.log('🔄 Triggering leases refresh from external component...');
  window.dispatchEvent(new CustomEvent(REFRESH_EVENT));
};