import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Issue {
  id: number;
  issue_id: number;
  asset_id: number;
  asset_name: string;
  description: string;
  status: string;
  owner_notes: string | null;
  reported_by: string;
  request_date: string;
  last_updated: string;
  lease_at_time_of_report: any;
  asset_maintenance_history: any[];
  // Additional fields for UI
  created_at: string;
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  renter_id: number | null;
}

export interface IssuesState {
  issues: Issue[];
  loading: boolean;
  error: string | null;
}

// Global refresh event system
const REFRESH_EVENT = 'issuesRefresh';

export function useIssues() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      console.log('🔄 Fetching issues...');

      // Call the Supabase function to get issues overview
      const { data, error } = await supabase.rpc('get_issue_reports_overview');

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(`Failed to fetch issues: ${error.message}`);
      }

      if (data && Array.isArray(data)) {
        // Transform the data to match our interface
        const transformedData: Issue[] = data.map(item => {
          // Extract resolution info from owner_notes if available
          let resolution = null;
          let resolved_by = null;
          let resolved_at = null;

          if (item.status === 'RESOLVED' && item.owner_notes) {
            resolution = item.owner_notes;
            // Try to extract resolved_by and resolved_at from last_updated
            resolved_by = item.reported_by; // Fallback
            resolved_at = item.last_updated;
          }

          return {
            id: item.issue_id,
            issue_id: item.issue_id,
            asset_id: item.asset_id,
            asset_name: item.asset_name || 'Unknown Asset',
            description: item.description,
            status: item.status || 'OPEN',
            owner_notes: item.owner_notes,
            reported_by: item.reported_by || 'Unknown',
            request_date: item.request_date,
            last_updated: item.last_updated,
            lease_at_time_of_report: item.lease_at_time_of_report,
            asset_maintenance_history: item.asset_maintenance_history || [],
            // Additional fields for UI
            created_at: item.request_date,
            resolution,
            resolved_by,
            resolved_at,
            renter_id: item.lease_at_time_of_report?.id || null
          };
        });

        setIssues(transformedData);
        console.log('✅ Issues fetched successfully:', transformedData);
      } else {
        console.warn('No issues data received or invalid format');
        setIssues([]);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred while fetching issues';
      setError(errorMessage);
      console.error('❌ Error fetching issues:', err);
      
      // Set empty array on error to prevent UI issues
      setIssues([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Trigger global refresh event
  const triggerGlobalRefresh = useCallback(() => {
    console.log('🔄 Triggering global issues refresh...');
    window.dispatchEvent(new CustomEvent(REFRESH_EVENT));
  }, []);

  // Fetch data when user is available
  useEffect(() => {
    if (user) {
      fetchIssues();
    } else {
      setIssues([]);
      setLoading(false);
      setError(null);
    }
  }, [user, fetchIssues]);

  // Listen for global refresh events
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Received global refresh event, refetching issues...');
      if (user) {
        fetchIssues(false); // Don't show loading spinner for background refreshes
      }
    };

    window.addEventListener(REFRESH_EVENT, handleRefresh);
    
    return () => {
      window.removeEventListener(REFRESH_EVENT, handleRefresh);
    };
  }, [user, fetchIssues]);

  // Helper functions for working with issues
  const getIssueById = useCallback((id: number): Issue | undefined => {
    return issues.find(issue => issue.id === id);
  }, [issues]);

  const getIssuesByStatus = useCallback((status: string): Issue[] => {
    return issues.filter(issue => issue.status === status);
  }, [issues]);

  const getIssuesByAsset = useCallback((assetId: number): Issue[] => {
    return issues.filter(issue => issue.asset_id === assetId);
  }, [issues]);

  const getOpenIssuesCount = useCallback((): number => {
    return issues.filter(issue => issue.status === 'OPEN').length;
  }, [issues]);

  const getResolvedIssuesCount = useCallback((): number => {
    return issues.filter(issue => issue.status === 'RESOLVED').length;
  }, [issues]);

  const getIssueStats = useCallback(() => {
    const openIssues = issues.filter(issue => issue.status === 'OPEN');
    const inProgressIssues = issues.filter(issue => issue.status === 'IN_PROGRESS');
    const resolvedIssues = issues.filter(issue => issue.status === 'RESOLVED');
    const closedIssues = issues.filter(issue => issue.status === 'CLOSED');
    
    return {
      totalIssues: issues.length,
      openIssues: openIssues.length,
      inProgressIssues: inProgressIssues.length,
      resolvedIssues: resolvedIssues.length,
      closedIssues: closedIssues.length
    };
  }, [issues]);

  return {
    issues,
    loading,
    error,
    refetch: fetchIssues,
    triggerGlobalRefresh,
    // Helper functions
    getIssueById,
    getIssuesByStatus,
    getIssuesByAsset,
    getOpenIssuesCount,
    getResolvedIssuesCount,
    getIssueStats
  };
}

// Export the refresh trigger function for use in other components
export const triggerIssuesRefresh = () => {
  console.log('🔄 Triggering issues refresh from external component...');
  window.dispatchEvent(new CustomEvent(REFRESH_EVENT));
};