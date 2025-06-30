import { CheckCircle, Clock, AlertTriangle, DollarSign } from 'lucide-react';

export const intervalStatusConfig = {
  upcoming: {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'Upcoming',
    borderColor: 'border-blue-200'
  },
  current: {
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    label: 'Current',
    borderColor: 'border-orange-200'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Completed',
    borderColor: 'border-green-200'
  },
  overdue: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Overdue',
    borderColor: 'border-red-200'
  }
};

export const paymentStatusConfig = {
  paid: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    label: 'Paid'
  },
  unpaid: {
    icon: DollarSign,
    color: 'text-red-600',
    bg: 'bg-red-50',
    label: 'Unpaid'
  },
  partial: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    label: 'Partial'
  }
};