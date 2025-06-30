import { CreditCard, DollarSign, Landmark, Smartphone, Wallet } from 'lucide-react';
import type { PaymentMethodOption, PaymentTypeOption } from './types';

export const paymentMethods: PaymentMethodOption[] = [
  {
    value: 'CASH',
    label: 'Cash',
    icon: DollarSign
  },
  {
    value: 'CREDIT_CARD',
    label: 'Credit Card',
    icon: CreditCard
  },
  {
    value: 'BANK_TRANSFER',
    label: 'Bank Transfer',
    icon: Landmark
  },
  {
    value: 'MOBILE_PAYMENT',
    label: 'Mobile Payment',
    icon: Smartphone
  },
  {
    value: 'OTHER',
    label: 'Other',
    icon: Wallet
  }
];

export const paymentTypes: PaymentTypeOption[] = [
  {
    value: 'RENT',
    label: 'Rent Payment',
    description: 'Regular rent payment'
  },
  {
    value: 'DEPOSIT',
    label: 'Security Deposit',
    description: 'Security or damage deposit'
  },
  {
    value: 'UTILITIES',
    label: 'Utilities',
    description: 'Payment for utilities'
  },
  {
    value: 'LATE_FEE',
    label: 'Late Fee',
    description: 'Payment for late fees'
  },
  {
    value: 'MAINTENANCE',
    label: 'Maintenance',
    description: 'Payment for maintenance services'
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Other payment type'
  }
];

export const getDefaultTransactionDate = (): string => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

export const getPaymentMethodConfig = (method: string) => {
  return paymentMethods.find(m => m.value === method) || paymentMethods[0];
};

export const getPaymentTypeConfig = (type: string) => {
  return paymentTypes.find(t => t.value === type) || paymentTypes[0];
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};