'use client';

import React, { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  className?: string;
}

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

export function LocationSelector({ selectedLocation, onLocationChange, className }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLocationChange = (location: string) => {
    onLocationChange(location);
    setIsOpen(false);
  };

  return (
    <div className={`flex-shrink-0 relative ${className}`}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-44 h-10 px-4 py-2 bg-white text-gray-700 hover:bg-[#7EF2DD]/10 focus:outline-none text-sm border border-emerald-600 cursor-pointer flex items-center justify-between transition-all duration-200 group rounded-full shadow-sm"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
            <span className={selectedLocation ? 'text-gray-900 font-medium' : 'text-gray-500'}>
              {selectedLocation || 'Chọn khu vực'}
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-emerald-600 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-emerald-600 rounded-2xl shadow-lg z-20 max-h-64 overflow-y-auto">
            <div className="p-2">
              <div
                className="px-3 py-2 text-sm text-gray-500 hover:bg-[#7EF2DD]/10 rounded-xl cursor-pointer transition-colors"
                onClick={() => handleLocationChange('')}
              >
                Tất cả khu vực
              </div>
              {locations.map((location) => (
                <div
                  key={location}
                  onClick={() => handleLocationChange(location)}
                  className={`px-3 py-2 text-sm rounded-xl cursor-pointer transition-colors ${
                    selectedLocation === location
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'text-gray-700 hover:bg-[#7EF2DD]/10'
                  }`}
                >
                  {location}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop để đóng dropdown khi click bên ngoài */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
