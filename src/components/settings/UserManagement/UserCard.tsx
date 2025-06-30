import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { userTypeConfig } from './constants';
import type { UserCardProps } from './types';

export function UserCard({ 
  user, 
  isSelected = false, 
  isCurrent = false, 
  onClick, 
  onDelete,
  showDeleteButton = false 
}: UserCardProps) {
  const config = userTypeConfig[user.user_type as keyof typeof userTypeConfig] || userTypeConfig.unknown;
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`p-3 border rounded-lg transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : isCurrent
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className={`p-1.5 ${config.bg} rounded-lg`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-medium">
              {user.name}
              {isCurrent && <span className="text-green-600 ml-2">(Current)</span>}
            </span>
            <p className="text-xs text-gray-500">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} font-medium`}>
            {config.label}
          </span>
          {showDeleteButton && onDelete && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}