import React, { useState } from 'react';
import { Trash2, AlertTriangle, Shield } from 'lucide-react';
import { Alert } from '../../ui/Alert';
import { Button } from '../../ui/Button';
import { UserList } from './UserList';
import { defaultUsers } from './constants';
import { supabase } from '../../../lib/supabase';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import type { TabProps, RMUser } from './types';

export function DeleteUserTab({ users, onUserAdded }: TabProps) {
  const { currentUser } = useCurrentUser();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Check if current user is admin
  const isAdmin = currentUser?.user_type === 'admin';

  const handleDeleteUser = async (user: RMUser) => {
    if (!isAdmin) {
      setMessage({ type: 'error', text: 'Only admin users can delete users' });
      return;
    }

    if (user.name === 'Everyone' || user.name === 'Owner') {
      setMessage({ type: 'error', text: 'Cannot delete default users (Everyone, Owner)' });
      return;
    }

    setDeleting(user.name);
    setMessage(null);

    try {
      // Call the delete_rm_sub_user function
      const { data, error } = await supabase.rpc('delete_rm_sub_user', {
        p_name: user.name
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }

      // Check the response from the function
      if (data && data.length > 0) {
        const result = data[0];
        if (result.success) {
          setMessage({ 
            type: 'success', 
            text: result.message || `User ${user.name} deleted successfully` 
          });
          
          // Call callback to refresh user list
          if (onUserAdded) {
            setTimeout(() => {
              onUserAdded();
            }, 500); // Small delay to ensure database is updated
          }
          
          // Clear success message after 5 seconds
          setTimeout(() => {
            setMessage(null);
          }, 5000);
          
        } else {
          setMessage({ 
            type: 'error', 
            text: result.message || `Failed to delete user ${user.name}` 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unexpected response from server' });
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      
      // Provide more specific error messages
      let errorMessage = 'An unexpected error occurred while deleting the user';
      if (error.message) {
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          errorMessage = 'User not found in the system';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to delete users';
        } else if (error.message.includes('cannot delete') || error.message.includes('protected')) {
          errorMessage = 'This user cannot be deleted (protected account)';
        } else {
          errorMessage = error.message;
        }
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setDeleting(null);
    }
  };

  const deletableUsers = users.filter(user => 
    !defaultUsers.some(defaultUser => 
      defaultUser.name === user.name && defaultUser.user_type === user.user_type
    )
  );

  // Show permission error if not admin
  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <Alert
          type="warning"
          title="Admin Access Required"
          message="Only admin users can delete users from the system. Please switch to an admin account to access this feature."
        />
        <div className="text-center py-8 text-gray-500">
          <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p>Admin permissions required</p>
          <p className="text-xs mt-1">Current user: {currentUser?.name} ({currentUser?.user_type})</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Admin Access Confirmation */}
      <Alert
        type="success"
        title="Admin Access Confirmed"
        message="You have admin permissions and can delete leaser users from the system."
      />

      {/* Warning Alert */}
      <Alert
        type="warning"
        title="Caution: User Deletion"
        message="Deleting a user is permanent and cannot be undone. The user will be removed from the system. Make sure you want to remove this user before proceeding."
      />

      {message && (
        <Alert
          type={message.type}
          message={message.text}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select User to Delete
        </label>
        
        {deletableUsers.length > 0 ? (
          <div className="space-y-2">
            {deletableUsers.map((user, index) => (
              <div
                key={`${user.name}-${index}`}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-900">{user.name}</span>
                    <span className="text-xs ml-2 px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium capitalize">
                      {user.user_type}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      This will permanently remove the user from the system
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                  onClick={() => handleDeleteUser(user)}
                  loading={deleting === user.name}
                  disabled={!!deleting}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {deleting === user.name ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p>No users available for deletion</p>
            <p className="text-xs mt-1">Default users (Everyone, Owner) cannot be deleted</p>
            <p className="text-xs mt-1">Only leaser users added through the system can be removed</p>
          </div>
        )}
      </div>
    </div>
  );
}