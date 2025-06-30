import React, { useState } from 'react';
import { Plus, Lock, Key, Shield } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Alert } from '../../ui/Alert';
import { supabase } from '../../../lib/supabase';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import type { TabProps, FormData } from './types';

export function AddUserTab({ onUserAdded }: TabProps) {
  const { currentUser } = useCurrentUser();
  // Set leaser as default and only user type
  const [formData, setFormData] = useState<FormData>({ 
    name: '', 
    user_type: 'leaser', 
    password: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Check if current user is admin
  const isAdmin = currentUser?.user_type === 'admin';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      setMessage({ type: 'error', text: 'Only admin users can add new users' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      // Validate form data
      if (!formData.name.trim()) {
        setMessage({ type: 'error', text: 'Name is required' });
        return;
      }

      if (!formData.password) {
        setMessage({ type: 'error', text: 'Password is required for leaser users' });
        return;
      }

      // First, check if the add_rm_sub_user function exists
      const { data: functionExists } = await supabase.rpc('add_rm_sub_user', {
        p_name: 'test_function_check',
        p_password: 'test',
        p_user_type: 'test'
      }).then(
        () => ({ data: true }),
        (error) => {
          if (error.message.includes('function') && error.message.includes('does not exist')) {
            return { data: false };
          }
          return { data: true }; // Function exists but failed for other reasons
        }
      );

      if (!functionExists) {
        setMessage({ 
          type: 'error', 
          text: 'Database function is not available. Please contact your administrator.' 
        });
        return;
      }

      // Call the add_rm_sub_user function
      const { data, error } = await supabase.rpc('add_rm_sub_user', {
        p_name: formData.name.trim(),
        p_password: formData.password,
        p_user_type: 'leaser'
      });

      if (error) {
        console.error('Database function error:', error);
        
        // Handle specific database errors
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          setMessage({ 
            type: 'error', 
            text: 'Database function does not exist. Please contact your administrator.' 
          });
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          setMessage({ 
            type: 'error', 
            text: 'You do not have permission to add users.' 
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: error.message 
          });
        }
        return;
      }

      // The function returns a table with success and message columns
      if (data && data.length > 0) {
        const result = data[0];
        
        if (result.success) {
          setMessage({ 
            type: 'success', 
            text: result.message || `Leaser ${formData.name} added successfully` 
          });
          
          // Reset form (keep leaser as user_type)
          setFormData({ name: '', user_type: 'leaser', password: '' });
          
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
          // Function returned success: false
          setMessage({ 
            type: 'error', 
            text: result.message || 'Failed to add leaser user' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'No response received from database' });
      }
    } catch (error: any) {
      console.error('Error calling add_rm_sub_user:', error);
      
      // Provide more specific error messages based on common database errors
      let errorMessage = 'Failed to add leaser user';
      
      if (error.message) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          errorMessage = 'A user with this name already exists';
        } else if (error.message.includes('permission') || error.message.includes('access denied')) {
          errorMessage = 'You do not have permission to add users';
        } else if (error.message.includes('password') || error.message.includes('authentication')) {
          errorMessage = 'Invalid password provided';
        } else if (error.message.includes('function') || error.message.includes('does not exist')) {
          errorMessage = 'Database function is not available. Please contact your administrator.';
        } else if (error.message.includes('Could not ensure main RM account existence')) {
          errorMessage = 'Unable to verify subscription account. The user may still have been added successfully.';
          setMessage({ 
            type: 'warning', 
            text: `${errorMessage} Please refresh the page to see if the user was added.` 
          });
          
          // Try to refresh the user list anyway
          if (onUserAdded) {
            setTimeout(() => {
              onUserAdded();
            }, 1000);
          }
          return;
        } else {
          errorMessage = error.message;
        }
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show permission error if not admin
  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <Alert
          type="warning"
          title="Admin Access Required"
          message="Only admin users can add new leaser accounts. Please switch to an admin account to access this feature."
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
        message="You have admin permissions and can add new leaser accounts to the system."
      />

      {/* Info Alert for Leaser Only */}
      <Alert
        type="info"
        message="Only leaser users can be added. Leaser users can transact and manage rents."
      />

      {message && (
        <Alert
          type={message.type}
          message={message.text}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Leaser Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter the leaser's name"
          required
          className="focus:ring-green-500 focus:border-green-500"
        />
        
        {/* Display selected user type (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Type (Fixed)
          </label>
          <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Key className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-800">Leaser</p>
              <p className="text-sm text-green-600">Can transact and manage rents</p>
            </div>
            <div className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
              Only Available Type
            </div>
          </div>
        </div>

        {/* Password field - always required for leaser */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="h-4 w-4 text-gray-500" />
            <label className="block text-sm font-medium text-gray-700">
              Leaser Password
            </label>
          </div>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter the password for this leaser account"
            required
            className="focus:ring-green-500 focus:border-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            This password will be validated to create the leaser account.
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500" 
          loading={submitting}
          disabled={!formData.name.trim() || !formData.password}
        >
          <Plus className="w-4 h-4 mr-2" />
          {submitting ? 'Adding Leaser...' : 'Add Leaser Account'}
        </Button>
      </form>
    </div>
  );
}