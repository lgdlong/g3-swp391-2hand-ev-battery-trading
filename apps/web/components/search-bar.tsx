'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const locations = [
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Cần Thơ',
    'Hải Phòng',
    'An Giang',
    'Bà Rịa - Vũng Tàu',
    'Bạc Liêu',
    'Bắc Giang',
    'Bắc Kạn',
    'Bắc Ninh',
    'Bến Tre',
    'Bình Dương',
    'Bình Phước',
    'Bình Thuận',
    'Cà Mau',
    'Cao Bằng',
    'Đắk Lắk',
    'Đắk Nông',
    'Điện Biên',
    'Đồng Nai',
    'Đồng Tháp',
    'Gia Lai',
    'Hà Giang',
    'Hà Nam',
    'Hà Tĩnh',
    'Hải Dương',
    'Hậu Giang',
    'Hòa Bình',
    'Hưng Yên',
    'Khánh Hòa',
    'Kiên Giang',
    'Kon Tum',
    'Lai Châu',
    'Lâm Đồng',
    'Lạng Sơn',
    'Lào Cai',
    'Long An',
    'Nam Định',
    'Nghệ An',
    'Ninh Bình',
    'Ninh Thuận',
    'Phú Thọ',
    'Phú Yên',
    'Quảng Bình',
    'Quảng Nam',
    'Quảng Ngãi',
    'Quảng Ninh',
    'Quảng Trị',
    'Sóc Trăng',
    'Sơn La',
    'Tây Ninh',
    'Thái Bình',
    'Thái Nguyên',
    'Thanh Hóa',
    'Thừa Thiên Huế',
    'Tiền Giang',
    'Trà Vinh',
    'Tuyên Quang',
    'Vĩnh Long',
    'Vĩnh Phúc',
    'Yên Bái'
  ];

  const brands = [
    'Tesla',
    'BYD',
    'VinFast',
    'BMW',
    'Mercedes',
    'Audi',
    'Porsche',
    'Hyundai',
    'Kia',
    'Nissan',
    'Toyota',
    'Honda'
  ];


  const priceRanges = [
    { label: 'Dưới 50 triệu', min: '0', max: '50000000' },
    { label: '50-100 triệu', min: '50000000', max: '100000000' },
    { label: '100-200 triệu', min: '100000000', max: '200000000' },
    { label: '200-500 triệu', min: '200000000', max: '500000000' },
    { label: 'Trên 500 triệu', min: '500000000', max: '' }
  ];

  const handleSearch = () => {
    console.log('Search:', { searchQuery, selectedLocation, selectedBrand });
    // TODO: Implement search logic
  };


  const handlePriceRange = (priceTag: any) => {
    console.log('Price range:', priceTag);
    // TODO: Implement price range logic
  };


  // Handle click outside to close filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

          {/* Location Dropdown - New Approach */}
          <div className="border-l border-emerald-600 flex-shrink-0">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-40 h-full px-4 py-3 bg-transparent text-gray-700 focus:outline-none text-sm border-0 cursor-pointer"
            >
              <option value="">Chọn khu vực</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Button */}
          <div ref={filterRef} className="relative border-l border-emerald-600 flex-shrink-0 z-10">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="border-0 bg-transparent text-gray-700 hover:bg-[#7EF2DD] transition-colors duration-200 px-4 py-3 rounded-none h-full flex items-center gap-2"
            >
              <Filter className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium">Bộ lọc</span>
            </Button>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-emerald-600 rounded-xl shadow-lg z-20 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 bg-emerald-100 border-b border-emerald-600">
                  <h3 className="text-sm font-semibold text-gray-800">Bộ lọc tìm kiếm</h3>
                </div>

                <div className="p-4 space-y-4">
                  {/* Brand Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Hãng xe</label>
                    <div className="flex flex-wrap gap-2">
                      {brands.map((brand) => (
                        <button
                          key={brand}
                          onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                          className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 border ${
                            selectedBrand === brand
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border-emerald-300'
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Tags */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Khoảng giá</label>
                    <div className="flex flex-wrap gap-2">
                      {priceRanges.map((priceTag) => (
                        <button
                          key={priceTag.label}
                          onClick={() => handlePriceRange(priceTag)}
                          className="px-3 py-1 text-xs bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-full transition-colors duration-200 border border-emerald-300"
                        >
                          {priceTag.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedLocation('');
                        setSelectedBrand('');
                        setSearchQuery('');
                        setIsFilterOpen(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      Xóa bộ lọc
                    </Button>
                    <Button
                      onClick={() => setIsFilterOpen(false)}
                      size="sm"
                      className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

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
