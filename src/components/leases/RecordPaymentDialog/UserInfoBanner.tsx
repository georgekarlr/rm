import React from 'react';
import type { UserInfoBannerProps } from './types';

export function UserInfoBanner({ currentUser }: UserInfoBannerProps) {
  if (!currentUser) return null;

  return (
    <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="text-sm font-medium text-blue-800">
          Recording payment as: {currentUser.name} ({currentUser.user_type})
        </span>
      </div>
    </div>
  );
}