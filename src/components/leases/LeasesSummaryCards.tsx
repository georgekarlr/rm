import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Triangle as ExclamationTriangle 
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface LeaseStats {
  activeLeases: number;
  expiringSoonLeases: number;
  overduePayments: number;
  totalOutstandingBalance: number;
  totalOverdueBalance: number;
}

interface LeasesSummaryCardsProps {
  stats: LeaseStats;
  loading?: boolean;
}

export function LeasesSummaryCards({ stats, loading = false }: LeasesSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Active Leases</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.activeLeases}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0 ml-3">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Expiring Soon</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                {stats.expiringSoonLeases}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-full flex-shrink-0 ml-3">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Overdue Payments</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                {stats.overduePayments}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-red-100 rounded-full flex-shrink-0 ml-3">
              <ExclamationTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Outstanding Balance</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">
                ${stats.totalOutstandingBalance.toLocaleString()}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-orange-100 rounded-full flex-shrink-0 ml-3">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Overdue Balance</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                ${stats.totalOverdueBalance.toLocaleString()}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-red-100 rounded-full flex-shrink-0 ml-3">
              <ExclamationTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}