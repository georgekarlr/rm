import { DollarSign, Zap, Wrench, Car, Wifi, Shield, FileText, AlertTriangle } from 'lucide-react';
import type { ChargeCategoryOption } from './types';

export const chargeCategories: ChargeCategoryOption[] = [
  {
    value: 'rent',
    label: 'Rent Payment',
    description: 'Regular monthly or periodic rent charge',
    icon: DollarSign
  },
  {
    value: 'utilities',
    label: 'Utilities',
    description: 'Electricity, water, gas, internet charges',
    icon: Zap
  },
  {
    value: 'maintenance',
    label: 'Maintenance Fee',
    description: 'Repairs, cleaning, upkeep charges',
    icon: Wrench
  },
  {
    value: 'parking',
    label: 'Parking Fee',
    description: 'Parking space or garage charges',
    icon: Car
  },
  {
    value: 'internet',
    label: 'Internet/WiFi',
    description: 'Internet connectivity charges',
    icon: Wifi
  },
  {
    value: 'security',
    label: 'Security Deposit',
    description: 'Security or damage deposit',
    icon: Shield
  },
  {
    value: 'administrative',
    label: 'Administrative Fee',
    description: 'Processing, documentation fees',
    icon: FileText
  },
  {
    value: 'late_fee',
    label: 'Late Fee',
    description: 'Penalty for late payments',
    icon: AlertTriangle
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Custom or miscellaneous charges',
    icon: FileText
  }
];

export const getDefaultDueDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 30); // 30 days from now
  return date.toISOString().split('T')[0];
};

export const getCategoryConfig = (category: string) => {
  return chargeCategories.find(cat => cat.value === category) || chargeCategories[0];
};