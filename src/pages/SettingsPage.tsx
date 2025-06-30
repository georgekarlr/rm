import React from 'react';
import { SubscriptionCard } from '../components/settings/SubscriptionCard';
import { UserManagement } from '../components/settings/UserManagement';
import { useSubscription } from '../hooks/useSubscription';
import { ExternalLink } from 'lucide-react';

export function SettingsPage() {
  const { subscriptionData, subscriptionStatus, loading, error, refetch } = useSubscription();

  const handleUserAdded = () => {
    // Refresh subscription data to get updated user list
    refetch();
  };

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your subscription and users</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">Error loading subscription data: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* User Management - Takes up 2/3 of the space */}
        <div className="xl:col-span-2">
          <UserManagement 
            users={subscriptionData?.rm_users || []} 
            loading={loading}
            onUserAdded={handleUserAdded}
          />
        </div>

        {/* Subscription Card - Takes up 1/3 of the space */}
        <div className="space-y-6">
          <SubscriptionCard 
            subscriptionStatus={subscriptionStatus}
            loading={loading}
          />
          
          {/* Ceintelly Information Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-3">Ceintelly Services</h3>
            <p className="mb-4 text-white/90">
              Access premium features and support for your rent management needs with Ceintelly.
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <span>Priority customer support</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <span>Advanced reporting tools</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <span>Unlimited asset management</span>
              </li>
            </ul>
            <a 
              href="https://ceintelly.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-white font-medium hover:text-blue-100 transition-colors"
            >
              <span>Learn more about Ceintelly</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}