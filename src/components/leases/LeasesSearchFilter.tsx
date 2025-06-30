import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface LeasesSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick?: () => void;
  totalResults: number;
  filteredResults: number;
  onClearSearch: () => void;
}

export function LeasesSearchFilter({ 
  searchQuery, 
  onSearchChange, 
  onFilterClick,
  totalResults,
  filteredResults,
  onClearSearch
}: LeasesSearchFilterProps) {
  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search leases by renter, asset, or status..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {onFilterClick && (
          <Button variant="outline" className="w-full sm:w-auto" onClick={onFilterClick}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        )}
      </div>

      {/* Search Results Info */}
      {searchQuery.trim() && (
        <div className="text-sm text-gray-600">
          Showing {filteredResults} of {totalResults} leases
          {filteredResults !== totalResults && (
            <button 
              onClick={onClearSearch}
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}