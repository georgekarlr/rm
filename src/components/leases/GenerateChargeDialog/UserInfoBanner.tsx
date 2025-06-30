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
    <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium text-green-800">
          Generating charge as: {currentUser.name} ({currentUser.user_type})
        </span>
      </div>
    </div>
  );
}