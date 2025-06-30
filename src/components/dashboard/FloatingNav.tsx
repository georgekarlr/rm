import React from 'react';
import { 
  Home, 
  Building, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  X,
  Shield,
  Eye,
  Key,
  Package,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { CeintellyLogo } from '../CeintellyLogo';

interface FloatingNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Package, label: 'Asset Types', href: '/properties' },
  { icon: Users, label: 'Renters', href: '/renters' },
  { icon: FileText, label: 'Leases', href: '/leases' },
  { icon: AlertTriangle, label: 'Issues', href: '/issues' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

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

export function FloatingNav({ isOpen, onClose }: FloatingNavProps) {
  const location = useLocation();
  const { currentUser, isSubscribed, isLifetime } = useCurrentUser();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const UserTypeIcon = currentUser ? userTypeIcons[currentUser.user_type as keyof typeof userTypeIcons] : Shield;
  const userTypeColor = currentUser ? userTypeColors[currentUser.user_type as keyof typeof userTypeColors] : 'text-gray-600';

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Floating Navigation Drawer */}
      <div className={`
        fixed top-0 left-0 h-full w-80 z-50 transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="bg-white shadow-2xl border-r border-gray-200 h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <Link to="/dashboard" className="flex items-center space-x-3" onClick={onClose}>
              <CeintellyLogo width={40} height={40} />
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                RentManager
              </span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl transition-colors duration-200"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Current User Display */}
          {currentUser && (
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <UserTypeIcon className={`h-5 w-5 ${userTypeColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {currentUser.name}
                  </p>
                  <div className="flex items-center">
                    <p className="text-xs text-gray-600 capitalize">
                      {currentUser.user_type} access
                    </p>
                    {!isSubscribed && !isLifetime && currentUser.user_type === 'viewer' && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-sm">
                        Unsubscribed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || 
                  (item.href === '/properties' && location.pathname === '/assets');
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group
                      transform hover:scale-[1.02] active:scale-[0.98]
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-white/20 shadow-lg' 
                        : 'bg-gray-100 group-hover:bg-white group-hover:shadow-md'
                      }
                    `}>
                      <Icon className={`
                        h-5 w-5 transition-all duration-200
                        ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'}
                      `} />
                    </div>
                    <span className={`
                      font-semibold text-base transition-all duration-200
                      ${isActive ? 'text-white' : 'text-gray-900 group-hover:text-gray-900'}
                    `}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100">
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
              
              {/* Ceintelly Link */}
              <a 
                href="https://ceintelly.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors p-2"
              >
                <CeintellyLogo width={20} height={20} />
                <span>Powered by Ceintelly</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}