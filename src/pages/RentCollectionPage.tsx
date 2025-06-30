import React from 'react';
import { DollarSign, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useCurrentUser } from '../hooks/useCurrentUser';

const rentData = [
  {
    id: 1,
    tenant: 'John Doe',
    property: 'Sunset Apartments',
    unit: 'Apt 4B',
    amount: 1200,
    dueDate: '2024-01-01',
    status: 'paid',
    paidDate: '2023-12-28',
  },
  {
    id: 2,
    tenant: 'Sarah Johnson',
    property: 'Oak Grove Complex',
    unit: 'Unit 12A',
    amount: 950,
    dueDate: '2024-01-01',
    status: 'overdue',
    daysPastDue: 5,
  },
  {
    id: 3,
    tenant: 'Mike Wilson',
    property: 'Riverside Towers',
    unit: 'Tower B-301',
    amount: 1450,
    dueDate: '2024-01-01',
    status: 'pending',
  },
];

const statusConfig = {
  paid: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Paid',
  },
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    label: 'Pending',
  },
  overdue: {
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Overdue',
  },
};

export function RentCollectionPage() {
  const { currentUser } = useCurrentUser();
  
  const totalRent = rentData.reduce((sum, rent) => sum + rent.amount, 0);
  const paidRent = rentData.filter(rent => rent.status === 'paid').reduce((sum, rent) => sum + rent.amount, 0);
  const overdueRent = rentData.filter(rent => rent.status === 'overdue').reduce((sum, rent) => sum + rent.amount, 0);

  // Check permissions based on current user type
  const canMarkPaid = currentUser?.user_type === 'admin' || currentUser?.user_type === 'leaser';

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rent Collection</h1>
        <p className="text-gray-600">
          Track and manage rent payments
          {currentUser && (
            <span className="ml-2 text-sm text-blue-600">
              ({currentUser.name} - {currentUser.user_type})
            </span>
          )}
        </p>
      </div>

      {/* Permission Notice */}
      {currentUser?.user_type === 'viewer' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Viewer Mode:</strong> You can view rent collection data but cannot mark payments as paid.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Expected</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  ${totalRent.toLocaleString()}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0 ml-3">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Collected</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  ${paidRent.toLocaleString()}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0 ml-3">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Overdue</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  ${overdueRent.toLocaleString()}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 rounded-full flex-shrink-0 ml-3">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rent Collection Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">January 2024 Rent Collection</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rentData.map((rent) => {
              const config = statusConfig[rent.status as keyof typeof statusConfig];
              const Icon = config.icon;

              return (
                <div key={rent.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div className={`p-2 ${config.bg} rounded-full flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 truncate">{rent.tenant}</h3>
                      <p className="text-sm text-gray-600 truncate">
                        {rent.property} - {rent.unit}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="text-center sm:text-right">
                      <p className="font-semibold text-gray-900">
                        ${rent.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(rent.dueDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.color} whitespace-nowrap`}>
                        {config.label}
                        {rent.status === 'overdue' && ` (${rent.daysPastDue} days)`}
                      </span>
                      {rent.status !== 'paid' && canMarkPaid && (
                        <Button size="sm" className="w-full sm:w-auto">
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}