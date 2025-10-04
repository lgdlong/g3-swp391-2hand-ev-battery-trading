'use client';

import React, { useState } from 'react';

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
        <h3 className="text-sm font-semibold text-gray-900">Quãng đường di chuyển</h3>

        <div className="space-y-2">
          {[
            { value: '<300', label: 'Dưới 300km' },
            { value: '300-600', label: '300km - 600km' },
            { value: '>600', label: 'Trên 600km' }
          ].map((option) => (
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

