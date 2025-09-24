'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocationSelector } from './LocationSelector';
import { FilterDropdown } from './FilterDropdown';

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = () => {
    console.log('Search:', { searchQuery, selectedLocation, selectedBrand });
    // TODO: Implement search logic
  };

  const handlePriceRange = (priceTag: any) => {
    console.log('Price range:', priceTag);
    // TODO: Implement price range logic
  };

  const handleClearFilters = () => {
    setSelectedLocation('');
    setSelectedBrand('');
    setSearchQuery('');
    setIsFilterOpen(false);
  };

  return (
    <div className={`w-full relative overflow-visible z-10 ${className}`}>
      {/* Clean Background */}
      <div className="absolute inset-0 bg-[#7EF2DD]/20"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center bg-white border border-emerald-600 rounded-xl shadow-sm h-12 relative z-10">
            {/* Search Input */}
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-600" />
              <Input
                type="text"
                placeholder="Tìm kiếm pin EV, thương hiệu, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-transparent border-0 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 text-sm h-full"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Location Dropdown */}
            <LocationSelector
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
            />

            {/* Filter Dropdown */}
            <FilterDropdown
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
              onClose={() => setIsFilterOpen(false)}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              onPriceRangeSelect={handlePriceRange}
              onClearFilters={handleClearFilters}
            />

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm hover:shadow-md transition-colors duration-200 px-6 py-3 rounded-none rounded-r-xl text-sm font-semibold h-full flex-shrink-0"
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export individual components for potential reuse
export { LocationSelector } from './LocationSelector';
export { BrandFilter } from './BrandFilter';
export { PriceFilter } from './PriceFilter';
export { FilterDropdown } from './FilterDropdown';
