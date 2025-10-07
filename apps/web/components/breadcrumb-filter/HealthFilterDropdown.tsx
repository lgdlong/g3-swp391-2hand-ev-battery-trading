'use client';

import React, { useState } from 'react';
import { HEALTH_OPTIONS, DROPDOWN_TITLES } from '@/config/constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';

interface HealthFilterDropdownProps {
  onApply: (health: string) => void;
  onClose: () => void;
  currentHealth?: string;
}

export function HealthFilterDropdown({
  onApply,
  onClose,
  currentHealth = '',
}: HealthFilterDropdownProps) {
  const [selectedHealth, setSelectedHealth] = useState(currentHealth);

  const handleApply = () => {
    onApply(selectedHealth);
    onClose();
  };

  const handleClear = () => {
    setSelectedHealth('');
    onApply('');
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-emerald-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">{DROPDOWN_TITLES.HEALTH}</h3>

          <div className="space-y-2">
            {HEALTH_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="health"
                  value={option.value}
                  checked={selectedHealth === option.value}
                  onChange={(e) => setSelectedHealth(e.target.value)}
                  className="w-3 h-3 text-emerald-600"
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
