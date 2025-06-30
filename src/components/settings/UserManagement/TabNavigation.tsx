import React from 'react';
import { Edit, Plus, Trash2, Shield } from 'lucide-react';
import type { TabNavigationProps, TabType } from './types';

const tabs = [
  { id: 'change' as TabType, label: 'Change User', icon: Edit, adminOnly: false },
  { id: 'add' as TabType, label: 'Add User', icon: Plus, adminOnly: true },
  { id: 'delete' as TabType, label: 'Delete User', icon: Trash2, adminOnly: true },
];

interface ExtendedTabNavigationProps extends TabNavigationProps {
  isAdmin: boolean;
}

export function TabNavigation({ activeTab, onTabChange, isAdmin }: ExtendedTabNavigationProps) {
  // Filter tabs based on admin permissions
  const availableTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
      {availableTabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.adminOnly && (
              <Shield className="w-3 h-3 text-purple-500" title="Admin only" />
            )}
          </button>
        );
      })}
    </div>
  );
}