'use client';

import React, { useState } from 'react';
import { ODO_KM_OPTIONS, DROPDOWN_TITLES } from './constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';

interface OdoKmFilterDropdownProps {
  onApply: (odoKm: string) => void;
  onClose: () => void;
  currentOdoKm?: string;
}

export function OdoKmFilterDropdown({ onApply, onClose, currentOdoKm }: OdoKmFilterDropdownProps) {
  const [selectedOdoKm, setSelectedOdoKm] = useState(currentOdoKm || '');

  const handleApply = () => {
    onApply(selectedOdoKm);
    onClose();
  };

  const handleClear = () => {
    setSelectedOdoKm('');
    onApply('');
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-emerald-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">{DROPDOWN_TITLES.ODO_KM}</h3>

          <div className="space-y-2">
            {ODO_KM_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="odoKm"
                  value={option.value}
                  checked={selectedOdoKm === option.value}
                  onChange={(e) => setSelectedOdoKm(e.target.value)}
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
