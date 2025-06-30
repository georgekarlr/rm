import { Eye, Shield, Key, User } from 'lucide-react';
import type { RMUser } from '../../../types/subscription';

export const defaultUsers: RMUser[] = [
  { name: 'Everyone', user_type: 'viewer' },
  { name: 'Owner', user_type: 'admin' }
];

export const userTypeConfig = {
  viewer: {
    icon: Eye,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'Viewer',
    description: 'Can only view data'
  },
  leaser: {
    icon: Key,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Leaser',
    description: 'Can transact and manage rents'
  },
  admin: {
    icon: Shield,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    label: 'Admin',
    description: 'Full access to all features'
  },
  unknown: {
    icon: User,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    label: 'Unknown',
    description: 'Unknown user type'
  }
};