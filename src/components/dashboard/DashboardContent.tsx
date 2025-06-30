import React from 'react';
import { 
  TrendingUp, 
  Building, 
  Users, 
  DollarSign,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';

const stats = [
  {
    title: 'Total Properties',
    value: '12',
    change: '+2',
    changeType: 'positive' as const,
    icon: Building,
  },
  {
    title: 'Active Tenants',
    value: '28',
    change: '+3',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    title: 'Monthly Revenue',
    value: '$24,500',
    change: '+12%',
    changeType: 'positive' as const,
    icon: DollarSign,
  },
  {
    title: 'Occupancy Rate',
    value: '94%',
    change: '+5%',
    changeType: 'positive' as const,
    icon: TrendingUp,
  },
];

const recentActivity = [
  {
    type: 'payment',
    description: 'Payment received from John Doe',
    amount: '$1,200',
    time: '2 hours ago',
  },
  {
    type: 'lease',
    description: 'New lease signed for Apt 4B',
    amount: '$1,500/mo',
    time: '5 hours ago',
  },
  {
    type: 'maintenance',
    description: 'Maintenance request submitted',
    amount: 'Property A',
    time: '1 day ago',
  },
];

export function DashboardContent() {
  return (
    <div className="py-6 space-y-6 sm:space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1 truncate">
                      {stat.title}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0 ml-3">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center">
                  <span className="text-sm font-medium text-green-600">
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1 truncate">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0 ml-2">
                    {activity.amount}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Lease renewal due
                  </p>
                  <p className="text-xs text-gray-500">Unit 3A - Due in 5 days</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Property inspection
                  </p>
                  <p className="text-xs text-gray-500">Building B - Tomorrow 2:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Rent collection
                  </p>
                  <p className="text-xs text-gray-500">Monthly reports ready</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}