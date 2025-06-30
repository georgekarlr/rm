import React, { useState } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useIssues, type Issue } from '../hooks/useIssues';
import { AlertTriangle, Search, Filter, Plus, CheckCircle, Clock, XCircle, Building, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { IssueCard } from '../components/issues/IssueCard';
import { ViewIssueDialog } from '../components/issues/ViewIssueDialog';
import { ResolveIssueDialog } from '../components/issues/ResolveIssueDialog';
import { IssueReportDialog } from '../components/issues/IssueReportDialog';
import { UpdateIssueStatusDialog } from '../components/issues/UpdateIssueStatusDialog';
import { useAssetTypes } from '../hooks/useAssetTypes';

export function IssuesPage() {
  const { currentUser } = useCurrentUser();
  const { issues, loading, error, getIssueStats, refetch } = useIssues();
  const { assetTypes } = useAssetTypes();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  
  // Check permissions based on current user type
  const canResolveIssues = currentUser?.user_type === 'admin' || currentUser?.user_type === 'leaser';
  const canReportIssues = true; // Everyone can report issues

  // Get stats
  const stats = getIssueStats();

  // Get all available assets for reporting
  const availableAssets = assetTypes.flatMap(assetType => assetType.coalesce);

  // Filter issues based on search query, status filter, and asset filter
  const filteredIssues = issues.filter(issue => {
    // Apply search filter
    const matchesSearch = searchQuery.trim() 
      ? issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.reported_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.id.toString().includes(searchQuery)
      : true;
    
    // Apply status filter
    const matchesStatus = statusFilter 
      ? issue.status === statusFilter
      : true;
    
    // Apply asset filter
    const matchesAsset = selectedAssetId 
      ? issue.asset_id === selectedAssetId
      : true;
    
    return matchesSearch && matchesStatus && matchesAsset;
  });

  const handleViewIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowViewDialog(true);
  };

  const handleResolveIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowResolveDialog(true);
  };

  const handleUpdateStatus = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowUpdateStatusDialog(true);
  };

  const handleReportIssue = (assetId: number) => {
    setSelectedAssetId(assetId);
    setShowReportDialog(true);
  };

  const handleIssueResolved = () => {
    // Data will be automatically refreshed via global event system
    console.log('✅ Issue resolved - data will refresh automatically');
  };

  const handleIssueStatusUpdated = () => {
    // Data will be automatically refreshed via global event system
    console.log('✅ Issue status updated - data will refresh automatically');
  };

  const handleIssueReported = () => {
    // Data will be automatically refreshed via global event system
    console.log('✅ Issue reported - data will refresh automatically');
  };

  const handleFilterClick = () => {
    // Toggle status filter between null, 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
    const statuses = [null, 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const currentIndex = statuses.indexOf(statusFilter);
    const nextIndex = (currentIndex + 1) % statuses.length;
    setStatusFilter(statuses[nextIndex]);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
    setSelectedAssetId(null);
  };

  const getStatusFilterLabel = () => {
    if (!statusFilter) return 'All Statuses';
    return {
      OPEN: 'Open Issues',
      IN_PROGRESS: 'In Progress',
      RESOLVED: 'Resolved Issues',
      CLOSED: 'Closed Issues'
    }[statusFilter] || 'All Statuses';
  };

  const getAssetFilterLabel = () => {
    if (!selectedAssetId) return 'All Assets';
    const asset = availableAssets.find(a => a.id === selectedAssetId);
    return asset ? asset.name : 'All Assets';
  };

  if (loading) {
    return (
      <div className="py-6 space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Issues</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issue Reports</h1>
          <p className="text-gray-600">
            Track and manage reported issues
            {currentUser && (
              <span className="ml-2 text-sm text-blue-600">
                ({currentUser.name} - {currentUser.user_type})
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={() => setShowReportDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        </div>
      </div>

      {/* Permission Notice */}
      {currentUser?.user_type === 'viewer' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Viewer Mode:</strong> You can view and report issues but cannot resolve them.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Issues</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIssues}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Open Issues</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.openIssues}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgressIssues}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvedIssues}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search issues by description, asset, or reporter..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={handleFilterClick}
          >
            <Filter className="w-4 h-4 mr-2" />
            {getStatusFilterLabel()}
          </Button>
          <select
            value={selectedAssetId || ''}
            onChange={(e) => setSelectedAssetId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Assets</option>
            {assetTypes.map(type => (
              <optgroup key={type.id} label={type.name}>
                {type.coalesce.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Active Filters */}
        {(searchQuery || statusFilter || selectedAssetId) && (
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm">
                  <span className="text-blue-700">Search: {searchQuery}</span>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {statusFilter && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm">
                  <span className="text-blue-700">Status: {statusFilter}</span>
                  <button 
                    onClick={() => setStatusFilter(null)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {selectedAssetId && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm">
                  <span className="text-blue-700">Asset: {getAssetFilterLabel()}</span>
                  <button 
                    onClick={() => setSelectedAssetId(null)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Search Results Info */}
        <div className="text-sm text-gray-600">
          Showing {filteredIssues.length} of {issues.length} issues
        </div>
      </div>

      {/* Issues Grid */}
      {filteredIssues.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              canResolve={canResolveIssues}
              onResolve={handleResolveIssue}
              onView={handleViewIssue}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter || selectedAssetId
                  ? 'No issues match your search criteria. Try adjusting your filters.'
                  : 'No issues have been reported yet.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {(searchQuery || statusFilter || selectedAssetId) && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                )}
                <Button onClick={() => setShowReportDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Report an Issue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Issue Dialog */}
      <ViewIssueDialog
        isOpen={showViewDialog}
        onClose={() => {
          setShowViewDialog(false);
          setSelectedIssue(null);
        }}
        issue={selectedIssue}
        onResolve={handleResolveIssue}
        onUpdateStatus={handleUpdateStatus}
        canResolve={canResolveIssues}
      />

      {/* Resolve Issue Dialog */}
      <ResolveIssueDialog
        isOpen={showResolveDialog}
        onClose={() => {
          setShowResolveDialog(false);
          setSelectedIssue(null);
        }}
        onSuccess={handleIssueResolved}
        issue={selectedIssue}
      />

      {/* Update Issue Status Dialog */}
      <UpdateIssueStatusDialog
        isOpen={showUpdateStatusDialog}
        onClose={() => {
          setShowUpdateStatusDialog(false);
          setSelectedIssue(null);
        }}
        onSuccess={handleIssueStatusUpdated}
        issue={selectedIssue}
      />

      {/* Report Issue Dialog */}
      <IssueReportDialog
        isOpen={showReportDialog}
        onClose={() => {
          setShowReportDialog(false);
          setSelectedAssetId(null);
        }}
        onSuccess={handleIssueReported}
        assetId={selectedAssetId || (availableAssets.length > 0 ? availableAssets[0].id : 0)}
        assetName={
          selectedAssetId 
            ? availableAssets.find(a => a.id === selectedAssetId)?.name || 'Unknown Asset'
            : availableAssets.length > 0 ? availableAssets[0].name : 'Unknown Asset'
        }
      />
    </div>
  );
}