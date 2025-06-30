import React from 'react';
import { Building, Package, ChevronLeft, ChevronRight, Edit, Trash2, MoreVertical, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { AssetType } from '../../hooks/useAssetTypes';

interface HorizontalAssetTypesProps {
  assetTypes: AssetType[];
  loading: boolean;
  selectedAssetTypeId: number | null;
  onAssetTypeSelect: (id: number) => void;
  onEditAssetType?: (assetType: AssetType) => void;
  onDeleteAssetType?: (assetType: AssetType) => void;
  onAddAssetType?: () => void;
}

export function HorizontalAssetTypes({ 
  assetTypes, 
  loading, 
  selectedAssetTypeId, 
  onAssetTypeSelect,
  onEditAssetType,
  onDeleteAssetType,
  onAddAssetType
}: HorizontalAssetTypesProps) {
  const { currentUser } = useCurrentUser();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showActionsFor, setShowActionsFor] = React.useState<number | null>(null);

  // Check permissions
  const canEdit = currentUser?.user_type === 'admin';

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleActionClick = (e: React.MouseEvent, assetType: AssetType, action: 'edit' | 'delete') => {
    e.stopPropagation();
    setShowActionsFor(null);
    
    if (action === 'edit' && onEditAssetType) {
      onEditAssetType(assetType);
    } else if (action === 'delete' && onDeleteAssetType) {
      onDeleteAssetType(assetType);
    }
  };

  const toggleActions = (e: React.MouseEvent, assetTypeId: number) => {
    e.stopPropagation();
    setShowActionsFor(showActionsFor === assetTypeId ? null : assetTypeId);
  };

  // Close actions menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowActionsFor(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <div className="flex space-x-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 p-4 bg-white border border-gray-200 rounded-xl animate-pulse"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <div className="h-3 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                  <div className="h-5 bg-gray-200 rounded w-6 mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="h-3 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                  <div className="h-5 bg-gray-200 rounded w-6 mx-auto"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Left Scroll Button */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white shadow-lg border border-gray-200 rounded-full hover:bg-gray-50 transition-all duration-200 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
      >
        <ChevronLeft className="h-5 w-5 text-gray-600" />
      </button>

      {/* Right Scroll Button */}
      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white shadow-lg border border-gray-200 rounded-full hover:bg-gray-50 transition-all duration-200 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Add Asset Type Card */}
        {canEdit && onAddAssetType && (
          <div
            onClick={onAddAssetType}
            className="flex-shrink-0 w-64 p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center"
          >
            <div className="p-3 bg-blue-100 rounded-full mb-3">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-lg font-medium text-blue-600">Add Asset Type</p>
            <p className="text-sm text-gray-500 text-center mt-1">Create a new category for your assets</p>
          </div>
        )}

        {assetTypes.map((assetType) => {
          const availableCount = assetType.coalesce.filter(asset => asset.status === 'AVAILABLE').length;
          const totalCount = assetType.coalesce.length;
          const occupancyRate = totalCount > 0 ? Math.round(((totalCount - availableCount) / totalCount) * 100) : 0;
          const isSelected = selectedAssetTypeId === assetType.id;
          const showActions = showActionsFor === assetType.id;

          return (
            <div
              key={assetType.id}
              onClick={() => onAssetTypeSelect(assetType.id)}
              className={`relative flex-shrink-0 w-64 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Actions Menu Button */}
              {canEdit && (
                <div className="absolute top-2 right-2 z-20">
                  <button
                    onClick={(e) => toggleActions(e, assetType.id)}
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
                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-30">
                      <button
                        onClick={(e) => handleActionClick(e, assetType, 'edit')}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Edit className="h-4 w-4 text-orange-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => handleActionClick(e, assetType, 'delete')}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Building className={`h-6 w-6 ${
                    isSelected ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <h3 className={`font-semibold truncate ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {assetType.name}
                  </h3>
                  <p className={`text-sm ${
                    isSelected ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {totalCount} assets
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className={`text-xs uppercase tracking-wide font-medium ${
                    isSelected ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    Available
                  </p>
                  <p className={`text-lg font-bold ${
                    isSelected ? 'text-green-600' : 'text-green-600'
                  }`}>
                    {availableCount}
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-xs uppercase tracking-wide font-medium ${
                    isSelected ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    Occupancy
                  </p>
                  <p className={`text-lg font-bold ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {occupancyRate}%
                  </p>
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="mt-3 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="ml-2 text-xs font-medium text-blue-600">Selected</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}