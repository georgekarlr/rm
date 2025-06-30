import React from 'react';
import { DollarSign, AlertTriangle, TrendingUp, Calendar, Triangle as ExclamationTriangle } from 'lucide-react';
import type { LeaseFinancialSummaryProps } from './types';

export function LeaseFinancialSummary({ lease }: LeaseFinancialSummaryProps) {
  if (!lease) return null;

  const financialCards = [
    {
      title: 'Base Charge Amount',
      value: lease.base_charge_amount || 0,
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Outstanding Balance',
      value: lease.outstandingBalance || 0,
      icon: DollarSign,
      color: lease.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600',
      bg: lease.outstandingBalance > 0 ? 'bg-red-100' : 'bg-green-100',
      iconColor: lease.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      title: 'Overdue Balance',
      value: lease.overdueBalance || 0,
      icon: ExclamationTriangle,
      color: lease.overdueBalance > 0 ? 'text-red-600' : 'text-green-600',
      bg: lease.overdueBalance > 0 ? 'bg-red-100' : 'bg-green-100',
      iconColor: lease.overdueBalance > 0 ? 'text-red-600' : 'text-green-600'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <span>Financial Summary</span>
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {financialCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${card.bg} rounded-lg`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className={`text-xl font-bold ${card.color}`}>
                      ${card.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Payment Due */}
      {lease.nextPaymentDue && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Next Payment Due</p>
              <p className="text-lg font-semibold text-blue-700">
                {new Date(lease.nextPaymentDue).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Critical Alerts */}
      {lease.overdueBalance > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">Critical Payment Alert</p>
              <p className="text-sm text-red-700">
                ${lease.overdueBalance.toLocaleString()} in overdue payments requires immediate attention
              </p>
            </div>
          </div>
        </div>
      )}

      {lease.isExpiringSoon && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Lease Expiring Soon</p>
              <p className="text-sm text-yellow-700">
                This lease expires in {lease.daysUntilExpiry} days. Consider renewal options.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}