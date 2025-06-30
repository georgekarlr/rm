import React, { useState } from 'react';
import { RefreshCw, X, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { triggerIssuesRefresh } from '../../hooks/useIssues';
import type { Issue } from '../../hooks/useIssues';

interface UpdateIssueStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  issue: Issue | null;
}

export function UpdateIssueStatusDialog({ isOpen, onClose, onSuccess, issue }: UpdateIssueStatusDialogProps) {
  const { currentUser } = useCurrentUser();
  const [newStatus, setNewStatus] = useState<string>('');
  const [ownerNotes, setOwnerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reset form when dialog opens or issue changes
  React.useEffect(() => {
    if (isOpen && issue) {
      setNewStatus(issue.status || 'OPEN');
      setOwnerNotes(issue.owner_notes || '');
      setMessage(null);
    }
  }, [isOpen, issue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.name) {
      setMessage({ type: 'error', text: 'Current user name is required' });
      return;
    }

    if (!issue) {
      setMessage({ type: 'error', text: 'No issue selected for status update' });
      return;
    }

    if (!newStatus) {
      setMessage({ type: 'error', text: 'Please select a new status' });
      return;
    }

    // If status is the same, check if notes have changed
    if (newStatus === issue.status && ownerNotes === issue.owner_notes) {
      setMessage({ type: 'error', text: 'No changes detected. Please change the status or notes.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      console.log('🔄 Updating issue status:', {
        issueId: issue.id,
        newStatus,
        ownerNotes: ownerNotes.trim(),
        username: currentUser.name
      });

      // Call the Supabase function to update issue status
      const { data, error } = await supabase.rpc('update_issue_status', {
        p_issue_id: issue.id,
        p_new_status: newStatus,
        p_owner_notes: ownerNotes.trim(),
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
          console.log('✅ Issue status updated successfully:', data);

          // Show success message
          setMessage({ 
            type: 'success', 
            text: result.message || `Issue status has been updated to ${newStatus} successfully!` 
          });

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
            text: result.message || 'Failed to update issue status' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unable to update issue status. Please try again.' });
      }

    } catch (error: any) {
      console.error('❌ Error updating issue status:', error);
      
      let errorMessage = 'Failed to update issue status';
      if (error.message) {
        if (error.message.includes('issue') && error.message.includes('not found')) {
          errorMessage = 'Issue not found or has been deleted';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to update issue status';
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
      setNewStatus('');
      setOwnerNotes('');
      setMessage(null);
      onClose();
    }
  };

  if (!isOpen || !issue) return null;

  const statusOptions = [
    { value: 'OPEN', label: 'Open', description: 'Issue has been reported but not yet addressed' },
    { value: 'IN_PROGRESS', label: 'In Progress', description: 'Work has begun on resolving the issue' },
    { value: 'ON_HOLD', label: 'On Hold', description: 'Issue resolution is temporarily paused' },
    { value: 'RESOLVED', label: 'Resolved', description: 'Issue has been fixed or addressed' },
    { value: 'CLOSED', label: 'Closed', description: 'Issue has been permanently closed' },
    { value: 'CANCELLED', label: 'Cancelled', description: 'Issue was cancelled or deemed invalid' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ON_HOLD': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg mx-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Update Issue Status</h2>
              <p className="text-sm text-gray-600">Change the status of issue #{issue.id}</p>
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
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">
                  Updating as: {currentUser?.name} ({currentUser?.user_type})
                </span>
              </div>
            </div>

            {/* Issue Info */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Issue #{issue.id}</p>
                  <p className="text-sm text-gray-600">Asset: {issue.asset_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Current Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-700">{issue.description}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Change Warning */}
              {newStatus !== issue.status && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      You are changing the status from {issue.status} to {newStatus}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={ownerNotes}
                  onChange={(e) => setOwnerNotes(e.target.value)}
                  placeholder="Add notes about this status change..."
                  disabled={submitting}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide context about why the status is being changed
                </p>
              </div>

              {/* Message */}
              {message && (
                <Alert
                  type={message.type}
                  message={message.text}
                />
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
                  loading={submitting}
                  disabled={
                    (newStatus === issue.status && ownerNotes === issue.owner_notes) || 
                    submitting
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Update Status
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Status Descriptions:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {statusOptions.map(option => (
                  <li key={option.value}>• <strong>{option.label}:</strong> {option.description}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}