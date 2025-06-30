import React from 'react';
import { AlertTriangle, X, CheckCircle, Calendar, Clock, User, Building, FileText, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Issue } from '../../hooks/useIssues';

interface ViewIssueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
  onResolve?: (issue: Issue) => void;
  onUpdateStatus?: (issue: Issue) => void;
  canResolve: boolean;
}

export function ViewIssueDialog({ isOpen, onClose, issue, onResolve, onUpdateStatus, canResolve }: ViewIssueDialogProps) {
  if (!isOpen || !issue) return null;

  const statusConfig = {
    OPEN: {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      label: 'Open'
    },
    IN_PROGRESS: {
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      label: 'In Progress'
    },
    ON_HOLD: {
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      label: 'On Hold'
    },
    RESOLVED: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
      label: 'Resolved'
    },
    CLOSED: {
      icon: X,
      color: 'text-gray-600',
      bg: 'bg-gray-100',
      label: 'Closed'
    },
    CANCELLED: {
      icon: X,
      color: 'text-red-600',
      bg: 'bg-red-100',
      label: 'Cancelled'
    }
  };

  const config = statusConfig[issue.status as keyof typeof statusConfig] || statusConfig.OPEN;
  const StatusIcon = config.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${config.bg} rounded-lg`}>
              <StatusIcon className={`h-6 w-6 ${config.color}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-gray-900">Issue #{issue.id}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} font-medium`}>
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Reported: {formatDate(issue.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Asset and Reporter Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span>Asset Information</span>
                </h3>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">{issue.asset_name}</p>
                  <p className="text-xs text-gray-500">Asset ID: {issue.asset_id}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Reporter Information</span>
                </h3>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">{issue.reported_by}</p>
                  <p className="text-xs text-gray-500">Reported on: {formatDate(issue.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Issue Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span>Issue Description</span>
              </h3>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-700">{issue.description}</p>
              </div>
            </div>

            {/* Resolution Information (if resolved) */}
            {issue.status === 'RESOLVED' && issue.resolution && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Resolution</span>
                </h3>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-700">{issue.resolution}</p>
                  <div className="flex items-center space-x-2 mt-3 text-xs text-green-600">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Resolved on: {issue.resolved_at ? formatDate(issue.resolved_at) : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1 text-xs text-green-600">
                    <User className="h-3 w-3" />
                    <span>
                      Resolved by: {issue.resolved_by || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Owner Notes (if any and not resolved) */}
            {issue.status !== 'RESOLVED' && issue.owner_notes && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>Notes</span>
                </h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">{issue.owner_notes}</p>
                </div>
              </div>
            )}

            {/* Lease Information (if available) */}
            {issue.lease_at_time_of_report && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>Lease Information</span>
                </h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Renter: {issue.lease_at_time_of_report.renter_name || 'Unknown'}
                  </p>
                  {issue.lease_at_time_of_report.start_date && issue.lease_at_time_of_report.end_date && (
                    <p className="text-xs text-blue-700 mt-1">
                      Lease Period: {new Date(issue.lease_at_time_of_report.start_date).toLocaleDateString()} - {new Date(issue.lease_at_time_of_report.end_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Maintenance History */}
            {issue.asset_maintenance_history && issue.asset_maintenance_history.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Asset Maintenance History</span>
                </h3>
                <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                  {issue.asset_maintenance_history.map((historyItem: any, index: number) => (
                    <div key={index} className="relative">
                      <div className={`absolute -left-[25px] w-4 h-4 rounded-full border-2 border-white ${
                        historyItem.status === 'RESOLVED' 
                          ? 'bg-green-500' 
                          : historyItem.status === 'OPEN'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`}></div>
                      <div className="pl-4">
                        <p className="text-xs text-gray-500">
                          {historyItem.request_date ? formatDate(historyItem.request_date) : 'Unknown date'}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {historyItem.status} - Issue #{historyItem.id}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {historyItem.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Issue Timeline</span>
              </h3>
              <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
                  <div className="pl-4">
                    <p className="text-xs text-gray-500">{formatDate(issue.created_at)}</p>
                    <p className="text-sm font-medium text-gray-900">Issue Reported</p>
                    <p className="text-xs text-gray-600">by {issue.reported_by}</p>
                  </div>
                </div>
                
                {issue.status === 'RESOLVED' && issue.resolved_at && (
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    <div className="pl-4">
                      <p className="text-xs text-gray-500">{formatDate(issue.resolved_at)}</p>
                      <p className="text-sm font-medium text-gray-900">Issue Resolved</p>
                      <p className="text-xs text-gray-600">by {issue.resolved_by || 'Unknown'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            {canResolve && issue.status === 'OPEN' && onResolve && (
              <Button
                onClick={() => onResolve(issue)}
                className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Resolve Issue
              </Button>
            )}
            {canResolve && onUpdateStatus && (
              <Button
                onClick={() => onUpdateStatus(issue)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Status
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}