import React, { useState } from 'react';
import { CheckCircle, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { triggerIssuesRefresh } from '../../hooks/useIssues';
import type { Issue } from '../../hooks/useIssues';

interface ResolveIssueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  issue: Issue | null;
}

export function ResolveIssueDialog({ isOpen, onClose, onSuccess, issue }: ResolveIssueDialogProps) {
  const { currentUser } = useCurrentUser();
  const [resolution, setResolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.name) {
      setMessage({ type: 'error', text: 'Current user name is required' });
      return;
    }

    if (!issue) {
      setMessage({ type: 'error', text: 'No issue selected for resolution' });
      return;
    }

    if (!resolution.trim()) {
      setMessage({ type: 'error', text: 'Please provide a resolution description' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      console.log('🔄 Resolving issue:', {
        issueId: issue.id,
        resolution: resolution.trim(),
        username: currentUser.name
      });

      // Use the update_issue_status function instead of direct update
      const { data, error } = await supabase.rpc('update_issue_status', {
        p_issue_id: issue.id,
        p_new_status: 'RESOLVED',
        p_owner_notes: resolution.trim(),
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
          console.log('✅ Issue resolved successfully:', data);

          // Show success message
          setMessage({ 
            type: 'success', 
            text: result.message || `Issue #${issue.id} has been resolved successfully!` 
          });

          // Reset form
          setResolution('');

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
            text: result.message || 'Failed to resolve issue' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unable to resolve issue. Please try again.' });
      }
    } catch (error: any) {
      console.error('❌ Error resolving issue:', error);
      
      let errorMessage = 'Failed to resolve issue';
      if (error.message) {
        if (error.message.includes('issue') && error.message.includes('not found')) {
          errorMessage = 'Issue not found or has been deleted';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to resolve issues';
        } else if (error.message.includes('already resolved')) {
          errorMessage = 'This issue has already been resolved';
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
      setResolution('');
      setMessage(null);
      onClose();
    }
  };

  if (!isOpen || !issue) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Resolve Issue</h2>
              <p className="text-sm text-gray-600">Mark this issue as resolved</p>
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
        <div className="p-6">
          {/* Current User Info */}
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">
                Resolving as: {currentUser?.name} ({currentUser?.user_type})
              </span>
            </div>
          </div>

          {/* Issue Info */}
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Issue #{issue.id}</p>
            <p className="text-sm text-gray-600 mt-1">Asset: {issue.asset_name}</p>
            <p className="text-sm text-gray-600">Reported by: {issue.reported_by}</p>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-gray-700">{issue.description}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Description *
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe how the issue was resolved..."
                required
                disabled={submitting}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
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
                disabled={!resolution.trim() || submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Resolved
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> Provide details about how the issue was resolved, 
              what actions were taken, and any follow-up that might be needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}