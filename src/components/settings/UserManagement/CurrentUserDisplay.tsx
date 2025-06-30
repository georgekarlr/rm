import React from 'react';
import { Users } from 'lucide-react';
import { userTypeConfig } from './constants';
import type { RMUser } from '../../../types/subscription';

interface CurrentUserDisplayProps {
  currentUser: RMUser | null;
  isSubscribed?: boolean;
  isLifetime?: boolean;
}

export function CurrentUserDisplay({ currentUser, isSubscribed, isLifetime }: CurrentUserDisplayProps) {
  if (!currentUser) return null;

  const config = userTypeConfig[currentUser.user_type as keyof typeof userTypeConfig] || userTypeConfig.unknown;
  const Icon = config.icon;

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Users className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-blue-900">Current User: {currentUser.name}</p>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-blue-700 capitalize">Role: {currentUser.user_type}</p>
            {!isSubscribed && !isLifetime && currentUser.user_type === 'viewer' && (
              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                Unsubscribed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}