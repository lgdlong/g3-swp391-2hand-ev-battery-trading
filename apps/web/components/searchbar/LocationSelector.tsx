'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { getProvinces } from '@/lib/tinhthanhpho';
import { Province } from '@/lib/tinhthanhpho';

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  className?: string;
}

export function LocationSelector({
  selectedLocation,
  onLocationChange,
  className,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Failed to fetch provinces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

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
              {loading ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">Đang tải...</div>
              ) : (
                provinces.map((province) => (
                  <div
                    key={province.code}
                    onClick={() => handleLocationChange(province.name)}
                    className={`px-3 py-2 text-sm rounded-xl cursor-pointer transition-colors ${
                      selectedLocation === province.name
                        ? 'bg-emerald-100 text-emerald-700 font-medium'
                        : 'text-gray-700 hover:bg-[#7EF2DD]/10'
                    }`}
                  >
                    {province.name}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop để đóng dropdown khi click bên ngoài */}
      {isOpen && <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
