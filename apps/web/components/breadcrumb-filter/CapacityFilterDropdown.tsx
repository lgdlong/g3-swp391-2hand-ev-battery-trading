'use client';

import React, { useState } from 'react';

interface CapacityFilterDropdownProps {
  onApply: (capacity: string) => void;
  onClose: () => void;
  currentCapacity?: string;
}

export function CapacityFilterDropdown({ onApply, onClose, currentCapacity = '' }: CapacityFilterDropdownProps) {
  const [selectedCapacity, setSelectedCapacity] = useState(currentCapacity);

  const capacities = [
    { value: '<30', label: 'Dưới 30kWh' },
    { value: '30-50', label: '30kWh - 50kWh' },
    { value: '50-70', label: '50kWh - 70kWh' },
    { value: '70-100', label: '70kWh - 100kWh' },
    { value: '>100', label: 'Trên 100kWh' }
  ];

  const handleApply = () => {
    onApply(selectedCapacity);
    onClose();
  };

  const handleClear = () => {
    setSelectedCapacity('');
    onApply('');
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-emerald-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Dung lượng pin</h3>

          <div className="space-y-2">
            {capacities.map((capacity) => (
              <label key={capacity.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="capacity"
                  value={capacity.value}
                  checked={selectedCapacity === capacity.value}
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                  className="w-3 h-3 text-emerald-600"
                />
                <span className="text-sm text-gray-700">{capacity.label}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button
              onClick={handleClear}
              className="px-3 py-1 text-xs text-red-600 hover:text-red-800 transition-colors"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
