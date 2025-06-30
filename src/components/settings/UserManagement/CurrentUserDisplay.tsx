import React from 'react';
import { Users } from 'lucide-react';
import { userTypeConfig } from './constants';
import type { CurrentUserDisplayProps } from './types';

export function CurrentUserDisplay({ currentUser }: CurrentUserDisplayProps) {
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
          <p className="text-sm text-blue-700 capitalize">Role: {currentUser.user_type}</p>
        </div>
      </div>
    </div>
  );
}