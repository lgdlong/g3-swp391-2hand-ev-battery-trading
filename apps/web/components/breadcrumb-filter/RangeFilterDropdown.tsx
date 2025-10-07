'use client';

import React, { useState } from 'react';
import { RANGE_OPTIONS, DROPDOWN_TITLES } from '@/config/constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';

interface RangeFilterDropdownProps {
  onApply: (range: string) => void;
  onClose: () => void;
  currentRange?: string;
}

export function RangeFilterDropdown({ onApply, onClose, currentRange }: RangeFilterDropdownProps) {
  const [selectedRange, setSelectedRange] = useState(currentRange || '');

  const handleApply = () => {
    onApply(selectedRange);
    onClose();
  };

  const handleClear = () => {
    setSelectedRange('');
    onApply('');
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-emerald-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">{DROPDOWN_TITLES.RANGE}</h3>

          <div className="space-y-2">
            {RANGE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="range"
                  value={option.value}
                  checked={selectedRange === option.value}
                  onChange={(e) => setSelectedRange(e.target.value)}
                  className="w-3 h-3 text-blue-600"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>

          <DropdownButtons onClear={handleClear} onCancel={onClose} onApply={handleApply} />
        </div>
      </div>
    </div>
  );
}
