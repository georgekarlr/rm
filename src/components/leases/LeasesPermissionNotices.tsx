import React from 'react';

interface LeasesPermissionNoticesProps {
  userType?: string;
  canEdit: boolean;
}

export function LeasesPermissionNotices({ userType, canEdit }: LeasesPermissionNoticesProps) {
  return (
    <>
      {/* Permission Notice */}
      {userType === 'viewer' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Viewer Mode:</strong> You can view lease information but cannot create or renew leases.
          </p>
        </div>
      )}

      {/* Admin/Leaser Features Notice */}
      {canEdit && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Edit Access:</strong> You can view and edit leases using the menu button (⋮) on each lease card.
          </p>
        </div>
      )}
    </>
  );
}