import React from 'react';
import { AlertTriangle, Calendar, Clock, User, Building, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Issue } from '../../hooks/useIssues';

interface IssueCardProps {
  issue: Issue;
  canResolve: boolean;
  onResolve?: (issue: Issue) => void;
  onView: (issue: Issue) => void;
  onUpdateStatus?: (issue: Issue) => void;
}

export function IssueCard({ issue, canResolve, onResolve, onView, onUpdateStatus }: IssueCardProps) {
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
      icon: XCircle,
      color: 'text-gray-600',
      bg: 'bg-gray-100',
      label: 'Closed'
    },
    CANCELLED: {
      icon: XCircle,
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
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${config.bg} rounded-lg`}>
              <StatusIcon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">Issue #{issue.id}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} font-medium`}>
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Reported: {formatDate(issue.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Asset and Reporter Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Asset</p>
              <p className="text-sm font-medium text-gray-900">{issue.asset_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Reported By</p>
              <p className="text-sm font-medium text-gray-900">{issue.reported_by}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
          <p className="text-sm text-gray-700">{issue.description}</p>
        </div>

        {/* Resolution Info (if resolved) */}
        {issue.status === 'RESOLVED' && issue.resolution && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Resolved</p>
            </div>
            <p className="text-sm text-green-700">{issue.resolution}</p>
            <div className="flex items-center space-x-2 mt-2 text-xs text-green-600">
              <Calendar className="h-3 w-3" />
              <span>
                {issue.resolved_at ? formatDate(issue.resolved_at) : 'Unknown date'} by {issue.resolved_by || 'Unknown'}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button size="sm" className="flex-1" onClick={() => onView(issue)}>
            View Details
          </Button>
          {canResolve && issue.status === 'OPEN' && onResolve && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
              onClick={() => onResolve(issue)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Resolve
            </Button>
          )}
          {canResolve && onUpdateStatus && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
              onClick={() => onUpdateStatus(issue)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Update Status
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}