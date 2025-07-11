import React from 'react';

interface UserInfoBannerProps {
  currentUser?: {
    name: string;
    user_type: string;
  } | null;
}

export function UserInfoBanner({ currentUser }: UserInfoBannerProps) {
  if (!currentUser) return null;

  return (
    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-sm font-medium text-red-800">
          Terminating lease as: {currentUser.name} ({currentUser.user_type})
        </span>
      </div>
    </div>
  );
}