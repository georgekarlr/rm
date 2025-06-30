import React, { useState } from 'react';
import { UserCheck, Lock } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Alert } from '../../ui/Alert';
import { CurrentUserDisplay } from './CurrentUserDisplay';
import { UserList } from './UserList';
import { userTypeConfig } from './constants';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { supabase } from '../../../lib/supabase';
import type { TabProps, FormData, ValidationResult, RMUser } from './types';

export function ChangeUserTab({ users }: TabProps) {
  const { currentUser, updateCurrentUser, isSubscribed, isLifetime } = useCurrentUser();
  const [selectedUser, setSelectedUser] = useState<RMUser | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', user_type: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validatePassword = async (userType: string, password: string, loginName?: string): Promise<ValidationResult> => {
    try {
      if (userType === 'admin') {
        const { data, error } = await supabase.rpc('validate_rm_account_password', {
          p_account_password: password
        });
        
        if (error) throw error;
        return data[0];
      } else if (userType === 'leaser') {
        const { data, error } = await supabase.rpc('validate_rm_local_user', {
          p_login_name: loginName || formData.name,
          p_login_password: password
        });
        
        if (error) throw error;
        return data[0];
      }
      
      // Viewer doesn't need password validation for changing users
      return { success: true, message: 'No password required for viewer role' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const handleUserSelect = (user: RMUser) => {
    setSelectedUser(user);
    setFormData({ name: user.name, user_type: user.user_type, password: '' });
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmitting(true);
    setMessage(null);

    try {
      // Only validate password if changing to admin or leaser
      if (selectedUser.user_type === 'admin' || selectedUser.user_type === 'leaser') {
        if (!formData.password) {
          setMessage({ type: 'error', text: 'Password is required for this user type' });
          return;
        }

        const validation = await validatePassword(selectedUser.user_type, formData.password, selectedUser.name);
        if (!validation.success) {
          setMessage({ type: 'error', text: validation.message });
          return;
        }
      }

      // Check if user is trying to select a non-viewer role without subscription
      if (!isSubscribed && !isLifetime && selectedUser.user_type !== 'viewer') {
        setMessage({ 
          type: 'error', 
          text: 'You need an active subscription to use non-viewer roles. The user will be set as a viewer until you subscribe.' 
        });
      }

      // Update current user - this will now persist across refreshes
      await updateCurrentUser(selectedUser);
      
      setMessage({ 
        type: 'success', 
        text: `Current user changed to ${selectedUser.name} (${selectedUser.user_type}). This change will persist across browser refreshes and page navigation.` 
      });

      // Reset form
      setFormData({ name: '', user_type: '', password: '' });
      setSelectedUser(null);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
      
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const requiresPassword = (userType: string) => {
    return userType === 'admin' || userType === 'leaser';
  };

  return (
    <div className="space-y-4">
      <CurrentUserDisplay currentUser={currentUser} isSubscribed={isSubscribed} isLifetime={isLifetime} />

      {/* Persistence Info */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <UserCheck className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-800">Data Persistence</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Your user selection is securely encrypted and stored locally. It will persist across browser refreshes, 
          page navigation, and browser sessions until you sign out or change users.
        </p>
      </div>

      {/* Subscription Warning */}
      {!isSubscribed && !isLifetime && (
        <Alert
          type="warning"
          title="Subscription Required for Full Access"
          message="Without an active subscription, you can only use the viewer role. Subscribe to Ceintelly to unlock admin and leaser roles."
        />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select User to Change To
        </label>
        <UserList
          users={users}
          currentUser={currentUser}
          onUserSelect={handleUserSelect}
          selectedUser={selectedUser}
        />
      </div>
      
      {selectedUser && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display selected user info (read-only) */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Selected User:</h4>
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${(userTypeConfig[selectedUser.user_type as keyof typeof userTypeConfig] || userTypeConfig.unknown).bg} rounded-lg`}>
                {React.createElement((userTypeConfig[selectedUser.user_type as keyof typeof userTypeConfig] || userTypeConfig.unknown).icon, {
                  className: `h-4 w-4 ${(userTypeConfig[selectedUser.user_type as keyof typeof userTypeConfig] || userTypeConfig.unknown).color}`
                })}
              </div>
              <div>
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-gray-600 capitalize">
                  {(userTypeConfig[selectedUser.user_type as keyof typeof userTypeConfig] || userTypeConfig.unknown).label} - {(userTypeConfig[selectedUser.user_type as keyof typeof userTypeConfig] || userTypeConfig.unknown).description}
                </p>
              </div>
            </div>
          </div>

          {requiresPassword(selectedUser.user_type) && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="h-4 w-4 text-gray-500" />
                <label className="block text-sm font-medium text-gray-700">
                  Password Required
                </label>
              </div>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder={`Enter ${selectedUser.user_type} password`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {selectedUser.user_type === 'admin' 
                  ? 'Enter the main account password'
                  : 'Enter the local user password'
                }
              </p>
            </div>
          )}

          {/* Subscription Warning for Non-Viewer Roles */}
          {!isSubscribed && !isLifetime && selectedUser.user_type !== 'viewer' && (
            <Alert
              type="warning"
              message="Without an active subscription, this user will be set as a viewer. Subscribe to use admin and leaser roles."
            />
          )}

          <Button type="submit" className="w-full" loading={submitting}>
            <UserCheck className="w-4 h-4 mr-2" />
            Change to {selectedUser.name}
          </Button>
        </form>
      )}

      {message && (
        <Alert
          type={message.type}
          message={message.text}
          className="mt-4"
        />
      )}
    </div>
  );
}