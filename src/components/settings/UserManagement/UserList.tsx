import React from 'react';
import { UserCard } from './UserCard';
import type { UserListProps } from './types';

export function UserList({ 
  users, 
  currentUser, 
  onUserSelect, 
  selectedUser, 
  showDeleteButtons = false,
  onUserDelete 
}: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No users found
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {users.map((user, index) => {
        const isCurrentUser = currentUser?.name === user.name && currentUser?.user_type === user.user_type;
        const isSelected = selectedUser?.name === user.name && selectedUser?.user_type === user.user_type;
        const canDelete = user.name !== 'Everyone' && user.name !== 'Owner';

        return (
          <UserCard
            key={`${user.name}-${index}`}
            user={user}
            isSelected={isSelected}
            isCurrent={isCurrentUser}
            onClick={onUserSelect ? () => onUserSelect(user) : undefined}
            onDelete={showDeleteButtons && canDelete && onUserDelete ? () => onUserDelete(user) : undefined}
            showDeleteButton={showDeleteButtons && canDelete}
          />
        );
      })}
    </div>
  );
}