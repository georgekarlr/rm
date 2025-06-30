import React, { useState } from 'react';
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { triggerRentersRefresh, type Renter } from '../../hooks/useRenters';

interface DeleteRenterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  renter: Renter | null;
}

export function DeleteRenterDialog({ isOpen, onClose, onSuccess, renter }: DeleteRenterDialogProps) {
  const { currentUser } = useCurrentUser();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDelete = async () => {
    if (!currentUser?.name) {
      setMessage({ type: 'error', text: 'Current user name is required' });
      return;
    }

    if (!renter) {
      setMessage({ type: 'error', text: 'No renter selected for deletion' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      console.log('🔄 Deleting renter:', {
        renterId: renter.id,
        username: currentUser.name
      });

      // Call the Supabase function to delete renter
      const { data, error } = await supabase.rpc('delete_renter_and_log', {
        p_renter_id: renter.id,
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
          // Show success message
          setMessage({ 
            type: 'success', 
            text: result.message || `Renter has been deleted successfully!` 
          });

          // Trigger global refresh to update all components
          triggerRentersRefresh();

          // Call success callback after a short delay
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1500);
        } else {
          // Function returned success: false
          setMessage({ 
            type: 'error', 
            text: result.message || 'Failed to delete renter' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unable to delete renter. Please try again.' });
      }

    } catch (error: any) {
      console.error('❌ Error deleting renter:', error);
      
      let errorMessage = 'Failed to delete renter';
      if (error.message) {
        if (error.message.includes('in use') || error.message.includes('cannot delete')) {
          errorMessage = 'Cannot delete renter that has active bookings or rental history';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to delete renters';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Renter not found or has already been deleted';
        } else {
          errorMessage = 'Unable to delete renter. Please try again.';
        }
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setMessage(null);
      onClose();
    }
  };

  if (!isOpen || !renter) return null;

  const fullName = `${renter.firstName} ${renter.middleName ? renter.middleName + ' ' : ''}${renter.lastName}`;
  const hasActiveRentals = renter.totalRentals && renter.totalRentals > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-auto max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Delete Renter</h2>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
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
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-800">
                  Deleting as: {currentUser?.name} ({currentUser?.user_type})
                </span>
              </div>
            </div>

            {/* Renter Info */}
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Renter to Delete</p>
                  <p className="text-lg font-semibold text-gray-900">{fullName}</p>
                  <p className="text-sm text-gray-600">{renter.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{renter.phoneNumber}</p>
                </div>
              </div>

              {/* Renter Stats */}
              {(renter.totalRentals !== undefined || renter.rating !== undefined) && (
                <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Renter Statistics</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {renter.totalRentals !== undefined && (
                      <div>
                        <span className="text-gray-600">Total Rentals:</span>
                        <span className="font-medium text-gray-900 ml-1">{renter.totalRentals}</span>
                      </div>
                    )}
                    {renter.rating !== undefined && (
                      <div>
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium text-gray-900 ml-1">{renter.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {hasActiveRentals && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Warning: This renter has rental history
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Warning Message */}
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">Permanent Deletion</h4>
                  <p className="text-sm text-red-700">
                    {hasActiveRentals 
                      ? `This will permanently delete the renter "${fullName}" who has ${renter.totalRentals} rental records. The system will handle any active bookings or relationships safely.`
                      : `This will permanently delete the renter "${fullName}". This action cannot be undone.`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className="mb-4">
                <Alert
                  type={message.type}
                  message={message.text}
                />
              </div>
            )}

            {/* Additional Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> The system will handle the deletion safely and return appropriate messages. 
                Any constraints or business rules will be enforced automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Actions - Fixed */}
        <div className="p-6 border-t border-gray-100 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
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
              onClick={handleDelete}
              loading={submitting}
              disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Renter
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}