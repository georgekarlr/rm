import React from 'react';
import { DashboardContent } from '../components/dashboard/DashboardContent';
import { useCurrentUser } from '../hooks/useCurrentUser';

export function DashboardPage() {
  const { currentUser } = useCurrentUser();

  return (
    <div>
      {/* Current User Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && currentUser && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Current User:</strong> {currentUser.name} ({currentUser.user_type})
          </p>
        </div>
      )}
      
      <DashboardContent />
    </div>
  );
}