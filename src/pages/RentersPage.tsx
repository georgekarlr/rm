import React, { useState } from 'react';
import { UserPlus, Plus, Search, Filter, Phone, Mail, MessageCircle, Star, Edit, Trash2, MoreVertical, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AddRenterDialog } from '../components/renters/AddRenterDialog';
import { EditRenterDialog } from '../components/renters/EditRenterDialog';
import { DeleteRenterDialog } from '../components/renters/DeleteRenterDialog';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useRenters, triggerRentersRefresh, type Renter } from '../hooks/useRenters';

const statusConfig = {
  active: {
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Active',
  },
  inactive: {
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    label: 'Inactive',
  },
  suspended: {
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Suspended',
  },
};

interface RenterCardProps {
  renter: Renter;
  canEdit: boolean;
  onEdit: (renter: Renter) => void;
  onDelete: (renter: Renter) => void;
}

function RenterCard({ renter, canEdit, onEdit, onDelete }: RenterCardProps) {
  const [showActions, setShowActions] = useState(false);
  const config = statusConfig[renter.status as keyof typeof statusConfig] || statusConfig.active;
  const fullName = `${renter.firstName} ${renter.middleName ? renter.middleName + ' ' : ''}${renter.lastName}`;

  const handleActionClick = (action: 'edit' | 'delete') => {
    setShowActions(false);
    if (action === 'edit') {
      onEdit(renter);
    } else if (action === 'delete') {
      onDelete(renter);
    }
  };

  // Close actions menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowActions(false);
    if (showActions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActions]);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 relative">
      <CardContent className="p-6">
        {/* Actions Menu Button */}
        {canEdit && (
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                showActions 
                  ? 'bg-gray-200 text-gray-700' 
                  : 'bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              } shadow-sm border border-gray-200`}
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* Actions Dropdown */}
            {showActions && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-20">
                <button
                  onClick={() => handleActionClick('edit')}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4 text-orange-500" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleActionClick('delete')}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3 pr-8">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {fullName}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} font-medium`}>
                  {config.label}
                </span>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < renter.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">({renter.rating})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{renter.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span>{renter.phoneNumber}</span>
          </div>
          {renter.socialMedia && renter.socialMedia.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MessageCircle className="h-4 w-4 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {renter.socialMedia.map((social: any, index: number) => (
                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {social.platform}: {social.handle}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Rentals</p>
            <p className="text-lg font-semibold text-gray-900">{renter.totalRentals}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(renter.joinDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Other Info */}
        {renter.otherInfo && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-gray-700">{renter.otherInfo}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button size="sm" className="flex-1">
            View Profile
          </Button>
          {canEdit && (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(renter)}>
              Quick Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RentersPage() {
  const { currentUser } = useCurrentUser();
  const { renters, loading, error, getRenterStats, refetch } = useRenters();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRenter, setSelectedRenter] = useState<Renter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Check permissions based on current user type
  const canAddRenter = currentUser?.user_type === 'admin' || currentUser?.user_type === 'leaser';
  const canEdit = currentUser?.user_type === 'admin' || currentUser?.user_type === 'leaser';

  // Get stats
  const stats = getRenterStats();

  // Filter renters based on search query
  const filteredRenters = searchQuery.trim() 
    ? renters.filter(renter => {
        const query = searchQuery.toLowerCase();
        const fullName = `${renter.firstName} ${renter.middleName} ${renter.lastName}`.toLowerCase();
        return fullName.includes(query) || 
               renter.email.toLowerCase().includes(query) ||
               renter.phoneNumber.includes(searchQuery);
      })
    : renters;

  const handleRenterAdded = () => {
    // Trigger global refresh to update all components
    triggerRentersRefresh();
    console.log('✅ Renter added - data will refresh automatically');
  };

  const handleRenterUpdated = () => {
    // Trigger global refresh to update all components
    triggerRentersRefresh();
    console.log('✅ Renter updated - data will refresh automatically');
  };

  const handleRenterDeleted = () => {
    // Trigger global refresh to update all components
    triggerRentersRefresh();
    console.log('✅ Renter deleted - data will refresh automatically');
  };

  const handleEditRenter = (renter: Renter) => {
    setSelectedRenter(renter);
    setShowEditDialog(true);
  };

  const handleDeleteRenter = (renter: Renter) => {
    setSelectedRenter(renter);
    setShowDeleteDialog(true);
  };

  if (loading) {
    return (
      <div className="py-6 space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Renters</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Renters</h1>
          <p className="text-gray-600">
            Manage your renter database and profiles
            {currentUser && (
              <span className="ml-2 text-sm text-blue-600">
                ({currentUser.name} - {currentUser.user_type})
              </span>
            )}
          </p>
        </div>
        {canAddRenter && (
          <Button 
            className="w-full sm:w-auto"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Renter
          </Button>
        )}
      </div>

      {/* Permission Notice */}
      {currentUser?.user_type === 'viewer' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Viewer Mode:</strong> You can view renter information but cannot make changes or add new renters.
          </p>
        </div>
      )}

      {/* Admin/Leaser Features Notice */}
      {canEdit && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Edit Access:</strong> You can edit and delete renters using the menu button (⋮) on each renter card.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Renters</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRenters}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Renters</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeRenters}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Rentals</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalRentals}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserPlus className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search renters by name, email, or phone..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Search Results Info */}
      {searchQuery.trim() && (
        <div className="text-sm text-gray-600">
          Showing {filteredRenters.length} of {renters.length} renters
          {filteredRenters.length !== renters.length && (
            <button 
              onClick={() => setSearchQuery('')}
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Renters Grid */}
      {filteredRenters.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRenters.map((renter) => (
            <RenterCard
              key={renter.id}
              renter={renter}
              canEdit={canEdit}
              onEdit={handleEditRenter}
              onDelete={handleDeleteRenter}
            />
          ))}
        </div>
      ) : searchQuery.trim() ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Renters Found</h3>
              <p className="text-gray-600 mb-4">
                No renters match your search criteria. Try adjusting your search terms.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Renters Found</h3>
              <p className="text-gray-600 mb-4">
                No renters have been added yet. Start by adding your first renter.
              </p>
              {canAddRenter && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Renter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Renter Dialog */}
      <AddRenterDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={handleRenterAdded}
      />

      {/* Edit Renter Dialog */}
      <EditRenterDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedRenter(null);
        }}
        onSuccess={handleRenterUpdated}
        renter={selectedRenter}
      />

      {/* Delete Renter Dialog */}
      <DeleteRenterDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedRenter(null);
        }}
        onSuccess={handleRenterDeleted}
        renter={selectedRenter}
      />
    </div>
  );
}