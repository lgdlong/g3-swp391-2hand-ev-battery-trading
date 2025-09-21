'use client';

import React, { useState } from 'react';
import { Search, Filter, MapPin, Battery } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  const locations = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];

  const brands = ['Tesla', 'BYD', 'VinFast', 'Hyundai', 'Kia', 'BMW', 'Mercedes'];

  const handleSearch = () => {
    console.log('Search:', { searchQuery, selectedLocation, selectedBrand });
    // TODO: Implement search logic
  };

  return (
    <div className={`w-full relative overflow-hidden ${className}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5"></div>

      {/* Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-green-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -top-2 -right-4 w-40 h-40 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-lg animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-cyan-500/10 rounded-full blur-lg animate-pulse delay-700"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Main Search Input */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm pin EV, thương hiệu, model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 rounded-xl backdrop-blur-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="relative min-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60 z-10" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl backdrop-blur-sm appearance-none focus:bg-white/20 focus:border-white/40"
              >
                <option value="" className="bg-slate-800 text-white">
                  Tất cả địa điểm
                </option>
                {locations.map((location) => (
                  <option key={location} value={location} className="bg-slate-800 text-white">
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="relative min-w-[200px]">
              <Battery className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60 z-10" />
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl backdrop-blur-sm appearance-none focus:bg-white/20 focus:border-white/40"
              >
                <option value="" className="bg-slate-800 text-white">
                  Tất cả thương hiệu
                </option>
                {brands.map((brand) => (
                  <option key={brand} value={brand} className="bg-slate-800 text-white">
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl"
            >
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>

            {/* Advanced Filter Button */}
            <Button
              variant="outline"
              className="border-white/20 text-black hover:bg-white/10 hover:border-white/40 transition-all duration-300 px-4 py-3 rounded-xl"
            >
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
          </div>

          {/* Quick Search Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-white/70">Tìm kiếm nhanh:</span>
            {['Tesla Model 3', 'BYD Atto 3', 'VinFast VF8', 'Pin 60kWh', 'Pin 100kWh'].map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200"
                >
                  {tag}
                </button>
              ),
            )}
          </div>

          {/* Price Range Quick Tags */}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-sm text-white/70">Khoảng giá:</span>
            {[
              { label: 'Dưới 50 triệu', min: '0', max: '50000000' },
              { label: '50-100 triệu', min: '50000000', max: '100000000' },
              { label: '100-200 triệu', min: '100000000', max: '200000000' },
              { label: '200-500 triệu', min: '200000000', max: '500000000' },
              { label: 'Trên 500 triệu', min: '500000000', max: '' },
            ].map((priceTag) => (
              <button
                key={priceTag.label}
                onClick={() => {
                  // TODO: Implement price range logic
                  console.log('Price range:', priceTag);
                }}
                className="px-3 py-1 text-xs bg-gradient-to-r from-green-500/20 to-blue-500/20 hover:from-green-500/30 hover:to-blue-500/30 text-green-300 rounded-full transition-all duration-200 border border-green-500/30"
              >
                {priceTag.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
