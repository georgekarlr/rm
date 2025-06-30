import React from 'react';
import { Menu, Bell, User, Home, Shield, Eye, Key } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { User as AuthUser } from '../../types/auth';

interface HeaderProps {
  onMenuClick: () => void;
  user?: AuthUser | null;
}

const userTypeIcons = {
  viewer: Eye,
  leaser: Key,
  admin: Shield
};

const userTypeColors = {
  viewer: 'text-blue-600',
  leaser: 'text-green-600',
  admin: 'text-purple-600'
};

export function Header({ onMenuClick, user }: HeaderProps) {
  const { currentUser } = useCurrentUser();
  
  const UserTypeIcon = currentUser ? userTypeIcons[currentUser.user_type as keyof typeof userTypeIcons] : User;
  const userTypeColor = currentUser ? userTypeColors[currentUser.user_type as keyof typeof userTypeColors] : 'text-gray-600';

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button - only visible on small screens */}
            <Button
              variant="outline"
              size="sm"
              onClick={onMenuClick}
              className="bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-200 sm:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Logo - visible on mobile when nav is closed */}
            <Link to="/dashboard" className="flex items-center space-x-2 sm:hidden">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                RentManager
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-all duration-200 backdrop-blur-sm">
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white/50 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-200/50">
              <div className="hidden sm:block text-right">
                <div className="flex items-center space-x-1">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {currentUser?.name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  {currentUser && (
                    <UserTypeIcon className={`h-3 w-3 ${userTypeColor}`} title={`${currentUser.user_type} access`} />
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate max-w-32">
                  {currentUser ? `${currentUser.user_type} • ${user?.email}` : user?.email}
                </p>
              </div>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg">
                <UserTypeIcon className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}