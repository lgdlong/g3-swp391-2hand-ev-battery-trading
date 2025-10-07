'use client';

import React, { useState } from 'react';
import { CAPACITY_OPTIONS, DROPDOWN_TITLES } from '@/config/constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';

interface CapacityFilterDropdownProps {
  onApply: (capacity: string) => void;
  onClose: () => void;
  currentCapacity?: string;
}

export function CapacityFilterDropdown({
  onApply,
  onClose,
  currentCapacity = '',
}: CapacityFilterDropdownProps) {
  const [selectedCapacity, setSelectedCapacity] = useState(currentCapacity);

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
          <h3 className="text-sm font-semibold text-gray-900">{DROPDOWN_TITLES.CAPACITY}</h3>

          <div className="space-y-2">
            {CAPACITY_OPTIONS.map((capacity) => (
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

          <DropdownButtons onClear={handleClear} onCancel={onClose} onApply={handleApply} />
        </div>
      </div>
    </div>
  );
}
