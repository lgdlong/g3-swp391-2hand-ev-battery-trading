'use client';

import React, { useState } from 'react';
import { CYCLES_OPTIONS, DROPDOWN_TITLES } from '@/config/constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';

interface CyclesFilterDropdownProps {
  onApply: (cycles: string) => void;
  onClose: () => void;
  currentCycles?: string;
}

export function CyclesFilterDropdown({
  onApply,
  onClose,
  currentCycles = '',
}: CyclesFilterDropdownProps) {
  const [selectedCycles, setSelectedCycles] = useState(currentCycles);

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
          <h3 className="text-sm font-semibold text-gray-900">{DROPDOWN_TITLES.CYCLES}</h3>

          <div className="space-y-2">
            {CYCLES_OPTIONS.map((cycle) => (
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

          <DropdownButtons onClear={handleClear} onCancel={onClose} onApply={handleApply} />
        </div>
      </div>
    </div>
  );
}
