'use client';

import React, { useState } from 'react';

interface CyclesFilterDropdownProps {
  onApply: (cycles: string) => void;
  onClose: () => void;
  currentCycles?: string;
}

export function CyclesFilterDropdown({ onApply, onClose, currentCycles = '' }: CyclesFilterDropdownProps) {
  const [selectedCycles, setSelectedCycles] = useState(currentCycles);

  const cycles = [
    { value: '<1000', label: 'Dưới 1,000 chu kỳ' },
    { value: '1000-2000', label: '1,000 - 2,000 chu kỳ' },
    { value: '2000-3000', label: '2,000 - 3,000 chu kỳ' },
    { value: '3000-4000', label: '3,000 - 4,000 chu kỳ' },
    { value: '>4000', label: 'Trên 4,000 chu kỳ' }
  ];

  const handleApply = () => {
    onApply(selectedCycles);
    onClose();
  };

  const handleClear = () => {
    setSelectedCycles('');
    onApply('');
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-emerald-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Số chu kỳ</h3>

          <div className="space-y-2">
            {cycles.map((cycle) => (
              <label key={cycle.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="cycles"
                  value={cycle.value}
                  checked={selectedCycles === cycle.value}
                  onChange={(e) => setSelectedCycles(e.target.value)}
                  className="w-3 h-3 text-emerald-600"
                />
                <span className="text-sm text-gray-700">{cycle.label}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            
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
