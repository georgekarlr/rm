import React, { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Alert } from '../../ui/Alert';
import { TabNavigation } from './TabNavigation';
import { ChangeUserTab } from './ChangeUserTab';
import { AddUserTab } from './AddUserTab';
import { DeleteUserTab } from './DeleteUserTab';
import { UserList } from './UserList';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { defaultUsers } from './constants';
import type { UserManagementProps, TabType } from './types';

export function UserManagement({ users, loading, onUserAdded }: UserManagementProps) {
  const { currentUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<TabType>('change');

  // Check if current user is admin
  const isAdmin = currentUser?.user_type === 'admin';

  // Combine default users with existing users, avoiding duplicates
  const allUsers = useMemo(() => {
    const existingNames = users.map(u => u.name.toLowerCase());
    const filteredDefaults = defaultUsers.filter(
      defaultUser => !existingNames.includes(defaultUser.name.toLowerCase())
    );
    return [...filteredDefaults, ...users];
  }, [users]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Reset to 'change' tab if current tab becomes unavailable due to permission change
  React.useEffect(() => {
    if (!isAdmin && (activeTab === 'add' || activeTab === 'delete')) {
      setActiveTab('change');
    }
  }, [isAdmin, activeTab]);

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'change':
        return <ChangeUserTab users={allUsers} loading={loading} />;
      case 'add':
        return isAdmin ? <AddUserTab users={allUsers} loading={loading} onUserAdded={onUserAdded} /> : null;
      case 'delete':
        return isAdmin ? <DeleteUserTab users={allUsers} loading={loading} onUserAdded={onUserAdded} /> : null;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          </div>
          {currentUser && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Current:</span>
              <span className="text-sm font-medium text-blue-600">
                {currentUser.name} ({currentUser.user_type})
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Admin Permission Notice */}
        {!isAdmin && (
          <Alert
            type="info"
            message={`You are logged in as ${currentUser?.user_type || 'viewer'}. Only admin users can add or delete users. You can change between existing users.`}
            className="mb-6"
          />
        )}

        {/* Admin Features Notice */}
        {isAdmin && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800">Admin Access</span>
            </div>
            <p className="text-sm text-purple-700 mt-1">
              As an admin, you can change users, add new leaser accounts, and delete existing users.
            </p>
          </div>
        )}

        {/* Segmented Navigation - Show all tabs for admin, only change for others */}
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          isAdmin={isAdmin}
        />

        {/* Current Users Display */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Available Users ({allUsers.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allUsers.map((user, index) => {
              const isCurrentUser = currentUser?.name === user.name && currentUser?.user_type === user.user_type;
              
              return (
                <div key={`${user.name}-${index}`} className={`flex items-center justify-between p-2 rounded-lg ${
                  isCurrentUser ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 bg-blue-100 rounded`}>
                      <Users className={`h-3 w-3 text-blue-600`} />
                    </div>
                    <span className="font-medium text-sm">
                      {user.name}
                      {isCurrentUser && <span className="text-green-600 ml-1">(Current)</span>}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 font-medium capitalize`}>
                    {user.user_type}
                  </span>
                </div>
              );
            })}
          </div>
          {allUsers.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No users found
            </div>
          )}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </CardContent>
    </Card>
  );
}