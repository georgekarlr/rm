import { CheckCircle, Users, AlertTriangle, Clock } from 'lucide-react';
import type { LeaseStatusConfig } from './types';

export const leaseStatusConfig: Record<string, LeaseStatusConfig> = {
  active: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Active',
  },
  expired: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Expired',
  },
  terminated: {
    icon: Clock,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    label: 'Terminated',
  },
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    label: 'Pending',
  },
  ended: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Ended',
  },
  // Add a default case to handle any unexpected values
  default: {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'Unknown',
  }
};

export const financialStatusConfig: Record<string, LeaseStatusConfig> = {
  paid: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Paid',
  },
  overdue: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Overdue',
  },
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    label: 'Pending',
  },
  partial: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    label: 'Partial',
  },
  active: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Active',
  },
  // Add a default case to handle any unexpected values
  default: {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'Unknown',
  }
};