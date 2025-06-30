import React from 'react';
import { Users, Plus, Search, Filter, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useCurrentUser } from '../hooks/useCurrentUser';

const tenants = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    property: 'Sunset Apartments',
    unit: 'Apt 4B',
    rent: 1200,
    leaseEnd: '2024-12-31',
    status: 'active',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 987-6543',
    property: 'Oak Grove Complex',
    unit: 'Unit 12A',
    rent: 950,
    leaseEnd: '2024-08-15',
    status: 'active',
  },
  {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike.wilson@email.com',
    phone: '(555) 456-7890',
    property: 'Riverside Towers',
    unit: 'Tower B-301',
    rent: 1450,
    leaseEnd: '2025-03-20',
    status: 'active',
  },
];

export function TenantsPage() {
  const { currentUser } = useCurrentUser();
  
  // Check permissions based on current user type
  const canAddTenant = currentUser?.user_type === 'admin' || currentUser?.user_type === 'leaser';
  const canContact = currentUser?.user_type !== 'viewer';

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600">
            Manage your tenants and leases
            {currentUser && (
              <span className="ml-2 text-sm text-blue-600">
                ({currentUser.name} - {currentUser.user_type})
              </span>
            )}
          </p>
        </div>
        {canAddTenant && (
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </Button>
        )}
      </div>

      {/* Permission Notice */}
      {currentUser?.user_type === 'viewer' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Viewer Mode:</strong> You can view tenant information but cannot make changes or contact tenants.
          </p>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search tenants..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Tenants List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {tenant.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {tenant.property} - {tenant.unit}
                    </p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full capitalize flex-shrink-0">
                  {tenant.status}
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{tenant.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{tenant.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Rent</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${tenant.rent.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Lease Ends</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(tenant.leaseEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="sm" className="flex-1">
                  View Profile
                </Button>
                {canContact && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Contact
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}